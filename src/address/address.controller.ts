import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { AddressService } from './address.service';
import { Address } from './address.schema';

@Controller('address')
export class AddressController {
  constructor(private readonly addressService: AddressService) {}
  @Post()
  create(@Body() data: Address) {
    return this.addressService.create(data);
  }
  @Get()
  findAll() {
    return this.addressService.findAll();
  }
  @Get('/:id')
  findOne(@Param('id') id: string) {
    return this.addressService.findOne(id);
  }
  @Patch('/:id') 
  update(@Param('id') id: string, @Body() data: Address) {
    return this.addressService.update(id, data);
  }
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.addressService.delete(id);
  }
}
