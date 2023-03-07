import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Address, AddressDocument } from './address.schema';
import { Model } from 'mongoose';

@Injectable()
export class AddressService {
  @InjectModel(Address.name) private model: Model<AddressDocument>;

  create(address: Address) {
    return this.model.create(address);
  }
  findAll() {
    return this.model.find();
  }
  findOne(id: string) {
    return this.model.findById(id);
  }
  update(id: string, address: Address) {
    return this.model.findByIdAndUpdate(id, address, { new: true });
  }
  delete(id: string) {
    return this.model.findByIdAndRemove(id);
  }
}
