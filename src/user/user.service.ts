import { User, UserDocument } from './user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { Address, AddressDocument } from '../address/address.schema';
import {
  Subscription,
  SubscriptionDocument,
} from '../subscription/subscription.schema';
import { Order, OrderDocument } from '../order/order.schema';
import { Product, ProductDocument } from '../product/product.schema';

@Injectable()
export class UserService {
  @InjectModel(User.name) private model: Model<UserDocument>;
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Address.name)
    private readonly addressModel: Model<AddressDocument>,
    @InjectModel(Subscription.name)
    private readonly subscriptionModel: Model<SubscriptionDocument>,
    @InjectModel(Order.name) private readonly orderModel: Model<OrderDocument>,
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
  ) {}

  async createUser(
    name: string,
    email: string,
    password: string,
    addressData: any,
    stripeCustomerId: string,
  ): Promise<User> {
    // Create a new address
    const address = new this.addressModel(addressData);
    await address.save();

    // Create a new user with the provided address, subscription, and order
    const user = new this.userModel({
      name,
      email,
      password,
      addresses: [address],
      defaultAddress: address._id,
      stripeCustomerId,
    });

    // Save the new user
    await user.save();
    console.log(user.id);
    return user;
  }

  async addAddress(
    addressData: any,
    isDefault: boolean,
    id: string,
  ): Promise<Address> {
    // Create a new address
    const address = new this.addressModel(addressData);
    await address.save();

    // find user and add address
    const user = await this.model.findById(id);
    user.addresses.push(address);

    if (isDefault) {
      user.defaultAddress = address;
      await user.save();
    }
    // Save the new user
    await user.save();

    return address;
  }

  async createOrder(userId: string, data: any): Promise<User> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    data.chart.forEach(
      async (item: {
        productID: string;
        paymentType: string;
        amount: number;
        option: string;
      }) => {
        const product = await this.productModel.findById(item.productID);

        if (!product) {
          throw new Error('Product not found');
        }
        const paymentType = item.paymentType;

        if (paymentType === 'oneTime') {
          const order = new this.orderModel({
            productName: product.name,
            amount: item.amount,
            price: product.price,
            user,
            address: user.defaultAddress,
            paymentType,
          });

          order.receiptUrl = `https://website.com/receipts/${order._id}.pdf`;
          //   order.products.push(product);
          await order.save();
          user.orders.push(order);
          await user.save();

        } else if (paymentType === 'Subscription') {
          const { price } = product;
          const options = item.option;

          let newPrice: number, endDate: Date;
          const startDate = new Date();

          switch (options) {
            case 'oneMonth':
              newPrice = price * 0.95;
              endDate = new Date(
                startDate.getFullYear(),
                startDate.getMonth() + 1,
                startDate.getDate(),
              );
              break;
            case 'threeMonth':
              newPrice = price * 0.85;
              endDate = new Date(
                startDate.getFullYear(),
                startDate.getMonth() + 3,
                startDate.getDate(),
              );
              break;
            case 'oneYear':
              newPrice = price * 0.75;
              endDate = new Date(
                startDate.getFullYear() + 1,
                startDate.getMonth(),
                startDate.getDate(),
              );
              break;
            default:
              throw new Error(
                'Invalid subscription plan: must be oneMonth, threeMonth, or oneYear',
              );
          }

          const subscription = new this.subscriptionModel({
            options,
            amount: item.amount,
            price: newPrice,
            startDate,
            endDate,
            user: user._id,
            product,
          });

          await subscription.save();

          const order = new this.orderModel({
            productName: product.name,
            amount: item.amount,
            price: newPrice,
            user,
            address: user.defaultAddress,
            paymentType,
            subscription: subscription._id,
          });

          order.receiptUrl = `https://website.com/receipts/${order._id}.pdf`;
          await order.save();
          user.subscriptions.push(subscription);
          user.orders.push(order);
          await user.save();
        }
      },
    );
    console.log(user);

    return user;
  }

  findAll() {
    return this.model.find();
  }
  findOne(id: string) {
    return this.model.findById(id);
  }
  update(id: string, data: User) {
    return this.model.findByIdAndUpdate(id, data, { new: true });
  }
  delete(id: string) {
    return this.model.findByIdAndRemove(id);
  }
}
