import { IsNotEmpty } from 'class-validator';

export class UpdateNoteDto {
  @IsNotEmpty()
  content: string;
}
