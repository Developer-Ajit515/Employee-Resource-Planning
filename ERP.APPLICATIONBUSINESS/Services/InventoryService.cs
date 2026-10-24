
using ERP.APPLICATIONBUSINESS.Interfaces.IRepository;
using ERP.APPLICATIONBUSINESS.Interfaces.IServices;
using ERP.DOMAINMODELS.Dtos;
using ERP.DOMAINMODELS.DTOs;
using ERP.DOMAINMODELS.Entities;

namespace ERP.APPLICATIONBUSINESS.Services
{
    public class InventoryService : IInventoryService
    {
        private readonly IInventoryRepository _repository;
        private readonly IAuditLogService _auditLogService;

        public InventoryService(
            IInventoryRepository repository,
            IAuditLogService auditLogService)
        {
            _repository = repository;
            _auditLogService = auditLogService;
        }

        // =========================
        // GET ALL
        // =========================

        public async Task<IEnumerable<InventoryDto>> GetAllAsync()
        {
            var inventories = await _repository.GetAllAsync();
            return inventories.Select(MapToDto);
        }

        // =========================
        // GET BY ID
        // =========================

        public async Task<InventoryDto?> GetByIdAsync(int id)
        {
            var inventory = await _repository.GetByIdAsync(id);

            return inventory == null ? null : MapToDto(inventory);
        }

        // =========================
        // GET BY PRODUCT ID
        // =========================

        public async Task<IEnumerable<InventoryDto>> GetByProductIdAsync(
            int productId)
        {
            var inventories =
                await _repository.GetByProductIdAsync(productId);

            return inventories.Select(MapToDto);
        }

        // =========================
        // STOCK IN
        // =========================

        public async Task<InventoryDto> StockInAsync(
            CreateStockInDto dto)
        {
            if (dto.Quantity <= 0)
                throw new ArgumentException(
                    "Stock-in quantity must be greater than zero.");

            var inventories =
                await _repository.GetByProductIdAsync(dto.ProductId);

            var existing = inventories.FirstOrDefault();

            if (existing == null)
            {
                var inventory = new Inventory
                {
                    ProductId = dto.ProductId,
                    Quantity = dto.Quantity,
                    TransactionType = "IN",
                    Remarks = dto.Remarks,
                    CreatedAt = DateTime.UtcNow
                };

                var created = await _repository.AddAsync(inventory);

                await _auditLogService.CreateAsync(new AuditLogDto
                {
                    UserId = null,
                    Action = "Stock In",
                    EntityName = "Inventory",
                    EntityId = created.Id.ToString(),
                    Description =
                        $"Stock added for Product ID {dto.ProductId}. " +
                        $"Quantity: {dto.Quantity}",
                    OldValues = null,
                    NewValues =
                        $"ProductId: {dto.ProductId}, " +
                        $"Quantity: {created.Quantity}",
                    IpAddress = null
                });

                return MapToDto(created);
            }

            var oldQuantity = existing.Quantity;

            existing.Quantity += dto.Quantity;
            existing.TransactionType = "IN";
            existing.Remarks = dto.Remarks;
            existing.CreatedAt = DateTime.UtcNow;

            var success = await _repository.UpdateAsync(existing);

            if (!success)
                throw new Exception("Failed to update inventory.");

            await _auditLogService.CreateAsync(new AuditLogDto
            {
                UserId = null,
                Action = "Stock In",
                EntityName = "Inventory",
                EntityId = existing.Id.ToString(),
                Description =
                    $"Stock added for Product ID {dto.ProductId}. " +
                    $"Quantity: {dto.Quantity}",
                OldValues = $"Quantity: {oldQuantity}",
                NewValues = $"Quantity: {existing.Quantity}",
                IpAddress = null
            });

            return MapToDto(existing);
        }

        // =========================
        // STOCK OUT
        // =========================

