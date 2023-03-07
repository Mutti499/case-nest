import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { User } from '../user/user.schema';

export type AddressDocument = Address & Document;
@Schema({ timestamps: true })
export class Address {
  @Prop({ required: true })
  line1: string;

  @Prop({ required: true })
  line2: string;

  @Prop({ required: true })
  city: string;

  @Prop({ required: true })
  state: string;

  @Prop({ required: true })
  postal_code: string;

  @Prop({ required: true })
  country: string;
}
export const AddressSchema = SchemaFactory.createForClass(Address);
