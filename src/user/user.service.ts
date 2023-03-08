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
import * as cron from 'node-cron';

import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_API_KEY, {
  apiVersion: '2022-11-15',
});

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

  // This function creates a new user in the database and registers them in Stripe
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

    // Create a new user with the provided address
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

    // Registering the user in stripe platform
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name,
      address: {
        line1: address.line1,
        line2: address.line2,
        city: address.city,
        state: address.state,
        postal_code: address.postal_code,
        country: address.country,
      },
    });

    // update the  user
    user.stripeCustomerId = customer.id;
    await user.save();

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

    //If user wants it make address the default address
    if (isDefault) {
      user.defaultAddress = address;
      await user.save();
    }
    // Save the new user
    await user.save();

    // Add the new address to the user's Stripe account COMMENTED BECAUSE OF UNNECESSARINESS
    // const stripeCustomer = await stripe.customers.retrieve(
    //   user.stripeCustomerId,
    // );
    // const stripeAddress = await stripe.customers.createSource(
    //   stripeCustomer.id,
    //   {
    //     object: 'card',
    //     address_line1: address.line1,
    //     address_line2: address.line2,
    //     address_city: address.city,
    //     address_state: address.state,
    //     address_zip: address.postal_code,
    //     address_country: address.country,
    //   },
    // );

    return address;
  }

  /**
   * Creates an order for the specified user based on the provided data.
   * @param {string} userId - The id of the user for whom the order will be created.
   * @param {object} data - An object containing the necessary data for creating the order.
   * @returns {Promise<User>} - A Promise that resolves with the updated user object.
   * @throws {Error} - If the user or product is not found, or if an invalid subscription plan is specified.
   */
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
          // Create a one-time payment order

          const order = new this.orderModel({
            productName: product.name,
            amount: item.amount,
            price: product.price,
            user,
            address: user.defaultAddress,
            paymentType,
          });

          order.receiptUrl = `https://website.com/receipts/${order._id}.pdf`;
          await order.save();
          user.orders.push(order);

          //If this is a onetime payment this payment will be created onetime instant
          // Create a payment intent for the one-time payment

          const paymentIntent = await stripe.paymentIntents.create({
            amount: order.amount * 100, // amount in cents
            currency: 'usd',
            customer: user.stripeCustomerId,
            payment_method_types: ['card'],
            description: `Charge for ${order.productName}`,
            metadata: {
              order_id: order.id,
            },
          });

          // send the client secret to the client
          // return {
          //     clientSecret: paymentIntent.client_secret,
          //     orderId: order._id,
          //   };

          await user.save();
        } else if (paymentType === 'Subscription') {
          // Create a subscription-based payment order
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
          // Create a new price object in Stripe
          const stripePrice = await stripe.prices.create({
            unit_amount: newPrice * 100, // price in cents
            currency: 'usd',
          });

          // Create a subscription object on Stripe
          //If this is not a onetime payment this payment will be created for charge customer monthly
          const stripeSubscription = await stripe.subscriptions.create({
            customer: user.stripeCustomerId,
            items: [
              {
                price: stripePrice.id,
                price_data: {
                  currency: 'usd',
                  product: product.id,
                  recurring: { interval: 'month' }, // Replace with your desired interval
                },
              },
            ],
          });

          //Create subscription with the given information
          const subscription = new this.subscriptionModel({
            options,
            amount: item.amount,
            price: newPrice,
            startDate,
            endDate,
            user: user._id,
            stripeSubscriptionId: stripeSubscription.id,
            product,
          });
          await subscription.save();

          //Create first order for the subscription
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

          //Add ids of new subscription and order to User
          user.subscriptions.push(subscription);
          user.orders.push(order);
          await user.save();
        }
      },
    );

    return user;
  }

  async scheduleMonthlyOrders(): Promise<void> {
    cron.schedule('0 0 * * *', async () => {
      // code runs everymidnight at international time zone
      const currentDate = new Date();

      // Find subscriptions that have ended
      const endedSubscriptions = await this.subscriptionModel.find({
        endDate: { $lt: currentDate },
        isActive: true,
      });

      // Remove ended subscriptions from user's subscriptions
      for (const subscription of endedSubscriptions) {
        const user = await this.userModel.findById(subscription.user);
        await this.userModel.findByIdAndUpdate(user._id, {
          $pull: { subscriptions: subscription._id },
        });
        await user.save();
        await stripe.subscriptions.del(subscription.stripeSubscriptionId);
      }

      // Find active subscriptions
      const activeSubscriptions = await this.subscriptionModel.find({
        endDate: { $gte: currentDate },
        isActive: true,
      });

      // Iterate over active subscriptions and check if a monthly order needs to be created
      for (const subscription of activeSubscriptions) {
        const user = await this.userModel.findById(subscription.user);
        // Find the last order made by the user for this subscription within the current month
        const lastOrder = await this.orderModel.findOne({
          user: user._id,
          paymentType: 'Subscription',
          subscription: subscription._id,
          createdAt: {
            $gte: new Date(
              currentDate.getFullYear(),
              currentDate.getMonth(),
              1,
            ),
            $lte: new Date(
              currentDate.getFullYear(),
              currentDate.getMonth() + 1,
              0,
            ),
          },
        });

        // If no order was found for this subscription and month, create a new monthly order
        if (!lastOrder) {
          await this.createMonthlyOrder(user, subscription);
        }
      }
    });
  }

  /**
   * Creates a monthly order for a user's subscription
   * @param {UserDocument} user - The user associated with the order
   * @param {SubscriptionDocument} subscription - The subscription associated with the order
   * @returns {Promise<OrderDocument>} - The created order
   */
  async createMonthlyOrder(
    user: UserDocument,
    subscription: SubscriptionDocument,
  ): Promise<OrderDocument> {
    // Retrieve the Stripe subscription object associated with the subscription
    const stripeSubscription = await stripe.subscriptions.retrieve(
      subscription.stripeSubscriptionId,
    );
    // Create a new invoice using the Stripe API
    const stripeInvoice = await stripe.invoices.create({
      customer: user.stripeCustomerId,
      subscription: stripeSubscription.id,
    });

    // Create a new monthly order object using the Order model
    const order = new this.orderModel({
      amount: subscription.amount,
      user: user,
      price: subscription.price,
      address: user.defaultAddress,
      paymentType: 'Subscription',
      subscription: subscription,
      products: [subscription.product],
      receiptUrl: stripeInvoice.invoice_pdf || ' ',
    });

    // If the receipt URL is empty, set it to a default URL using the order ID
    if (order.receiptUrl === ' ') {
      order.receiptUrl = `https://website.com/receipts/${order._id}.pdf`;
    }

    // Save the order to the database
    await order.save();

    // Return the created order object
    return order;
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
