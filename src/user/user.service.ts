import { User, UserDocument } from './user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { Address, AddressDocument } from '../address/address.schema';

@Injectable()
export class UserService {
  @InjectModel(User.name) private model: Model<UserDocument>;
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Address.name)
    private readonly addressModel: Model<AddressDocument>,
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
