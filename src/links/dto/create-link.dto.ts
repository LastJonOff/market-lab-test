import { IsNotEmpty, IsUrl } from 'class-validator';

export class CreateLinkDto {
  @IsNotEmpty()
  @IsUrl()
  url: string;
}
