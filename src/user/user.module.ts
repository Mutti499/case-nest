import { forwardRef, Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { User, UserSchema } from './user.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { AddressModule } from '../address/address.module';
import { Address, AddressSchema } from '../address/address.schema';
import { SubscriptionModule } from '../subscription/subscription.module';
import {
  Subscription,
  SubscriptionSchema,
} from '../subscription/subscription.schema';
import { OrderModule } from '../order/order.module';
import { Order, OrderSchema } from '../order/order.schema';
import { ProductModule } from '../product/product.module';
import { Product, ProductSchema } from '../product/product.schema';
@Module({
  imports: [
    forwardRef(() => ProductModule),
    forwardRef(() => SubscriptionModule),
    forwardRef(() => AddressModule),
    forwardRef(() => OrderModule),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Address.name, schema: AddressSchema },
      { name: Subscription.name, schema: SubscriptionSchema },
      { name: Order.name, schema: OrderSchema },
      { name: Product.name, schema: ProductSchema },
    ]),
  ],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
