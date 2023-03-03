import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { HttpStatus } from '@nestjs/common/enums/http-status.enum';
import * as request from 'supertest';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { AppModule } from './../src/app.module';
import { getModelToken } from '@nestjs/mongoose';
import { User } from './../src/users/schemas/user.schema';
import { JwtAuthGuard } from '../src/auth/guards/jwt-auth.guard';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  const userModelMock = {
    findOne: jest.fn(),
    create: jest.fn(),
  };
  const jwtServiceMock = {
    sign: jest.fn(),
  };
  const mockJwtAuthGuard = {
    canActivate: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(getModelToken(User.name))
      .useValue(userModelMock)
      .overrideProvider(JwtService)
      .useValue(jwtServiceMock)
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
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
      jest.spyOn(bcrypt, 'hash').mockImplementation(async () => hashedPwd);

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

  describe('/api/auth/login (POST)', () => {
    it('should create and return token for good credentials', async () => {
      const payload = { username: 'user', password: 'pwd' };
      const user = { username: 'user', passwordHash: 'xxx' };
      const mockedToken = 'MOCKED_TOKEN';
      jwtServiceMock.sign.mockImplementation(() => mockedToken);
      userModelMock.findOne.mockReturnValue({ exec: async () => user });
      jest.spyOn(bcrypt, 'compare').mockImplementation(async () => true);

      await request(app.getHttpServer())
        .post('/auth/login')
        .send(payload)
        .expect(HttpStatus.OK)
        .expect({ token: mockedToken });

      expect(userModelMock.findOne).toBeCalledWith({
        username: payload.username,
      });
    });

    it('should throw exception for bad username', async () => {
      const payload = { username: 'user', password: 'pwd' };
      const user = null;
      const mockedToken = 'MOCKED_TOKEN';
      jwtServiceMock.sign.mockImplementation(() => mockedToken);
      userModelMock.findOne.mockReturnValue({ exec: async () => user });
      jest.spyOn(bcrypt, 'compare').mockImplementation(async () => true);
      mockJwtAuthGuard.canActivate = jest.fn(() => false);

      await request(app.getHttpServer())
        .post('/auth/login')
        .send(payload)
        .expect(401);

      expect(userModelMock.findOne).toBeCalledWith({
        username: payload.username,
      });
    });

    it('should throw exception for bad password', async () => {
      const payload = { username: 'user', password: 'pwd' };
      const user = { username: 'user', passwordHash: 'xxx' };
      const mockedToken = 'MOCKED_TOKEN';
      jwtServiceMock.sign.mockImplementation(() => mockedToken);
      userModelMock.findOne.mockReturnValue({ exec: async () => user });
      jest.spyOn(bcrypt, 'compare').mockImplementation(async () => false);
      mockJwtAuthGuard.canActivate = jest.fn(() => false);

      await request(app.getHttpServer())
        .post('/auth/login')
        .send(payload)
        .expect(401);

      expect(bcrypt.compare).toBeCalledWith(
        payload.password,
        user.passwordHash,
      );
      expect(userModelMock.findOne).toBeCalledWith({
        username: payload.username,
      });
    });
  });

  describe('/api/notes (POST)', () => {
    it('should throw exception without credentials', () => {
      mockJwtAuthGuard.canActivate.mockImplementation(() => false);
      return request(app.getHttpServer())
        .post('/notes')
        .send({})
        .expect(HttpStatus.FORBIDDEN);
    });
  });
});
