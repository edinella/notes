import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { SignupRequestDto } from '../auth/dto/signup-request.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  findByUsername(username: string): Promise<UserDocument> {
    return this.userModel.findOne({ username }).exec();
  }

  async create(payload: SignupRequestDto): Promise<UserDocument> {
    const { username, password } = payload;
    const passwordHash = await bcrypt.hash(password, 10);
    return this.userModel.create({ username, passwordHash }).catch((err) => {
      if (err.code === 11000) {
        throw new BadRequestException('Username is taken');
      }
      throw new InternalServerErrorException('Error saving new user', {
        cause: err,
      });
    });
  }

  purgeIDs(candidateIDs: string[]) {
    return this.userModel
      .find({ _id: { $in: candidateIDs } })
      .select('_id')
      .exec()
      .then((docs) => {
        return docs.map((doc) => doc._id);
      });
  }
}
