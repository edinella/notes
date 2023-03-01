import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let usersServiceMock;
  let jwtServiceMock;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: jest.fn() },
        { provide: JwtService, useValue: jest.fn() },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersServiceMock = module.get<AuthService>(UsersService);
    jwtServiceMock = module.get<AuthService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('AuthService', () => {
    beforeAll(() => {
      jest.spyOn(bcrypt, 'compare');
    });

    it('should throw error if user not found', async () => {
      const user = null;
      usersServiceMock.findByUsername = jest.fn(() => user);
      await expect(async () => {
        await service.login({ username: 'usr', password: '' });
      }).rejects.toThrowError('Bad credentials');
      expect(usersServiceMock.findByUsername).toHaveBeenCalledWith('usr');
    });

    it('should throw error on wrong credentials', async () => {
      const user = { id: '', username: 'usr', passwordHash: 'hash' };
      const compare = jest
        .spyOn(bcrypt, 'compare')
        .mockImplementation(() => Promise.resolve(false));
      usersServiceMock.findByUsername = jest.fn(() => Promise.resolve(user));
      await expect(async () => {
        await service.login({ username: 'usr', password: 'pass' });
      }).rejects.toThrowError('Bad credentials');
      expect(usersServiceMock.findByUsername).toHaveBeenCalledWith('usr');
      expect(compare).toHaveBeenCalledWith('pass', 'hash');
    });

    it('should return a new jwt Token on good credentials', async () => {
      const user = { id: 'ID', username: 'usr', passwordHash: 'hash' };
      const compare = jest
        .spyOn(bcrypt, 'compare')
        .mockImplementation(() => Promise.resolve(true));
      usersServiceMock.findByUsername = jest.fn(() => Promise.resolve(user));
      jwtServiceMock.sign = jest.fn().mockReturnValue('TOKEN');
      const result = await service.login({ username: 'usr', password: 'pass' });
      expect(usersServiceMock.findByUsername).toHaveBeenCalledWith('usr');
      expect(compare).toHaveBeenCalledWith('pass', 'hash');
      expect(jwtServiceMock.sign).toHaveBeenCalledWith({ sub: 'ID' });
      expect(result.token).toBe('TOKEN');
    });
  });
});
