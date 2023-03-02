import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;

  const authServiceMock = {
    signup: jest.fn(),
    login: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: authServiceMock,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  describe('signup', () => {
    it('should return id and username properties', async () => {
      const mockDto = {
        username: 'testuser',
        password: 'password',
      };
      const mockResult = {
        id: '6400fa303a19d358d3c63db4',
        username: 'testuser',
      };
      authServiceMock.signup.mockImplementationOnce(async () => mockResult);

      const result = await controller.signup(mockDto);

      expect(result).toEqual(mockResult);
    });
  });

  describe('login', () => {
    it('should return a LoginResponseDto with a token property', () => {
      const mockReq = {
        user: {
          id: '6400fa303a19d358d3c63db4',
          username: 'testuser',
        },
      };
      const mockDto = {
        username: 'testuser',
        password: 'password',
      };
      const mockResult = {
        token: 'mockToken',
      };
      authServiceMock.login.mockImplementationOnce(() => mockResult.token);

      const result = controller.login(mockReq, mockDto);

      expect(result).toEqual(mockResult);
    });
  });
});
