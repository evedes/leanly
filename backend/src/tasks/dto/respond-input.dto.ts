import { IsString, MaxLength, MinLength } from 'class-validator';

export class RespondInputDto {
  @IsString()
  @MinLength(1)
  @MaxLength(5000)
  response: string;
}
