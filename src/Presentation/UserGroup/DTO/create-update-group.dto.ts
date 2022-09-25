import { IsNotEmpty } from 'class-validator';

export class CreateUpdateGroupDTO {
  @IsNotEmpty()
  name: string;

  users: string;
}
