import {
  IsBoolean,
  IsDefined,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';

export class CreateUpdateAnswerDTO {
  @IsString()
  @IsNotEmpty()
  id?: string;

  @IsDefined()
  @IsString()
  @IsNotEmpty()
  text: string;

  @IsNumber()
  @IsNotEmpty()
  priority?: number;

  @IsBoolean()
  isCorrectAnswer?: boolean;
}
