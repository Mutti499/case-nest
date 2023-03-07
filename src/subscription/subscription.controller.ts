import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { Subscription } from './subscription.schema';
import { User } from '../user/user.schema';

@Controller('subscription')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Post()
  create(@Body() data: Subscription) {
    return this.subscriptionService.create(data);
  }

  @Get()
  findAll() {
    return this.subscriptionService.findAll();
  }

  @Get('/:id')
  findOne(@Param('id') id: string) {
    return this.subscriptionService.findOne(id);
  }

  @Patch('/:id')
  update(@Param('id') id: string, @Body() data: Subscription) {
    return this.subscriptionService.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.subscriptionService.delete(id);
  }
}
