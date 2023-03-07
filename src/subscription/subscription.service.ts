import { Injectable } from '@nestjs/common';
import { Subscription, SubscriptionDocument } from './subscription.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../user/user.schema';

@Injectable()
export class SubscriptionService {
  @InjectModel(Subscription.name) private model: Model<SubscriptionDocument>;
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Subscription.name)
    private readonly subcriptionModel: Model<SubscriptionDocument>,
  ) {}

  create(subscription: Subscription) {
    return this.model.create(subscription);
  }
  findAll() {
    return this.model.find();
  }
  findOne(id: string) {
    return this.model.findById(id);
  }
  update(id: string, subscription: Subscription) {
    return this.model.findByIdAndUpdate(id, subscription, { new: true });
  }
  delete(id: string) {
    return this.model.findByIdAndRemove(id);
  }
}
