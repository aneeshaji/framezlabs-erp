import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notification, NotificationDocument } from './schemas/notification.schema';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name) private notificationModel: Model<NotificationDocument>,
  ) {}

  async create(title: string, message: string, type: 'INFO' | 'WARNING' | 'SUCCESS' | 'ERROR' = 'INFO'): Promise<Notification> {
    const newNotification = new this.notificationModel({ title, message, type });
    return newNotification.save();
  }

  async findAll(limit: number = 20): Promise<Notification[]> {
    return this.notificationModel.find().sort({ createdAt: -1 }).limit(limit).exec();
  }

  async getUnreadCount(): Promise<number> {
    return this.notificationModel.countDocuments({ read: false }).exec();
  }

  async markAsRead(id: string): Promise<Notification | null> {
    return this.notificationModel.findByIdAndUpdate(id, { read: true }, { new: true }).exec();
  }
}
