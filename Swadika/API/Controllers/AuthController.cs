using System.Security.Cryptography;
using System.Text;
using API.Data;
using API.Models.DTOs;
using API.Models.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IAuthService _authService;
        private readonly IWebHostEnvironment _env;

        public AuthController(
            ApplicationDbContext context,
            IAuthService authService,
            IWebHostEnvironment env)
        {
            _context = context;
            _authService = authService;
            _env = env;
        }

        // OTP-based endpoints removed. Authentication is now handled via identifier (phone/email) + password.

        [HttpPost("refresh")]
        public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenRequest request)
        {
            if (string.IsNullOrEmpty(request.RefreshToken))
            {
                return BadRequest(new
                {
                    success = false,
                    error = new { code = "TOKEN_REQUIRED", message = "Refresh token is required" }
                });
            }

            try
            {
                var tokens = await _authService.RefreshTokensAsync(request.RefreshToken);
                return Ok(new
                {
                    success = true,
                    message = "Token refreshed successfully",
                    data = new
                    {
                        accessToken = tokens.AccessToken,
                        refreshToken = tokens.RefreshToken
                    }
                });
            }
            catch (Exception ex)
            {
                return Unauthorized(new
                {
                    success = false,
                    error = new { code = "INVALID_TOKEN", message = ex.Message }
                });
            }
        }

        [HttpGet("me")]
        [Authorize]
        public async Task<IActionResult> GetCurrentUser()
        {
            var userIdClaim = User.FindFirst("userId")?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized(new
                {
                    success = false,
                    error = new { code = "UNAUTHORIZED", message = "User not authenticated" }
                });
            }

            var user = await _authService.GetUserByIdAsync(userId);
            if (user == null)
            {
                return NotFound(new
                {
                    success = false,
                    error = new { code = "USER_NOT_FOUND", message = "User not found" }
                });
            }

            return Ok(new
            {
                success = true,
                data = new
                {
                    user = new
                    {
                        id = user.Id,
                        phone = user.Phone,
                        name = user.Name,
                        email = user.Email,
                        role = user.Role,
                        outlets = user.UserOutlets?.Select(uo => uo.OutletId).ToArray(),
                        currentOutlet = user.CurrentOutlet,
                        isActive = user.IsActive,
                        createdAt = user.CreatedAt,
                        updatedAt = user.UpdatedAt
                    }
                }
            });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            if (string.IsNullOrEmpty(request.Identifier) || string.IsNullOrEmpty(request.Password))
            {
                return BadRequest(new
                {
                    success = false,
                    error = new
                    {
                        code = "CREDENTIALS_REQUIRED",
                        message = "Identifier and password are required"
                    }
                });
            }

            var user = await _context.Users.FirstOrDefaultAsync(u =>
                (u.Phone == request.Identifier || u.Email == request.Identifier) && u.IsActive);

            if (user == null || string.IsNullOrEmpty(user.PasswordHash))
            {
                return Unauthorized(new
                {
                    success = false,
                    error = new
                    {
                        code = "INVALID_CREDENTIALS",
                        message = "Invalid identifier or password"
                    }
                });
            }

            if (!await VerifyPasswordAsync(request.Password, user.PasswordHash, user.PasswordSalt))
            {
                return Unauthorized(new
                {
                    success = false,
                    error = new
                    {
                        code = "INVALID_CREDENTIALS",
                        message = "Invalid identifier or password"
                    }
                });
            }

            var tokens = await _authService.GenerateTokensAsync(user);

            return Ok(new
            {
                success = true,
                message = "Login successful",
                data = new
                {
                    user = new
                    {
                        id = user.Id,
                        phone = user.Phone,
                        name = user.Name,
                        email = user.Email,
                        role = user.Role,
                        outlets = user.UserOutlets?.Select(uo => uo.OutletId).ToArray(),
                        currentOutlet = user.CurrentOutlet
                    },
                    accessToken = tokens.AccessToken,
                    refreshToken = tokens.RefreshToken
                }
            });
        }

        [HttpPost("signup")]
        public async Task<IActionResult> Signup([FromBody] SignupRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new { success = false, message = "Invalid signup data", errors = ModelState });
            }

            if (request.Password != request.ConfirmPassword)
            {
                return BadRequest(new { success = false, message = "Passwords do not match" });
            }

            // Check if email or phone already exists
            var existing = await _context.Users.FirstOrDefaultAsync(u => (u.Phone == request.Phone || u.Email == request.Email) && u.IsActive);
            if (existing != null)
            {
                return Conflict(new { success = false, message = "User with provided phone or email already exists" });
            }

            var user = await _authService.CreateUserAsync(request.Phone, request.Name, request.Email, request.Password);
            var tokens = await _authService.GenerateTokensAsync(user);

            return Ok(new
            {
                success = true,
                message = "Signup successful",
                data = new
                {
                    user = new
                    {
                        id = user.Id,
                        phone = user.Phone,
                        name = user.Name,
                        email = user.Email,
                        role = user.Role
                    },
                    accessToken = tokens.AccessToken,
                    refreshToken = tokens.RefreshToken
                }
            });
        }

        // Development-only debug endpoint to inspect stored password hash/salt and verify a password.
        [HttpPost("debug/verify")]
        public async Task<IActionResult> DebugVerify([FromBody] DebugVerifyRequest request)
        {
            if (!_env.IsDevelopment())
            {
                return Forbid();
            }

            if (string.IsNullOrEmpty(request.Identifier))
            {
                return BadRequest(new { success = false, message = "Identifier is required" });
            }

            var user = await _context.Users.FirstOrDefaultAsync(u => (u.Phone == request.Identifier || u.Email == request.Identifier) && u.IsActive);
            if (user == null)
            {
                return NotFound(new { success = false, message = "User not found" });
            }

            var verified = await VerifyPasswordAsync(request.Password ?? string.Empty, user.PasswordHash, user.PasswordSalt);

            return Ok(new
            {
                success = true,
                data = new
                {
                    id = user.Id,
                    phone = user.Phone,
                    email = user.Email,
                    passwordHash = user.PasswordHash,
                    passwordSalt = user.PasswordSalt,
                    verified
                }
            });
        }

        private async Task<bool> VerifyPasswordAsync(string password, string? storedHash, string? storedSalt)
        {
            if (string.IsNullOrEmpty(storedHash) || string.IsNullOrEmpty(storedSalt))
                return await Task.FromResult(false);

            return await Task.Run(() =>
            {
                try
                {
                    var saltBytes = Convert.FromBase64String(storedSalt);
                    using var pbkdf2 = new Rfc2898DeriveBytes(password, saltBytes, 100_000, HashAlgorithmName.SHA256);
                    var key = pbkdf2.GetBytes(32);
                    var hash = Convert.ToBase64String(key);
                    return hash == storedHash;
                }
                catch
                {
                    return false;
                }
            });
        }
    }
}