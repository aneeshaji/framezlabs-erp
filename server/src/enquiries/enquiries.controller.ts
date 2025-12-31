import { Controller, Get, Param, Delete, UseGuards } from '@nestjs/common';
import { EnquiriesService } from './enquiries.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('enquiries')
@UseGuards(JwtAuthGuard)
export class EnquiriesController {
  constructor(private readonly enquiriesService: EnquiriesService) {}

  @Get()
  findAll() {
    return this.enquiriesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.enquiriesService.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.enquiriesService.remove(id);
  }
}
