import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true, collection: 'enquiries', strict: false })
export class Enquiry extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  phone: string;

  @Prop({ required: true })
  message: string;

  @Prop({ required: true })
  category: string;
}

export const EnquirySchema = SchemaFactory.createForClass(Enquiry);
