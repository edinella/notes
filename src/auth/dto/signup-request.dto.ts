import { IsNotEmpty } from 'class-validator';

export class SignupRequestDto {
  @IsNotEmpty()
  username: string;

  @IsNotEmpty()
  password: string;
}
