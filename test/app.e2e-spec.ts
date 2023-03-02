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
    it('should create and return user (except passwordHash)', async () => {
      const payload = { username: 'user', password: 'pwd' };
      const created = { id: '6400fa303a19d358d3c63db4', username: 'user' };
      userModelMock.create.mockImplementationOnce(() => created);

      const result = request(server).post('/auth/signup').send(payload);

      result.expect(201).expect(created);
    });
  });

  describe('/api/auth/login (POST)', () => {
    it('should create and return token', () => {
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
