# Restaurant POS System Migration Guide

## From Node.js/Express + Next.js + MongoDB

## To .NET Core 9 WebAPI + Angular + SQL Server

**Date:** 11 November 2025  
**Version:** 2.0  
**Status:** Implementation Ready - Comprehensive UI/UX Documentation

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Project Setup](#2-project-setup)
3. [Database Migration](#3-database-migration)
4. [Backend Implementation](#4-backend-implementation)
5. [Frontend Implementation](#5-frontend-implementation)
6. [Authentication & Security](#6-authentication--security)
7. [Key Features Implementation](#7-key-features-implementation)
8. [UI/UX Specifications](#8-uiux-specifications)
9. [Testing Strategy](#9-testing-strategy)
10. [Deployment](#10-deployment)
11. [Troubleshooting](#11-troubleshooting)

---

## Quick Reference - Key Pages & Routes

| Next.js Route      | Angular Route     | Page Name      | Key Features                              |
| ------------------ | ----------------- | -------------- | ----------------------------------------- |
| `/dashboard`       | `/dashboard`      | Dashboard      | Stats, Quick actions, Business overview   |
| `/orders/create`   | `/orders/create`  | Create Order   | Item selection, Cart, KOT/Bill generation |
| `/items`           | `/items`          | Items List     | Browse, Edit, Toggle availability         |
| `/items/create`    | `/items/create`   | Add Item       | Form with image upload                    |
| `/items/[id]/edit` | `/items/:id/edit` | Edit Item      | Update item details                       |
| `/reports`         | `/reports`        | Reports        | Sales analytics, Stats cards              |
| `/more`            | `/more`           | More Menu      | Navigation hub                            |
| `/orders`          | `/orders`         | Orders List    | View all orders with filters              |
| `/orders/[id]`     | `/orders/:id`     | Order Details  | View single order                         |
| `/kots`            | `/kots`           | Kitchen Orders | KOT management                            |
| `/invoices`        | `/invoices`       | Invoices       | Billing history                           |
| `/outlets`         | `/outlets`        | Outlets        | Manage outlets                            |
| `/customers`       | `/customers`      | Customers      | Customer database                         |
| `/staff`           | `/staff`          | Staff          | Staff management                          |
| `/login`           | `/auth/login`     | Login          | OTP + Password auth                       |
| `/signup`          | `/auth/signup`    | Signup         | Registration form                         |
| `/verify`          | `/auth/verify`    | Verify OTP     | OTP verification                          |

## Component Hierarchy

```
App Component
├── Auth Module (Standalone)
│   ├── Login Component
│   ├── Signup Component
│   └── Verify Component
│
└── Dashboard Layout (with Bottom Nav)
    ├── Dashboard Component
    │   ├── Outlet Selector Modal
    │   ├── Printer Status Card
    │   ├── Quick Actions
    │   └── Business Overview Card
    │
    ├── Orders Module
    │   ├── Orders List Component
    │   ├── Order Details Component
    │   └── Create Order Component
    │       ├── Category Filter
    │       ├── Item Cards
    │       ├── Cart Summary
    │       ├── Customer Details Card (Floating)
    │       ├── Bill Summary Card (Floating)
    │       ├── KOT Preview Modal
    │       └── Invoice Preview Modal
    │
    ├── Items Module
    │   ├── Items List Component
    │   │   └── Category Filter
    │   ├── Create Item Component
    │   └── Edit Item Component
    │
    ├── Reports Module
    │   ├── Reports Dashboard Component
    │   ├── Sales Report Component
    │   ├── Item Sales Report Component
    │   └── Category Report Component
    │
    ├── More Component
    │   └── Menu Cards
    │
    └── Shared Components
        ├── Bottom Navigation
        ├── Outlet Selector Modal
        ├── Search Input
        ├── Category Filter
        └── Loading Spinner
```

---

## 1. Prerequisites

### Required Software

- **.NET Core 9 SDK** - Download from [Microsoft](https://dotnet.microsoft.com/download/dotnet/9.0)
- **Node.js 20+** - For Angular CLI and build tools
- **SQL Server 2022** - Express edition available for free
- **Visual Studio 2022** - Community edition available for free
- **VS Code** - With C# and Angular extensions
- **Git** - For version control

### Required Accounts

- **Firebase Project** - For OTP authentication
- **OpenAI API Key** - For AI image generation
- **SSL Certificate** - For HTTPS in production

### Development Environment Setup

```bash
# Verify .NET installation
dotnet --version  # Should show 9.x.x

# Install Angular CLI globally
npm install -g @angular/cli

# Verify Angular CLI
ng version

# Install SQL Server Management Studio (SSMS)
# Download from Microsoft website
```

---

## 2. Project Setup

### 2.1 Create Solution Structure

```bash
# Create root directory
mkdir RestaurantPOS.Migration
cd RestaurantPOS.Migration

# Create backend project
dotnet new webapi -n RestaurantPOS.API
dotnet new classlib -n RestaurantPOS.Core
dotnet new classlib -n RestaurantPOS.Infrastructure

# Create frontend project
ng new restaurant-pos-frontend --routing --style=css --skip-git

# Create solution file
dotnet new sln -n RestaurantPOS
dotnet sln add RestaurantPOS.API/RestaurantPOS.API.csproj
dotnet sln add RestaurantPOS.Core/RestaurantPOS.Core.csproj
dotnet sln add RestaurantPOS.Infrastructure/RestaurantPOS.Infrastructure.csproj
```

### 2.2 Project Structure Overview

```
RestaurantPOS.Migration/
├── RestaurantPOS.API/           # WebAPI Project
│   ├── Controllers/
│   ├── Models/
│   ├── Services/
│   ├── Data/
│   └── appsettings.json
├── RestaurantPOS.Core/          # Business Logic
│   ├── Entities/
│   ├── Interfaces/
│   ├── Services/
│   └── DTOs/
├── RestaurantPOS.Infrastructure/ # Data Access
│   ├── Data/
│   ├── Repositories/
│   └── Migrations/
├── restaurant-pos-frontend/     # Angular Project
│   ├── src/
│   │   ├── app/
│   │   ├── assets/
│   │   └── environments/
│   └── angular.json
├── RestaurantPOS.sln
└── README.md
```

### 2.3 Package Installation

#### Backend Packages

```bash
# API Project
cd RestaurantPOS.API
dotnet add package Microsoft.EntityFrameworkCore.SqlServer
dotnet add package Microsoft.EntityFrameworkCore.Tools
dotnet add package Microsoft.AspNetCore.Authentication.JwtBearer
dotnet add package FirebaseAdmin
dotnet add package AutoMapper
dotnet add package FluentValidation.AspNetCore
dotnet add package Microsoft.AspNetCore.Cors
dotnet add package SixLabors.ImageSharp
dotnet add package QRCoder
dotnet add package Microsoft.AspNetCore.Identity
dotnet add package Microsoft.Extensions.Caching.StackExchangeRedis
dotnet add package Hangfire.AspNetCore
dotnet add package Hangfire.SqlServer
dotnet add package OpenAI
dotnet add package MailKit
dotnet add package Serilog.AspNetCore
dotnet add package Serilog.Sinks.File

# Core Project
cd ../RestaurantPOS.Core
dotnet add package FluentValidation
dotnet add package MediatR
dotnet add package AutoMapper

# Infrastructure Project
cd ../RestaurantPOS.Infrastructure
dotnet add package Microsoft.EntityFrameworkCore.SqlServer
dotnet add package Microsoft.EntityFrameworkCore.Tools
```

#### Frontend Packages

```bash
cd restaurant-pos-frontend
ng add @angular/material
ng add @angular/pwa
npm install rxjs zone.js
npm install firebase angularfire
npm install jspdf html2canvas qrcode
npm install chart.js ng2-charts
npm install ngx-toastr
npm install @ngx-translate/core @ngx-translate/http-loader
npm install ngx-spinner
npm install @angular/common @angular/core @angular/forms @angular/router
```

---

## 3. Database Migration

### 3.1 Create SQL Server Database

```sql
-- Execute in SQL Server Management Studio
CREATE DATABASE RestaurantPOS;
GO

USE RestaurantPOS;
GO

-- Create tables (copy from section 2.1 of main document)
-- [INSERT ALL TABLE CREATION SCRIPTS HERE]
```

### 3.2 Data Migration Script

```csharp
// Create a console app for data migration
// RestaurantPOS.Migration/MigrationConsole/Program.cs

using System;
using MongoDB.Driver;
using Microsoft.Data.SqlClient;
using System.Threading.Tasks;

class Program
{
    static async Task Main(string[] args)
    {
        Console.WriteLine("Starting data migration from MongoDB to SQL Server...");

        // MongoDB connection
        var mongoClient = new MongoClient("mongodb://localhost:27017");
        var mongoDatabase = mongoClient.GetDatabase("restaurant_pos");

        // SQL Server connection
        var sqlConnectionString = "Server=localhost;Database=RestaurantPOS;Trusted_Connection=True;";
        using var sqlConnection = new SqlConnection(sqlConnectionString);

        try
        {
            // Migrate users
            await MigrateUsers(mongoDatabase, sqlConnection);

            // Migrate outlets
            await MigrateOutlets(mongoDatabase, sqlConnection);

            // Migrate categories
            await MigrateCategories(mongoDatabase, sqlConnection);

            // Migrate items
            await MigrateItems(mongoDatabase, sqlConnection);

            // Migrate orders
            await MigrateOrders(mongoDatabase, sqlConnection);

            Console.WriteLine("Data migration completed successfully!");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Migration failed: {ex.Message}");
        }
    }

    // Implement migration methods for each collection
    // [DETAILED MIGRATION CODE HERE]
}
```

### 3.3 Entity Framework Setup

```bash
# Create initial migration
cd RestaurantPOS.API
dotnet ef migrations add InitialCreate --project ../RestaurantPOS.Infrastructure

# Update database
dotnet ef database update
```

---

## 4. Backend Implementation

### 4.1 Core Layer Implementation

#### Step 1: Define Entities

```csharp
// RestaurantPOS.Core/Entities/User.cs
using System;
using System.Collections.Generic;

namespace RestaurantPOS.Core.Entities
{
    public class User
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Phone { get; set; } = string.Empty;
        public string? Name { get; set; }
        public string? Email { get; set; }
        public string? Password { get; set; }
        public string Role { get; set; } = "staff";
        public string? Permissions { get; set; }
        public Guid? InvitedBy { get; set; }
        public string Status { get; set; } = "joined";
        public DateTime? LastActive { get; set; }
        public Guid? CurrentOutlet { get; set; }
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public User? Inviter { get; set; }
        public Outlet? CurrentOutletNavigation { get; set; }
        public ICollection<Outlet> OwnedOutlets { get; set; } = new List<Outlet>();
        public ICollection<UserOutlet> UserOutlets { get; set; } = new List<UserOutlet>();
    }
}

// RestaurantPOS.Core/Entities/Outlet.cs
public class Outlet
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid OwnerId { get; set; }
    public string BusinessName { get; set; } = string.Empty;
    public string? Logo { get; set; }
    public string? BusinessType { get; set; }
    public string? CuisineType { get; set; }
    public string Street { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string State { get; set; } = string.Empty;
    public string Pincode { get; set; } = string.Empty;
    public string Country { get; set; } = "India";
    public string Phone { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? Whatsapp { get; set; }
    public string? GSTIN { get; set; }
    public bool IsGSTEnabled { get; set; } = false;
    public string? UPIId { get; set; }
    public string? QRCodeUrl { get; set; }
    public string? OperatingHours { get; set; }
    public bool TableManagementEnabled { get; set; } = false;
    public int TotalTables { get; set; } = 0;
    public string TablePrefix { get; set; } = "T";
    public string Currency { get; set; } = "INR";
    public string Language { get; set; } = "en";
    public string Timezone { get; set; } = "Asia/Kolkata";
    public decimal TaxRate { get; set; } = 0;
    public string? TaxType { get; set; }
    public bool ServiceChargeEnabled { get; set; } = false;
    public decimal ServiceChargeRate { get; set; } = 0;
    public bool KOTPrinterEnabled { get; set; } = false;
    public bool BillPrinterEnabled { get; set; } = false;
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public User Owner { get; set; } = null!;
    public ICollection<UserOutlet> UserOutlets { get; set; } = new List<UserOutlet>();
    public ICollection<Category> Categories { get; set; } = new List<Category>();
    public ICollection<Item> Items { get; set; } = new List<Item>();
    public ICollection<Order> Orders { get; set; } = new List<Order>();
    public ICollection<Customer> Customers { get; set; } = new List<Customer>();
    public ICollection<Expense> Expenses { get; set; } = new List<Expense>();
    public ICollection<Inventory> Inventory { get; set; } = new List<Inventory>();
}

// RestaurantPOS.Core/Entities/Item.cs
public class Item
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid OutletId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public Guid Category { get; set; }
    public decimal Price { get; set; }
    public string? ImageUrl { get; set; }
    public bool IsAiGenerated { get; set; } = false;
    public string? AiPrompt { get; set; }
    public bool TaxApplicable { get; set; } = false;
    public decimal TaxRate { get; set; } = 0;
    public string TaxType { get; set; } = "percentage";
    public bool IsFavourite { get; set; } = false;
    public bool IsAvailable { get; set; } = true;
    public bool TrackInventory { get; set; } = false;
    public int CurrentStock { get; set; } = 0;
    public int LowStockAlert { get; set; } = 10;
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public Outlet Outlet { get; set; } = null!;
    public Category CategoryNavigation { get; set; } = null!;
    public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
}

// RestaurantPOS.Core/Entities/Order.cs
public class Order
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid OutletId { get; set; }
    public string OrderNumber { get; set; } = string.Empty;
    public decimal Subtotal { get; set; }
    public decimal TaxAmount { get; set; } = 0;
    public decimal Total { get; set; }
    public string Status { get; set; } = "draft";
    public string PaymentStatus { get; set; } = "pending";
    public string? PaymentMethod { get; set; }
    public string? CustomerName { get; set; }
    public string? CustomerPhone { get; set; }
    public string? CustomerAddress { get; set; }
    public string? TableNumber { get; set; }
    public Guid? KOTId { get; set; }
    public string? Notes { get; set; }
    public Guid CreatedBy { get; set; }
    public DateTime? CompletedAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public Outlet Outlet { get; set; } = null!;
    public User Creator { get; set; } = null!;
    public KOT? KOT { get; set; }
    public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
    public ICollection<KOT> KOTs { get; set; } = new List<KOT>();
    public ICollection<Invoice> Invoices { get; set; } = new List<Invoice>();
}
```

#### Step 2: Define Interfaces

```csharp
// RestaurantPOS.Core/Interfaces/IAuthService.cs
using RestaurantPOS.Core.Entities;
using System.Threading.Tasks;

namespace RestaurantPOS.Core.Interfaces
{
    public interface IAuthService
    {
        Task<bool> ValidatePhoneNumberAsync(string phone);
        Task<User> FindOrCreateUserAsync(string phone, string? name = null);
        Task<User> CreateUserAsync(string phone, string? name = null, string? email = null, string? password = null);
        Task<User?> GetUserByIdAsync(Guid userId);
        Task<TokenResult> GenerateTokensAsync(User user);
        Task<TokenResult> RefreshTokensAsync(string refreshToken);
    }

    public class TokenResult
    {
        public string AccessToken { get; set; } = string.Empty;
        public string RefreshToken { get; set; } = string.Empty;
    }
}

// RestaurantPOS.Core/Interfaces/IOrderService.cs
using RestaurantPOS.Core.Entities;
using RestaurantPOS.Core.DTOs;
using System.Threading.Tasks;

namespace RestaurantPOS.Core.Interfaces
{
    public interface IOrderService
    {
        Task<Order> CreateOrderAsync(CreateOrderDto dto, Guid outletId, Guid userId);
        Task<Order> GetOrderByIdAsync(Guid orderId, Guid outletId);
        Task UpdateOrderStatusAsync(Guid orderId, string status);
        Task<string> GenerateOrderNumberAsync(Guid outletId);
    }
}
```

#### Step 3: Define DTOs

```csharp
// RestaurantPOS.Core/DTOs/AuthDtos.cs
using System.ComponentModel.DataAnnotations;

namespace RestaurantPOS.Core.DTOs
{
    public class SendOTPRequest
    {
        [Required]
        [RegularExpression(@"^[6-9]\d{9}$", ErrorMessage = "Invalid phone number format")]
        public string Phone { get; set; } = string.Empty;
    }

    public class VerifyOTPRequest
    {
        [Required]
        public string IdToken { get; set; } = string.Empty;

        public string? Name { get; set; }
    }

    public class RefreshTokenRequest
    {
        [Required]
        public string RefreshToken { get; set; } = string.Empty;
    }

    public class LoginRequest
    {
        [Required]
        public string Identifier { get; set; } = string.Empty; // phone or email

        [Required]
        public string Password { get; set; } = string.Empty;
    }
}

// RestaurantPOS.Core/DTOs/OrderDtos.cs
using System.ComponentModel.DataAnnotations;

namespace RestaurantPOS.Core.DTOs
{
    public class CreateOrderDto
    {
        [Required]
        public List<OrderItemDto> Items { get; set; } = new List<OrderItemDto>();

        public CustomerDto? Customer { get; set; }

        public string? TableNumber { get; set; }

        public string? Notes { get; set; }
    }

    public class OrderItemDto
    {
        [Required]
        public Guid ItemId { get; set; }

        [Range(1, int.MaxValue)]
        public int Quantity { get; set; } = 1;

        public string? Notes { get; set; }
    }

    public class CustomerDto
    {
        public string? Name { get; set; }

        public string? Phone { get; set; }

        public string? Address { get; set; }
    }

    public class OrderFilterDto
    {
        public string? Status { get; set; }
        public string? PaymentStatus { get; set; }
        public DateTime? DateFrom { get; set; }
        public DateTime? DateTo { get; set; }
        public string? Search { get; set; }
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 20;
    }
}
```

### 4.2 Infrastructure Layer Implementation

#### Step 1: DbContext Configuration

```csharp
// RestaurantPOS.Infrastructure/Data/ApplicationDbContext.cs
using Microsoft.EntityFrameworkCore;
using RestaurantPOS.Core.Entities;

namespace RestaurantPOS.Infrastructure.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Outlet> Outlets { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<Item> Items { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderItem> OrderItems { get; set; }
        public DbSet<Customer> Customers { get; set; }
        public DbSet<Expense> Expenses { get; set; }
        public DbSet<Inventory> Inventory { get; set; }
        public DbSet<KOT> KOTs { get; set; }
        public DbSet<Invoice> Invoices { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // User configurations
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasIndex(e => e.Phone).IsUnique();
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
                entity.Property(e => e.UpdatedAt).HasDefaultValueSql("GETUTCDATE()");
            });

            // Outlet configurations
            modelBuilder.Entity<Outlet>(entity =>
            {
                entity.HasOne(e => e.Owner)
                    .WithMany(u => u.OwnedOutlets)
                    .HasForeignKey(e => e.OwnerId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
                entity.Property(e => e.UpdatedAt).HasDefaultValueSql("GETUTCDATE()");
            });

            // Item configurations
            modelBuilder.Entity<Item>(entity =>
            {
                entity.HasOne(e => e.Outlet)
                    .WithMany(o => o.Items)
                    .HasForeignKey(e => e.OutletId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.CategoryNavigation)
                    .WithMany(c => c.Items)
                    .HasForeignKey(e => e.Category)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
                entity.Property(e => e.UpdatedAt).HasDefaultValueSql("GETUTCDATE()");
            });

            // Order configurations
            modelBuilder.Entity<Order>(entity =>
            {
                entity.HasIndex(e => new { e.OutletId, e.OrderNumber }).IsUnique();
                entity.HasOne(e => e.Outlet)
                    .WithMany(o => o.Orders)
                    .HasForeignKey(e => e.OutletId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.Creator)
                    .WithMany()
                    .HasForeignKey(e => e.CreatedBy)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
                entity.Property(e => e.UpdatedAt).HasDefaultValueSql("GETUTCDATE()");
            });

            // OrderItem configurations
            modelBuilder.Entity<OrderItem>(entity =>
            {
                entity.HasOne(e => e.Order)
                    .WithMany(o => o.OrderItems)
                    .HasForeignKey(e => e.OrderId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.Item)
                    .WithMany(i => i.OrderItems)
                    .HasForeignKey(e => e.ItemId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // Customer configurations
            modelBuilder.Entity<Customer>(entity =>
            {
                entity.HasOne(e => e.Outlet)
                    .WithMany(o => o.Customers)
                    .HasForeignKey(e => e.OutletId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
                entity.Property(e => e.UpdatedAt).HasDefaultValueSql("GETUTCDATE()");
            });

            // Expense configurations
            modelBuilder.Entity<Expense>(entity =>
            {
                entity.HasOne(e => e.Outlet)
                    .WithMany(o => o.Expenses)
                    .HasForeignKey(e => e.OutletId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.Creator)
                    .WithMany()
                    .HasForeignKey(e => e.CreatedBy)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
                entity.Property(e => e.UpdatedAt).HasDefaultValueSql("GETUTCDATE()");
            });

            // Inventory configurations
            modelBuilder.Entity<Inventory>(entity =>
            {
                entity.HasOne(e => e.Outlet)
                    .WithMany(o => o.Inventory)
                    .HasForeignKey(e => e.OutletId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.Item)
                    .WithMany()
                    .HasForeignKey(e => e.ItemId)
                    .OnDelete(DeleteBehavior.SetNull);

                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
                entity.Property(e => e.UpdatedAt).HasDefaultValueSql("GETUTCDATE()");
            });

            // KOT configurations
            modelBuilder.Entity<KOT>(entity =>
            {
                entity.HasOne(e => e.Order)
                    .WithMany(o => o.KOTs)
                    .HasForeignKey(e => e.OrderId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
            });

            // Invoice configurations
            modelBuilder.Entity<Invoice>(entity =>
            {
                entity.HasOne(e => e.Order)
                    .WithMany(o => o.Invoices)
                    .HasForeignKey(e => e.OrderId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
            });
        }
    }
}
```

#### Step 2: Implement Repositories

```csharp
// RestaurantPOS.Core/Interfaces/IRepository.cs
using System.Linq.Expressions;

namespace RestaurantPOS.Core.Interfaces
{
    public interface IRepository<T> where T : class
    {
        Task<T?> GetByIdAsync(Guid id);
        Task<IEnumerable<T>> GetAllAsync();
        Task<IEnumerable<T>> FindAsync(Expression<Func<T, bool>> predicate);
        Task<T> AddAsync(T entity);
        Task UpdateAsync(T entity);
        Task DeleteAsync(T entity);
        Task<int> CountAsync(Expression<Func<T, bool>>? predicate = null);
    }
}

// RestaurantPOS.Infrastructure/Repositories/Repository.cs
using Microsoft.EntityFrameworkCore;
using RestaurantPOS.Core.Interfaces;
using System.Linq.Expressions;

namespace RestaurantPOS.Infrastructure.Repositories
{
    public class Repository<T> : IRepository<T> where T : class
    {
        protected readonly DbContext _context;
        protected readonly DbSet<T> _dbSet;

        public Repository(DbContext context)
        {
            _context = context;
            _dbSet = context.Set<T>();
        }

        public async Task<T?> GetByIdAsync(Guid id)
        {
            return await _dbSet.FindAsync(id);
        }

        public async Task<IEnumerable<T>> GetAllAsync()
        {
            return await _dbSet.ToListAsync();
        }

        public async Task<IEnumerable<T>> FindAsync(Expression<Func<T, bool>> predicate)
        {
            return await _dbSet.Where(predicate).ToListAsync();
        }

        public async Task<T> AddAsync(T entity)
        {
            await _dbSet.AddAsync(entity);
            await _context.SaveChangesAsync();
            return entity;
        }

        public async Task UpdateAsync(T entity)
        {
            _dbSet.Update(entity);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(T entity)
        {
            _dbSet.Remove(entity);
            await _context.SaveChangesAsync();
        }

        public async Task<int> CountAsync(Expression<Func<T, bool>>? predicate = null)
        {
            return predicate == null
                ? await _dbSet.CountAsync()
                : await _dbSet.CountAsync(predicate);
        }
    }
}
```

#### Step 3: Implement Services

```csharp
// RestaurantPOS.Infrastructure/Services/AuthService.cs
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using RestaurantPOS.Core.Entities;
using RestaurantPOS.Core.Interfaces;
using RestaurantPOS.Infrastructure.Data;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace RestaurantPOS.Infrastructure.Services
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
            return !string.IsNullOrEmpty(phone) && System.Text.RegularExpressions.Regex.IsMatch(phone, @"^[6-9]\d{9}$");
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
            if (!string.IsNullOrEmpty(password))
            {
                hashedPassword = await HashPasswordAsync(password);
            }

            var user = new User
            {
                Phone = phone,
                Name = name,
                Email = email,
                Password = hashedPassword,
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
            var accessTokenExpiry = TimeSpan.FromHours(1);
            var refreshTokenExpiry = TimeSpan.FromDays(7);

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

            var refreshToken = GenerateRefreshToken();

            return new TokenResult
            {
                AccessToken = new JwtSecurityTokenHandler().WriteToken(accessToken),
                RefreshToken = refreshToken
            };
        }

        public async Task<TokenResult> RefreshTokensAsync(string refreshToken)
        {
            throw new NotImplementedException("Refresh token validation not implemented");
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

        private async Task<string> HashPasswordAsync(string password)
        {
            return await Task.Run(() =>
            {
                using var sha256 = SHA256.Create();
                var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
                return Convert.ToBase64String(hashedBytes);
            });
        }
    }
}

// RestaurantPOS.Infrastructure/Services/OrderService.cs
using Microsoft.EntityFrameworkCore;
using RestaurantPOS.Core.Entities;
using RestaurantPOS.Core.DTOs;
using RestaurantPOS.Core.Interfaces;
using RestaurantPOS.Infrastructure.Data;

namespace RestaurantPOS.Infrastructure.Services
{
    public class OrderService : IOrderService
    {
        private readonly ApplicationDbContext _context;

        public OrderService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Order> CreateOrderAsync(CreateOrderDto dto, Guid outletId, Guid userId)
        {
            var orderNumber = await GenerateOrderNumberAsync(outletId);

            var itemIds = dto.Items.Select(i => i.ItemId).Distinct().ToList();
            var items = await _context.Items
                .Where(i => itemIds.Contains(i.Id) && i.OutletId == outletId && i.IsActive)
                .ToDictionaryAsync(i => i.Id, i => i);

            decimal subtotal = 0;
            decimal taxAmount = 0;

            var orderItems = new List<OrderItem>();
            foreach (var itemDto in dto.Items)
            {
                if (!items.TryGetValue(itemDto.ItemId, out var item))
                {
                    throw new Exception($"Item {itemDto.ItemId} not found");
                }

                var quantity = itemDto.Quantity;
                var itemSubtotal = item.Price * quantity;
                var itemTaxAmount = item.TaxApplicable ? (itemSubtotal * item.TaxRate / 100) : 0;
                var itemTotal = itemSubtotal + itemTaxAmount;

                subtotal += itemSubtotal;
                taxAmount += itemTaxAmount;

                orderItems.Add(new OrderItem
                {
                    ItemId = item.Id,
                    Name = item.Name,
                    Price = item.Price,
                    Quantity = quantity,
                    TaxRate = item.TaxApplicable ? item.TaxRate : 0,
                    TaxAmount = itemTaxAmount,
                    Subtotal = itemSubtotal,
                    Total = itemTotal,
                    Notes = itemDto.Notes
                });
            }

            var order = new Order
            {
                OutletId = outletId,
                OrderNumber = orderNumber,
                OrderItems = orderItems,
                Subtotal = subtotal,
                TaxAmount = taxAmount,
                Total = subtotal + taxAmount,
                Status = "draft",
                PaymentStatus = "pending",
                CustomerName = dto.Customer?.Name,
                CustomerPhone = dto.Customer?.Phone,
                CustomerAddress = dto.Customer?.Address,
                TableNumber = dto.TableNumber,
                Notes = dto.Notes,
                CreatedBy = userId
            };

            _context.Orders.Add(order);
            await _context.SaveChangesAsync();

            return order;
        }

        public async Task<Order> GetOrderByIdAsync(Guid orderId, Guid outletId)
        {
            var order = await _context.Orders
                .Include(o => o.OrderItems)
                .Include(o => o.Creator)
                .FirstOrDefaultAsync(o => o.Id == orderId && o.OutletId == outletId);

            if (order == null)
            {
                throw new Exception("Order not found");
            }

            return order;
        }

        public async Task UpdateOrderStatusAsync(Guid orderId, string status)
        {
            var order = await _context.Orders.FindAsync(orderId);
            if (order == null)
            {
                throw new Exception("Order not found");
            }

            order.Status = status;
            order.UpdatedAt = DateTime.UtcNow;

            if (status == "completed")
            {
                order.CompletedAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();
        }

        public async Task<string> GenerateOrderNumberAsync(Guid outletId)
        {
            var today = DateTime.UtcNow.Date;
            var todayOrdersCount = await _context.Orders
                .CountAsync(o => o.OutletId == outletId && o.CreatedAt.Date == today);

            var datePart = DateTime.UtcNow.ToString("yyyyMMdd");
            var sequenceNumber = (todayOrdersCount + 1).ToString("D4");

            return $"{datePart}{sequenceNumber}";
        }
    }
}
```

### 4.3 API Layer Implementation

#### Step 1: Controllers

```csharp
// RestaurantPOS.API/Controllers/AuthController.cs
using Microsoft.AspNetCore.Mvc;
using RestaurantPOS.Core.Interfaces;
using RestaurantPOS.Core.DTOs;

namespace RestaurantPOS.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly IOtpService _otpService;

        public AuthController(IAuthService authService, IOtpService otpService)
        {
            _authService = authService;
            _otpService = otpService;
        }

        [HttpPost("send-otp")]
        public async Task<IActionResult> SendOTP([FromBody] SendOTPRequest request)
        {
            if (!await _authService.ValidatePhoneNumberAsync(request.Phone))
            {
                return BadRequest(new
                {
                    success = false,
                    error = new
                    {
                        code = "INVALID_PHONE",
                        message = "Invalid phone number format. Please provide a 10-digit Indian phone number."
                    }
                });
            }

            var rateLimitCheck = await _otpService.CheckRateLimitAsync(request.Phone);
            if (!rateLimitCheck.Allowed)
            {
                return StatusCode(429, new
                {
                    success = false,
                    error = new
                    {
                        code = "RATE_LIMIT_EXCEEDED",
                        message = rateLimitCheck.Message ?? "Too many OTP requests. Please try again later."
                    }
                });
            }

            var result = await _otpService.SendOTPAsync(request.Phone);
            if (!result.Success)
            {
                return StatusCode(500, new
                {
                    success = false,
                    error = new
                    {
                        code = "OTP_SEND_FAILED",
                        message = result.Message
                    }
                });
            }

            await _otpService.RecordOTPAttemptAsync(request.Phone);

            return Ok(new
            {
                success = true,
                message = "OTP sent successfully",
                data = new { phone = request.Phone }
            });
        }

        [HttpPost("verify-otp")]
        public async Task<IActionResult> VerifyOTP([FromBody] VerifyOTPRequest request)
        {
            if (string.IsNullOrEmpty(request.IdToken))
            {
                return BadRequest(new
                {
                    success = false,
                    error = new { code = "TOKEN_REQUIRED", message = "Firebase ID token is required" }
                });
            }

            var verificationResult = await _otpService.VerifyOTPAsync(request.IdToken);
            if (!verificationResult.Success || string.IsNullOrEmpty(verificationResult.Phone))
            {
                return Unauthorized(new
                {
                    success = false,
                    error = new
                    {
                        code = "VERIFICATION_FAILED",
                        message = verificationResult.Error ?? "OTP verification failed"
                    }
                });
            }

            var user = await _authService.FindOrCreateUserAsync(verificationResult.Phone, request.Name);
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

            if (user == null || string.IsNullOrEmpty(user.Password))
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

            if (!await VerifyPasswordAsync(request.Password, user.Password))
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

        private async Task<bool> VerifyPasswordAsync(string password, string hashedPassword)
        {
            return await Task.Run(() =>
            {
                using var sha256 = SHA256.Create();
                var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
                var hash = Convert.ToBase64String(hashedBytes);
                return hash == hashedPassword;
            });
        }
    }
}

// RestaurantPOS.API/Controllers/OrderController.cs
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RestaurantPOS.Core.Interfaces;
using RestaurantPOS.Core.DTOs;
using RestaurantPOS.Infrastructure.Data;

namespace RestaurantPOS.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class OrderController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IOrderService _orderService;
        private readonly IKOTService _kotService;
        private readonly IOutletService _outletService;

        public OrderController(
            ApplicationDbContext context,
            IOrderService orderService,
            IKOTService kotService,
            IOutletService outletService)
        {
            _context = context;
            _orderService = orderService;
            _kotService = kotService;
            _outletService = outletService;
        }

        [HttpGet]
        public async Task<IActionResult> GetOrders([FromQuery] OrderFilterDto filter)
        {
            var currentOutlet = await _outletService.GetCurrentOutletAsync(User);
            if (currentOutlet == null)
            {
                return BadRequest(new { success = false, error = new { code = "NO_OUTLET", message = "No outlet selected" } });
            }

            var query = _context.Orders
                .Where(o => o.OutletId == currentOutlet.Id)
                .Include(o => o.OrderItems)
                .Include(o => o.Creator)
                .AsQueryable();

            if (!string.IsNullOrEmpty(filter.Status))
            {
                query = query.Where(o => o.Status == filter.Status);
            }

            if (!string.IsNullOrEmpty(filter.PaymentStatus))
            {
                query = query.Where(o => o.PaymentStatus == filter.PaymentStatus);
            }

            if (filter.DateFrom.HasValue)
            {
                query = query.Where(o => o.CreatedAt.Date >= filter.DateFrom.Value.Date);
            }

            if (filter.DateTo.HasValue)
            {
                query = query.Where(o => o.CreatedAt.Date <= filter.DateTo.Value.Date);
            }

            if (!string.IsNullOrEmpty(filter.Search))
            {
                query = query.Where(o =>
                    o.OrderNumber.Contains(filter.Search) ||
                    (o.CustomerName != null && o.CustomerName.Contains(filter.Search)) ||
                    (o.CustomerPhone != null && o.CustomerPhone.Contains(filter.Search)));
            }

            var orders = await query
                .OrderByDescending(o => o.CreatedAt)
                .Skip((filter.Page - 1) * filter.PageSize)
                .Take(filter.PageSize)
                .ToListAsync();

            var totalCount = await query.CountAsync();

            var result = orders.Select(o => new
            {
                id = o.Id,
                orderNumber = o.OrderNumber,
                items = o.OrderItems.Select(oi => new
                {
                    itemId = oi.ItemId,
                    name = oi.Name,
                    price = oi.Price,
                    quantity = oi.Quantity,
                    total = oi.Total,
                    notes = oi.Notes
                }),
                pricing = new
                {
                    subtotal = o.Subtotal,
                    taxAmount = o.TaxAmount,
                    total = o.Total
                },
                status = o.Status,
                paymentStatus = o.PaymentStatus,
                paymentMethod = o.PaymentMethod,
                customer = new
                {
                    name = o.CustomerName,
                    phone = o.CustomerPhone,
                    address = o.CustomerAddress
                },
                tableNumber = o.TableNumber,
                notes = o.Notes,
                createdBy = new
                {
                    id = o.Creator.Id,
                    name = o.Creator.Name ?? o.Creator.Phone
                },
                createdAt = o.CreatedAt,
                updatedAt = o.UpdatedAt,
                completedAt = o.CompletedAt
            });

            return Ok(new
            {
                success = true,
                data = result,
                pagination = new
                {
                    page = filter.Page,
                    pageSize = filter.PageSize,
                    totalCount,
                    totalPages = (int)Math.Ceiling(totalCount / (double)filter.PageSize)
                }
            });
        }

        [HttpPost]
        public async Task<IActionResult> CreateOrder([FromBody] CreateOrderDto dto)
        {
            var currentOutlet = await _outletService.GetCurrentOutletAsync(User);
            if (currentOutlet == null)
            {
                return BadRequest(new { success = false, error = new { code = "NO_OUTLET", message = "No outlet selected" } });
            }

            var userIdClaim = User.FindFirst("userId")?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized(new { success = false, error = new { code = "UNAUTHORIZED", message = "User not authenticated" } });
            }

            try
            {
                var order = await _orderService.CreateOrderAsync(dto, currentOutlet.Id, userId);
                return CreatedAtAction(nameof(GetOrder), new { id = order.Id }, new
                {
                    success = true,
                    data = new
                    {
                        id = order.Id,
                        orderNumber = order.OrderNumber,
                        items = order.OrderItems.Select(oi => new
                        {
                            itemId = oi.ItemId,
                            name = oi.Name,
                            price = oi.Price,
                            quantity = oi.Quantity,
                            tax = new { rate = oi.TaxRate, amount = oi.TaxAmount },
                            subtotal = oi.Subtotal,
                            total = oi.Total,
                            notes = oi.Notes
                        }),
                        pricing = new
                        {
                            subtotal = order.Subtotal,
                            taxAmount = order.TaxAmount,
                            total = order.Total
                        },
                        status = order.Status,
                        paymentStatus = order.PaymentStatus,
                        customer = new
                        {
                            name = order.CustomerName,
                            phone = order.CustomerPhone,
                            address = order.CustomerAddress
                        },
                        tableNumber = order.TableNumber,
                        notes = order.Notes,
                        createdAt = order.CreatedAt
                    }
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, error = new { code = "ORDER_CREATION_FAILED", message = ex.Message } });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetOrder(Guid id)
        {
            var currentOutlet = await _outletService.GetCurrentOutletAsync(User);
            if (currentOutlet == null)
            {
                return BadRequest(new { success = false, error = new { code = "NO_OUTLET", message = "No outlet selected" } });
            }

            var order = await _context.Orders
                .Include(o => o.OrderItems)
                .Include(o => o.Creator)
                .Include(o => o.KOT)
                .FirstOrDefaultAsync(o => o.Id == id && o.OutletId == currentOutlet.Id);

            if (order == null)
            {
                return NotFound(new { success = false, error = new { code = "ORDER_NOT_FOUND", message = "Order not found" } });
            }

            return Ok(new
            {
                success = true,
                data = new
                {
                    id = order.Id,
                    orderNumber = order.OrderNumber,
                    items = order.OrderItems.Select(oi => new
                    {
                        itemId = oi.ItemId,
                        name = oi.Name,
                        price = oi.Price,
                        quantity = oi.Quantity,
                        tax = new { rate = oi.TaxRate, amount = oi.TaxAmount },
                        subtotal = oi.Subtotal,
                        total = oi.Total,
                        notes = oi.Notes
                    }),
                    pricing = new
                    {
                        subtotal = order.Subtotal,
                        taxAmount = order.TaxAmount,
                        total = order.Total
                    },
                    status = order.Status,
                    paymentStatus = order.PaymentStatus,
                    paymentMethod = order.PaymentMethod,
                    customer = new
                    {
                        name = order.CustomerName,
                        phone = order.CustomerPhone,
                        address = order.CustomerAddress
                    },
                    tableNumber = order.TableNumber,
                    kot = order.KOT != null ? new
                    {
                        id = order.KOT.Id,
                        kotNumber = order.KOT.KOTNumber,
                        status = order.KOT.Status,
                        isPrinted = order.KOT.IsPrinted,
                        createdAt = order.KOT.CreatedAt
                    } : null,
                    notes = order.Notes,
                    createdBy = new
                    {
                        id = order.Creator.Id,
                        name = order.Creator.Name ?? order.Creator.Phone
                    },
                    createdAt = order.CreatedAt,
                    updatedAt = order.UpdatedAt,
                    completedAt = order.CompletedAt
                }
            });
        }

        [HttpPost("{id}/kot")]
        public async Task<IActionResult> GenerateKOT(Guid id)
        {
            var currentOutlet = await _outletService.GetCurrentOutletAsync(User);
            if (currentOutlet == null)
            {
                return BadRequest(new { success = false, error = new { code = "NO_OUTLET", message = "No outlet selected" } });
            }

            try
            {
                var result = await _kotService.GenerateKOTAsync(id, currentOutlet.Id);
                return Ok(new
                {
                    success = true,
                    message = "KOT generated successfully",
                    data = new
                    {
                        kot = new
                        {
                            id = result.KOT.Id,
                            kotNumber = result.KOT.KOTNumber,
                            status = result.KOT.Status,
                            isPrinted = result.KOT.IsPrinted,
                            createdAt = result.KOT.CreatedAt
                        },
                        order = new
                        {
                            id = result.Order.Id,
                            orderNumber = result.Order.OrderNumber,
                            status = result.Order.Status
                        }
                    }
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, error = new { code = "KOT_GENERATION_FAILED", message = ex.Message } });
            }
        }

        [HttpPost("{id}/hold")]
        public async Task<IActionResult> HoldOrder(Guid id)
        {
            var currentOutlet = await _outletService.GetCurrentOutletAsync(User);
            if (currentOutlet == null)
            {
                return BadRequest(new { success = false, error = new { code = "NO_OUTLET", message = "No outlet selected" } });
            }

            var order = await _context.Orders
                .FirstOrDefaultAsync(o => o.Id == id && o.OutletId == currentOutlet.Id);

            if (order == null)
            {
                return NotFound(new { success = false, error = new { code = "ORDER_NOT_FOUND", message = "Order not found" } });
            }

            if (order.Status != "draft")
            {
                return BadRequest(new { success = false, error = new { code = "INVALID_STATUS", message = "Order cannot be held" } });
            }

            order.Status = "on_hold";
            order.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "Order held successfully" });
        }

        [HttpPost("{id}/complete")]
        public async Task<IActionResult> CompleteOrder(Guid id, [FromBody] CompleteOrderDto dto)
        {
            var currentOutlet = await _outletService.GetCurrentOutletAsync(User);
            if (currentOutlet == null)
            {
                return BadRequest(new { success = false, error = new { code = "NO_OUTLET", message = "No outlet selected" } });
            }

            var order = await _context.Orders
                .FirstOrDefaultAsync(o => o.Id == id && o.OutletId == currentOutlet.Id);

            if (order == null)
            {
                return NotFound(new { success = false, error = new { code = "ORDER_NOT_FOUND", message = "Order not found" } });
            }

            if (order.Status != "kot_generated")
            {
                return BadRequest(new { success = false, error = new { code = "INVALID_STATUS", message = "Order must have KOT generated first" } });
            }

            order.Status = "completed";
            order.PaymentStatus = "paid";
            order.PaymentMethod = dto.PaymentMethod;
            order.CompletedAt = DateTime.UtcNow;
            order.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "Order completed successfully" });
        }
    }
}
```

#### Step 2: Program.cs Configuration

```csharp
// RestaurantPOS.API/Program.cs
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using RestaurantPOS.Core.Interfaces;
using RestaurantPOS.Infrastructure.Data;
using RestaurantPOS.Infrastructure.Services;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Restaurant POS API", Version = "v1" });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\"",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// Database
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Authentication
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"] ?? ""))
        };
    });

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", builder =>
    {
        builder.AllowAnyOrigin()
               .AllowAnyMethod()
               .AllowAnyHeader();
    });
});

// Services
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IOrderService, OrderService>();
builder.Services.AddScoped<IOutletService, OutletService>();
builder.Services.AddScoped<IItemService, ItemService>();
builder.Services.AddScoped<IKOTService, KOTService>();
builder.Services.AddScoped<IOtpService, OtpService>();

// Firebase Admin SDK
FirebaseAdmin.FirebaseApp.Create(new FirebaseAdmin.AppOptions
{
    Credential = FirebaseAdmin.GoogleCredential.FromFile("path/to/serviceAccountKey.json")
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowAll");
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
```

#### Step 3: appsettings.json

```json
// RestaurantPOS.API/appsettings.json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=RestaurantPOS;Trusted_Connection=True;MultipleActiveResultSets=true"
  },
  "Jwt": {
    "Key": "your-super-secret-jwt-key-here-make-it-long-and-secure",
    "Issuer": "RestaurantPOS.API",
    "Audience": "RestaurantPOS.Client"
  },
  "Firebase": {
    "ProjectId": "your-firebase-project-id",
    "ServiceAccountKeyPath": "path/to/serviceAccountKey.json"
  },
  "OpenAI": {
    "ApiKey": "your-openai-api-key"
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*"
}
```

---

## 5. Frontend Implementation (Angular)

### 5.1 Project Setup

```bash
# Create Angular project
ng new restaurant-pos-frontend --routing --style=css --skip-git

# Navigate to project
cd restaurant-pos-frontend

# Add required packages
ng add @angular/material
ng add @angular/pwa
npm install rxjs zone.js
npm install firebase angularfire
npm install jspdf html2canvas qrcode
npm install chart.js ng2-charts
npm install ngx-toastr
npm install @ngx-translate/core @ngx-translate/http-loader
npm install ngx-spinner
```

### 5.2 Core Services

#### Step 1: Auth Service

```typescript
// src/app/core/services/auth.service.ts
import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { BehaviorSubject, Observable, tap } from "rxjs";
import { Router } from "@angular/router";
import { environment } from "../../../environments/environment";

export interface User {
  id: string;
  phone: string;
  name?: string;
  email?: string;
  role: string;
  outlets: string[];
  currentOutlet?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    accessToken: string;
    refreshToken: string;
  };
}

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private readonly API_URL = environment.apiUrl;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    this.loadUserFromStorage();
  }

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  sendOTP(phone: string): Observable<any> {
    return this.http.post(`${this.API_URL}/auth/send-otp`, { phone });
  }

  verifyOTP(idToken: string, name?: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.API_URL}/auth/verify-otp`, { idToken, name })
      .pipe(
        tap((response) => {
          if (response.success) {
            this.setSession(response.data);
          }
        })
      );
  }

  login(identifier: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.API_URL}/auth/login`, {
        identifier,
        password,
      })
      .pipe(
        tap((response) => {
          if (response.success) {
            this.setSession(response.data);
          }
        })
      );
  }

  logout(): Observable<any> {
    return this.http.post(`${this.API_URL}/auth/logout`, {}).pipe(
      tap(() => {
        this.clearSession();
        this.router.navigate(["/auth/login"]);
      })
    );
  }

  refreshToken(): Observable<any> {
    const refreshToken = localStorage.getItem("refreshToken");
    return this.http
      .post(`${this.API_URL}/auth/refresh`, { refreshToken })
      .pipe(
        tap((response: any) => {
          if (response.success) {
            localStorage.setItem("accessToken", response.data.accessToken);
            localStorage.setItem("refreshToken", response.data.refreshToken);
          }
        })
      );
  }

  getCurrentUser(): Observable<any> {
    return this.http.get(`${this.API_URL}/auth/me`).pipe(
      tap((response: any) => {
        if (response.success) {
          this.currentUserSubject.next(response.data.user);
        }
      })
    );
  }

  private setSession(authData: any): void {
    localStorage.setItem("accessToken", authData.accessToken);
    localStorage.setItem("refreshToken", authData.refreshToken);
    this.currentUserSubject.next(authData.user);
  }

  private clearSession(): void {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    this.currentUserSubject.next(null);
  }

  private loadUserFromStorage(): void {
    const token = localStorage.getItem("accessToken");
    if (token) {
      this.getCurrentUser().subscribe();
    }
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem("accessToken");
  }

  getToken(): string | null {
    return localStorage.getItem("accessToken");
  }
}
```

#### Step 2: Order Service

```typescript
// src/app/core/services/order.service.ts
import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment";

export interface OrderItem {
  itemId: string;
  quantity: number;
  notes?: string;
}

export interface Customer {
  name?: string;
  phone?: string;
  address?: string;
}

export interface CreateOrderRequest {
  items: OrderItem[];
  customer?: Customer;
  tableNumber?: string;
  notes?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  items: any[];
  pricing: {
    subtotal: number;
    taxAmount: number;
    total: number;
  };
  status: string;
  paymentStatus: string;
  paymentMethod?: string;
  customer?: Customer;
  tableNumber?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

@Injectable({
  providedIn: "root",
})
export class OrderService {
  private readonly API_URL = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getOrders(params?: any): Observable<any> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach((key) => {
        if (params[key] !== null && params[key] !== undefined) {
          httpParams = httpParams.set(key, params[key]);
        }
      });
    }
    return this.http.get(`${this.API_URL}/orders`, { params: httpParams });
  }

  createOrder(orderData: CreateOrderRequest): Observable<any> {
    return this.http.post(`${this.API_URL}/orders`, orderData);
  }

  getOrder(id: string): Observable<any> {
    return this.http.get(`${this.API_URL}/orders/${id}`);
  }

  generateKOT(orderId: string): Observable<any> {
    return this.http.post(`${this.API_URL}/orders/${orderId}/kot`, {});
  }

  holdOrder(orderId: string): Observable<any> {
    return this.http.post(`${this.API_URL}/orders/${orderId}/hold`, {});
  }

  completeOrder(orderId: string, paymentMethod: string): Observable<any> {
    return this.http.post(`${this.API_URL}/orders/${orderId}/complete`, {
      paymentMethod,
    });
  }
}
```

#### Step 3: Item Service

```typescript
// src/app/core/services/item.service.ts
import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment";

export interface Item {
  id: string;
  name: string;
  description?: string;
  category: {
    id: string;
    name: string;
  };
  price: number;
  image?: {
    url?: string;
    isAiGenerated: boolean;
    aiPrompt?: string;
  };
  tax: {
    isApplicable: boolean;
    rate: number;
    type: string;
  };
  isFavourite: boolean;
  isAvailable: boolean;
  inventory: {
    trackInventory: boolean;
    currentStock: number;
    lowStockAlert: number;
  };
  createdAt: string;
  updatedAt: string;
}

@Injectable({
  providedIn: "root",
})
export class ItemService {
  private readonly API_URL = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getItems(filters?: any): Observable<any> {
    let params = new HttpParams();
    if (filters) {
      Object.keys(filters).forEach((key) => {
        if (filters[key] !== null && filters[key] !== undefined) {
          params = params.set(key, filters[key]);
        }
      });
    }
    return this.http.get(`${this.API_URL}/items`, { params });
  }

  createItem(itemData: any): Observable<any> {
    return this.http.post(`${this.API_URL}/items`, itemData);
  }

  updateItem(id: string, itemData: any): Observable<any> {
    return this.http.put(`${this.API_URL}/items/${id}`, itemData);
  }

  deleteItem(id: string): Observable<any> {
    return this.http.delete(`${this.API_URL}/items/${id}`);
  }

  toggleFavourite(id: string): Observable<any> {
    return this.http.put(`${this.API_URL}/items/${id}/toggle-favourite`, {});
  }

  toggleAvailability(id: string): Observable<any> {
    return this.http.put(`${this.API_URL}/items/${id}/toggle-availability`, {});
  }
}
```

### 5.3 Feature Modules

#### Step 1: Order Create Component

```typescript
// src/app/features/orders/order-create/order-create.component.ts
import { Component, OnInit, OnDestroy } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { Subject, takeUntil } from "rxjs";
import {
  OrderService,
  CreateOrderRequest,
  OrderItem,
} from "../../../core/services/order.service";
import { ItemService, Item } from "../../../core/services/item.service";
import { CategoryService } from "../../../core/services/category.service";
import { OutletService } from "../../../core/services/outlet.service";
import { ToastrService } from "ngx-toastr";

interface CartItem extends Item {
  cartQuantity: number;
  notes?: string;
}

@Component({
  selector: "app-order-create",
  templateUrl: "./order-create.component.html",
  styleUrls: ["./order-create.component.css"],
})
export class OrderCreateComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  items: Item[] = [];
  categories: any[] = [];
  cart: CartItem[] = [];
  filteredItems: Item[] = [];
  searchQuery = "";
  selectedCategory: string | null = null;
  showFavourite = false;

  customerForm: FormGroup;
  showCustomerDetails = false;
  showBillSummary = false;

  isLoading = false;
  isProcessing = false;

  constructor(
    private fb: FormBuilder,
    private orderService: OrderService,
    private itemService: ItemService,
    private categoryService: CategoryService,
    private outletService: OutletService,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.customerForm = this.fb.group({
      name: [""],
      phone: [""],
      address: [""],
      tableNumber: [""],
      notes: [""],
    });
  }

  ngOnInit(): void {
    this.loadData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadData(): void {
    this.isLoading = true;

    this.categoryService
      .getCategories()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.categories = response.data;
          }
        },
        error: (error) => {
          this.toastr.error("Failed to load categories");
        },
      });

    this.itemService
      .getItems({ isAvailable: true })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.items = response.data;
            this.applyFilters();
          }
          this.isLoading = false;
        },
        error: (error) => {
          this.toastr.error("Failed to load items");
          this.isLoading = false;
        },
      });
  }

  applyFilters(): void {
    let filtered = [...this.items];

    if (this.showFavourite) {
      filtered = filtered.filter((item) => item.isFavourite);
    } else if (this.selectedCategory) {
      filtered = filtered.filter(
        (item) => item.category.id === this.selectedCategory
      );
    }

    if (this.searchQuery) {
      filtered = filtered.filter((item) =>
        item.name.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    }

    this.filteredItems = filtered;
  }

  onCategorySelect(categoryId: string | null): void {
    this.selectedCategory = categoryId;
    this.showFavourite = false;
    this.applyFilters();
  }

  onFavouriteSelect(): void {
    this.showFavourite = !this.showFavourite;
    this.selectedCategory = null;
    this.applyFilters();
  }

  onSearchChange(query: string): void {
    this.searchQuery = query;
    this.applyFilters();
  }

  addToCart(item: Item): void {
    const existing = this.cart.find((i) => i.id === item.id);
    if (existing) {
      existing.cartQuantity++;
    } else {
      this.cart.push({ ...item, cartQuantity: 1 });
    }
  }

  updateQuantity(itemId: string, delta: number): void {
    const item = this.cart.find((i) => i.id === itemId);
    if (item) {
      item.cartQuantity += delta;
      if (item.cartQuantity <= 0) {
        this.removeFromCart(itemId);
      }
    }
  }

  removeFromCart(itemId: string): void {
    this.cart = this.cart.filter((i) => i.id !== itemId);
  }

  getCartTotal(): { subtotal: number; tax: number; total: number } {
    let subtotal = 0;
    let tax = 0;

    this.cart.forEach((item) => {
      const itemSubtotal = item.price * item.cartQuantity;
      subtotal += itemSubtotal;

      if (item.tax.isApplicable) {
        tax += itemSubtotal * (item.tax.rate / 100);
      }
    });

    return {
      subtotal: Number(subtotal.toFixed(2)),
      tax: Number(tax.toFixed(2)),
      total: Number((subtotal + tax).toFixed(2)),
    };
  }

  toggleCustomerDetails(): void {
    this.showCustomerDetails = !this.showCustomerDetails;
    if (!this.showCustomerDetails) {
      this.showBillSummary = false;
    }
  }

  toggleBillSummary(): void {
    this.showBillSummary = !this.showBillSummary;
    if (!this.showBillSummary) {
      this.showCustomerDetails = false;
    }
  }

  createOrder(action: "kot" | "hold" | "bill"): void {
    if (this.cart.length === 0) {
      this.toastr.error("Please add items to the order");
      return;
    }

    this.isProcessing = true;

    const orderData: CreateOrderRequest = {
      items: this.cart.map((item) => ({
        itemId: item.id,
        quantity: item.cartQuantity,
        notes: item.notes,
      })),
    };

    const customerFormValue = this.customerForm.value;
    if (customerFormValue.name || customerFormValue.phone) {
      orderData.customer = {
        name: customerFormValue.name || undefined,
        phone: customerFormValue.phone || undefined,
        address: customerFormValue.address || undefined,
      };
    }

    if (customerFormValue.tableNumber) {
      orderData.tableNumber = customerFormValue.tableNumber;
    }

    if (customerFormValue.notes) {
      orderData.notes = customerFormValue.notes;
    }

    this.orderService
      .createOrder(orderData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            const orderId = response.data.id;

            switch (action) {
              case "kot":
                this.generateKOT(orderId);
                break;
              case "hold":
                this.holdOrder(orderId);
                break;
              case "bill":
                this.router.navigate(["/orders", orderId, "invoice"]);
                break;
            }
          } else {
            this.toastr.error(
              response.error?.message || "Failed to create order"
            );
            this.isProcessing = false;
          }
        },
        error: (error) => {
          this.toastr.error("Failed to create order");
          this.isProcessing = false;
        },
      });
  }

  private generateKOT(orderId: string): void {
    this.orderService
      .generateKOT(orderId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.toastr.success("KOT generated and sent to printer!");
            this.cart = [];
            this.customerForm.reset();
            this.router.push("/orders");
          } else {
            this.toastr.error(
              response.error?.message || "Failed to generate KOT"
            );
          }
          this.isProcessing = false;
        },
        error: (error) => {
          this.toastr.error("Failed to generate KOT");
          this.isProcessing = false;
        },
      });
  }

  private holdOrder(orderId: string): void {
    this.orderService
      .holdOrder(orderId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.toastr.success("Order held successfully");
            this.cart = [];
            this.customerForm.reset();
            this.router.push("/orders");
          } else {
            this.toastr.error(
              response.error?.message || "Failed to hold order"
            );
          }
          this.isProcessing = false;
        },
        error: (error) => {
          this.toastr.error("Failed to hold order");
          this.isProcessing = false;
        },
      });
  }
}
```

#### Step 2: Bottom Navigation Component

```typescript
// src/app/shared/components/bottom-nav/bottom-nav.component.ts
import { Component } from "@angular/core";
import { Router, NavigationEnd } from "@angular/router";
import { CommonModule } from "@angular/common";
import { filter } from "rxjs/operators";

interface NavItem {
  label: string;
  icon: string;
  path: string;
  active: boolean;
  isCenter?: boolean;
}

@Component({
  selector: "app-bottom-nav",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-area-bottom"
      *ngIf="!isHidden"
    >
      <div class="flex items-center justify-around h-16 px-2">
        <ng-container *ngFor="let item of navItems">
          <button
            *ngIf="!item.isCenter"
            [routerLink]="item.path"
            class="flex flex-col items-center justify-center flex-1 h-full transition-colors"
            [class.text-blue-600]="item.active"
            [class.text-gray-600]="!item.active"
            [class.hover:text-gray-900]="!item.active"
          >
            <i [class]="item.icon + ' h-6 w-6 mb-1'"></i>
            <span class="text-xs font-medium">{{ item.label }}</span>
          </button>

          <button
            *ngIf="item.isCenter"
            [routerLink]="item.path"
            class="flex flex-col items-center justify-center -mt-6"
          >
            <div
              class="w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow"
            >
              <i [class]="item.icon + ' h-6 w-6 text-white'"></i>
            </div>
            <span class="text-xs mt-1 text-gray-700 font-medium">{{
              item.label
            }}</span>
          </button>
        </ng-container>
      </div>
    </div>
  `,
  styles: [],
})
export class BottomNavComponent {
  isHidden = false;

  navItems: NavItem[] = [
    {
      label: "Home",
      icon: "fas fa-home",
      path: "/dashboard",
      active: false,
    },
    {
      label: "Items",
      icon: "fas fa-utensils",
      path: "/items",
      active: false,
    },
    {
      label: "Add",
      icon: "fas fa-plus",
      path: "/orders/create",
      active: false,
      isCenter: true,
    },
    {
      label: "Reports",
      icon: "fas fa-chart-bar",
      path: "/reports",
      active: false,
    },
    {
      label: "More",
      icon: "fas fa-ellipsis-h",
      path: "/more",
      active: false,
    },
  ];

  constructor(private router: Router) {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.updateActiveStates(event.url);
        this.checkIfHidden(event.url);
      });
  }

  private updateActiveStates(currentUrl: string): void {
    this.navItems.forEach((item) => {
      item.active = currentUrl.startsWith(item.path);
    });
  }

  private checkIfHidden(currentUrl: string): void {
    this.isHidden =
      currentUrl === "/orders/create" || currentUrl.startsWith("/kots");
  }
}
```

### 5.4 App Configuration

#### Step 1: App Config

```typescript
// src/app/app.config.ts
import { ApplicationConfig } from "@angular/core";
import { provideRouter } from "@angular/router";
import {
  provideHttpClient,
  withInterceptorsFromDi,
} from "@angular/common/http";
import { provideAnimations } from "@angular/platform-browser/animations";
import { routes } from "./app.routes";

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()),
    provideAnimations(),
  ],
};
```

#### Step 2: App Routes

```typescript
// src/app/app.routes.ts
import { Routes } from "@angular/router";
import { AuthGuard } from "./core/guards/auth.guard";

export const routes: Routes = [
  {
    path: "auth",
    loadChildren: () =>
      import("./features/auth/auth.routes").then((m) => m.authRoutes),
  },
  {
    path: "",
    canActivate: [AuthGuard],
    children: [
      {
        path: "",
        redirectTo: "dashboard",
        pathMatch: "full",
      },
      {
        path: "dashboard",
        loadComponent: () =>
          import("./features/dashboard/dashboard.component").then(
            (m) => m.DashboardComponent
          ),
      },
      {
        path: "orders",
        loadChildren: () =>
          import("./features/orders/orders.routes").then((m) => m.orderRoutes),
      },
      {
        path: "items",
        loadChildren: () =>
          import("./features/items/items.routes").then((m) => m.itemRoutes),
      },
      {
        path: "reports",
        loadChildren: () =>
          import("./features/reports/reports.routes").then(
            (m) => m.reportRoutes
          ),
      },
      {
        path: "more",
        loadComponent: () =>
          import("./features/more/more.component").then((m) => m.MoreComponent),
      },
    ],
  },
  {
    path: "**",
    redirectTo: "dashboard",
  },
];
```

#### Step 3: Auth Guard

```typescript
// src/app/core/guards/auth.guard.ts
import { Injectable } from "@angular/core";
import { CanActivate, Router } from "@angular/router";
import { AuthService } from "../services/auth.service";
import { Observable } from "rxjs";
import { map, take } from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): Observable<boolean> {
    return this.authService.currentUser$.pipe(
      take(1),
      map((user) => {
        if (user) {
          return true;
        } else {
          this.router.navigate(["/auth/login"]);
          return false;
        }
      })
    );
  }
}
```

#### Step 4: Auth Interceptor

```typescript
// src/app/core/interceptors/auth.interceptor.ts
import { Injectable } from "@angular/core";
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
} from "@angular/common/http";
import { Observable, throwError } from "rxjs";
import { catchError, switchMap } from "rxjs/operators";
import { AuthService } from "../services/auth.service";

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;

  constructor(private authService: AuthService) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const token = this.authService.getToken();
    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401 && !this.isRefreshing) {
          this.isRefreshing = true;

          return this.authService.refreshToken().pipe(
            switchMap(() => {
              this.isRefreshing = false;
              const newToken = this.authService.getToken();
              request = request.clone({
                setHeaders: {
                  Authorization: `Bearer ${newToken}`,
                },
              });
              return next.handle(request);
            }),
            catchError(() => {
              this.isRefreshing = false;
              this.authService.logout();
              return throwError(() => error);
            })
          );
        }

        return throwError(() => error);
      })
    );
  }
}
```

#### Step 5: Main App Component

```typescript
// src/app/app.component.ts
import { Component, OnInit } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { AuthService } from "./core/services/auth.service";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  template: `
    <div class="min-h-screen bg-gray-50">
      <router-outlet></router-outlet>
    </div>
  `,
  styles: [],
})
export class AppComponent implements OnInit {
  title = "Restaurant POS";

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.authService.getCurrentUser().subscribe();
    }
  }
}
```

---

## 6. Authentication & Security

### 6.1 Firebase OTP Setup

```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  apiUrl: "http://localhost:5000/api",
  firebase: {
    apiKey: "your-firebase-api-key",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "your-app-id",
  },
};

