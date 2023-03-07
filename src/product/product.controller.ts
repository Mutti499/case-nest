import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { Product } from './product.schema';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}
  @Post()
  create(@Body() data: Product) {
    return this.productService.create(data);
  }
  @Get()
  findAll() {
    return this.productService.findAll();
  }
  @Get('/:id')
  findOne(@Param('id') id: string) {
    return this.productService.findOne(id);
  }
  @Patch('/:id')
  update(@Param('id') id: string, @Body() data: Product) {
    return this.productService.update(id, data);
  }
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productService.delete(id);
  }
}
