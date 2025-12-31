import { Controller, Get, Patch, Param, Query } from '@nestjs/common';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  findAll(@Query('limit') limit: number) {
    return this.notificationsService.findAll(limit);
  }

  @Get('unread-count')
  getUnreadCount() {
    return this.notificationsService.getUnreadCount();
  }

  @Patch(':id/read')
  markAsRead(@Param('id') id: string) {
    return this.notificationsService.markAsRead(id);
  }
}
