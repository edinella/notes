import { IsNotEmpty } from 'class-validator';

export class SignupResponseDto {
  @IsNotEmpty()
  id: string;

  @IsNotEmpty()
  username: string;
}
