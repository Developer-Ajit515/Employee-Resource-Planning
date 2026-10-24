using ERP.APPLICATIONBUSINESS.Interfaces.IRepository;
using ERP.APPLICATIONBUSINESS.Interfaces;
using ERP.INFRASTRUCTUREDATA.Data;
using System.Threading.Tasks;
using ERP.DOMAINMODELS.Entities;
using ERP.APPLICATION.Interfaces.IRepository;


namespace ERP.INFRASTRUCTUREDATA.Repositories
{
    public class UnitOfWork : IUnitOfWork
    {
        private readonly AppDbContext _context;

        public UnitOfWork(
            AppDbContext context,
            IProductRepository productRepository,
            IInventoryRepository inventoryRepository,
            IWarehouseRepository warehouseRepository,
            IWarehouseInventoryRepository warehouseInventoryRepository,
            ICategoryRepository categoryRepository,
            IUserRepository userRepository,
            IRoleRepository roleRepository,
            IProjectRepository projectRepository,
            ITaskRepository taskRepository,
            IEmployeeRepository employeeRepository,
            ILeaveTypeRepository leaveTypeRepository,
            ILeaveRequestRepository leaveRequestRepository,
            ICustomerRepository customerRepository,
            ISalesOrderRepository salesOrderRepository,
            IGoodsReceiptRepository goodsReceiptRepository,
            ISupplierRepository supplierRepository,
            IPurchaseOrderRepository  purchaseOrderRepository,
            IInvoiceRepository invoiceRepository,
            IAttendanceRepository attendanceRepository,
            IDashboardRepository dashboardRepository,
            IDepartmentRepository department,
            ISettingsRepository settingsRepository,
            ITimesheetRepository timesheetRepository,
            IAuditLogRepository auditLogRepository)
        {
            _context = context;
            Products = productRepository;
            Warehouse = warehouseRepository;
            WarehouseInventory = warehouseInventoryRepository;
            Inventory = inventoryRepository;
            Categories = categoryRepository;
            Users = userRepository;
            Roles = roleRepository;
            Projects = projectRepository;
            Tasks = taskRepository;
            Employees = employeeRepository;
            LeaveType = leaveTypeRepository;
            Customer = customerRepository;
            SalesOrder = salesOrderRepository;
            Supplier = supplierRepository;
            PurchaseOrder = purchaseOrderRepository;
            GoodsReceipt = goodsReceiptRepository;
            Invoice = invoiceRepository;
            LeaveRequest = leaveRequestRepository;
            Attendance  = attendanceRepository;
            Dashboard = dashboardRepository;
            Department = department;
            Settings = settingsRepository;
            AuditLog = auditLogRepository;
            Timesheets = timesheetRepository;
        }

        public IProductRepository Products { get; private set; }

        public IInventoryRepository Inventory { get; private set; }
        public ICategoryRepository Categories { get; private set; }
        public IUserRepository Users { get; private set; }
        public IRoleRepository Roles { get; private set; }
        public IProjectRepository Projects { get; private set; }
        public ITaskRepository Tasks { get; private set; }

        public IEmployeeRepository Employees { get; private set; }

        public IDashboardRepository Dashboard { get; private set; }

        public IDepartmentRepository Department { get; private set; }

        public ISettingsRepository Settings { get; private set; }

        public IAuditLogRepository AuditLog { get; private set; }

        public ILeaveTypeRepository LeaveType { get; private set; }

        public ITimesheetRepository Timesheets { get; private set; }
        public ILeaveRequestRepository LeaveRequest { get; private set; }

        public ICustomerRepository Customer { get; private set; }

        public ISalesOrderRepository SalesOrder { get; private set; }
        public IInvoiceRepository Invoice {  get; private set; }

        public IAttendanceRepository Attendance { get; private set; }

        public IWarehouseRepository Warehouse { get; private set; }
        public IWarehouseInventoryRepository WarehouseInventory { get; private set; }

        public ISupplierRepository Supplier { get; private set; }

        public IPurchaseOrderRepository PurchaseOrder { get; private set; }

        public IGoodsReceiptRepository GoodsReceipt { get; private set; }

        

        public async Task<int> SaveChangesAsync()
        {
            return await _context.SaveChangesAsync();
        }
    }
}