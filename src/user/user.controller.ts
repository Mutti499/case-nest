import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { UserService } from './user.service';
import { Address } from '../address/address.schema';
import { Subscription } from '../subscription/subscription.schema';
import { Order } from '../order/order.schema';

import { User } from './user.schema';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async createUser(@Body() data: any): Promise<User> {
    return this.userService.createUser(
      data.user.name,
      data.user.email,
      data.user.password,
      data.address,
      data.user.stripeCustomerId,
    );
  }

  @Post('/:id/newAddress')
  async addAddressToUser(
    @Param('id') userId: string,
    @Body() data: any,
  ): Promise<Address> {
    return this.userService.addAddress(data.address, data.isDefault, userId);
  }

  @Post(':id/newOrder')
  async createOrder(
    @Param('id') userId: string,
    @Body() chart: any,
  ): Promise<User> {
    return this.userService.createOrder(userId, chart);
  }

  @Get()
  findAll() {
    return this.userService.findAll();
  }
  @Get('/:id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }
  @Patch('/:id')
  update(@Param('id') id: string, @Body() data: User) {
    return this.userService.update(id, data);
  }
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.delete(id);
  }
}
