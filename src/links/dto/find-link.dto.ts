import { IsNotEmpty, IsString } from 'class-validator';

export class FindLinkDto {
  @IsNotEmpty()
  @IsString()
  code: string;
}
