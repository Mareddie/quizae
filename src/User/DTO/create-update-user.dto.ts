import { IsString, IsEmail, IsNotEmpty, ValidateIf } from 'class-validator';

export class CreateUpdateUserDTO {
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ValidateIf((object) => object.password !== undefined)
  @IsString()
  @IsNotEmpty()
  password?: string;

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;
}
