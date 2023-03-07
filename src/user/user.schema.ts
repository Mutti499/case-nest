import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Order } from '../order/order.schema';
import { Address } from '../address/address.schema';
import { Subscription } from '../subscription/subscription.schema';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  email: string; //unique

  @Prop({ required: true })
  password: string;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Address' }] })
  addresses: Address[];

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Address' })
  defaultAddress: Address;

  @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: 'Subscription' }])
  subscriptions: Subscription[];

  @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }])
  orders: Order[];

  @Prop()
  stripeCustomerId: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
