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
  order?: number;

  @IsBoolean()
  isCorrectAnswer?: boolean;
}