// src/app/core/services/firebase.service.ts
import { Injectable } from "@angular/core";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
} from "firebase/auth";
import { environment } from "../../../environments/environment";

@Injectable({
  providedIn: "root",
})
export class FirebaseService {
  private auth = getAuth(initializeApp(environment.firebase));

  async setupRecaptcha(containerId: string): Promise<void> {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        containerId,
        {
          size: "invisible",
          callback: (response: any) => {
            console.log("reCAPTCHA solved");
          },
        },
        this.auth
      );
    }
  }

  async sendOTP(phoneNumber: string): Promise<ConfirmationResult> {
    const appVerifier = window.recaptchaVerifier;
    return await signInWithPhoneNumber(this.auth, phoneNumber, appVerifier);
  }

  getCurrentUser() {
    return this.auth.currentUser;
  }
}
```

### 6.2 JWT Token Management

```typescript
// src/app/core/services/token.service.ts
import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class TokenService {
  private tokenSubject = new BehaviorSubject<string | null>(this.getToken());
  public token$ = this.tokenSubject.asObservable();

  getToken(): string | null {
    return localStorage.getItem("accessToken");
  }

  setToken(token: string): void {
    localStorage.setItem("accessToken", token);
    this.tokenSubject.next(token);
  }

  removeToken(): void {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    this.tokenSubject.next(null);
  }

  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) return true;

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const expiry = payload.exp * 1000;
      return Date.now() > expiry;
    } catch {
      return true;
    }
  }
}
```

---

## 7. Key Features Implementation

### 7.1 Order Creation Flow

**Complete Implementation:**

- Item selection with category filtering
- Real-time cart management
- Customer details collection
- KOT generation and printing
- Order hold/resume functionality
- Invoice generation with QR codes

### 7.2 Multi-Outlet Management

**Implementation Steps:**

1. Outlet selection component
2. Outlet-specific data filtering
3. Outlet configuration management
4. User-outlet association

### 7.3 AI Image Generation

**OpenAI Integration:**

```typescript
// src/app/core/services/ai.service.ts
import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment";

