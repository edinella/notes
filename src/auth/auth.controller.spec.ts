import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { UsersService } from '../users/users.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let authController: AuthController;
  const jwtServiceMock = { sign: jest.fn(() => 'MOCKED_TOKEN') };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [AuthService, UsersService, JwtService],
    })
      .overrideProvider(JwtService)
      .useValue(jwtServiceMock)
      .compile();

    authController = moduleRef.get<AuthController>(AuthController);
  });

  describe('signup', () => {
    it('should return id and username', async () => {
      const result = await authController.signup({
        username: 'user',
        password: 'pwd',
      });
      expect(result.id).toBe('0');
      expect(result.username).toBe('user');
    });
  });

  describe('login', () => {
    it('should return token', async () => {
      const req = { user: { username: 'usr' } };
      const result = await authController.login(req, {
        username: 'usr',
        password: 'x',
      });
      expect(result.token).toBe('MOCKED_TOKEN');
    });
  });
});
