import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, Query } from '@nestjs/common';
import { HRService } from './hr.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('hr')
@UseGuards(JwtAuthGuard, RolesGuard)
export class HRController {
    constructor(private readonly hrService: HRService) {}

    // Employee Endpoints
    @Get('employees')
    @Roles('ADMIN', 'MANAGER')
    findAllEmployees() {
        return this.hrService.findAllEmployees();
    }

    @Get('employees/:id')
    @Roles('ADMIN', 'MANAGER')
    findEmployee(@Param('id') id: string) {
        return this.hrService.findEmployeeById(id);
    }

    @Post('employees')
    @Roles('ADMIN')
    createEmployee(@Body() data: any) {
        return this.hrService.createEmployee(data);
    }

    @Patch('employees/:id')
    @Roles('ADMIN')
    updateEmployee(@Param('id') id: string, @Body() data: any) {
        return this.hrService.updateEmployee(id, data);
    }

    @Delete('employees/:id')
    @Roles('ADMIN')
    deleteEmployee(@Param('id') id: string) {
        return this.hrService.deleteEmployee(id);
    }

    // Attendance Endpoints
    @Post('attendance')
    @Roles('ADMIN', 'MANAGER', 'STAFF')
    logAttendance(@Body() data: any) {
        return this.hrService.logAttendance(data);
    }

    @Get('attendance')
    @Roles('ADMIN', 'MANAGER')
    getAttendance(@Query('date') date: string, @Query('employeeId') employeeId: string) {
        if (employeeId) {
            return this.hrService.getAttendanceByEmployee(employeeId);
        }
        return this.hrService.getAttendanceByDate(new Date(date || new Date()));
    }
}