@Injectable({
  providedIn: "root",
})
export class AiService {
  private readonly API_URL = environment.apiUrl;

  constructor(private http: HttpClient) {}

  generateImage(description: string): Observable<any> {
    return this.http.post(`${this.API_URL}/ai/generate-image`, { description });
  }

  enhanceDescription(description: string): Observable<any> {
    return this.http.post(`${this.API_URL}/ai/enhance-description`, {
      description,
    });
  }
}
```

### 7.4 Reporting & Analytics

**Chart Implementation:**

```typescript
// src/app/features/reports/sales-chart/sales-chart.component.ts
import { Component, OnInit } from "@angular/core";
import { ChartConfiguration, ChartType } from "chart.js";
import { BaseChartDirective } from "ng2-charts";

@Component({
  selector: "app-sales-chart",
  template: `
    <div class="w-full h-64">
      <canvas
        baseChart
        [data]="chartData"
        [options]="chartOptions"
        [type]="chartType"
      >
      </canvas>
    </div>
  `,
})
export class SalesChartComponent implements OnInit {
  chartType: ChartType = "line";
  chartData: ChartConfiguration["data"] = {
    datasets: [
      {
        data: [],
        label: "Sales",
      },
    ],
    labels: [],
  };
  chartOptions: ChartConfiguration["options"] = {
    responsive: true,
    maintainAspectRatio: false,
  };

