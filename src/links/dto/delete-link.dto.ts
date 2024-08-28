import { IsNotEmpty, IsString } from 'class-validator';

export class DeleteLinkDto {
  @IsNotEmpty()
  @IsString()
  code: string;
}
