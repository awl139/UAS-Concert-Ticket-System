import { IsEmail, IsString, MinLength, Matches } from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'Email tidak valid' })
  email: string;

  @IsString()
  @MinLength(8, { message: 'Password minimal 8 karakter' })
  @Matches(/(?=.*[A-Z])/, { 
    message: 'Password harus mengandung minimal 1 huruf besar' 
  })
  @Matches(/(?=.*\d)/, { 
    message: 'Password harus mengandung minimal 1 angka' 
  })
  password: string;

  @IsString()
  @MinLength(2, { message: 'Nama minimal 2 karakter' })
  name: string;
}