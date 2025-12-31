import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './schemas/user.schema';
import { Role, RoleDocument } from './schemas/role.schema';

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Role.name) private roleModel: Model<RoleDocument>,
  ) {}

  async onModuleInit() {
    await this.seedRoles();
  }

  private async seedRoles() {
    const rolesCount = await this.roleModel.countDocuments();
    if (rolesCount === 0) {
      const defaultRoles = [
        { name: 'ADMIN', description: 'Full system access', isSystem: true, permissions: ['*'] },
        { name: 'MANAGER', description: 'Sales and team management', isSystem: true, permissions: ['dashboard.view', 'pos.access', 'orders.manage', 'crm.manage', 'inventory.manage', 'finance.view'] },
        { name: 'STAFF', description: 'Daily operations', isSystem: true, permissions: ['dashboard.view', 'pos.access', 'orders.manage', 'crm.manage', 'inventory.view'] },
      ];
      await this.roleModel.insertMany(defaultRoles);
      console.log('Default roles seeded successfully.');
    }
  }

  async create(createUserDto: any): Promise<UserDocument> {
    console.log(`Attempting to create user with email: ${createUserDto.email}`);
    const { password, ...userData } = createUserDto;
    
    // Check if this is the first user
    const userCount = await this.userModel.countDocuments().exec();
    const role = userCount === 0 ? 'ADMIN' : 'STAFF';

    const passwordHash = await bcrypt.hash(password, 10);
    const createdUser = new this.userModel({
      ...userData,
      passwordHash,
      role,
    });
    const result = await createdUser.save();
    console.log(`User saved successfully: ${result.email} (ID: ${result._id}) as ${role}`);
    return result;
  }

  async findAll(): Promise<UserDocument[]> {
    return this.userModel.find({}, { passwordHash: 0 }).exec();
  }

  async update(id: string, updateUserDto: any): Promise<UserDocument | null> {
    const { password, ...userData } = updateUserDto;
    const update: any = { ...userData };
    
    if (password) {
      update.passwordHash = await bcrypt.hash(password, 10);
    }

    return this.userModel.findByIdAndUpdate(id, update, { new: true }).exec();
  }

  async remove(id: string): Promise<any> {
    return this.userModel.findByIdAndDelete(id).exec();
  }

  async findOneByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }

  // Role Management
  async findAllRoles(): Promise<RoleDocument[]> {
    return this.roleModel.find().exec();
  }

  async createRole(roleData: any): Promise<RoleDocument> {
    return new this.roleModel(roleData).save();
  }

  async updateRole(id: string, roleData: any): Promise<RoleDocument | null> {
    return this.roleModel.findByIdAndUpdate(id, roleData, { new: true }).exec();
  }

  async deleteRole(id: string): Promise<any> {
    const role = await this.roleModel.findById(id);
    if (role?.isSystem) throw new Error('Cannot delete system roles');
    return this.roleModel.findByIdAndDelete(id).exec();
  }
}
