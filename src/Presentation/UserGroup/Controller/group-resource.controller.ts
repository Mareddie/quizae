import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthenticatedGuard } from '../../../Auth/Guard/authenticated.guard';
import { CheckOriginGuard } from '../../../Common/Guard/check-origin.guard';
import { CreateUpdateGroupDTO } from '../DTO/create-update-group.dto';
import { CreateGroupHandler } from '../../../User/Handler/create-group.handler';
import { Request, Response } from 'express';
import { Group } from '@prisma/client';
import { GroupRepository } from '../../../User/Repository/group.repository';
import { UpdateGroupHandler } from '../../../User/Handler/update-group.handler';
import { DeleteGroupHandler } from '../../../User/Handler/delete-group.handler';
import { CheckObjectIdGuard } from '../../../Common/Guard/check-object-id.guard';

@Controller('groups')
@UseGuards(AuthenticatedGuard)
export class GroupResourceController {
  constructor(
    private readonly createHandler: CreateGroupHandler,
    private readonly updateHandler: UpdateGroupHandler,
    private readonly deleteHandler: DeleteGroupHandler,
    private readonly groupRepository: GroupRepository,
  ) {}

  @Get()
  async resourceList(@Req() req: Request): Promise<object> {
    if (
      req.query.hasOwnProperty('filter') &&
      typeof req.query.filter === 'string'
    ) {
      return await this.groupRepository.findGroupsForUser(
        req.query.filter,
        req.user['id'],
      );
    }

    return [];
  }

  @Post('create')
  @UseGuards(CheckOriginGuard)
  async createResource(
    @Body() createGroup: CreateUpdateGroupDTO,
    @Req() request: Request,
  ): Promise<Group> {
    return await this.createHandler.createGroup(
      createGroup,
      request.user['id'],
    );
  }

  @Patch(':groupId')
  @UseGuards(CheckOriginGuard, new CheckObjectIdGuard('groupId'))
  async updateResource(
    @Param('groupId') groupId: string,
    @Body() updateGroup: CreateUpdateGroupDTO,
    @Req() request: Request,
  ): Promise<Group> {
    return await this.updateHandler.updateGroup(
      updateGroup,
      groupId,
      request.user['id'],
    );
  }

  @Delete(':groupId')
  @UseGuards(CheckOriginGuard, new CheckObjectIdGuard('groupId'))
  async deleteResource(
    @Param('groupId') groupId: string,
    @Req() request: Request,
    @Res() response: Response,
  ): Promise<any> {
    await this.deleteHandler.deleteGroup(groupId, request.user['id']);

    response.status(204).json();
    return response;
  }
}
