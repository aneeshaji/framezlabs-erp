import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Employee } from './employee.schema';

export type AttendanceDocument = Attendance & Document;

@Schema({ timestamps: true })
export class Attendance {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Employee', required: true })
  employee: Employee;

  @Prop({ required: true })
  date: Date;

  @Prop()
  checkIn: Date;

  @Prop()
  checkOut: Date;

  @Prop({ default: 'PRESENT', enum: ['PRESENT', 'ABSENT', 'LATE', 'ON_LEAVE', 'HALF_DAY'] })
  status: string;

  @Prop()
  note: string;

  @Prop()
  location: string; // IP address or GPS if needed
}

export const AttendanceSchema = SchemaFactory.createForClass(Attendance);
