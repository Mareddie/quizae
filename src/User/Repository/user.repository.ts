import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../Common/Service/prisma.service';
import { User } from '@prisma/client';
import { IdentifiedUser } from '../Type/identified-user';

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  public async getUserIdsByEmails(emails: string[]): Promise<IdentifiedUser[]> {
    return await this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
      },
      where: { email: { in: emails } },
    });
  }

  public async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email: email } });
  }

  public async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id: id } });
  }
}
