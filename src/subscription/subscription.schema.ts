import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as mongoose from 'mongoose';
import { User } from '../user/user.schema';
import { Product } from '../product/product.schema';

export type SubscriptionDocument = Subscription & Document;

@Schema({ timestamps: true })
export class Subscription {
  @Prop({
    type: String,
    enum: ['threeMonth', 'oneMonth', 'oneYear'],
    required: true,
  })
  options: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  price: number;

  @Prop({
    type: Date,
    required: true,
  })
  startDate: Date;

  @Prop({
    type: Date,
    required: true,
  })
  endDate: Date;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  user: User;

  @Prop({
    type: Boolean,
    default: true,
  })
  isActive: boolean;

  @Prop()
  stripeSubscriptionId: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Product' })
  product: Product;
}

export const SubscriptionSchema = SchemaFactory.createForClass(Subscription);
