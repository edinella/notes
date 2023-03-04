import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from './users.service';
import { User } from './schemas/user.schema';
import { Types } from 'mongoose';

describe('UsersService', () => {
  let usersService: UsersService;

  const userModelMock = {
    findOne: jest.fn(),
    create: jest.fn(),
    find: jest.fn(),
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
      jest.spyOn(bcrypt, 'hash').mockImplementation(async () => 'hashed');
      userModelMock.create.mockImplementation(async () => expected);

      const result = await usersService.create(payload);

      expect(bcrypt.hash).toHaveBeenCalledWith(payload.password, 10);
      expect(userModelMock.create).toHaveBeenCalledWith(expected);
      expect(result).toEqual(expected);
    });

    it('should throw BadRequestException if username is taken', async () => {
      const payload = { username: 'usr', password: 'pwd' };
      userModelMock.create.mockImplementation(() =>
        Promise.reject({ code: 11000 }),
      );

      await expect(usersService.create(payload)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw InternalServerErrorException if error occurred while saving new user', async () => {
      const payload = { username: 'usr', password: 'pwd' };
      userModelMock.create.mockImplementation(() =>
        Promise.reject(new Error()),
      );

      await expect(usersService.create(payload)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('purgeIDs', () => {
    it('should check if users exists and return valid IDs only', async () => {
      const candidateIDs = [
        new Types.ObjectId(),
        new Types.ObjectId(),
        new Types.ObjectId(),
      ];
      const strCandidateIDs = candidateIDs.map((id) => id.toString());
      const mockDocs = [{ _id: candidateIDs[1] }];
      const mock = {
        find: jest.fn(() => mock),
        select: jest.fn(() => mock),
        exec: jest.fn(async () => mockDocs),
      };
      userModelMock.find = mock.find;

      const result = await usersService.purgeIDs(strCandidateIDs);

      expect(mock.find).toHaveBeenCalledWith({ _id: { $in: strCandidateIDs } });
      expect(mock.select).toHaveBeenCalledWith('_id');
      expect(result).toEqual([candidateIDs[1]]);
    });
  });
});
