import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { User } from '../../users/schemas/user.schema';

export type NoteDocument = HydratedDocument<Note>;

@Schema()
export class Note {
  @Prop({ type: 'ObjectId', ref: 'Owner', required: true })
  owner: User;

  @Prop({ type: [{ type: 'ObjectId', ref: 'Accessors' }] })
  accessors: User[];

  @Prop({ required: true })
  content: string;
}

export const NoteSchema = SchemaFactory.createForClass(Note);
NoteSchema.index({ content: 'text' });
