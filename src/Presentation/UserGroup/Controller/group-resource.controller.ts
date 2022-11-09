import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthenticatedGuard } from '../../../Auth/Guard/authenticated.guard';
import { CreateUpdateGroupDTO } from '../../../User/DTO/create-update-group.dto';
import { CreateUpdateGroupHandler } from '../../../User/Handler/create-update-group.handler';
import { Request, Response } from 'express';
import { Group } from '@prisma/client';
import { GroupRepository } from '../../../User/Repository/group.repository';
import { DeleteGroupHandler } from '../../../User/Handler/delete-group.handler';
import { CheckObjectIdGuard } from '../../../Common/Guard/check-object-id.guard';
import { LeaveGroupHandler } from '../../../User/Handler/leave-group.handler';
import { GroupWithMemberships } from '../../../User/Type/group-with-memberships';

@Controller('groups')
@UseGuards(AuthenticatedGuard)
export class GroupResourceController {
  constructor(
    private readonly createUpdateHandler: CreateUpdateGroupHandler,
    private readonly leaveHandler: LeaveGroupHandler,
    private readonly deleteHandler: DeleteGroupHandler,
    private readonly groupRepository: GroupRepository,
  ) {}

  @Get()
  async resourceList(
    @Req() req: Request,
    @Query('filter') filter?: string,
  ): Promise<Group[]> {
    if (typeof filter === 'string') {
      return await this.groupRepository.findGroupsForUser(
        filter,
        req.user['id'],
      );
    }

    return [];
  }

  @Post('create')
  async createResource(
    @Body() createGroup: CreateUpdateGroupDTO,
    @Req() request: Request,
  ): Promise<GroupWithMemberships> {
    return await this.createUpdateHandler.createGroup(
      createGroup,
      request.user['id'],
    );
  }

  @Patch(':groupId')
  @UseGuards(new CheckObjectIdGuard('groupId'))
  async updateResource(
    @Param('groupId') groupId: string,
    @Body() updateGroup: CreateUpdateGroupDTO,
    @Req() request: Request,
  ): Promise<GroupWithMemberships> {
    return await this.createUpdateHandler.updateGroup(
      updateGroup,
      groupId,
      request.user['id'],
    );
  }

  @Delete(':groupId')
  @UseGuards(new CheckObjectIdGuard('groupId'))
  async deleteResource(
    @Param('groupId') groupId: string,
    @Req() request: Request,
    @Res() response: Response,
  ): Promise<Response> {
    await this.deleteHandler.deleteGroup(groupId, request.user['id']);

    response.status(204).json();
    return response;
  }

  @Patch(':groupId/leave')
  @UseGuards(new CheckObjectIdGuard('groupId'))
  async leaveGroup(
    @Param('groupId') groupId: string,
    @Req() request: Request,
    @Res() response: Response,
  ): Promise<Response> {
    await this.leaveHandler.leaveGroup(groupId, request.user['id']);

    response.status(204).json();
    return response;
  }
}
