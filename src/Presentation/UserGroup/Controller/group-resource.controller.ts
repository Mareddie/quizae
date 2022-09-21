import { Controller, Get, Render, UseFilters, UseGuards } from '@nestjs/common';
import { AuthenticatedGuard } from '../../../Auth/Guard/authenticated.guard';
import { AuthExceptionFilter } from '../../../Common/Filters/auth-exceptions.filter';

@Controller('groups')
@UseFilters(AuthExceptionFilter)
@UseGuards(AuthenticatedGuard)
export class GroupResourceController {
  @Get()
  @Render('pages/groups/list')
  async resourceList(): Promise<void> {}
}
