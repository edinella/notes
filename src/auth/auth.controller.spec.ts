import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { UsersService } from '../users/users.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [AuthService, UsersService, JwtService],
    }).compile();

    authService = moduleRef.get<AuthService>(AuthService);
    authController = moduleRef.get<AuthController>(AuthController);
  });

  describe('signup', () => {
    it('should return a SignupResponseDto', async () => {
      jest
        .spyOn(authService, 'signup')
        .mockImplementation(async () => ({ userId: '1', token: 'TOKEN' }));
      const result = await authController.signup({
        username: 'user',
        password: 'pwd',
      });
      expect(result.userId).toBe('1');
      expect(result.token).toBe('TOKEN');
    });
  });

  describe('login', () => {
    it('should return the user object', async () => {
      const req = { user: { username: 'usr' } };
      const result = await authController.login(req, {
        username: 'usr',
        password: 'x',
      });
      expect(result.username).toBe('usr');
    });
  });
});
