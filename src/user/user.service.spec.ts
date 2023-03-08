import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { UserService } from './user.service';
import { User, UserDocument } from './user.schema';
import { Address, AddressDocument } from '../address/address.schema';
import {
  Subscription,
  SubscriptionDocument,
} from '../subscription/subscription.schema';
import { Order, OrderDocument } from '../order/order.schema';
import { Product, ProductDocument } from '../product/product.schema';
import { Model } from 'mongoose';

describe('UserService', () => {
  let userService: UserService;
  let userModel: Model<UserDocument>;
  let addressModel: Model<AddressDocument>;
  let subscriptionModel: Model<SubscriptionDocument>;
  let orderModel: Model<OrderDocument>;
  let productModel: Model<ProductDocument>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getModelToken(User.name),
          useValue: {},
        },
        {
          provide: getModelToken(Address.name),
          useValue: {},
        },
        {
          provide: getModelToken(Subscription.name),
          useValue: {},
        },
        {
          provide: getModelToken(Order.name),
          useValue: {},
        },
        {
          provide: getModelToken(Product.name),
          useValue: {},
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    userModel = module.get<Model<UserDocument>>(getModelToken(User.name));
    addressModel = module.get<Model<AddressDocument>>(
      getModelToken(Address.name),
    );
    subscriptionModel = module.get<Model<SubscriptionDocument>>(
      getModelToken(Subscription.name),
    );
    orderModel = module.get<Model<OrderDocument>>(getModelToken(Order.name));
    productModel = module.get<Model<ProductDocument>>(
      getModelToken(Product.name),
    );
  });

  describe('createUser', () => {
    it('should create a new user with an address and return the user', async () => {
      const name = 'Test User';
      const email = 'test@example.com';
      const password = 'password123';
      const addressData = {
        street: '123 Main St',
        city: 'Anytown',
        state: 'CA',
        zip: '12345',
      };
      const stripeCustomerId = 'stripe_customer_123';

      const address = new addressModel(addressData);
      jest.spyOn(address, 'save').mockResolvedValueOnce(address);

      const user = new User({
        name,
        email,
        password,
        addresses: [address],
        defaultAddress: address._id,
        stripeCustomerId,
      });
      jest.spyOn(userModel, 'create').mockResolvedValueOnce(user);

      const result = await userService.createUser(
        name,
        email,
        password,
        addressData,
        stripeCustomerId,
      );

      expect(result).toBe(user);
      expect(userModel.create).toHaveBeenCalledWith({
        name,
        email,
        password,
        addresses: [address],
        defaultAddress: address._id,
        stripeCustomerId,
      });
      expect(address.save).toHaveBeenCalled();
    });
  });
});
