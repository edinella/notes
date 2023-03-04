import { Test, TestingModule } from '@nestjs/testing';
import { NotesController } from './notes.controller';
import { NotesService } from './notes.service';

describe('NotesController', () => {
  let controller: NotesController;

  const notesServiceMock = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
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
    it('should return call service`s create and return its result', async () => {
      const payload = { content: 'My text' };
      const doc = { content: payload.content, id: 'NOTEID' };
      const req = { user: { id: 'USERID' } };
      notesServiceMock.create.mockImplementation(async () => doc);

      const result = await controller.create(req, payload);

      expect(notesServiceMock.create).toBeCalledWith(
        req.user.id,
        payload.content,
      );
      expect(result).toEqual(doc);
    });
  });

  describe('findAll', () => {
    it('should return call service`s findAllByOwner and return its result', async () => {
      const docs = [{ content: 'My text', id: 'NOTEID' }];
      const req = { user: { id: 'USERID' } };
      notesServiceMock.findAll.mockImplementation(async () => docs);

      const result = await controller.findAll(req);

      expect(notesServiceMock.findAll).toBeCalledWith(req.user.id);
      expect(result).toEqual(docs);
    });
  });

  describe('findOne', () => {
    it('should return call service`s findAllByOwner and return its result', async () => {
      const doc = { content: 'My text', id: 'NOTEID' };
      const req = { user: { id: 'USERID' } };
      notesServiceMock.findOne.mockImplementation(async () => doc);

      const result = await controller.findOne(req, doc.id);

      expect(notesServiceMock.findOne).toBeCalledWith(req.user.id, doc.id);
      expect(result).toEqual(doc);
    });
  });
});
