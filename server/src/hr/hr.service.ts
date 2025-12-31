import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Employee, EmployeeDocument } from './schemas/employee.schema';
import { Attendance, AttendanceDocument } from './schemas/attendance.schema';

@Injectable()
export class HRService {
  constructor(
    @InjectModel(Employee.name) private employeeModel: Model<EmployeeDocument>,
    @InjectModel(Attendance.name) private attendanceModel: Model<AttendanceDocument>,
  ) {}

  // Employees
  async findAllEmployees(): Promise<Employee[]> {
    return this.employeeModel.find().populate('user', '-passwordHash').exec();
  }

  async findEmployeeById(id: string): Promise<Employee> {
    const employee = await this.employeeModel.findById(id).populate('user', '-passwordHash').exec();
    if (!employee) throw new NotFoundException('Employee not found');
    return employee;
  }

  async createEmployee(data: any): Promise<Employee> {
    const newEmployee = new this.employeeModel(data);
    return newEmployee.save();
  }

  async updateEmployee(id: string, data: any): Promise<Employee | null> {
    return this.employeeModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async deleteEmployee(id: string): Promise<any> {
    return this.employeeModel.findByIdAndDelete(id).exec();
  }

  // Attendance
  async logAttendance(data: any): Promise<Attendance> {
    const attendance = new this.attendanceModel(data);
    return attendance.save();
  }

  async getAttendanceByEmployee(employeeId: string): Promise<Attendance[]> {
    return this.attendanceModel.find({ employee: employeeId } as any).sort({ date: -1 }).exec();
  }

  async getAttendanceByDate(date: Date): Promise<Attendance[]> {
    const startOfDay = new Date(date).setHours(0, 0, 0, 0);
    const endOfDay = new Date(date).setHours(23, 59, 59, 999);
    return this.attendanceModel.find({
      date: { $gte: startOfDay, $lte: endOfDay }
    }).populate('employee').exec();
  }
}