        public async Task<InventoryDto> StockOutAsync(
            CreateStockOutDto dto)
        {
            if (dto.Quantity <= 0)
                throw new ArgumentException(
                    "Stock-out quantity must be greater than zero.");

            var inventories =
                await _repository.GetByProductIdAsync(dto.ProductId);

            var existing = inventories.FirstOrDefault();

            if (existing == null)
                throw new Exception("Inventory not found.");

            if (existing.Quantity < dto.Quantity)
                throw new Exception("Insufficient stock.");

            var oldQuantity = existing.Quantity;

            existing.Quantity -= dto.Quantity;
            existing.TransactionType = "OUT";
            existing.CreatedAt = DateTime.UtcNow;
            existing.Remarks = dto.Remarks;

            var success = await _repository.UpdateAsync(existing);

            if (!success)
                throw new Exception("Failed to update inventory.");

            await _auditLogService.CreateAsync(new AuditLogDto
            {
                UserId = null,
                Action = "Stock Out",
                EntityName = "Inventory",
                EntityId = existing.Id.ToString(),
                Description =
                    $"Stock removed for Product ID {dto.ProductId}. " +
                    $"Quantity: {dto.Quantity}",
                OldValues = $"Quantity: {oldQuantity}",
                NewValues = $"Quantity: {existing.Quantity}",
                IpAddress = null
            });

            return MapToDto(existing);
        }

        // =========================
        // STOCK ADJUSTMENT
        // =========================

        public async Task<InventoryDto> StockAdjustmentAsync(
            CreateStockAdjustmentDto dto)
        {
            var inventories =
                await _repository.GetByProductIdAsync(dto.ProductId);

            var existing = inventories.FirstOrDefault();

            if (existing == null)
            {
                var inventory = new Inventory
                {
                    ProductId = dto.ProductId,
                    Quantity = dto.Quantity,
                    TransactionType = "ADJUSTMENT",
                    Remarks = dto.Remarks,
                    CreatedAt = DateTime.UtcNow
                };

                var created = await _repository.AddAsync(inventory);

                await _auditLogService.CreateAsync(new AuditLogDto
                {
                    UserId = null,
                    Action = "Stock Adjustment",
                    EntityName = "Inventory",
                    EntityId = created.Id.ToString(),
                    Description =
                        $"Initial inventory adjustment for Product ID " +
                        $"{dto.ProductId}. Quantity: {dto.Quantity}",
                    OldValues = null,
                    NewValues = $"Quantity: {created.Quantity}",
                    IpAddress = null
                });

                return MapToDto(created);
            }

            var oldQuantity = existing.Quantity;

            existing.Quantity += dto.Quantity;
            existing.TransactionType = "ADJUSTMENT";
            existing.Remarks = dto.Remarks;
            existing.CreatedAt = DateTime.UtcNow;

            var success = await _repository.UpdateAsync(existing);

            if (!success)
                throw new Exception("Failed to update inventory.");

            await _auditLogService.CreateAsync(new AuditLogDto
            {
                UserId = null,
                Action = "Stock Adjustment",
                EntityName = "Inventory",
                EntityId = existing.Id.ToString(),
                Description =
                    $"Inventory adjusted for Product ID {dto.ProductId}. " +
                    $"Adjustment: {dto.Quantity}",
                OldValues = $"Quantity: {oldQuantity}",
                NewValues = $"Quantity: {existing.Quantity}",
                IpAddress = null
            });

            return MapToDto(existing);
        }

        // =========================
        // DELETE
        // =========================

        public async Task<bool> DeleteAsync(int id)
        {
            var inventory = await _repository.GetByIdAsync(id);

            if (inventory == null)
                return false;

            var success = await _repository.DeleteAsync(id);

            if (success)
            {
                await _auditLogService.CreateAsync(new AuditLogDto
                {
                    UserId = null,
                    Action = "Deleted",
                    EntityName = "Inventory",
                    EntityId = id.ToString(),
                    Description =
                        $"Inventory record for Product ID " +
                        $"{inventory.ProductId} was deleted.",
                    OldValues = $"Quantity: {inventory.Quantity}",
                    NewValues = null,
                    IpAddress = null
                });
            }

            return success;
        }

        // =========================
        // MAPPING
        // =========================

        private static InventoryDto MapToDto(Inventory inventory)
        {
            return new InventoryDto
            {
                Id = inventory.Id,
                ProductId = inventory.ProductId,
                ProductName = inventory.Product?.Name,
                Quantity = inventory.Quantity,
                TransactionType = inventory.TransactionType,
                ReferenceType = inventory.ReferenceType,
                ReferenceId = inventory.ReferenceId,
                Remarks = inventory.Remarks,
                CreatedAt = inventory.CreatedAt
            };
        }
    }
}
