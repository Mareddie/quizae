import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthenticatedGuard } from '../../../Auth/Guard/authenticated.guard';
import { Request } from 'express';
import { AuthenticatedUser } from '../../../User/Type/authenticated-user';
import { CreateUpdateUserDTO } from '../../../User/DTO/create-update-user.dto';
import { UpdateUserHandler } from '../../../User/Handler/update-user.handler';

@Controller('users')
@UseGuards(AuthenticatedGuard)
export class UserResourceController {
  constructor(private readonly updateHandler: UpdateUserHandler) {}

  @Get('profile')
  async getProfile(@Req() req: Request): Promise<AuthenticatedUser> {
    return req.user as AuthenticatedUser;
  }

  @Post('profile')
  @HttpCode(204)
  async updateProfile(
    @Req() req: Request,
    @Body() createUpdateUser: CreateUpdateUserDTO,
  ): Promise<void> {
    await this.updateHandler.updateUser(req.user['id'], createUpdateUser);
  }
}
