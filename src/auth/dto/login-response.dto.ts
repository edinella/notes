import { IsNotEmpty } from 'class-validator';

export class LoginResponseDto {
  @IsNotEmpty()
  token: string;
}
