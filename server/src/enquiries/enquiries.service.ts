import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Enquiry } from './schemas/enquiry.schema';

@Injectable()
export class EnquiriesService {
  constructor(@InjectModel(Enquiry.name) private enquiryModel: Model<Enquiry>) {}

  async findAll(): Promise<Enquiry[]> {
    console.log('Backend: Fetching enquiries...');
    const results = await this.enquiryModel.find().sort({ createdAt: -1 }).exec();
    console.log('Backend: Found enquiries count:', results.length);
    return results;
  }

  async findOne(id: string): Promise<Enquiry | null> {
    return this.enquiryModel.findById(id).exec();
  }

  async remove(id: string): Promise<any> {
    return this.enquiryModel.findByIdAndDelete(id).exec();
  }
}
