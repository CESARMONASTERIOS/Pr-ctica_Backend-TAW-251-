import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ format: 'email', example: 'personal@gmail.com' })
  @IsEmail({}, { message: 'Ingresa un correo electrónico válido.' })
  @MaxLength(254)
  email!: string;

  @ApiProperty({ format: 'password', example: 'FuncionDeNoche7' })
  @IsString()
  @IsNotEmpty()
  password!: string;
}