  ngOnInit(): void {
    this.loadSalesData();
  }

  loadSalesData(): void {
    // Load data from service
  }
}
```

---

## 8. UI/UX Specifications

This section documents the complete UI/UX design from the Next.js app for accurate Angular implementation.

### 8.1 Design System

#### Color Palette

```scss
// Primary Colors
$primary-blue: #0066ff;
$primary-blue-hover: #0052cc;
$primary-blue-light: #e6f0ff;

// Status Colors
$success-green: #10b981;
$success-green-light: #d1fae5;
$warning-yellow: #f59e0b;
$warning-yellow-light: #fef3c7;
$error-red: #ef4444;
$error-red-light: #fee2e2;

// Neutral Colors
$gray-50: #f9fafb;
$gray-100: #f3f4f6;
$gray-200: #e5e7eb;
$gray-300: #d1d5db;
$gray-600: #4b5563;
$gray-700: #374151;
$gray-900: #111827;

// Background
$bg-main: #f9fafb;
$bg-white: #ffffff;
```

#### Typography

```scss
// Font Family
$font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;

// Font Sizes
$text-xs: 0.75rem; // 12px
$text-sm: 0.875rem; // 14px
$text-base: 1rem; // 16px
$text-lg: 1.125rem; // 18px
$text-xl: 1.25rem; // 20px
$text-2xl: 1.5rem; // 24px

