import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  const usersServiceMock: UsersService = {
    findByUsername: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersServiceMock },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
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

    it('should throw error if password doesn`t match', async () => {
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
  });
});
