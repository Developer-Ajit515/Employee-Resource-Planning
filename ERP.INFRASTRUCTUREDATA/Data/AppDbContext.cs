using ERP.DOMAINMODELS.Entities;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Text.Json;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using ERP.DOMAINMODELS.Entities.ERP.DOMAINMODELS.Entities;


namespace ERP.INFRASTRUCTUREDATA.Data
{
    public class AppDbContext : DbContext
    {
        private readonly IAuditLogContext? _auditLogContext;

        public AppDbContext(
            DbContextOptions<AppDbContext> options,
            IAuditLogContext? auditLogContext = null)
            : base(options)
        {
            _auditLogContext = auditLogContext;
        }

        public DbSet<Product> Products { get; set; }

        public DbSet<Category> Categories { get; set; }
        public DbSet<User> Users { get; set; }

        public DbSet<Role> Roles { get; set; }

        public DbSet<Permission> Permissions { get; set; }

        public DbSet<UserRole> UserRoles { get; set; }

        public DbSet<RolePermission> RolePermissions { get; set; }
        public DbSet<Project> Projects { get; set; }

        public DbSet<ProjectTask> ProjectTasks { get; set; }

        public DbSet<Timesheet> Timesheets { get; set; }

        public DbSet<Employee> Employees { get; set; }
        public DbSet<Notification> Notifications { get; set; }

        public DbSet<Message> Messages { get; set; }
        public DbSet<AuditLog> AuditLogs { get; set; }
        public DbSet<Customer> Customers { get; set; }

        public DbSet<Payment> Payments { get; set; }

        public DbSet<SalesOrder> SalesOrders { get; set; }

        public DbSet<SalesOrderItem> SalesOrderItems { get; set; }

        public DbSet<Department> Departments { get; set; }

        public DbSet<LeaveType> LeaveTypes { get; set; }

        public DbSet<LeaveRequest> LeaveRequests { get; set; }

        public DbSet<Attendance> Attendances { get; set; }

        public DbSet<StockTransaction> StockTransactions { get; set; }

        public DbSet<Warehouse> Warehouses { get; set; }
        public DbSet<WarehouseInventory> WarehouseInventories {  get; set;  }

        public DbSet<Inventory> Inventories { get; set; }

        public DbSet<Invoice> Invoices { get; set; }

        public DbSet<InvoiceItem> InvoiceItems { get; set; }

        public DbSet<Supplier> Suppliers { get; set; }

        public DbSet<PurchaseOrder> PurchaseOrders { get; set; }

        public DbSet<PurchaseOrderItem> PurchaseOrderItems { get; set; }

        public DbSet<GoodsReceipt> GoodsReceipts { get; set; }

        public DbSet<GoodsReceiptItem>GoodsReceiptItems { get; set; }

        public DbSet<SystemSetting> SystemSettings { get; set; }

        private sealed class AuditSnapshot
        {
            public EntityEntry Entry { get; init; } = null!;
            public string Action { get; init; } = string.Empty;
            public string EntityName { get; init; } = string.Empty;
            public string? OldValues { get; init; }
            public string? NewValues { get; init; }
        }

        private static readonly HashSet<string> SensitiveProperties =
            new(StringComparer.OrdinalIgnoreCase)
            {
        "Password",
        "PasswordHash",
        "Token",
        "AccessToken",
        "RefreshToken",
        "Secret",
        "ClientSecret",
        "SecurityStamp"
            };

        private static bool IsSensitive(string propertyName)
        {
            return SensitiveProperties.Contains(propertyName)
                || propertyName.Contains("Password",
                    StringComparison.OrdinalIgnoreCase)
                || propertyName.Contains("Token",
                    StringComparison.OrdinalIgnoreCase)
                || propertyName.Contains("Secret",
                    StringComparison.OrdinalIgnoreCase);
        }

        private static string SerializeValues(
            IDictionary<string, object?> values)
        {
            return JsonSerializer.Serialize(values);
        }

