import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { SignupResponseDto } from './dto/signup-response.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const JwtServiceProvider = {
      provide: JwtService,
      useValue: {
        sign: jest.fn(() => 'fakeToken'),
      },
    };
    const moduleRef = await Test.createTestingModule({
      providers: [AuthService, UsersService, JwtServiceProvider],
    }).compile();

    authService = moduleRef.get<AuthService>(AuthService);
    usersService = moduleRef.get<UsersService>(UsersService);
    jwtService = moduleRef.get<JwtService>(JwtService);
  });

  describe('signup', () => {
    it('should create a user and return token and userId', async () => {
      jest
        .spyOn(usersService, 'create')
        .mockResolvedValue({ id: '1', username: '', passwordHash: '' });
      const response: SignupResponseDto = await authService.signup({
        username: 'testUser',
        password: 'password',
      });
      expect(response.token).toEqual('fakeToken');
      expect(response.userId).toEqual('1');
    });
  });

  describe('validateUser', () => {
    it('should return user id & username for good credentials', async () => {
      jest.spyOn(usersService, 'findByUsername').mockResolvedValue({
        id: '1',
        username: 'testUser',
        passwordHash: 'hashedPassword',
      });
      jest
        .spyOn(bcrypt, 'compare')
        .mockImplementation(() => Promise.resolve(true));
      const response = await authService.validateUser('testUser', 'password');
      expect(response).toEqual({ id: '1', username: 'testUser' });
    });

    it('should return null if the username is invalid', async () => {
      jest.spyOn(usersService, 'findByUsername').mockResolvedValue(null);
      const response = await authService.validateUser('invalidUsr', 'pwd');
      expect(response).toBeNull();
    });

    it('should return null if the password is invalid', async () => {
      jest.spyOn(usersService, 'findByUsername').mockResolvedValue({
        id: '1',
        username: 'testUser',
        passwordHash: 'hashedPwd',
      });
      jest
        .spyOn(bcrypt, 'compare')
        .mockImplementation(() => Promise.resolve(false));
      const response = await authService.validateUser('testUser', 'invalidPwd');
      expect(response).toBeNull();
    });
  });

  describe('login', () => {
    it('should return a token', async () => {
      const response: LoginResponseDto = await authService.login({ id: 1 });
      expect(response.token).toEqual('fakeToken');
    });
  });
});
