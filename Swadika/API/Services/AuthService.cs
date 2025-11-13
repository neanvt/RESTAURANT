using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using API.Data;
using API.Models.Entities;
using API.Models.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace API.Services
{
    public class AuthService : IAuthService
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthService(ApplicationDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        public async Task<bool> ValidatePhoneNumberAsync(string phone)
        {
            return await Task.FromResult(!string.IsNullOrEmpty(phone) && System.Text.RegularExpressions.Regex.IsMatch(phone, @"^[6-9]\d{9}$"));
        }

        public async Task<User> FindOrCreateUserAsync(string phone, string? name = null)
        {
            var user = await _context.Users
                .Include(u => u.UserOutlets)
                .FirstOrDefaultAsync(u => u.Phone == phone && u.IsActive);

            if (user == null)
            {
                user = new User
                {
                    Phone = phone,
                    Name = name,
                    Role = "staff"
                };

                _context.Users.Add(user);
                await _context.SaveChangesAsync();
            }
            else if (!string.IsNullOrEmpty(name) && string.IsNullOrEmpty(user.Name))
            {
                user.Name = name;
                user.UpdatedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();
            }

            return user;
        }

        public async Task<User> CreateUserAsync(string phone, string? name = null, string? email = null, string? password = null)
        {
            var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Phone == phone && u.IsActive);
            if (existingUser != null)
            {
                throw new Exception("User already exists");
            }

            string? hashedPassword = null;
            string? salt = null;
            if (!string.IsNullOrEmpty(password))
            {
                salt = GenerateSalt();
                hashedPassword = await HashPasswordWithSaltAsync(password, salt);
            }

            var user = new User
            {
                Phone = phone,
                Name = name,
                Email = email,
                Password = null,
                PasswordHash = hashedPassword,
                PasswordSalt = salt,
                Role = "staff"
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return user;
        }

        public async Task<User?> GetUserByIdAsync(Guid userId)
        {
            return await _context.Users
                .Include(u => u.UserOutlets)
                .FirstOrDefaultAsync(u => u.Id == userId && u.IsActive);
        }

        public async Task<TokenResult> GenerateTokensAsync(User user)
        {
            var jwtKey = _configuration["Jwt:Key"] ?? throw new Exception("JWT Key not configured");
            var jwtIssuer = _configuration["Jwt:Issuer"] ?? "RestaurantPOS.API";
            var jwtAudience = _configuration["Jwt:Audience"] ?? "RestaurantPOS.Client";
            // Set token lifetimes: short-lived access token (1 hour) and long-lived refresh token (6 months).
            var accessTokenExpiry = TimeSpan.FromHours(1);
            var refreshTokenExpiry = TimeSpan.FromDays(30 * 6);

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new Claim("userId", user.Id.ToString()),
                new Claim("phone", user.Phone),
                new Claim("role", user.Role),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var accessToken = new JwtSecurityToken(
                issuer: jwtIssuer,
                audience: jwtAudience,
                claims: claims,
                expires: DateTime.UtcNow.Add(accessTokenExpiry),
                signingCredentials: creds
            );

            var accessTokenString = new JwtSecurityTokenHandler().WriteToken(accessToken);
            var refreshToken = GenerateRefreshToken();

            // Persist refresh token with 6-month expiry
            var refreshTokenEntity = new RefreshToken
            {
                UserId = user.Id,
                Token = refreshToken,
                ExpiresAt = DateTime.UtcNow.AddMonths(6),
                CreatedAt = DateTime.UtcNow
            };

            _context.RefreshTokens.Add(refreshTokenEntity);
            await _context.SaveChangesAsync();

            return new TokenResult
            {
                AccessToken = accessTokenString,
                RefreshToken = refreshToken
            };
        }

        public async Task<TokenResult> RefreshTokensAsync(string refreshToken)
        {
            // Find refresh token in DB
            var existing = await _context.RefreshTokens
                .Include(r => r.User)
                .FirstOrDefaultAsync(r => r.Token == refreshToken);

            if (existing == null)
            {
                throw new Exception("Refresh token not found");
            }

            if (existing.RevokedAt != null)
            {
                throw new Exception("Refresh token revoked");
            }

            if (existing.ExpiresAt <= DateTime.UtcNow)
            {
                throw new Exception("Refresh token expired");
            }

            var user = existing.User;
            if (user == null)
            {
                throw new Exception("User for refresh token not found");
            }

            // Create new access token
            var jwtKey = _configuration["Jwt:Key"] ?? throw new Exception("JWT Key not configured");
            var jwtIssuer = _configuration["Jwt:Issuer"] ?? "RestaurantPOS.API";
            var jwtAudience = _configuration["Jwt:Audience"] ?? "RestaurantPOS.Client";

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new Claim("userId", user.Id.ToString()),
                new Claim("phone", user.Phone),
                new Claim("role", user.Role),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var accessToken = new JwtSecurityToken(
                issuer: jwtIssuer,
                audience: jwtAudience,
                claims: claims,
                // For refresh path, issue a short-lived access token (1 hour)
                expires: DateTime.UtcNow.AddHours(1),
                signingCredentials: creds
            );

            var accessTokenString = new JwtSecurityTokenHandler().WriteToken(accessToken);

            // Rotate refresh token: revoke existing and insert a new one
            var newRefreshToken = GenerateRefreshToken();
            existing.RevokedAt = DateTime.UtcNow;
            existing.RevokedReason = "rotated";
            existing.ReplacedByToken = newRefreshToken;

            var newRefreshEntity = new RefreshToken
            {
                UserId = user.Id,
                Token = newRefreshToken,
                ExpiresAt = DateTime.UtcNow.AddMonths(6),
                CreatedAt = DateTime.UtcNow
            };

            _context.RefreshTokens.Add(newRefreshEntity);
            await _context.SaveChangesAsync();

            return new TokenResult
            {
                AccessToken = accessTokenString,
                RefreshToken = newRefreshToken
            };
        }

        private string GenerateRefreshToken()
        {
            var randomBytes = new byte[32];
            using (var rng = RandomNumberGenerator.Create())
            {
                rng.GetBytes(randomBytes);
            }
            return Convert.ToBase64String(randomBytes);
        }

        private string GenerateSalt(int size = 16)
        {
            var saltBytes = new byte[size];
            using var rng = RandomNumberGenerator.Create();
            rng.GetBytes(saltBytes);
            return Convert.ToBase64String(saltBytes);
        }

        private Task<string> HashPasswordWithSaltAsync(string password, string salt, int iterations = 100_000, int keySize = 32)
        {
            return Task.Run(() =>
            {
                var saltBytes = Convert.FromBase64String(salt);
                using var pbkdf2 = new Rfc2898DeriveBytes(password, saltBytes, iterations, HashAlgorithmName.SHA256);
                var key = pbkdf2.GetBytes(keySize);
                return Convert.ToBase64String(key);
            });
        }
    }
}