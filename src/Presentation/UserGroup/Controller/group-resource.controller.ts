import {
  Body,
  Controller,
  Get,
  Post,
  Render,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthenticatedGuard } from '../../../Auth/Guard/authenticated.guard';
import { CheckOriginGuard } from '../../../Common/Guard/check-origin.guard';
import { CreateGroupDTO } from '../DTO/create-group.dto';
import { CreateGroupHandler } from '../../../User/Handler/create-group.handler';
import { Request } from 'express';

@Controller('groups')
@UseGuards(AuthenticatedGuard)
export class GroupResourceController {
  constructor(private readonly createHandler: CreateGroupHandler) {}

  @Get()
  @Render('pages/groups/list')
  async resourceList(): Promise<void> {
    return;
  }

  @Post('create')
  @UseGuards(CheckOriginGuard)
  async createResource(
    @Body() createGroup: CreateGroupDTO,
    @Req() request: Request,
  ): Promise<void> {
    await this.createHandler.createGroup(createGroup, request.user['id']);

    return;
  }
}
