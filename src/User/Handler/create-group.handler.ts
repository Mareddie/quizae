import { Injectable } from '@nestjs/common';
import { CreateGroupDTO } from '../../Presentation/UserGroup/DTO/create-group.dto';
import { PrismaService } from '../../Common/Service/prisma.service';

@Injectable()
export class CreateGroupHandler {
  constructor(private readonly prisma: PrismaService) {}

  async createGroup(data: CreateGroupDTO, ownerId: string): Promise<any> {
    const createdGroup = await this.prisma.group.create({
      data: {
        name: data.name,
        ownerId: ownerId,
      },
    });

    console.log(createdGroup);
  }
}
