import {
  ArrayMinSize,
  IsArray,
  IsDefined,
  IsNotEmpty,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateGameSessionRequestDTO {
  @IsDefined()
  @IsArray()
  @ValidateNested()
  @ArrayMinSize(1)
  @Type(() => InitGameSessionPlayerDTO)
  players: InitGameSessionPlayerDTO[];
}

export class InitGameSessionPlayerDTO {
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  name: string;
}
