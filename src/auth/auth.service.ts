import { BadRequestException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { SignupRequestDto } from './dto/signup-request.dto';
import { SignupResponseDto } from './dto/signup-response.dto';
import { LoginRequestDto } from './dto/login-request.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  signup(signupRequestDto: SignupRequestDto): Promise<SignupResponseDto> {
    const token = '';
    const userId = '';
    const response: SignupResponseDto = { token, userId };
    return Promise.resolve(response);
  }

  async login(payload: LoginRequestDto): Promise<LoginResponseDto> {
    const user = await this.usersService.findByUsername(payload.username);
    if (user === null) {
      throw new BadRequestException('Bad credentials');
    }
    const isMatch = await bcrypt.compare(payload.password, user.passwordHash);
    if (!isMatch) {
      throw new BadRequestException('Bad credentials');
    }
    const token = this.jwtService.sign({ sub: user.id });
    return Promise.resolve({ token });
  }
}
