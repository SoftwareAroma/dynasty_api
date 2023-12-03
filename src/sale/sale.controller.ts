import { Body, Controller, Param, Post } from '@nestjs/common';
import { SaleService } from './sale.service';
import { CreateSaleDto } from './dto/sale.dto';
import { Sale } from '@prisma/client';

@Controller({ path: 'sale', version: '1' })
export class SaleController {
    constructor(
        private saleService: SaleService,
    ) { }

    /**
     * Create a new sale
     * @param createSaleDto - sale data to be created
     * @returns Sale
     */
    @Post('create')
    async createSale(
        @Body() createSaleDto: CreateSaleDto,
    ): Promise<Sale> {
        return await this.saleService.createSale(createSaleDto);
    }

    /**
     * Get all sales
     * @returns List<Sale>
     */
    @Post('all')
    async getSales(): Promise<Array<Sale>> {
        return await this.saleService.getSales();
    }

    /**
     * Get a sale by id
     * @param id - sale id
     * @returns Sale
     */
    @Post('/:id')
    async getSaleById(
        @Param('id') id: string,
    ): Promise<Sale> {
        return await this.saleService.getSaleById(id);
    }

    /**
     * Get all sales by employee id
     * @param employeeId - employee id
     * @returns List<Sale>
     */
    @Post('employee/:id')
    async getSalesByEmployeeId(
        @Param('id') employeeId: string,
    ): Promise<Array<Sale>> {
        return await this.saleService.getSalesByEmployeeId(employeeId);
    }

    /**
     * Get sales by product id
     * @param productId - product id
     * @returns List<Sale>
     */
    @Post('product/:id')
    async getSalesByProductId(
        @Param('id') productId: string,
    ): Promise<Array<Sale>> {
        return await this.saleService.getSalesByProductId(productId);
    }

    /**
     * Update a sale by id
     * @param id - sale id
     * @param createSaleDto - sale data to be updated 
     * @returns Sale
     */
    @Post('update/:id')
    async updateSaleById(
        @Param('id') id: string,
        @Body() createSaleDto: CreateSaleDto,
    ): Promise<Sale> {
        return await this.saleService.updateSale(id, createSaleDto);
    }

    /**
     * Delete a sale by id
     * @param id - sale id
     * @returns true if the sale was deleted
     */
    @Post('delete/:id')
    async deleteSaleById(
        @Param('id') id: string,
    ): Promise<boolean> {
        return await this.saleService.deleteSale(id);
    }

}
