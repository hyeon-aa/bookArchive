export interface User {
  id: string;
  email: string;
  name: string;
}
export interface LoginResponse {
  accessToken: string;
  user: User;
}
export interface LoginForm {
  email: string;
  password: string;
}

export interface SignUpForm extends LoginForm {
  name: string;
}
