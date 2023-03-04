import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { HttpStatus } from '@nestjs/common/enums/http-status.enum';
import * as request from 'supertest';
import * as bcrypt from 'bcrypt';
import { Types } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { AppModule } from '../src/app.module';
import { User } from '../src/users/schemas/user.schema';
import { Note } from '../src/notes/schemas/note.schema';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  const userModelMock = {
    create: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
  };
  const noteModelMock = {
    create: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    findOneAndUpdate: jest.fn(),
    deleteOne: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(getModelToken(User.name))
      .useValue(userModelMock)
      .overrideProvider(getModelToken(Note.name))
      .useValue(noteModelMock)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/api/auth/signup (POST)', () => {
    it('should return create and return new user', async () => {
      const payload = { username: 'user', password: 'pwd' };
      const created = { id: '6400fa303a19d358d3c63db4', username: 'user' };
      const hashedPwd = 'hashed';
      userModelMock.create.mockImplementation(async () => created);
      jest.spyOn(bcrypt, 'hash').mockImplementationOnce(async () => hashedPwd);

      await request(app.getHttpServer())
        .post('/auth/signup')
        .send(payload)
        .expect(HttpStatus.CREATED)
        .expect(created);

      expect(bcrypt.hash).toHaveBeenCalledWith(payload.password, 10);
      expect(userModelMock.create).toBeCalledWith({
        username: payload.username,
        passwordHash: hashedPwd,
      });
    });

    it('should throw exception if username is taken', async () => {
      const username = 'user';
      const password = 'pwd';
      const passwordHash = 'hashed';
      const hash = jest
        .spyOn(bcrypt, 'hash')
        .mockImplementationOnce(async () => passwordHash);
      userModelMock.create = jest.fn(() => Promise.reject({ code: 11000 }));

      const result = await request(app.getHttpServer())
        .post('/auth/signup')
        .send({ username, password })
        .expect(400);

      expect(hash).toBeCalledWith(password, 10);
      expect(userModelMock.create).toBeCalledWith({ username, passwordHash });
    });

    it('should throw exception if error occurred while saving new user', () => {
      const payload = { username: 'user', password: 'pwd' };
      userModelMock.create.mockImplementation(() =>
        Promise.reject(new Error()),
      );

      return request(app.getHttpServer())
        .post('/auth/signup')
        .send(payload)
        .expect(500);
    });
  });

  describe('protected route', () => {
    const owner = new Types.ObjectId().toString();
    const username = 'usr';
    const password = 'pwd';
    let passwordHash;

    beforeAll(async () => {
      passwordHash = await bcrypt.hash(password, 10);
      const user = { _id: owner, username, passwordHash };
      userModelMock.findOne.mockImplementation((conditions) => {
        return conditions.username === user.username
          ? { exec: async () => user }
          : { exec: async () => null };
      });
    });

    it('/api/auth/login (POST) should return 401', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({})
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('/api/notes (POST) should return 401', () => {
      return request(app.getHttpServer())
        .post('/notes')
        .send({})
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('/api/notes (GET) should return 401', () => {
      return request(app.getHttpServer())
        .get('/notes')
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('/api/notes/:id (GET) should return 401', () => {
      return request(app.getHttpServer())
        .get('/notes/1')
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('/api/notes/:id (PUT) should return 401', () => {
      return request(app.getHttpServer())
        .put('/notes/1')
        .send({})
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('/api/notes/:id (DELETE) should return 401', () => {
      return request(app.getHttpServer())
        .delete('/notes/1')
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('/api/auth/login (POST) on good credentials, should return token', async () => {
      const { body } = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ username, password })
        .expect(HttpStatus.OK);

      expect(body.token).toBeDefined();
    });

    it('/api/auth/login (POST) on bad username, should return 401', async () => {
      const { body } = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ username: 'BAD_USERNAME', password })
        .expect(HttpStatus.UNAUTHORIZED);

      expect(body.token).not.toBeDefined();
    });

    it('/api/auth/login (POST) on bad password, should return 401', async () => {
      const { body } = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ username, password: 'BAD_PASSWORD' })
        .expect(HttpStatus.UNAUTHORIZED);

      expect(body.token).not.toBeDefined();
    });

    describe('with token', () => {
      let token;

      beforeAll(async () => {
        const { body } = await request(app.getHttpServer())
          .post('/auth/login')
          .send({ username, password })
          .expect(HttpStatus.OK);
        token = body.token;
      });

      describe('/api/notes (POST)', () => {
        it('should create a note', async () => {
          const _id = new Types.ObjectId().toString();
          const accessors = [];
          const content = 'My text';
          const doc = { _id, owner, accessors, content };
          noteModelMock.create.mockImplementation(async () => doc);

          const { body } = await request(app.getHttpServer())
            .post('/notes')
            .set('Authorization', 'Bearer ' + token)
            .send({ content })
            .expect(HttpStatus.CREATED);

          expect(noteModelMock.create).toBeCalledWith({ owner, content });
          expect(body._id).toEqual(_id);
          expect(body.owner).toEqual(owner);
          expect(body.accessors).toEqual(accessors);
          expect(body.content).toEqual(content);
        });
      });

      describe('/api/notes (GET)', () => {
        it('should list user`s notes', async () => {
          const _id = new Types.ObjectId().toString();
          const accessors = [];
          const content = 'My text';
          const doc = { _id, owner, accessors, content };
          noteModelMock.find.mockImplementation(async () => [doc]);

          const { body } = await request(app.getHttpServer())
            .get('/notes')
            .set('Authorization', 'Bearer ' + token)
            .expect(HttpStatus.OK);

          expect(noteModelMock.find).toBeCalledWith({
            $or: [{ owner }, { accessors: owner }],
          });
          expect(body.length).toEqual(1);
          expect(body[0]._id).toEqual(_id);
          expect(body[0].owner).toEqual(owner);
          expect(body[0].accessors).toEqual(accessors);
          expect(body[0].content).toEqual(content);
        });
      });

      describe('/api/notes/:id (GET)', () => {
        it('should get user`s note', async () => {
          const _id = new Types.ObjectId().toString();
          const accessors = [];
          const content = 'My text';
          const doc = { _id, owner, accessors, content };
          noteModelMock.findOne.mockImplementation(async () => doc);

          const { body } = await request(app.getHttpServer())
            .get('/notes/' + _id)
            .set('Authorization', 'Bearer ' + token)
            .expect(HttpStatus.OK);

          expect(noteModelMock.findOne).toBeCalledWith({
            _id,
            $or: [{ owner }, { accessors: owner }],
          });
          expect(body._id).toEqual(_id);
          expect(body.owner).toEqual(owner);
          expect(body.accessors).toEqual(accessors);
          expect(body.content).toEqual(content);
        });
      });

      describe('/api/notes/:id (PUT)', () => {
        it('should update user`s note', async () => {
          const _id = new Types.ObjectId().toString();
          const accessors = [];
          const content = 'My text';
          const doc = { _id, owner, accessors, content };
          noteModelMock.findOneAndUpdate.mockImplementation(async () => doc);

          const { body } = await request(app.getHttpServer())
            .put('/notes/' + _id)
            .set('Authorization', 'Bearer ' + token)
            .send({ content })
            .expect(HttpStatus.OK);

          expect(noteModelMock.findOneAndUpdate).toBeCalledWith(
            { _id, owner },
            { content },
          );
          expect(body._id).toEqual(_id);
          expect(body.owner).toEqual(owner);
          expect(body.accessors).toEqual(accessors);
          expect(body.content).toEqual(content);
        });
      });

      describe('/api/notes/:id (DELETE)', () => {
        it('should delete user`s note', async () => {
          const _id = new Types.ObjectId().toString();
          const delResult = { deletedCount: 1 };
          noteModelMock.deleteOne.mockImplementation(async () => delResult);

          const { body } = await request(app.getHttpServer())
            .delete('/notes/' + _id)
            .set('Authorization', 'Bearer ' + token)
            .expect(HttpStatus.OK);

          expect(noteModelMock.deleteOne).toBeCalledWith({ _id, owner });
          expect(body).toEqual(delResult);
        });
      });

      describe('/api/notes/:id/share (POST)', () => {
        it('should update note`s accessors', async () => {
          const _id = new Types.ObjectId().toString();

          const newAccessors = [
            new Types.ObjectId().toString(),
            new Types.ObjectId().toString(),
            new Types.ObjectId().toString(),
          ];
          const validAccessors = [newAccessors[1]];

          const users = [{ _id: newAccessors[1] }];
          const mock = {
            find: jest.fn(() => mock),
            select: jest.fn(() => mock),
            exec: jest.fn(async () => users),
          };
          userModelMock.find = mock.find;

          const resultantDoc = {
            _id,
            owner,
            accessors: validAccessors,
            content: 'My text',
          };
          noteModelMock.findOneAndUpdate = jest.fn(async () => resultantDoc);

          const { body } = await request(app.getHttpServer())
            .post(`/notes/${_id.toString()}/share`)
            .send({ accessors: newAccessors })
            .set('Authorization', 'Bearer ' + token)
            .expect(HttpStatus.OK);

          expect(noteModelMock.findOneAndUpdate).toBeCalledWith(
            { owner, _id },
            { accessors: validAccessors },
          );
          expect(body).toEqual(resultantDoc);
        });
      });

      describe('/api/search (GET)', () => {
        it('should find user`s matching notes by keyword, escaping special chars', async () => {
          const _id = new Types.ObjectId().toString();
          const accessors = [];
          const content = 'My text';
          const doc = { _id, owner, accessors, content };
          noteModelMock.find.mockImplementation(async () => [doc]);
          const q = encodeURIComponent('A-[]/{}()*+?.\\^$|');

          const { body } = await request(app.getHttpServer())
            .get('/search?q=' + q)
            .set('Authorization', 'Bearer ' + token)
            .expect(HttpStatus.OK);

          expect(noteModelMock.find).toBeCalledWith({
            $or: [{ owner }, { accessors: owner }],
            content: /A\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|/i,
          });
          expect(body.length).toEqual(1);
          expect(body[0]._id).toEqual(_id);
          expect(body[0].owner).toEqual(owner);
          expect(body[0].accessors).toEqual(accessors);
          expect(body[0].content).toEqual(content);
        });
      });
    });
  });
});
