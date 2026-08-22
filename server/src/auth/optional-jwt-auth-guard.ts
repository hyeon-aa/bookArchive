import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// 로그인 없이도 호출 가능해야 하는 엔드포인트에서, 토큰이 있으면 검증해서
// request.user를 채우고 없거나 유효하지 않아도 막지 않는 guard.
// (JwtAuthGuard처럼 인증 실패 시 401을 던지지 않고 그냥 user를 null로 둔다)
@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  handleRequest<TUser = unknown>(err: unknown, user: TUser): TUser {
    return user;
  }
}
