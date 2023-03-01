import { Injectable } from '@nestjs/common';
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
}