        private List<AuditSnapshot> CaptureAuditSnapshots()
        {
            ChangeTracker.DetectChanges();

            return ChangeTracker.Entries()
                .Where(entry =>
                    entry.Entity is not AuditLog &&
                    (entry.State == EntityState.Added ||
                     entry.State == EntityState.Modified ||
                     entry.State == EntityState.Deleted))
                .Select(entry =>
                {
                    var oldValues = new Dictionary<string, object?>();
                    var newValues = new Dictionary<string, object?>();

                    foreach (var property in entry.Properties)
                    {
                        var name = property.Metadata.Name;

                        if (IsSensitive(name))
                            continue;

                        if (entry.State == EntityState.Added)
                        {
                            newValues[name] = property.CurrentValue;
                        }
                        else if (entry.State == EntityState.Deleted)
                        {
                            oldValues[name] = property.OriginalValue;
                        }
                        else if (property.IsModified)
                        {
                            oldValues[name] = property.OriginalValue;
                            newValues[name] = property.CurrentValue;
                        }
                    }

                    var action = entry.State switch
                    {
                        EntityState.Added => "Create",
                        EntityState.Modified => "Update",
                        EntityState.Deleted => "Delete",
                        _ => string.Empty
                    };

                    return new AuditSnapshot
                    {
                        Entry = entry,
                        Action = action,
                        EntityName = entry.Metadata.ClrType.Name,
                        OldValues = oldValues.Count > 0
                            ? SerializeValues(oldValues)
                            : null,
                        NewValues = newValues.Count > 0
                            ? SerializeValues(newValues)
                            : null
                    };
                })
                .ToList();
        }

        private string? GetEntityId(EntityEntry entry)
        {
            var primaryKey = entry.Metadata.FindPrimaryKey();

            if (primaryKey == null)
                return null;

            var values = primaryKey.Properties.Select(property =>
            {
                var value = entry.Property(property.Name).CurrentValue;
                return value?.ToString() ?? string.Empty;
            });

            return string.Join(",", values);
        }

        private async Task<int> SaveWithAuditAsync( CancellationToken cancellationToken)
        {
            var snapshots = CaptureAuditSnapshots();

            if (snapshots.Count == 0)
            {
                return  await base.SaveChangesAsync(
                acceptAllChangesOnSuccess: true,
                cancellationToken: cancellationToken);
            }

            Microsoft.EntityFrameworkCore.Storage.IDbContextTransaction?
                transaction = null;

            var ownsTransaction = Database.IsRelational()
                && Database.CurrentTransaction == null;

            try
            {
                if (ownsTransaction)
                {
                    transaction = await Database.BeginTransactionAsync(
                        cancellationToken);
                }

                // Save business entities first so generated IDs are available.
                var businessChanges =
                    await base.SaveChangesAsync(
                    acceptAllChangesOnSuccess: true,
                    cancellationToken: cancellationToken);

                var auditLogs = snapshots.Select(snapshot => new AuditLog
                {
                    UserId = _auditLogContext?.GetUserId(),
                    Action = snapshot.Action,
                    EntityName = snapshot.EntityName,
                    EntityId = GetEntityId(snapshot.Entry),
                    Description = $"{snapshot.Action} {snapshot.EntityName}",
                    OldValues = snapshot.OldValues,
                    NewValues = snapshot.NewValues,
                    IpAddress = _auditLogContext?.GetIpAddress(),
                    CreatedAt = DateTime.UtcNow
                }).ToList();

                AuditLogs.AddRange(auditLogs);

                var auditChanges =
                    await base.SaveChangesAsync(cancellationToken);

                if (transaction != null)
                {
                    await transaction.CommitAsync(cancellationToken);
                }

                return businessChanges + auditChanges;
            }
            catch
            {
                if (transaction != null)
                {
                    await transaction.RollbackAsync(CancellationToken.None);
                }

                throw;
            }
            finally
            {
                if (transaction != null)
                {
                    await transaction.DisposeAsync();
                }
            }
        }

        public override Task<int> SaveChangesAsync(
            CancellationToken cancellationToken = default)
        {
            return SaveWithAuditAsync(cancellationToken);
        }

