using ERP.DOMAINMODELS.Dtos;
using ERP.DOMAINMODELS.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ERP.APPLICATIONBUSINESS.Interfaces.IServices
{

    public interface IProductService
    {
        Task<IEnumerable<ProductDto>> GetAll();

        Task<ProductDto> GetById(int id);

        Task Add(CreateProductDto dto, CancellationToken cancellationToken = default);

        Task Update(UpdateProductDto dto);

        Task Delete(int id);
        Task<IEnumerable<ProductDto>> GetLowStockProducts(int thresold);
    }

           
        
    
}
