import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from '../../users/schemas/user.schema';

export type EmployeeDocument = Employee & Document;

@Schema({ timestamps: true })
export class Employee {
  @Prop({ required: true })
  employeeId: string; // e.g., EMP001

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', unique: true })
  user: User; // Optional link to a system user account

  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  phone: string;

  @Prop({ required: true })
  designation: string;

  @Prop({ required: true })
  department: string;

  @Prop({ required: true })
  dateOfJoining: Date;

  @Prop()
  dateOfBirth: Date;

  @Prop()
  address: string;

  @Prop({ default: 'ACTIVE', enum: ['ACTIVE', 'ON_LEAVE', 'RESIGNED', 'TERMINATED'] })
  status: string;

  @Prop({ type: Object })
  salary: {
    base: number;
    allowances: number;
    currency: string;
  };

  @Prop([String])
  documents: string[]; // URLs or file paths to ID proofs, etc.
}

export const EmployeeSchema = SchemaFactory.createForClass(Employee);
