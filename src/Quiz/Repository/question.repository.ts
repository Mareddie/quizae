import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../Common/Service/prisma.service';
import { Question } from '@prisma/client';

@Injectable()
export class QuestionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async fetchQuestions(groupId: string, filter?: string): Promise<Question[]> {
    // TODO: implement this method
    return [];
  }
}
