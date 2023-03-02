import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  const jwtServiceMock = { sign: jest.fn(() => 'MOCKED_TOKEN') };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      providers: [JwtService],
    })
      .overrideProvider(JwtService)
      .useValue(jwtServiceMock)
      .compile();
    app = moduleFixture.createNestApplication();
    await app.init();
  });

  describe('/api/auth/signup (POST)', () => {
    it('should create user and token', async () => {
      return await request(app.getHttpServer())
        .post('/auth/signup')
        .send({ username: 'user', password: 'pwd' })
        .expect(201)
        .expect({ token: 'MOCKED_TOKEN', userId: '0' });
    });
  });

  describe('/api/auth/login (POST)', () => {
    it('should create user and token', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({ username: 'user', password: 'pwd' })
        .expect(200)
        .expect({ id: '0', username: 'user' });
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
