export class LoginResponseDto {
  accessToken!: string;
  user!: {
    id: string;
    email: string;
    nickname: string;
  };
}
