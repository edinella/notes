import { Injectable } from '@nestjs/common';
import { SignupRequestDto } from './dto/signup-request.dto';
import { SignupResponseDto } from './dto/signup-response.dto';
import { LoginRequestDto } from './dto/login-request.dto';
import { LoginResponseDto } from './dto/login-response.dto';

@Injectable()
export class AuthService {
  signup(signupRequestDto: SignupRequestDto): Promise<SignupResponseDto> {
    const token = '';
    const userId = '';
    const response: SignupResponseDto = { token, userId };
    return Promise.resolve(response);
  }

  login(loginRequestDto: LoginRequestDto): Promise<LoginResponseDto> {
    const token: LoginResponseDto = { token: '' };
    return Promise.resolve(token);
  }
}
