import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../enums/role.enum';
import { RolesGuard } from './roles.guard';

function contextWithUser(user: unknown): ExecutionContext {
  return {
    getHandler: () => undefined,
    getClass: () => undefined,
    switchToHttp: () => ({ getRequest: () => ({ user }) }),
  } as unknown as ExecutionContext;
}

describe('RolesGuard', () => {
  let reflector: Reflector;
  let guard: RolesGuard;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);
  });

  it('allows routes with no @Roles metadata', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
    expect(guard.canActivate(contextWithUser({ role: Role.User }))).toBe(true);
  });

  it('blocks a non-admin from an admin-only route (403)', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.Admin]);
    expect(() =>
      guard.canActivate(contextWithUser({ role: Role.User })),
    ).toThrow(ForbiddenException);
  });

  it('allows an admin through an admin-only route', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.Admin]);
    expect(guard.canActivate(contextWithUser({ role: Role.Admin }))).toBe(true);
  });

  it('blocks a request with no user when a role is required', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.Admin]);
    expect(() => guard.canActivate(contextWithUser(undefined))).toThrow(
      ForbiddenException,
    );
  });
});
