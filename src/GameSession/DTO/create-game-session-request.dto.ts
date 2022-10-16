import {
  ArrayMinSize,
  IsArray,
  IsDefined,
  IsNotEmpty,
  IsNumber,
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

  @IsDefined()
  @IsNumber()
  @IsNotEmpty()
  order: number;
}
