import { Module } from '@nestjs/common';
import { PrismaService } from './Service/prisma.service';

@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class CommonModule {}
