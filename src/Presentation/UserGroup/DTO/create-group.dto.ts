import { IsNotEmpty } from 'class-validator';

export class CreateGroupDTO {
  @IsNotEmpty()
  name: string;

  users: string;
}
