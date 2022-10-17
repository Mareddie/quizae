import { Module } from '@nestjs/common';
import { PrismaService } from './Service/prisma.service';
import { ReorderService } from './Service/reorder.service';

@Module({
  providers: [PrismaService, ReorderService],
  exports: [PrismaService, ReorderService],
})
export class CommonModule {}
