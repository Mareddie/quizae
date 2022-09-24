import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthenticatedGuard } from '../../../Auth/Guard/authenticated.guard';
import { CheckOriginGuard } from '../../../Common/Guard/check-origin.guard';
import { CreateGroupDTO } from '../DTO/create-group.dto';
import { CreateGroupHandler } from '../../../User/Handler/create-group.handler';
import { Request } from 'express';
import { Group } from '@prisma/client';
import { GroupRepository } from '../../../User/Repository/group.repository';
import { AuthenticatedUser } from '../../../User/Type/authenticated-user';

@Controller('groups')
@UseGuards(AuthenticatedGuard)
export class GroupResourceController {
  constructor(
    private readonly createHandler: CreateGroupHandler,
    private readonly groupRepository: GroupRepository,
  ) {}

  @Get()
  async resourceList(@Req() req: Request): Promise<object> {
    const user = req.user as AuthenticatedUser;

    if (
      req.query.hasOwnProperty('filter') &&
      typeof req.query.filter === 'string'
    ) {
      return await this.groupRepository.getGroupsForUser(
        req.query.filter,
        user.id,
      );
    }

    return [];
  }

  @Post('create')
  @UseGuards(CheckOriginGuard)
  async createResource(
    @Body() createGroup: CreateGroupDTO,
    @Req() request: Request,
  ): Promise<Group> {
    return await this.createHandler.createGroup(
      createGroup,
      request.user['id'],
    );
  }

  @Patch(':groupId')
  @UseGuards(CheckOriginGuard)
  async updateResource(@Param() groupId: string): Promise<any> {
    return;
  }
}
