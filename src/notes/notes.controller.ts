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
  Query,
} from '@nestjs/common';
import { NotesService } from './notes.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ShareNoteDto } from './dto/share-note.dto';

@Controller()
@UseGuards(JwtAuthGuard)
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Post('notes')
  create(@Request() req, @Body() createNoteDto: CreateNoteDto) {
    const { content } = createNoteDto;
    return this.notesService.create(req.user.id, content);
  }

  @Get('notes')
  findAll(@Request() req) {
    return this.notesService.findAll(req.user.id);
  }

  @Get('notes/:id')
  findOne(@Request() req, @Param('id') id: string) {
    return this.notesService.findOne(req.user.id, id);
  }

  @Put('notes/:id')
  update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateNoteDto: UpdateNoteDto,
  ) {
    const { content } = updateNoteDto;
    return this.notesService.update(req.user.id, id, content);
  }

  @Delete('notes/:id')
  remove(@Request() req, @Param('id') id: string) {
    return this.notesService.remove(req.user.id, id);
  }

  @Post('notes/:id/share')
  @HttpCode(200)
  share(
    @Request() req,
    @Param('id') id: string,
    @Body() shareNoteDto: ShareNoteDto,
  ) {
    const { accessors } = shareNoteDto;
    return this.notesService.share(req.user.id, id, accessors);
  }

  @Get('search')
  search(@Request() req, @Query('q') q: string) {
    return this.notesService.search(req.user.id, q);
  }
}
