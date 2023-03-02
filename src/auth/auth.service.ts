import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { SignupRequestDto } from './dto/signup-request.dto';
import { SignupResponseDto } from './dto/signup-response.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signup(payload: SignupRequestDto): Promise<SignupResponseDto> {
    const user = await this.usersService.create(payload);
    const token = this.jwtService.sign({ sub: user.id });
    return { token, userId: user.id };
  }

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.usersService.findByUsername(username);
    if (!user) {
      return null;
    }
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return null;
    }
    return { id: user.id, username };
  }

  async login(user: any): Promise<LoginResponseDto> {
    const token = this.jwtService.sign({ sub: user.id });
    return Promise.resolve({ token });
  }
}
