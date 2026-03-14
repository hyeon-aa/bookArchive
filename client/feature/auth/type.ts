export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignUpRequest extends LoginRequest {
  name: string;
}

export interface UserResponse {
  id: string;
  email: string;
  nickname: string;
  isMember: boolean;
  level: number;
}

export interface LoginResponse {
  accessToken: string;
  user: UserResponse;
}
