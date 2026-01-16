export interface JwtPayload {
  sub: string; // user id
  email: string;
}

export interface JwtUser {
  userId: string;
  email: string;
}
