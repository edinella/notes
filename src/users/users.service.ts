import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { SignupRequestDto } from 'src/auth/dto/signup-request.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  findByUsername(username: string): Promise<User> {
    const user: User = {
      id: 'fake',
      username,
      passwordHash: '',
    };
    return Promise.resolve(user);
  }

  async create(payload: SignupRequestDto): Promise<User> {
    const { username, password } = payload;
    const passwordHash = await bcrypt.hash(password, 10);
    const user = {
      id: 'fake',
      username,
      passwordHash,
    };
    return Promise.resolve(user);
  }
}
