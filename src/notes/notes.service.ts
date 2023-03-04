import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Note, NoteDocument } from './schemas/note.schema';

@Injectable()
export class NotesService {
  constructor(@InjectModel(Note.name) private noteModel: Model<NoteDocument>) {}

  create(owner: string, content: string) {
    return this.noteModel.create({ owner, content });
  }

  findAll(owner) {
    return this.noteModel.find({ owner });
  }

  findOne(owner: string, _id: string) {
    return this.noteModel.findOne({ owner, _id });
  }

  update(owner: string, _id: string, content: string) {
    return this.noteModel.findOneAndUpdate({ owner, _id }, { content });
  }

  remove(id: number) {
    return `This action removes a #${id} note`;
  }
}
