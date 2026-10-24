using System.Threading.Tasks;
using ERP.APPLICATION.Interfaces.IRepository;
using ERP.APPLICATIONBUSINESS.Interfaces.IRepository;


namespace ERP.APPLICATIONBUSINESS.Interfaces
{
    public interface IUnitOfWork
    {
        IProductRepository Products { get; }

        IInventoryRepository Inventory { get; }
        ICategoryRepository Categories { get; }
        IUserRepository Users { get; }
        IRoleRepository Roles { get; }
        IProjectRepository Projects { get; }
        ITaskRepository Tasks { get; }
        IEmployeeRepository Employees { get; }

        IDashboardRepository Dashboard { get; }

        IDepartmentRepository Department { get; }

        ILeaveTypeRepository LeaveType { get; }

        ILeaveRequestRepository LeaveRequest { get; }

        ICustomerRepository Customer { get; }

        ISalesOrderRepository SalesOrder { get; }

        ISupplierRepository Supplier { get; }
        IPurchaseOrderRepository PurchaseOrder { get; }
        IGoodsReceiptRepository GoodsReceipt { get; }
        IInvoiceRepository Invoice { get; }

        IAttendanceRepository Attendance { get; }
        ITimesheetRepository Timesheets { get; }
        ISettingsRepository Settings { get; }

        IWarehouseRepository Warehouse { get; }

        IWarehouseInventoryRepository WarehouseInventory { get; }

        IAuditLogRepository AuditLog { get; }

        Task<int> SaveChangesAsync();
    }
}