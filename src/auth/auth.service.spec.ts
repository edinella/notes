import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let authService: AuthService;

  const jwtServiceMock = {
    sign: jest.fn(),
  };
  const usersServiceMock = {
    create: jest.fn(),
    findByUsername: jest.fn(),
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: usersServiceMock,
        },
        {
          provide: JwtService,
          useValue: jwtServiceMock,
        },
      ],
    }).compile();

    authService = moduleRef.get<AuthService>(AuthService);
  });

  describe('signup', () => {
    it('should create a user and return token and userId', async () => {
      const mockRequest = {
        username: 'usr',
        password: 'pass',
      };
      const mockResult = {
        id: '6400fa303a19d358d3c63db4',
        username: 'usr',
        passwordHash: 'x',
      };
      usersServiceMock.create.mockImplementation(async () => mockResult);

      const response = await authService.signup(mockRequest);

      expect(response.id).toEqual(mockResult.id);
      expect(response.username).toEqual(mockResult.username);
    });
  });

  describe('validateUser', () => {
    it('should return user id for good credentials', async () => {
      const user = {
        _id: '6400fa303a19d358d3c63db4',
        username: 'testUser',
        passwordHash: 'hashedPassword',
      };
      const expectedResult = {
        id: user._id,
      };

      usersServiceMock.findByUsername.mockImplementation(async () => user);
      jest.spyOn(bcrypt, 'compare').mockImplementation(async () => true);

      const response = await authService.validateUser('testUser', 'password');

      expect(response).toEqual(expectedResult);
    });

    it('should return null if the username is invalid', async () => {
      usersServiceMock.findByUsername.mockImplementation(async () => null);

      const response = await authService.validateUser('invalidUsr', 'pwd');

      expect(response).toBeNull();
    });

    it('should return null if the password is invalid', async () => {
      const user = {
        id: '6400fa303a19d358d3c63db4',
        username: 'testUser',
        passwordHash: 'hashedPassword',
      };
      usersServiceMock.findByUsername.mockImplementation(async () => user);
      jest.spyOn(bcrypt, 'compare').mockImplementation(async () => false);

      const response = await authService.validateUser('testUser', 'invalidPwd');

      expect(response).toBeNull();
    });
  });

  describe('login', () => {
    it('should return a token', async () => {
      const user = { id: '6400fa303a19d358d3c63db4' };
      const mockedToken = 'MOCKED_TOKEN';
      jwtServiceMock.sign.mockImplementation(() => mockedToken);

      const response = await authService.login(user);

      expect(response).toEqual(mockedToken);
    });
  });
});
