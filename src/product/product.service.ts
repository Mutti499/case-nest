import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { Product, ProductDocument } from './product.schema';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class ProductService {
  @InjectModel(Product.name) private model: Model<ProductDocument>;
  create(product: Product) {
    return this.model.create(product);
  }
  findAll() {
    return this.model.find();
  }
  findOne(id: string) {
    return this.model.findById(id);
  }
  update(id: string, product: Product) {
    return this.model.findByIdAndUpdate(id, product, { new: true });
  }
  delete(id: string) {
    return this.model.findByIdAndRemove(id);
  }
}
