import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Get()
    @Roles('ADMIN')
    findAll() {
        return this.usersService.findAll();
    }

    @Post()
    @Roles('ADMIN')
    create(@Body() createUserDto: any) {
        return this.usersService.create(createUserDto);
    }

    @Patch(':id')
    @Roles('ADMIN')
    update(@Param('id') id: string, @Body() updateUserDto: any) {
        return this.usersService.update(id, updateUserDto);
    }

    @Delete(':id')
    @Roles('ADMIN')
    remove(@Param('id') id: string) {
        return this.usersService.remove(id);
    }

    // Role Management
    @Get('roles')
    @Roles('ADMIN')
    findAllRoles() {
        return this.usersService.findAllRoles();
    }

    @Post('roles')
    @Roles('ADMIN')
    createRole(@Body() roleData: any) {
        return this.usersService.createRole(roleData);
    }

    @Patch('roles/:id')
    @Roles('ADMIN')
    updateRole(@Param('id') id: string, @Body() roleData: any) {
        return this.usersService.updateRole(id, roleData);
    }

    @Delete('roles/:id')
    @Roles('ADMIN')
    deleteRole(@Param('id') id: string) {
        return this.usersService.deleteRole(id);
    }
}
