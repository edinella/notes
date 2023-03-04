import { Test, TestingModule } from '@nestjs/testing';
import { Types } from 'mongoose';
import { NotesController } from './notes.controller';
import { NotesService } from './notes.service';

describe('NotesController', () => {
  let controller: NotesController;

  const notesServiceMock = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    share: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotesController],
      providers: [
        {
          provide: NotesService,
          useValue: notesServiceMock,
        },
      ],
    }).compile();

    controller = module.get<NotesController>(NotesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call service`s create and return its result', async () => {
      const _id = new Types.ObjectId().toString();
      const owner = new Types.ObjectId().toString();
      const accessors = [];
      const content = 'My text';
      const doc = { _id, owner, accessors, content };
      const req = { user: { id: owner } };
      const payload = { content };
      notesServiceMock.create.mockImplementation(async () => doc);

      const result = await controller.create(req, payload);

      expect(notesServiceMock.create).toBeCalledWith(owner, content);
      expect(result).toEqual(doc);
    });
  });

  describe('findAll', () => {
    it('should call service`s findAll and return its result', async () => {
      const _id = new Types.ObjectId().toString();
      const owner = new Types.ObjectId().toString();
      const accessors = [];
      const content = 'My text';
      const docs = [{ _id, owner, accessors, content }];
      const req = { user: { id: owner } };
      notesServiceMock.findAll.mockImplementation(async () => docs);

      const result = await controller.findAll(req);

      expect(notesServiceMock.findAll).toBeCalledWith(owner);
      expect(result).toEqual(docs);
    });
  });

  describe('findOne', () => {
    it('should call service`s findOne and return its result', async () => {
      const _id = new Types.ObjectId().toString();
      const owner = new Types.ObjectId().toString();
      const accessors = [];
      const content = 'My text';
      const doc = { _id, owner, accessors, content };
      const req = { user: { id: owner } };
      notesServiceMock.findOne.mockImplementation(async () => doc);

      const result = await controller.findOne(req, _id);

      expect(notesServiceMock.findOne).toBeCalledWith(owner, _id);
      expect(result).toEqual(doc);
    });
  });

  describe('update', () => {
    it('should call service`s update and return its result', async () => {
      const _id = new Types.ObjectId().toString();
      const owner = new Types.ObjectId().toString();
      const accessors = [];
      const content = 'My text';
      const doc = { _id, owner, accessors, content };
      const req = { user: { id: owner } };
      const payload = { content };
      notesServiceMock.update.mockImplementation(async () => doc);

      const result = await controller.update(req, _id, payload);

      expect(notesServiceMock.update).toBeCalledWith(owner, _id, content);
      expect(result).toEqual(doc);
    });
  });

  describe('delete', () => {
    it('should call service`s remove and return its result', async () => {
      const _id = new Types.ObjectId().toString();
      const owner = new Types.ObjectId().toString();
      const req = { user: { id: owner } };
      const delResult = { deletedCount: 1 };
      notesServiceMock.remove.mockImplementation(async () => delResult);

      const result = await controller.remove(req, _id);

      expect(notesServiceMock.remove).toBeCalledWith(owner, _id);
      expect(result).toEqual(delResult);
    });
  });

  describe('share', () => {
    it('should call service`s share and return its result', async () => {
      const _id = new Types.ObjectId().toString();
      const owner = new Types.ObjectId().toString();
      const accessors = [];
      const content = 'My text';
      const doc = { _id, owner, accessors, content };
      const req = { user: { id: owner } };
      const candidateAccessors = [new Types.ObjectId().toString()];

      notesServiceMock.share.mockImplementation(async () => doc);

      const result = await controller.share(req, _id, {
        accessors: candidateAccessors,
      });

      expect(notesServiceMock.share).toBeCalledWith(
        owner,
        _id,
        candidateAccessors,
      );
      expect(result).toEqual(doc);
    });
  });
});
