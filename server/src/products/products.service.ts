import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from './schemas/product.schema';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    private notificationsService: NotificationsService,
  ) {}

  async create(createProductDto: any): Promise<ProductDocument> {
    const createdProduct = new this.productModel(createProductDto);
    return createdProduct.save();
  }

  async findAll(): Promise<ProductDocument[]> {
    return this.productModel.find().exec();
  }

  async findOne(id: string): Promise<ProductDocument> {
    const product = await this.productModel.findById(id).exec();
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

  async update(id: string, updateProductDto: any): Promise<ProductDocument> {
    const updatedProduct = await this.productModel
      .findByIdAndUpdate(id, updateProductDto, { new: true })
      .exec();
    if (!updatedProduct) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return updatedProduct;
  }

  async remove(id: string) {
    const result = await this.productModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return result;
  }

  async updateStock(id: string, quantity: number): Promise<ProductDocument> {
    const product = await this.productModel.findById(id);
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    
    product.stockLevel += Number(quantity);
    const updatedProduct = await product.save();

    if (updatedProduct.stockLevel <= (updatedProduct.minStockLevel || 5)) {
      await this.notificationsService.create(
        'Low Stock Warning',
        `Product "${updatedProduct.name}" is running low (${updatedProduct.stockLevel} units remaining).`,
        'WARNING',
      );
    }

    return updatedProduct;
  }
}
