import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Types } from 'mongoose';
import { NotesService } from './notes.service';
import { Note } from './schemas/note.schema';

describe('NotesService', () => {
  let service: NotesService;

  const noteModelMock = {
    create: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotesService,
        {
          provide: getModelToken(Note.name),
          useValue: noteModelMock,
        },
      ],
    }).compile();

    service = module.get<NotesService>(NotesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a note', async () => {
      const _id = new Types.ObjectId().toString();
      const owner = new Types.ObjectId().toString();
      const accessors = [];
      const content = 'My text';
      const doc = { _id, owner, accessors, content };
      noteModelMock.create.mockImplementation(async () => doc);

      const result = await service.create(owner.toString(), content);

      expect(noteModelMock.create).toHaveBeenCalledWith({ owner, content });
      expect(result).toEqual(doc);
    });
  });

  describe('findAll', () => {
    it('should list user`s notes', async () => {
      const _id = new Types.ObjectId().toString();
      const owner = new Types.ObjectId().toString();
      const accessors = [];
      const content = 'My text';
      const docs = [{ _id, owner, accessors, content }];
      noteModelMock.find.mockImplementation(async () => docs);

      const result = await service.findAll(owner);

      expect(noteModelMock.find).toHaveBeenCalledWith({ owner });
      expect(result).toEqual(docs);
    });
  });

  describe('findOne', () => {
    it('should get user`s note by id', async () => {
      const _id = new Types.ObjectId().toString();
      const owner = new Types.ObjectId().toString();
      const accessors = [];
      const content = 'My text';
      const doc = { _id, owner, accessors, content };
      noteModelMock.findOne.mockImplementation(async () => doc);

      const result = await service.findOne(owner, _id);

      expect(noteModelMock.findOne).toHaveBeenCalledWith({ owner, _id });
      expect(result).toEqual(doc);
    });
  });
});
