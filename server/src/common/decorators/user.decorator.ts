import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { AuthRequest } from '../type/auth.type';
export const CurrentUser = createParamDecorator(
  (data: keyof AuthRequest['user'] | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<AuthRequest>();
    const user = request.user;

    return data ? user?.[data] : user;
  },
);
