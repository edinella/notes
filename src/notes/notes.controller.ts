import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Request,
  Put,
  HttpCode,
} from '@nestjs/common';
import { NotesService } from './notes.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ShareNoteDto } from './dto/share-note.dto';

@Controller('notes')
@UseGuards(JwtAuthGuard)
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Post()
  create(@Request() req, @Body() createNoteDto: CreateNoteDto) {
    const { content } = createNoteDto;
    return this.notesService.create(req.user.id, content);
  }

  @Get()
  findAll(@Request() req) {
    return this.notesService.findAll(req.user.id);
  }

  @Get(':id')
  findOne(@Request() req, @Param('id') id: string) {
    return this.notesService.findOne(req.user.id, id);
  }

  @Put(':id')
  update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateNoteDto: UpdateNoteDto,
  ) {
    const { content } = updateNoteDto;
    return this.notesService.update(req.user.id, id, content);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.notesService.remove(req.user.id, id);
  }

  @Post(':id/share')
  @HttpCode(200)
  share(
    @Request() req,
    @Param('id') id: string,
    @Body() shareNoteDto: ShareNoteDto,
  ) {
    const { accessors } = shareNoteDto;
    return this.notesService.share(req.user.id, id, accessors);
  }
}
