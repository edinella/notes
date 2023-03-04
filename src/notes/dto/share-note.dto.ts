import { IsNotEmpty } from 'class-validator';

export class ShareNoteDto {
  @IsNotEmpty()
  accessors: string[];
}
