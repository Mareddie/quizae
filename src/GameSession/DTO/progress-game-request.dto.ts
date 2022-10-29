import { IsDefined, IsNotEmpty, IsString } from 'class-validator';

export class ProgressGameRequestDTO {
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  categoryId: string;

  @IsDefined()
  @IsString()
  @IsNotEmpty()
  questionId: string;

  @IsDefined()
  @IsString()
  @IsNotEmpty()
  answerId: string;

  @IsDefined()
  @IsString()
  @IsNotEmpty()
  playerId: string;
}