// Font Weights
$font-medium: 500;
$font-semibold: 600;
$font-bold: 700;
```

#### Spacing System

```scss
// Based on 4px base unit
$spacing-1: 0.25rem; // 4px
$spacing-2: 0.5rem; // 8px
$spacing-3: 0.75rem; // 12px
$spacing-4: 1rem; // 16px
$spacing-5: 1.25rem; // 20px
$spacing-6: 1.5rem; // 24px
$spacing-8: 2rem; // 32px
```

#### Border Radius

```scss
$radius-sm: 0.375rem; // 6px
$radius-md: 0.5rem; // 8px
$radius-lg: 0.75rem; // 12px
$radius-xl: 1rem; // 16px
$radius-2xl: 1.25rem; // 20px
$radius-full: 9999px; // Full circle
```

#### Shadows

```scss
$shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
$shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
$shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
$shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
$shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
```

### 8.2 Layout Structure

#### Mobile-First Approach

- **Viewport**: width=device-width, initial-scale=1, maximum-scale=1, user-scalable=false
- **Safe Areas**: Apply padding-bottom for iOS safe area on fixed bottom elements
- **Min Height**: min-h-screen for full-screen pages
- **Background**: bg-gray-50 (#f9fafb) for main content area

#### Bottom Navigation

```typescript
// Component: BottomNav
// Position: Fixed at bottom
// Height: 64px (h-16)
// Background: White with top border
// Items: 5 navigation items
// Center Item: Elevated with rounded-full bg-blue-600

