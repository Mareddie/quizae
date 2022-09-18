import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../Common/Service/prisma.service';
import { User } from '@prisma/client';

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  public async users(): Promise<User[]> {
    return this.prisma.user.findMany();
  }

  public async findByEmail(email: string): Promise<User> {
    return this.prisma.user.findUnique({ where: { email: email } });
  }

  public async findById(id: string): Promise<User> {
    return this.prisma.user.findUnique({ where: { id: id } });
  }
}
