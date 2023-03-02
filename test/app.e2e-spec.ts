import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { AppModule } from './../src/app.module';
import { AuthModule } from './../src/auth/auth.module';
import { UsersModule } from './../src/users/users.module';
import { UsersService } from './../src/users/users.service';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  const usersServiceMock = {
    findByUsername: jest.fn(),
    create: jest.fn(),
  };
  const jwtServiceMock = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      providers: [AuthModule, UsersModule, JwtService, UsersService],
    })
      .overrideProvider(UsersService)
      .useValue(usersServiceMock)
      .overrideProvider(JwtService)
      .useValue(jwtServiceMock)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  describe('/api/auth/signup (POST)', () => {
    it('should create user and token', () => {
      usersServiceMock.create = jest.fn(() => ({
        id: 'test',
        token: 'TOKEN',
        passwordHash: 'secret',
      }));
      jwtServiceMock.sign = jest.fn().mockReturnValue('TOKEN');
      return request(app.getHttpServer())
        .post('/auth/signup')
        .expect(201)
        .expect({ token: 'TOKEN', userId: 'test' });
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
