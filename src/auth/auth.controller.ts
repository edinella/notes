import {
  Controller,
  Post,
  Body,
  HttpCode,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { SignupRequestDto } from './dto/signup-request.dto';
import { SignupResponseDto } from './dto/signup-response.dto';
import { LoginRequestDto } from './dto/login-request.dto';
import { LoginResponseDto } from './dto/login-response.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signup(
    @Body() signupRequestDto: SignupRequestDto,
  ): Promise<SignupResponseDto> {
    const { id, username } = await this.authService.signup(signupRequestDto);
    return { id, username };
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(200)
  login(
    @Request() req,
    @Body() loginRequestDto: LoginRequestDto,
  ): LoginResponseDto {
    const token = this.authService.login(req.user);
    return { token };
  }
}
