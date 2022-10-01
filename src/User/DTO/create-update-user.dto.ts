import {
  IsString,
  IsEmail,
  IsNotEmpty,
  ValidateIf,
  IsDefined,
} from 'class-validator';

export class CreateUpdateUserDTO {
  @IsDefined()
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ValidateIf((object) => object.password !== undefined)
  @IsString()
  @IsNotEmpty()
  password?: string;

  @IsDefined()
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsDefined()
  @IsString()
  @IsNotEmpty()
  lastName: string;
}
