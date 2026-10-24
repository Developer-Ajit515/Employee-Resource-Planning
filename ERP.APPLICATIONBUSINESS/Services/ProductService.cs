using AutoMapper;
using ERP.APPLICATIONBUSINESS.Exceptions;
using ERP.APPLICATIONBUSINESS.Interfaces;
using ERP.APPLICATIONBUSINESS.Interfaces.IRepository;
using ERP.APPLICATIONBUSINESS.Interfaces.IServices;
using ERP.DOMAINMODELS.Dtos;
using ERP.DOMAINMODELS.DTOs;
using ERP.DOMAINMODELS.Entities;
using Microsoft.Extensions.Caching.Memory;
using System.Threading;

namespace ERP.APPLICATIONBUSINESS.Services
{
    public class ProductService : IProductService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IProductRepository _repository;
        private readonly IMapper _mapper;
        private readonly IAuditLogService _auditLogService;
        private readonly IMemoryCache _cache;


        public ProductService(
            IUnitOfWork unitOfWork,
            IProductRepository repository,
            IMapper mapper, 
            IAuditLogService auditLogService,
            IMemoryCache cache)
        {
            _unitOfWork = unitOfWork;
            _repository = repository;
            _mapper = mapper;
            _auditLogService = auditLogService;
            _cache = cache;
        }

        public async Task<IEnumerable<ProductDto>> GetAll()
        {
            const string cacheKey = "Products_All";

            var products = await _cache.GetOrCreateAsync(
                cacheKey,
                async entry =>
                {
                    entry.AbsoluteExpirationRelativeToNow =
                        TimeSpan.FromMinutes(5);

                    entry.SlidingExpiration =
                        TimeSpan.FromMinutes(2);

                    var data = await _repository.GetAll();


                    return data.Select(p => new ProductDto
                    {
                        Id = p.Id,
                        Name = p.Name,
                        Price = p.Price,
                        Stock = p.Stock,
                        CategoryId = p.CategoryId
                    }).ToList();

                });

            return products ?? Enumerable.Empty<ProductDto>();
        }

        public async Task<ProductDto> GetById(int id)
        {
            var product = await _unitOfWork.Products.GetById(id);

            if (product == null)
                throw new NotFoundException("Product not found");

            return _mapper.Map<ProductDto>(product);
        }

        public async Task Add(CreateProductDto dto, CancellationToken cancellationToken = default)
        {
            var product = _mapper.Map<Product>(dto);

            await _unitOfWork.Products.Add(product);

            await _unitOfWork.SaveChangesAsync();

            _cache.Remove("Products_All");

            await _auditLogService.CreateAsync(
                new AuditLogDto
                {
                    UserId = null,
                    Action = "Created",
                    EntityName = "Product",
                    EntityId = product.Id.ToString(),
                    Description = $"Product '{product.Name}' was created.",
                    OldValues = null,
                    NewValues = null,
                    IpAddress = null
                },
                cancellationToken);
        }



        public async Task Update(UpdateProductDto dto)
        {
            var existingProduct =
                await _unitOfWork.Products.GetById(dto.Id);

            if (existingProduct == null)
                throw new NotFoundException("Product not found");

            _mapper.Map(dto, existingProduct);

            _unitOfWork.Products.Update(existingProduct);

            await _unitOfWork.SaveChangesAsync();

            _cache.Remove("Products_All");

            await _auditLogService.CreateAsync(
                new AuditLogDto
                {
                    UserId = null,
                    Action = "Updated",
                    EntityName = "Product",
                    EntityId = existingProduct.Id.ToString(),
                    Description = $"Product '{existingProduct.Name}' was updated.",
                    OldValues = null,
                    NewValues = null,
                    IpAddress = null
                });
        }

        public async Task Delete(int id)
        {
            var product = await _unitOfWork.Products.GetById(id);

            if (product == null)
                throw new NotFoundException("Product not found");

            _unitOfWork.Products.Delete(product);

            await _unitOfWork.SaveChangesAsync();
        }

        public async Task<IEnumerable<ProductDto>> GetLowStockProducts(int threshold)
        {
            var products = await _unitOfWork.Products
                .GetLowStockProducts(threshold);

            return _mapper.Map<IEnumerable<ProductDto>>(products);
        }


       


    }
}