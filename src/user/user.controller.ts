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
  /* Body for createUser
{
    "user": {
        "name": "John Doe",
        "email": "johndoe@example.com",
        "password": "aaaa"

    },
    "address": {
        "line1": "123 Main St",
        "line2": "asd",
        "city": "Anytown",
        "state": "CA",
        "postal_code": "12345",
        "country": "USA"
    }
}

*/

  @Post('/:id/newAddress')
  async addAddressToUser(
    @Param('id') userId: string,
    @Body() data: any,
  ): Promise<Address> {
    return this.userService.addAddress(data.address, data.isDefault, userId);
  }

  /* Body for newAddress
{   
    "address": {
        "line1": "2567 Near St",
        "line2": "24/6",
        "city": "Istanbul",
        "state": "California",
        "postal_code": "34002",
        "country": "Turkey"
    },
    "isDefault": true
}
*/

  @Post(':id/newOrder')
  async createOrder(
    @Param('id') userId: string,
    @Body() chart: any,
  ): Promise<User> {
    return this.userService.createOrder(userId, chart);
  }

  /* Body for newOrder
{   
    "chart" : [
        {
            "productID": "6407adaa2d284915bb677f0d", //These ID's coming prom product objects which are generated manually. 
            "amount" : 20,
            "paymentType": "oneTime",
            "option": "noSub"
        },
        {
            "productID": "6407adff2d284915bb677f0f",
            "amount" : 50,
            "paymentType": "Subscription",
            "option": "oneYear"
        }
    ]

}
*/

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
