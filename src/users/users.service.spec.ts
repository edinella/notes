import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from './users.service';
import { User } from './schemas/user.schema';

describe('UsersService', () => {
  let usersService: UsersService;

  const userModelMock = {
    findOne: jest.fn(),
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(User.name),
          useValue: userModelMock,
        },
      ],
    }).compile();

    usersService = module.get<UsersService>(UsersService);
  });

  describe('findByUsername', () => {
    it('should return a user by username', async () => {
      const user = { username: 'testuser', passwordHash: 'hashedpassword' };
      const username = user.username;
      userModelMock.findOne.mockReturnValueOnce({ exec: async () => user });

      const result = await usersService.findByUsername(username);

      expect(userModelMock.findOne).toHaveBeenCalledWith({ username });
      expect(result).toEqual(user);
    });
  });

  describe('create', () => {
    it('should create a user with hashed password', async () => {
      const payload = { username: 'usr', password: 'pwd' };
      const expected = { username: 'usr', passwordHash: 'hashed' };
      jest.spyOn(bcrypt, 'hash').mockImplementationOnce(async () => 'hashed');
      userModelMock.create.mockImplementationOnce(async () => expected);

      const result = await usersService.create(payload);

      expect(bcrypt.hash).toHaveBeenCalledWith(payload.password, 10);
      expect(userModelMock.create).toHaveBeenCalledWith(expected);
      expect(result).toEqual(expected);
    });

    it('should throw BadRequestException if username is taken', async () => {
      const payload = { username: 'usr', password: 'pwd' };
      userModelMock.create.mockImplementationOnce(() =>
        Promise.reject({ code: 11000 }),
      );

      await expect(usersService.create(payload)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw InternalServerErrorException if error occurred while saving new user', async () => {
      const payload = { username: 'usr', password: 'pwd' };
      userModelMock.create.mockImplementationOnce(() =>
        Promise.reject(new Error()),
      );

      await expect(usersService.create(payload)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
