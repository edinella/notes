import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { SignupRequestDto } from './dto/signup-request.dto';
import { UsersService } from '../users/users.service';
import { UserDocument } from 'src/users/schemas/user.schema';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signup(payload: SignupRequestDto): Promise<UserDocument> {
    return this.usersService.create(payload);
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

    return { id: user._id, username };
  }

  login(user: any): string {
    return this.jwtService.sign({ sub: user.id });
  }
}
