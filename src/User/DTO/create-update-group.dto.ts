import {
  IsArray,
  IsNotEmpty,
  ArrayUnique,
  IsString,
  IsEmail,
  IsDefined,
} from 'class-validator';

export class CreateUpdateGroupDTO {
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsArray()
  @ArrayUnique()
  @IsEmail({}, { each: true, message: 'users must be a set of unique emails' })
  users?: string[];
}
