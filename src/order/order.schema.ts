import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Subscription } from '../subscription/subscription.schema';
import { User } from '../user/user.schema';
import { Address } from '../address/address.schema';
// import { Product } from '../product/product.schema';

export type OrderDocument = Order & Document;

@Schema({ timestamps: true })
export class Order {
  @Prop({ required: true })
  productName: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  price: number;

  @Prop({
    type: String,
    enum: ['Pending', 'Paid', 'Cancelled'],
    default: 'Pending',
  })
  status: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Subscription' })
  subscription: Subscription;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  user: User;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Address',
    required: true,
  })
  address: Address;

  @Prop({
    type: String,
    enum: ['oneTime', 'Subscription'],
    required: true,
  })
  paymentType: string;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop()
  receiptUrl: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
