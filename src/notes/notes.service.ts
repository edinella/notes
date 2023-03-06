import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UsersService } from '../users/users.service';
import { Note, NoteDocument } from './schemas/note.schema';

@Injectable()
export class NotesService {
  constructor(
    private usersService: UsersService,
    @InjectModel(Note.name) private noteModel: Model<NoteDocument>,
  ) {}

  create(userId: string, content: string) {
    return this.noteModel.create({ owner: userId, content });
  }

  findAll(userId: string) {
    return this.noteModel.find({
      $or: [{ owner: userId }, { accessors: userId }],
    });
  }

  findOne(userId: string, _id: string) {
    return this.noteModel.findOne({
      _id,
      $or: [{ owner: userId }, { accessors: userId }],
    });
  }

  update(userId: string, _id: string, content: string) {
    return this.noteModel.findOneAndUpdate(
      { _id, owner: userId },
      { content },
      { returnOriginal: false },
    );
  }

  remove(userId: string, _id: string) {
    return this.noteModel.deleteOne({ _id, owner: userId });
  }

  async share(userId: string, _id: string, newAccessors: string[]) {
    const accessors = await this.usersService.purgeIDs(newAccessors);
    return this.noteModel.findOneAndUpdate(
      { _id, owner: userId },
      { accessors },
      { returnOriginal: false },
    );
  }

  search(userId: string, q: string) {
    /*
    This will prevent literal chars from the user to be interpreted as regex tokens.
    For example, searching the string "A." will also match "AB" if not escaped.
    */
    const escaped = q.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
    const contentMatcher = new RegExp(escaped, 'i');
    return this.noteModel.find({
      $or: [{ owner: userId }, { accessors: userId }],
      content: contentMatcher,
    });
  }
}
