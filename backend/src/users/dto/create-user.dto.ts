export class CreateUserDto {
  email: string;
  password: string;
  name?: string;
  initialBalance?: number;
}