using ERP.APIMain.Attributes;
using ERP.APPLICATIONBUSINESS.Interfaces.IServices;
using ERP.DOMAINMODELS.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ERP.APIMain.Controllers
{
    //[Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class ProductController : ControllerBase
    {
        private readonly IProductService _productService;

        public ProductController(IProductService productService)
        {
            _productService = productService;
        }

        // GET: api/product
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var products = await _productService.GetAll();

            return Ok(products);
        }

        // GET: api/product/5
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var product = await _productService.GetById(id);

            return Ok(product);
        }

        // POST: api/product
        [HasPermission("Product.Create")]
        [HttpPost]
        public async Task<IActionResult> Create(CreateProductDto dto)
        {
            await _productService.Add(dto);

            return Ok(new
            {
                message = "Product created successfully"
            });
        }

        // PUT: api/product
        [HasPermission("Product.Edit")]
        [HttpPut]
        public async Task<IActionResult> Update(
     [FromBody] UpdateProductDto dto)
        {
            await _productService.Update(dto);

            return Ok(new
            {
                message = "Product updated successfully"
            });
        }

        // DELETE: api/product/5
        [HasPermission("Product.Delete")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            await _productService.Delete(id);

            return Ok(new
            {
                message = "Product deleted successfully"
            });
        }

        // GET: api/product/low-stock?threshold=10
        [HttpGet("low-stock")]
        public async Task<IActionResult> GetLowStockProducts(int threshold)
        {
            var products = await _productService
                .GetLowStockProducts(threshold);

            return Ok(products);
        }
    }
}