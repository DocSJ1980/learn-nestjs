import { CreateUserRequest } from './dto/create-user.request';
import { UsersService } from './users.service';
import { Body, Controller, Get, Post } from '@nestjs/common';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async getUsers() {
    return this.usersService.getUsers();
  }

  @Post()
  async createUser(@Body() request: CreateUserRequest) {
    return this.usersService.createUser(request);
  }
}
