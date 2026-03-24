import { Test } from '@nestjs/testing';
import { AuthGuard } from './auth.guard';
import { JwtService } from '@nestjs/jwt';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        AuthGuard,
        {
          provide: JwtService,
          useValue: { verifyAsync: jest.fn() },
        },
      ],
    }).compile();

    guard = module.get<AuthGuard>(AuthGuard);
    jwtService = module.get<JwtService>(JwtService);
  });

  const mockContext = (token?: string): ExecutionContext => ({
    switchToHttp: () => ({
      getRequest: () => ({
        headers: {
          authorization: token ? `Bearer ${token}` : undefined,
        },
      }),
    }),
  } as any);

  it('should allow request with valid JWT', async () => {
    const payload = { sub: 'user-123', username: 'kenkzuha' };
    jest.spyOn(jwtService, 'verifyAsync').mockResolvedValue(payload);

    const result = await guard.canActivate(mockContext('valid.token.here'));
    expect(result).toBe(true);
  });

  it('should throw 401 when no token provided', async () => {
    await expect(guard.canActivate(mockContext())).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should throw 401 when token is invalid', async () => {
    jest.spyOn(jwtService, 'verifyAsync').mockRejectedValue(new Error('invalid'));

    await expect(guard.canActivate(mockContext('invalid.token'))).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should throw 401 when token is expired', async () => {
    jest.spyOn(jwtService, 'verifyAsync').mockRejectedValue(
      new Error('jwt expired')
    );

    await expect(guard.canActivate(mockContext('expired.token'))).rejects.toThrow(
      UnauthorizedException,
    );
  });
});