import { IsNotEmpty } from 'class-validator';

export class SignupResponseDto {
  @IsNotEmpty()
  token: string;

  @IsNotEmpty()
  userId: string;
}
