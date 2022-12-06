import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthenticatedGuard } from '../../../Auth/Guard/authenticated.guard';
import { CreateUpdateGroupDTO } from '../../../User/DTO/create-update-group.dto';
import { CreateUpdateGroupHandler } from '../../../User/Handler/create-update-group.handler';
import { Request } from 'express';
import { GroupRepository } from '../../../User/Repository/group.repository';
import { DeleteGroupHandler } from '../../../User/Handler/delete-group.handler';
import { CheckObjectIdGuard } from '../../../Common/Guard/check-object-id.guard';
import { LeaveGroupHandler } from '../../../User/Handler/leave-group.handler';
import { GroupWithMemberships } from '../../../User/Type/group-with-memberships';
import { GroupWithOwnerAndMemberships } from '../../../User/Type/group-with-owner-and-memberships';

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
  ): Promise<GroupWithOwnerAndMemberships[]> {
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
  @HttpCode(204)
  async deleteResource(
    @Param('groupId') groupId: string,
    @Req() request: Request,
  ): Promise<void> {
    await this.deleteHandler.deleteGroup(groupId, request.user['id']);
  }

  @Patch(':groupId/leave')
  @UseGuards(new CheckObjectIdGuard('groupId'))
  @HttpCode(204)
  async leaveGroup(
    @Param('groupId') groupId: string,
    @Req() request: Request,
  ): Promise<void> {
    await this.leaveHandler.leaveGroup(groupId, request.user['id']);
  }
}