Interface BottomNavItem {
  label: string;
  icon: LucideIcon;
  path: string;
  isCenter?: boolean;  // Center "Add" button
  active: boolean;
}

Navigation Items:
1. Home - /dashboard
2. Items - /items
3. Add (Center, elevated) - /orders/create
4. Reports - /reports
5. More - /more

Hide on: /orders/create, /kots (full-screen pages)
```

### 8.3 Page Specifications

#### 8.3.1 Dashboard Page (/dashboard)

**Layout:**

```
┌─────────────────────────────────────┐
│ [Outlet Name ▼]        [Logo/Avatar]│ ← Header (sticky)
├─────────────────────────────────────┤
│ 🖨️ Printer Status     [Offline] ⟳ │ ← Status Card
├─────────────────────────────────────┤
│ Quick Actions                       │
│ ┌──────┐ ┌──────┐ ┌──────┐         │
│ │  ✓   │ │  🕐  │ │  🍴  │         │ ← 3 circular buttons
│ │Closed│ │On Hold│ │Add   │         │
│ └──────┘ └──────┘ └──────┘         │
├─────────────────────────────────────┤
│ Business Overview            ⟳     │
│ ┌─────────────────────────────────┐│
│ │ 🏪                              ││
│ │                                 ││
│ │ Today's sales  │ Today's orders ││
│ │ ₹ 0.00         │ 0              ││
│ │ ₹ 0.00 (Yest.) │ 0 (Yest.)     ││
│ │                                 ││
│ │ [Top selling items >]           ││
│ └─────────────────────────────────┘│
├─────────────────────────────────────┤
│ ┌──────────────┐ ┌──────────────┐ │
│ │Paid Invoices │ │Month to Date │ │
│ │     0        │ │   ₹ 0.00     │ │
│ └──────────────┘ └──────────────┘ │
├─────────────────────────────────────┤
│ More Actions                        │
│ [🍴 Create New Order]              │
│ [✓ View Kitchen Orders]            │
│ [🏪 Manage Customers]              │
└─────────────────────────────────────┘
```

**Components:**

1. **Header**

   - Sticky position
   - White background, bottom border
   - Outlet selector (clickable, shows modal)
   - Outlet logo/avatar (right side)

2. **Printer Status Card**

   - Icon: Printer
   - Status badge: "Online" (green) or "Offline" (gray)
   - Refresh button

3. **Quick Actions**

   - 3 circular buttons (w-16 h-16)
   - Blue background (#0066ff)
   - White icons
   - Shadow on hover
   - Icons: CheckCircle, Clock, UtensilsCrossed

4. **Business Overview Card**

   - Gradient background: from-blue-50 to-white
   - Store icon in white card
   - Grid layout for stats (2 columns)
   - Link to reports (clickable with chevron)
   - Refresh button in header

5. **Stats Cards**
   - 2-column grid
   - White background
   - Border and shadow
   - Large numbers with labels

#### 8.3.2 Order Creation Page (/orders/create)

**Layout:**

```
┌─────────────────────────────────────┐
│ ← New Order        🛒 2 items       │ ← Header (sticky)
│ [Search items...]                   │
│ [All] [Veg] [Non-Veg] [Beverages]  │ ← Category filter
├─────────────────────────────────────┤
│                                     │
│ ┌────────┐ ┌────────┐              │
│ │[Image] │ │[Image] │              │ ← Item cards (2 cols)
│ │₹99     │ │₹149    │              │   - Price badge (top-left)
│ │  [-]   │ │  [+]   │              │   - Quantity controls (overlay)
│ │  [2]   │ │        │              │
│ │  [+]   │ │        │              │
│ └────────┘ └────────┘              │
│                                     │
│ ┌────────┐ ┌────────┐              │
│ │[Image] │ │[Image] │              │
│ └────────┘ └────────┘              │
│                                     │
│                                     │
│                                     │
│                          [👤]       │ ← Floating action buttons
│                          [🧾]       │   (right bottom)
├─────────────────────────────────────┤
│ Total Amount  ₹298                  │ ← Cart summary (fixed bottom)
│ 2 items                             │
│ [KOT] [HOLD] [BILL]                │ ← Action buttons
└─────────────────────────────────────┘
```

**Key Features:**

1. **Header**

   - Back button (left)
   - "New Order" title
   - Cart item count (right)
   - Search bar
   - Category filter (horizontal scroll)

2. **Category Filter**

   - Horizontal scrollable chips
   - Active state: blue background
   - Special "Favourite" chip with star icon
   - "All Items" default

3. **Item Cards**

   - 2-column grid
   - Image with aspect ratio 5:4
   - Price badge (top-left, white bg, blue text)
   - Add button (+) if not in cart
   - Quantity controls if in cart:
     - Blue rounded-full background
     - Minus, quantity, plus buttons
     - Positioned at bottom-center overlay

4. **Floating Action Buttons (FAB)**

   - Position: fixed bottom-right
   - 2 buttons vertically stacked
   - User icon: Customer details
   - Receipt icon: Bill summary
   - White background, shadow, circular
   - Active state: blue background

5. **Customer Details Card** (Floating)

   - Slides in from bottom
   - White background, shadow-2xl
   - Position: above cart summary
   - Fields: Name, Phone, Table Number, Notes
   - Close button (X)

6. **Bill Summary Card** (Floating)

   - Similar to customer details
   - Shows: Subtotal, Tax, Total
   - Right-aligned amounts

7. **Cart Summary** (Fixed Bottom)
   - White background, top border, shadow
   - Total amount (large, blue)
   - Item count
   - 3 action buttons (equal width):
     - KOT (outline)
     - HOLD (outline)
     - BILL (primary blue)

#### 8.3.3 Items Page (/items)

**Layout:**

```
┌─────────────────────────────────────┐
│ Items              [+ Add Item]     │ ← Header (sticky)
│ [Search items...]                   │
│ [All] [Veg] [Non-Veg] [Beverages]  │ ← Category filter
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐│
│ │ [Img] Item Name       ₹99 [Edit]││ ← Item card (list view)
│ │       [★ Unavailable]            ││
│ │ [⭐] [👁] [🗑]                   ││ ← Action buttons
│ └─────────────────────────────────┘│
│ ┌─────────────────────────────────┐│
│ │ [Img] Item Name       ₹149 [Edit]││
│ │       ⭐                          ││
│ │ [⭐] [👁] [🗑]                   ││
│ └─────────────────────────────────┘│
└─────────────────────────────────────┘
```

**Key Features:**

1. **Header**

   - Title: "Items"
   - Add button (primary blue)
   - Search bar
   - Category filter

2. **Item Cards**

   - List view (full width)
   - Left: Thumbnail (80x80px, rounded)
   - Middle: Name, price, status badges
   - Right: Edit button
   - Favourite star badge (top-right of image)
   - Bottom row: 3 action buttons
     - Toggle favourite (star)
     - Toggle availability (eye/eye-off)
     - Delete (trash, red)

3. **Empty State**
   - Dashed border card
   - Emoji: 🍽️
   - Text: "No items found"
   - Subtitle: "Add your first menu item"

#### 8.3.4 Reports Page (/reports)

**Layout:**

```
┌─────────────────────────────────────┐
│ ← Reports & Analytics    • Live    │ ← Header (sticky)
│   Business insights                 │
│   Last updated: 10:30:25 AM         │
├─────────────────────────────────────┤
│ Today's Performance                 │
│ ┌──────────┐ ┌──────────┐          │
│ │🛒 ↑15%   │ │₹ ↑8.5%   │          │ ← Stats cards
│ │   25     │ │ ₹1,250   │          │
│ │Orders    │ │Revenue   │          │
│ │Yest: 20  │ │Yest: ₹1,150│        │
│ └──────────┘ └──────────┘          │
│ ┌──────────────────────────────┐   │
│ │🧾 Month to Date              │   │
│ │   ₹35,000                    │   │
│ └──────────────────────────────┘   │
├─────────────────────────────────────┤
│ Detailed Reports                    │
│ [₹ Sales Report             >]     │ ← Report links
│ [🛒 Item Sales Report       >]     │   (green highlight)
│ [📄 Order Report            >]     │
│ [📊 Category Report         >]     │
│ [💳 Payment Methods         >]     │
└─────────────────────────────────────┘
```

**Key Features:**

1. **Header**

   - Back button
   - Title with subtitle
   - Live indicator (green pulsing dot)
   - Last updated timestamp

2. **Stats Cards**

   - 2-column grid
   - Icon with colored background
   - Percentage change (up/down arrow)
   - Large number
   - Label
   - Yesterday comparison

3. **Report Links**
   - Full-width cards
   - Icon with colored circle
   - Title and description
   - Right chevron
   - Hover effect (shadow-md)
   - Special highlight for "Item Sales Report" (green background)

#### 8.3.5 More Page (/more)

**Layout:**

```
┌─────────────────────────────────────┐
│ More                                │ ← Header
│ Manage your restaurant              │
├─────────────────────────────────────┤
│ [🏪] Outlets                    >  │
│      Manage your outlets            │
│ [👥] Manage Staff               >  │
│      Staff members & roles          │
│ [👥] Customers                  >  │
│      Customer database              │
│ [📄] Orders                     >  │
│      View all orders                │
│ [👨‍🍳] Kitchen (KOT)              >  │
│      Kitchen order tickets          │
│ [🧾] Invoices                   >  │
│      Billing & payments             │
│ [💰] Expenses                   >  │
│      Track expenses                 │
│ [📦] Inventory                  >  │
│      Stock management               │
│ [🖨️] Printers                   >  │
│      Printer management             │
│ [📈] Analytics                  >  │
│      Reports & insights             │
│ [📁] Categories                 >  │
│      Manage categories              │
│ [⚙️] Settings                   >  │
│      App preferences                │
│ [🚪] Logout                     >  │ ← Red color
│      Sign out of your account       │
└─────────────────────────────────────┘
```

**Key Features:**

1. **Header**

   - Title: "More"
   - Subtitle: "Manage your restaurant"

2. **Menu Cards**

   - Full-width cards
   - Icon in colored circle (left)
   - Title (bold)
   - Description (small, gray)
   - Right chevron
   - Hover effect
   - Each card has unique color scheme

3. **Logout Card**
   - Special styling (red border)
   - Red icon and text
   - Confirmation dialog on click

### 8.4 Component Library

#### Button Variants

```typescript
// Primary Button
class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-colors"

