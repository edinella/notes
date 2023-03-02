import { BadRequestException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { SignupRequestDto } from '../auth/dto/signup-request.dto';
import { User } from './entities/user.entity';

const collectionMock: User[] = [];

@Injectable()
export class UsersService {
  findByUsername(username: string): Promise<User> {
    return Promise.resolve(
      collectionMock.find((user) => user.username == username) || null,
    );
  }

  async create(payload: SignupRequestDto): Promise<User> {
    const { username, password } = payload;
    if (await this.findByUsername(username)) {
      throw new BadRequestException('Username is taken');
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const id = collectionMock.length.toString();
    const user = { id, username, passwordHash };
    collectionMock.push(user);
    return Promise.resolve(user);
  }
}