        public override Task<int> SaveChangesAsync(
            bool acceptAllChangesOnSuccess,
            CancellationToken cancellationToken = default)
        {
            // This implementation accepts changes after both saves.
            // Do not use acceptAllChangesOnSuccess=false with this audit pattern.
            return SaveWithAuditAsync(cancellationToken);
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // =====================================================
            // USER ROLE - MANY TO MANY
            // =====================================================

            modelBuilder.Entity<UserRole>()
                .HasKey(x => new
                {
                    x.UserId,
                    x.RoleId
                });

            modelBuilder.Entity<UserRole>()
                .HasOne(x => x.User)
                .WithMany(x => x.UserRoles)
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<UserRole>()
                .HasOne(x => x.Role)
                .WithMany(x => x.UserRoles)
                .HasForeignKey(x => x.RoleId)
                .OnDelete(DeleteBehavior.Cascade);


            // =====================================================
            // ROLE PERMISSION - MANY TO MANY
            // =====================================================

            modelBuilder.Entity<RolePermission>()
                .HasKey(x => new
                {
                    x.RoleId,
                    x.PermissionId
                });

            modelBuilder.Entity<RolePermission>()
                .HasOne(x => x.Role)
                .WithMany(x => x.RolePermissions)
                .HasForeignKey(x => x.RoleId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<RolePermission>()
                .HasOne(x => x.Permission)
                .WithMany(x => x.RolePermissions)
                .HasForeignKey(x => x.PermissionId)
                .OnDelete(DeleteBehavior.Cascade);


            // =====================================================
            // PRODUCT
            // =====================================================

            modelBuilder.Entity<Product>()
                .Property(x => x.Price)
                .HasPrecision(18, 2);


            // =====================================================
            // INVENTORY
            // =====================================================

            modelBuilder.Entity<Inventory>()
               .HasOne(x => x.Product)
               .WithMany()
               .HasForeignKey(x => x.ProductId)
               .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<WarehouseInventory>()
              .HasOne(x => x.Warehouse)
              .WithMany(x => x.WarehouseInventories)
              .HasForeignKey(x => x.WarehouseId)
              .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<WarehouseInventory>()
                .HasOne(x => x.Product)
                .WithMany()
                .HasForeignKey(x => x.ProductId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<WarehouseInventory>()
                .HasIndex(x => new
                {
                    x.WarehouseId,
                    x.ProductId
                })
                .IsUnique();


            // =====================================================
            // INVOICES
            // =====================================================

            modelBuilder.Entity<Invoice>()
                .HasKey(x => x.InvoiceId);

            modelBuilder.Entity<InvoiceItem>()
                .HasKey(x => x.InvoiceItemId);

            modelBuilder.Entity<Invoice>()
                .HasMany(x => x.InvoiceItems)
                .WithOne(x => x.Invoice)
                .HasForeignKey(x => x.InvoiceId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Invoice>()
                .HasOne(x => x.Customer)
                .WithMany()
                .HasForeignKey(x => x.CustomerId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<InvoiceItem>()
                .HasOne(x => x.Product)
                .WithMany()
                .HasForeignKey(x => x.ProductId)
                .OnDelete(DeleteBehavior.Restrict);


            // =====================================================
            // PAYMENTS
            // =====================================================

            modelBuilder.Entity<Payment>(entity =>
            {
                entity.HasKey(p => p.PaymentId);

                entity.Property(p => p.PaymentNumber)
                    .IsRequired()
                    .HasMaxLength(50);

                entity.Property(p => p.Amount)
                    .HasPrecision(18, 2);

                entity.Property(p => p.PaymentMethod)
                    .IsRequired()
                    .HasMaxLength(50);

                entity.Property(p => p.Status)
                    .IsRequired()
                    .HasMaxLength(50);

                entity.Property(p => p.ReferenceNumber)
                    .HasMaxLength(100);

                entity.HasOne(p => p.Invoice)
                    .WithMany(i => i.Payments)
                    .HasForeignKey(p => p.InvoiceId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(p => p.Customer)
                    .WithMany(c => c.Payments)
                    .HasForeignKey(p => p.CustomerId)
                    .OnDelete(DeleteBehavior.Restrict);
            });


            // =====================================================
            // EMPLOYEE
            // =====================================================

            modelBuilder.Entity<Employee>()
                .Property(x => x.Salary)
                .HasPrecision(18, 2);

            modelBuilder.Entity<Employee>()
                .HasOne(e => e.Department)
                .WithMany(d => d.Employees)
                .HasForeignKey(e => e.DepartmentId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Employee>()
                .HasOne(e => e.User)
                .WithMany()
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Restrict);


            // =====================================================
            // Leave
            // =====================================================


            modelBuilder.Entity<LeaveRequest>()
                .HasOne(l => l.Employee)
                .WithMany()
                .HasForeignKey(l => l.EmployeeId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<LeaveRequest>()
                .HasOne(l => l.LeaveType)
                .WithMany(l => l.LeaveRequests)
                .HasForeignKey(l => l.LeaveTypeId)
                .OnDelete(DeleteBehavior.Restrict);

            // =====================================================
            // Attendance
            // =====================================================


            modelBuilder.Entity<Attendance>(entity =>
{
             entity.HasKey(x => x.AttendanceId);

             entity.Property(x => x.Status)
                .IsRequired()
                  .HasMaxLength(20);

             entity.Property(x => x.Remarks)
                   .HasMaxLength(500);

             entity.HasOne(x => x.Employee)
                   .WithMany()
                   .HasForeignKey(x => x.EmployeeId)
                   .OnDelete(DeleteBehavior.Restrict);

             entity.HasIndex(x => new
    {
                x.EmployeeId,
                x.AttendanceDate
    })
               .IsUnique();
});


            // =====================================================
            // PROJECT TASK
            // =====================================================

            modelBuilder.Entity<ProjectTask>()
                .Property(x => x.EstimatedHours)
                .HasPrecision(18, 2);

            modelBuilder.Entity<ProjectTask>()
                .Property(x => x.ActualHours)
                .HasPrecision(18, 2);

            modelBuilder.Entity<ProjectTask>()
                .Property(x => x.TaskCode)
                .HasMaxLength(50)
                .IsRequired();

            modelBuilder.Entity<ProjectTask>()
                .Property(x => x.Priority)
                .HasMaxLength(20)
                .IsRequired();

            modelBuilder.Entity<ProjectTask>()
                .Property(x => x.Status)
                .HasMaxLength(30)
                .IsRequired();

            modelBuilder.Entity<Timesheet>(entity =>
            {
                entity.ToTable("Timesheets");

                entity.HasKey(x => x.Id);

                entity.Property(x => x.Hours)
                    .HasPrecision(18, 2);

                entity.HasOne(x => x.ProjectTask)
                    .WithMany(x => x.Timesheets)
                    .HasForeignKey(x => x.ProjectTaskId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // =====================================================
            // STOCK TRANSACTION
            // =====================================================

            modelBuilder.Entity<StockTransaction>()
                .Property(x => x.Quantity)
                .HasPrecision(18, 2);



            // =====================================================
            // SALES ORDER
            // =====================================================


            modelBuilder.Entity<SalesOrder>()
                .HasOne(x => x.Customer)
                .WithMany(x => x.SalesOrders)
                .HasForeignKey(x => x.CustomerId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<SalesOrder>()
                .Property(x => x.Subtotal)
                .HasPrecision(18, 2);

            modelBuilder.Entity<SalesOrder>()
                .Property(x => x.DiscountAmount)
                .HasPrecision(18, 2);

            modelBuilder.Entity<SalesOrder>()
                .Property(x => x.TaxAmount)
                .HasPrecision(18, 2);

            modelBuilder.Entity<SalesOrder>()
                .Property(x => x.TotalAmount)
                .HasPrecision(18, 2);

            modelBuilder.Entity<SalesOrderItem>()
                .HasOne(x => x.SalesOrder)
                .WithMany(x => x.Items)
                .HasForeignKey(x => x.SalesOrderId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<SalesOrderItem>()
                .HasOne(x => x.Product)
                .WithMany()
                .HasForeignKey(x => x.ProductId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<SalesOrderItem>()
                .Property(x => x.Quantity)
                .HasPrecision(18, 3);

            modelBuilder.Entity<SalesOrderItem>()
                .Property(x => x.UnitPrice)
                .HasPrecision(18, 2);

            modelBuilder.Entity<SalesOrderItem>()
                .Property(x => x.DiscountAmount)
                .HasPrecision(18, 2);

            modelBuilder.Entity<SalesOrderItem>()
                .Property(x => x.TaxAmount)
                .HasPrecision(18, 2);

            modelBuilder.Entity<SalesOrderItem>()
                .Property(x => x.TotalAmount)
                .HasPrecision(18, 2);


            // =====================================================
            // NOTIFICATION
            // =====================================================

            modelBuilder.Entity<Notification>()
                .Property(x => x.Title)
                .HasMaxLength(200)
                .IsRequired();

            modelBuilder.Entity<Notification>()
                .Property(x => x.Type)
                .HasMaxLength(50);

            modelBuilder.Entity<Notification>()
                .Property(x => x.ReferenceType)
                .HasMaxLength(100);


            modelBuilder.Entity<PurchaseOrder>()
    .HasKey(x => x.Id);

            modelBuilder.Entity<PurchaseOrder>()
                .HasIndex(x => x.PONumber)
                .IsUnique();

            modelBuilder.Entity<PurchaseOrder>()
                .Property(x => x.SubTotal)
                .HasPrecision(18, 2);

            modelBuilder.Entity<PurchaseOrder>()
                .Property(x => x.DiscountAmount)
                .HasPrecision(18, 2);

            modelBuilder.Entity<PurchaseOrder>()
                .Property(x => x.TaxAmount)
                .HasPrecision(18, 2);

            modelBuilder.Entity<PurchaseOrder>()
                .Property(x => x.ShippingAmount)
                .HasPrecision(18, 2);

            modelBuilder.Entity<PurchaseOrder>()
                .Property(x => x.OtherCharges)
                .HasPrecision(18, 2);

            modelBuilder.Entity<PurchaseOrder>()
                .Property(x => x.GrandTotal)
                .HasPrecision(18, 2);


            modelBuilder.Entity<PurchaseOrderItem>()
                .HasKey(x => x.Id);

            modelBuilder.Entity<PurchaseOrderItem>()
                .Property(x => x.Quantity)
                .HasPrecision(18, 3);

            modelBuilder.Entity<PurchaseOrderItem>()
                .Property(x => x.UnitPrice)
                .HasPrecision(18, 2);

            modelBuilder.Entity<PurchaseOrderItem>()
                .Property(x => x.DiscountPercent)
                .HasPrecision(18, 2);

            modelBuilder.Entity<PurchaseOrderItem>()
                .Property(x => x.DiscountAmount)
                .HasPrecision(18, 2);

            modelBuilder.Entity<PurchaseOrderItem>()
                .Property(x => x.TaxPercent)
                .HasPrecision(18, 2);

            modelBuilder.Entity<PurchaseOrderItem>()
                .Property(x => x.TaxAmount)
                .HasPrecision(18, 2);

            modelBuilder.Entity<PurchaseOrderItem>()
                .Property(x => x.LineTotal)
                .HasPrecision(18, 2);

            modelBuilder.Entity<PurchaseOrderItem>()
                .Property(x => x.ReceivedQuantity)
                .HasPrecision(18, 3);

            modelBuilder.Entity<PurchaseOrderItem>()
                .Property(x => x.PendingQuantity)
                .HasPrecision(18, 3);


            // Supplier → Purchase Orders

            modelBuilder.Entity<PurchaseOrder>()
                .HasOne(x => x.Supplier)
                .WithMany(x => x.PurchaseOrders)
                .HasForeignKey(x => x.SupplierId)
                .OnDelete(DeleteBehavior.Restrict);


            // Purchase Order → Items

            modelBuilder.Entity<PurchaseOrderItem>()
                .HasOne(x => x.PurchaseOrder)
                .WithMany(x => x.Items)
                .HasForeignKey(x => x.PurchaseOrderId)
                .OnDelete(DeleteBehavior.Cascade);


            // Product → PO Items

            modelBuilder.Entity<PurchaseOrderItem>()
                .HasOne(x => x.Product)
                .WithMany()
                .HasForeignKey(x => x.ProductId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<GoodsReceipt>(entity =>
            {
                entity.HasKey(x => x.Id);

                entity.Property(x => x.ReceiptNumber)
                    .IsRequired()
                    .HasMaxLength(50);

                entity.HasIndex(x => x.ReceiptNumber)
                    .IsUnique();

                entity.Property(x => x.Status)
                    .IsRequired()
                    .HasMaxLength(30);

                entity.Property(x => x.Notes)
                    .HasMaxLength(1000);

                entity.HasMany(x => x.Items)
                    .WithOne(x => x.GoodsReceipt)
                    .HasForeignKey(x => x.GoodsReceiptId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<GoodsReceiptItem>(entity =>
            {
                entity.HasKey(x => x.Id);

                entity.Property(x => x.ProductName)
                    .IsRequired()
                    .HasMaxLength(200);

                entity.Property(x => x.OrderedQuantity)
                    .HasPrecision(18, 2);

                entity.Property(x => x.ReceivedQuantity)
                    .HasPrecision(18, 2);

                entity.Property(x => x.Remarks)
                    .HasMaxLength(500);
            });
        }


    }
}
