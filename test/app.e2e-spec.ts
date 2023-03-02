import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { AppModule } from './../src/app.module';
import { getModelToken } from '@nestjs/mongoose';
import { User } from './../src/users/schemas/user.schema';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let server;

  const userModelMock = {
    findOne: jest.fn(),
    create: jest.fn(),
  };
  const jwtServiceMock = {
    sign: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      providers: [
        {
          provide: getModelToken(User.name),
          useValue: userModelMock,
        },
        {
          provide: JwtService,
          useValue: jwtServiceMock,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  beforeEach(() => {
    server = app.getHttpServer();
  });

  describe('/api/auth/signup (POST)', () => {
    it('should return create and return new user', async () => {
      const payload = { username: 'user', password: 'pwd' };
      const created = { id: '6400fa303a19d358d3c63db4', username: 'user' };
      userModelMock.create.mockImplementationOnce(() => created);

      const result = request(server).post('/auth/signup').send(payload);

      result.expect(201).expect(created);
    });

    it('should throw exception if username is taken', async () => {
      const payload = { username: 'user', password: 'pwd' };
      userModelMock.create.mockImplementationOnce(() =>
        Promise.reject({ code: 11000 }),
      );

      const result = request(server).post('/auth/signup').send(payload);

      result.expect(400);
    });

    it('should throw exception if error occurred while saving new user', async () => {
      const payload = { username: 'user', password: 'pwd' };
      userModelMock.create.mockImplementationOnce(() =>
        Promise.reject(new Error()),
      );

      const result = request(server).post('/auth/signup').send(payload);

      result.expect(500);
    });
  });

  describe('/api/auth/login (POST)', () => {
    it('should create and return token for good credentials', () => {
      const payload = { username: 'user', password: 'pwd' };
      const mockedToken = 'MOCKED_TOKEN';
      const expected = { token: mockedToken };
      jwtServiceMock.sign.mockImplementationOnce(() => mockedToken);

      const result = request(server).post('/auth/login').send(payload);

      result.expect(200).expect(expected);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