// Outline Button
class="border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-semibold py-2 px-4 rounded-lg transition-colors"

// Ghost Button
class="text-gray-700 hover:bg-gray-100 font-semibold py-2 px-4 rounded-lg transition-colors"

// Circular FAB (Large)
class="w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg flex items-center justify-center text-white transition-shadow"

// Circular Action Button (Small)
class="w-16 h-16 rounded-full bg-blue-600 shadow-lg hover:shadow-xl flex items-center justify-center text-white"
```

#### Card Components

```typescript
// Standard Card
class="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"

// Gradient Card
class="bg-gradient-to-br from-blue-50 to-white rounded-lg border border-gray-200"

// Stat Card
class="bg-white rounded-lg border border-gray-200 p-4"
```

#### Input Components

```typescript
// Text Input
class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"

// Search Input (with icon)
class="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
```

#### Badge Components

```typescript
// Status Badge (Online)
class="text-xs px-2 py-1 rounded-full font-medium bg-green-100 text-green-700"

// Status Badge (Offline)
class="text-xs px-2 py-1 rounded-full font-medium bg-gray-100 text-gray-600"

// Price Badge
class="text-sm font-bold text-blue-600 bg-white/95 backdrop-blur-sm px-2 py-1 rounded-md shadow-md"
```

### 8.5 Modal Specifications

#### Outlet Selector Modal

**Layout:**

```
┌─────────────────────────────────────┐
│ Select an Outlet              ⟳    │ ← Header
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐│
│ │ 🏪 You Are Logged In With       ││
│ │    9876543210                   ││ ← User info
│ └─────────────────────────────────┘│
│ My Outlets                          │
│ ┌─────────────────────────────────┐│
│ │ [Logo] SWADIKA            ✓ ⚙️  ││ ← Active outlet
│ │        SYNC ON                  ││   (blue border)
│ └─────────────────────────────────┘│
│ ┌─────────────────────────────────┐│
│ │ [Logo] Branch 2             ⚙️  ││ ← Other outlet
│ │        SYNC ON                  ││   (gray border)
│ └─────────────────────────────────┘│
│ [Create New Outlet]                 │ ← Primary button
│ [Logout]                            │ ← Outline button
└─────────────────────────────────────┘
```

**Features:**

- Centered modal (max-w-md)
- Rounded corners (rounded-2xl)
- Scrollable outlet list
- Edit button for each outlet
- Check mark on active outlet
- Logo/icon display
- Create new outlet button
- Logout button

#### KOT Preview Modal

**Layout:**

```
┌─────────────────────────────────────┐
│            KOT Preview        ✕     │
├─────────────────────────────────────┤
│ Outlet Name                         │
│ Address, Phone                      │
│                                     │
│ KOT #001                            │
│ Order #12345                        │
│ Table: 5                            │
│ Time: 10:30 AM                      │
│                                     │
│ ────────────────────────────────    │
│ Item Name              Qty          │
│ Notes                               │
│ ────────────────────────────────    │
│                                     │
│ [Print KOT]  [Print Bill]          │
└─────────────────────────────────────┘
```

#### Invoice Preview Modal

**Layout:**

```
┌─────────────────────────────────────┐
│         Invoice Preview       ✕     │
├─────────────────────────────────────┤
│ Outlet Name                         │
│ GSTIN: XXXXX                        │
│                                     │
│ Invoice #INV-001                    │
│ Date: 11/11/2025                    │
│                                     │
│ Item          Qty   Price   Total   │
│ ────────────────────────────────    │
│                                     │
│              Subtotal: ₹100         │
│              Tax (5%): ₹5           │
│              Total: ₹105            │
│                                     │
│         [QR Code]                   │
│                                     │
│ [Print Invoice]  [Share]            │
└─────────────────────────────────────┘
```

### 8.6 Animation & Transitions

```scss
// Standard transitions
.transition-all {
  transition-property: all;
  transition-duration: 150ms;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

// Hover effects
.hover-shadow {
  transition: box-shadow 150ms;
  &:hover {
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  }
}

// Loading spinner
.spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

// Slide in from bottom
@keyframes slide-in-bottom {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

// Pulse animation (live indicator)
@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
```

### 8.7 Responsive Breakpoints

```scss
// Mobile First - Default styles for mobile
// No media query needed

// Tablet (640px and up)
@media (min-width: 640px) {
  // Increase card sizes
  // Show more columns in grids
}

// Desktop (1024px and up)
@media (min-width: 1024px) {
  // Side navigation instead of bottom nav
  // Multi-column layouts
}

// Note: Current Next.js app is mobile-only
// Desktop view can be enhanced in Angular implementation
```

### 8.8 Icon Library

**Primary Icons (Lucide React → @angular/material icons)**

```typescript
// Navigation
Home → home
UtensilsCrossed → restaurant
Plus → add
BarChart3 → bar_chart
Menu → menu

// Actions
Edit → edit
Trash2 → delete
Star → star / star_border
Eye / EyeOff → visibility / visibility_off
Search → search
ChevronRight → chevron_right
ChevronDown → expand_more
ArrowLeft → arrow_back
RefreshCw → refresh

// Business
Store → store
ShoppingCart → shopping_cart
Receipt → receipt
Printer → print
IndianRupee → currency_rupee

// Status
CheckCircle → check_circle
Clock → schedule
TrendingUp / TrendingDown → trending_up / trending_down
User → person
Settings → settings
LogOut → logout
```

### 8.9 State Management Patterns

**Store Structure (Zustand → NgRx/Akita)**

```typescript
// Auth Store
interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Order Store
interface OrderState {
  orders: Order[];
  currentOrder: Order | null;
  isLoading: boolean;
  error: string | null;
  filters: OrderFilters;
}

// Outlet Store
interface OutletState {
  outlets: Outlet[];
  currentOutlet: Outlet | null;
  isLoading: boolean;
  error: string | null;
}

// Item Store
interface ItemState {
  items: Item[];
  categories: Category[];
  filters: ItemFilters;
  isLoading: boolean;
}

// Report Store
interface ReportState {
  dashboardStats: DashboardStats | null;
  isLoading: boolean;
}
```

### 8.10 API Response Formats

**Standard Success Response:**

```typescript
{
  success: true,
  data: {
    // Response data
  },
  message?: string
}
```

**Standard Error Response:**

```typescript
{
  success: false,
  error: {
    message: string,
    code?: string,
    details?: any
  }
}
```

**Paginated Response:**

```typescript
{
  success: true,
  data: T[],
  pagination: {
    page: number,
    limit: number,
    total: number,
    totalPages: number
  }
}
```

### 8.11 Critical Implementation Notes

#### PWA Configuration

```json
// manifest.json
{
  "name": "Restaurant POS System",
  "short_name": "Restaurant POS",
  "theme_color": "#0066ff",
  "background_color": "#ffffff",
  "display": "standalone",
  "orientation": "portrait",
  "start_url": "/dashboard",
  "icons": [
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

#### Performance Optimizations

1. **Image Optimization**

   - Use lazy loading for images
   - Implement image CDN or optimized serving
   - Use WebP format with fallbacks
   - Thumbnail generation for item images

2. **Code Splitting**

   - Lazy load feature modules
   - Route-based code splitting
   - Vendor chunk separation

3. **Caching Strategy**

   - Cache static assets (Service Worker)
   - API response caching (30 seconds for dashboard stats)
   - Local storage for offline support

4. **Data Fetching**
   - Auto-refresh dashboard every 30 seconds
   - Debounce search inputs (300ms)
   - Infinite scroll for large lists
   - Pagination for orders/items

#### Accessibility

- ARIA labels for icon-only buttons
- Keyboard navigation support
- Focus management in modals
- Color contrast ratios (WCAG AA)
- Screen reader support

#### Error Handling

```typescript
// Standard error display
toast.error(error?.response?.data?.error?.message || "Operation failed");

// Loading states
isLoading ? <Spinner /> : <Content />;

// Empty states
items.length === 0 ? <EmptyState /> : <ItemsList />;

// Network errors
if (error.code === "NETWORK_ERROR") {
  toast.error("Please check your internet connection");
}
```

#### Security Considerations

1. **Authentication**

   - JWT tokens in localStorage (auto-refresh on expiry)
   - Protected routes with AuthGuard
   - Auto-logout on 401 responses

2. **Data Validation**

   - Client-side validation for forms
   - Server-side validation (always)
   - Sanitize user inputs

3. **API Security**
   - CORS configuration
   - Rate limiting
   - Request size limits

#### Print Functionality

```typescript
// KOT Printing
- Thermal printer support (58mm/80mm)
- ESC/POS command formatting
- Network printer connectivity
- Auto-print on KOT generation

// Invoice Printing
- A4 size support
- QR code for payment
- GST invoice format
- Print and share options
```

#### Offline Support

```typescript
// Service Worker Strategy
- Cache-first for static assets
- Network-first for API calls
- Background sync for failed requests
- Offline indicator in UI

// Data Sync
- Queue failed operations
- Retry on connection restore
- Conflict resolution strategy
```

#### Multi-Outlet Support

```typescript
// Implementation Details
- Outlet selection modal on first login
- Outlet switcher in dashboard header
- Filter all data by currentOutlet
- User can belong to multiple outlets
- Outlet-specific settings
- Separate printer configurations per outlet
```

#### Real-time Updates

```typescript
// Auto-refresh Strategy
- Dashboard stats: every 30 seconds
- Order status: on visibility change
- KOT list: polling when on KOT page
- Consider WebSocket for future enhancement
```

---

## 9. Testing Strategy

### 9.1 Backend Testing

```csharp
// RestaurantPOS.API.Tests/Controllers/AuthControllerTests.cs
using Xunit;
using Moq;
using RestaurantPOS.API.Controllers;
using RestaurantPOS.Core.Interfaces;
using Microsoft.AspNetCore.Mvc;

public class AuthControllerTests
{
    private readonly Mock<IAuthService> _authServiceMock;
    private readonly AuthController _controller;

    public AuthControllerTests()
    {
        _authServiceMock = new Mock<IAuthService>();
        _controller = new AuthController(_authServiceMock.Object, null);
    }

    [Fact]
    public async Task SendOTP_ValidPhone_ReturnsSuccess()
    {
        // Arrange
        var phone = "9876543210";
        _authServiceMock.Setup(x => x.ValidatePhoneNumberAsync(phone))
            .ReturnsAsync(true);

        // Act
        var result = await _controller.SendOTP(new Core.DTOs.SendOTPRequest { Phone = phone });

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        // Add more assertions
    }
}
```

### 8.2 Frontend Testing

```typescript
// src/app/core/services/auth.service.spec.ts
import { TestBed } from "@angular/core/testing";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { AuthService } from "./auth.service";

describe("AuthService", () => {
  let service: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService],
    });
    service = TestBed.inject(AuthService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  it("should send OTP", (done) => {
    const phone = "9876543210";
    service.sendOTP(phone).subscribe((response) => {
      expect(response.success).toBeTruthy();
      done();
    });
  });
});
```

---

## 9. Deployment

### 9.1 Backend Deployment

```bash
# Build and publish
cd RestaurantPOS.API
dotnet publish -c Release -o ./publish

# Deploy to IIS
# 1. Install .NET Core Hosting Bundle
# 2. Create website in IIS Manager
# 3. Point to publish folder
# 4. Configure web.config
```

### 9.2 Frontend Deployment

```bash
# Build for production
cd restaurant-pos-frontend
ng build --configuration production

# Deploy dist folder to web server
```

### 9.3 Docker Deployment (Optional)

```dockerfile
# Dockerfile for API
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
WORKDIR /app
EXPOSE 80

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY ["RestaurantPOS.API/RestaurantPOS.API.csproj", "RestaurantPOS.API/"]
RUN dotnet restore "RestaurantPOS.API/RestaurantPOS.API.csproj"
COPY . .
WORKDIR "/src/RestaurantPOS.API"
RUN dotnet build "RestaurantPOS.API.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "RestaurantPOS.API.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "RestaurantPOS.API.dll"]
```

---

## 10. Troubleshooting

### Common Issues

#### Backend Issues

1. **Database Connection Error**

   - Check connection string in appsettings.json
   - Ensure SQL Server is running
   - Verify firewall settings

2. **JWT Token Issues**

   - Verify JWT configuration
   - Check token expiration
   - Validate secret key

3. **Firebase Authentication**
   - Verify service account key path
   - Check Firebase project configuration
   - Ensure proper permissions

#### Frontend Issues

1. **CORS Errors**

   - Configure CORS policy in backend
   - Check API URL in environment files

2. **Authentication Issues**

   - Verify token storage
   - Check interceptor configuration
   - Validate token expiration

3. **Build Errors**
   - Clear node_modules and reinstall
   - Check Angular CLI version
   - Verify TypeScript configuration

### Performance Optimization

#### Database Optimization

- Add proper indexes
- Implement query optimization
- Use connection pooling

#### API Optimization

- Implement caching
- Use pagination
- Optimize database queries

#### Frontend Optimization

- Lazy loading modules
- Bundle optimization
- Image optimization

---

## Implementation Checklist

### Phase 1: Foundation ✅

- [x] Project structure setup
- [x] Database schema creation
- [x] Entity Framework configuration
- [x] Basic API controllers
- [x] Authentication setup

### Phase 2: Core Features 🔄

- [ ] Order creation and management
- [ ] Item management with categories
- [ ] KOT generation and printing
- [ ] Customer management
- [ ] Basic reporting

### Phase 3: Advanced Features ⏳

- [ ] AI image generation
- [ ] Multi-outlet support
- [ ] Inventory management
- [ ] Advanced analytics
- [ ] PWA features

### Phase 4: Production Ready ⏳

- [ ] Comprehensive testing
- [ ] Performance optimization
- [ ] Security hardening
- [ ] Deployment automation
- [ ] Monitoring setup

---

**Next Steps:**

1. Start with Phase 1 implementation
2. Test each component thoroughly
3. Gradually implement Phase 2 features
4. Deploy to staging environment
5. Conduct user acceptance testing
6. Move to production

**Estimated Timeline:** 8-12 weeks for complete implementation

**Resources Required:**

- 2-3 Full-stack developers
- 1 DevOps engineer
- 1 QA engineer
- 1 UI/UX designer

---

_This instruction file provides a comprehensive guide for implementing the Restaurant POS system migration. Follow the steps sequentially and test thoroughly at each phase._
