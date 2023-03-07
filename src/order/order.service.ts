import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Order, OrderDocument } from './order.schema';

@Injectable()
export class OrderService {
  @InjectModel(Order.name) private model: Model<OrderDocument>;
  //may be missing model

  create(order: Order) {
    return this.model.create(order);
  }
  findAll() {
    return this.model.find();
  }
  findOne(id: string) {
    return this.model.findById(id);
  }
  update(id: string, order: Order) {
    return this.model.findByIdAndUpdate(id, order, { new: true });
  }
  delete(id: string) {
    return this.model.findByIdAndRemove(id);
  }
}
