import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Types } from 'mongoose';
import { UsersService } from '../users/users.service';
import { NotesService } from './notes.service';
import { Note } from './schemas/note.schema';

describe('NotesService', () => {
  let service: NotesService;

  const noteModelMock = {
    create: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    deleteOne: jest.fn(),
    findOneAndUpdate: jest.fn(),
  };
  const usersServiceMock = {
    purgeIDs: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotesService,
        {
          provide: getModelToken(Note.name),
          useValue: noteModelMock,
        },
        {
          provide: UsersService,
          useValue: usersServiceMock,
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

      expect(noteModelMock.find).toHaveBeenCalledWith({
        $or: [{ owner }, { accessors: owner }],
      });
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

      expect(noteModelMock.findOne).toHaveBeenCalledWith({
        _id,
        $or: [{ owner }, { accessors: owner }],
      });
      expect(result).toEqual(doc);
    });
  });

  describe('update', () => {
    it('should get user`s note by id', async () => {
      const _id = new Types.ObjectId().toString();
      const owner = new Types.ObjectId().toString();
      const accessors = [];
      const content = 'My text';
      const doc = { _id, owner, accessors, content };
      noteModelMock.findOneAndUpdate.mockImplementation(async () => doc);

      const result = await service.update(owner, _id, content);

      expect(noteModelMock.findOneAndUpdate).toHaveBeenCalledWith(
        { owner, _id },
        { content },
        { returnOriginal: false },
      );
      expect(result).toEqual(doc);
    });
  });

  describe('delete', () => {
    it('should delete user`s note by id', async () => {
      const _id = new Types.ObjectId().toString();
      const owner = new Types.ObjectId().toString();
      const delResult = { deletedCount: 1 };
      noteModelMock.deleteOne.mockImplementation(async () => delResult);

      const result = await service.remove(owner, _id);

      expect(noteModelMock.deleteOne).toHaveBeenCalledWith({ owner, _id });
      expect(result).toEqual(delResult);
    });
  });

  describe('share', () => {
    it('should update note`s accessors', async () => {
      const _id = new Types.ObjectId().toString();
      const owner = new Types.ObjectId().toString();
      const accessors = [];
      const content = 'My text';
      const doc = { _id, owner, accessors, content };
      noteModelMock.findOne.mockImplementation(async () => doc);
      const newAccessors = [
        new Types.ObjectId().toString(),
        new Types.ObjectId().toString(),
        new Types.ObjectId().toString(),
      ];
      const validAccessors = [newAccessors[1]];
      usersServiceMock.purgeIDs.mockImplementation(async () => validAccessors);
      const updatedDoc = { ...doc, accessors: validAccessors };
      noteModelMock.findOneAndUpdate.mockImplementation(async () => updatedDoc);

      const result = await service.share(owner, _id, accessors);

      expect(noteModelMock.findOneAndUpdate).toHaveBeenCalledWith(
        { owner, _id },
        { accessors: validAccessors },
        { returnOriginal: false },
      );
      expect(result).toEqual(updatedDoc);
    });
  });

  describe('search', () => {
    it('should match note`s content, escaping special chars', async () => {
      const _id = new Types.ObjectId().toString();
      const owner = new Types.ObjectId().toString();
      const accessors = [];
      const content = 'My text';
      const docs = [{ _id, owner, accessors, content }];
      noteModelMock.find.mockImplementation(async () => docs);

      const result = await service.search(owner, 'A-[]/{}()*+?.\\^$|');

      expect(noteModelMock.find).toHaveBeenCalledWith({
        $or: [{ owner }, { accessors: owner }],
        content: /A\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|/i,
      });
      expect(result).toEqual(docs);
    });
  });
});
