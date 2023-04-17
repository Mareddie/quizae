import { CreateUpdateAnswerDTO } from './create-update-answer.dto';
import {
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsDefined,
  IsNotEmpty,
  IsNotEmptyObject,
  IsObject,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateUpdateQuestionDTO {
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  text: string;

  @IsArray()
  @ValidateNested()
  @ArrayUnique()
  @ArrayMinSize(1)
  @Type(() => CreateUpdateAnswerDTO)
  answers?: CreateUpdateAnswerDTO[];

  @IsObject()
  @IsNotEmptyObject()
  @ValidateNested()
  @Type(() => CreateUpdateAnswerDTO)
  correctAnswer?: CreateUpdateAnswerDTO;
}
