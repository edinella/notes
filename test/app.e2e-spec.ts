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

    it('should throw exception if username is taken', () => {
      const payload = { username: 'user', password: 'pwd' };
      userModelMock.create.mockImplementation(() =>
        Promise.reject({ code: 11000 }),
      );

      return request(app.getHttpServer())
        .post('/auth/signup')
        .send(payload)
        .expect(400);
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
    const userId = new Types.ObjectId();
    const username = 'usr';
    const password = 'pwd';

    beforeAll(async () => {
      const passwordHash = await bcrypt.hash(password, 10);
      const user = { _id: userId, username, passwordHash };
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
          const payload = { content: 'My text' };
          const doc = {
            _id: new Types.ObjectId(),
            owner: userId,
            accessors: [],
            content: payload.content,
          };
          noteModelMock.create.mockImplementation(async () => doc);

          const { body } = await request(app.getHttpServer())
            .post('/notes')
            .set('Authorization', 'Bearer ' + token)
            .send(payload)
            .expect(HttpStatus.CREATED);

          // expect(noteModelMock.create).toBeCalledWith({ owner, content });
          expect(body._id).toEqual(doc._id.toString());
          expect(body.owner).toEqual(doc.owner.toString());
          expect(body.accessors).toEqual(doc.accessors);
          expect(body.content).toEqual(doc.content);
        });
      });

      describe('/api/notes (GET)', () => {
        it('should list user`s notes', async () => {
          const doc = {
            _id: new Types.ObjectId(),
            owner: userId,
            accessors: [],
            content: 'My text',
          };
          noteModelMock.find.mockImplementation(async () => [doc]);

          const { body } = await request(app.getHttpServer())
            .get('/notes')
            .set('Authorization', 'Bearer ' + token)
            .expect(HttpStatus.OK);

          expect(body.length).toEqual(1);
          expect(body[0]._id).toEqual(doc._id.toString());
          expect(body[0].owner).toEqual(doc.owner.toString());
          expect(body[0].accessors).toEqual(doc.accessors);
          expect(body[0].content).toEqual(doc.content);
        });
      });

      describe('/api/notes/:id (GET)', () => {
        it('should get user`s note', async () => {
          const doc = {
            _id: new Types.ObjectId(),
            owner: userId,
            accessors: [],
            content: 'My text',
          };
          noteModelMock.findOne.mockImplementation(async () => doc);

          const { body } = await request(app.getHttpServer())
            .get('/notes/' + doc._id.toString())
            .set('Authorization', 'Bearer ' + token)
            .expect(HttpStatus.OK);

          expect(body._id).toEqual(doc._id.toString());
          expect(body.owner).toEqual(doc.owner.toString());
          expect(body.accessors).toEqual(doc.accessors);
          expect(body.content).toEqual(doc.content);
        });
      });

      describe('/api/notes/:id (PUT)', () => {
        it('should update user`s note', async () => {
          const payload = { content: 'My text' };
          const doc = {
            _id: new Types.ObjectId(),
            owner: userId,
            accessors: [],
            content: payload.content,
          };
          noteModelMock.findOneAndUpdate.mockImplementation(async () => doc);

          const { body } = await request(app.getHttpServer())
            .put('/notes/' + doc._id.toString())
            .set('Authorization', 'Bearer ' + token)
            .send(payload)
            .expect(HttpStatus.OK);

          expect(body._id).toEqual(doc._id.toString());
          expect(body.owner).toEqual(doc.owner.toString());
          expect(body.accessors).toEqual(doc.accessors);
          expect(body.content).toEqual(doc.content);
        });
      });

      describe('/api/notes/:id (DELETE)', () => {
        it('should delete user`s note', async () => {
          const _id = new Types.ObjectId();
          const deleteResult = { deletedCount: 1 };
          noteModelMock.deleteOne.mockImplementation(async () => deleteResult);

          const { body } = await request(app.getHttpServer())
            .delete('/notes/' + _id.toString())
            .set('Authorization', 'Bearer ' + token)
            .expect(HttpStatus.OK);

          expect(body).toEqual(deleteResult);
        });
      });
    });
  });
});
