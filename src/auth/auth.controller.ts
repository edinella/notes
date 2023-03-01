import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginRequestDto } from './dto/login-request.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { SignupRequestDto } from './dto/signup-request.dto';
import { SignupResponseDto } from './dto/signup-response.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  signup(
    @Body() signupRequestDto: SignupRequestDto,
  ): Promise<SignupResponseDto> {
    return this.authService.signup(signupRequestDto);
  }

  @Post('login')
  @HttpCode(200)
  login(@Body() loginRequestDto: LoginRequestDto): Promise<LoginResponseDto> {
    return this.authService.login(loginRequestDto);
  }
}
