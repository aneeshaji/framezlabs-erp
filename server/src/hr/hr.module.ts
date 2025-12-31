import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HRService } from './hr.service';
import { HRController } from './hr.controller';
import { Employee, EmployeeSchema } from './schemas/employee.schema';
import { Attendance, AttendanceSchema } from './schemas/attendance.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Employee.name, schema: EmployeeSchema },
      { name: Attendance.name, schema: AttendanceSchema },
    ]),
  ],
  providers: [HRService],
  controllers: [HRController],
  exports: [HRService],
})
export class HRModule {}
