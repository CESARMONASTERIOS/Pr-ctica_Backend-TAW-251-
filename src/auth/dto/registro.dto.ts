import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { LoginDto } from './login.dto';

export class RegistroDto extends LoginDto {
  @ApiProperty({ example: 'taquilla' })
  @IsString()
  @Matches(/\S/, { message: 'Escribe un nombre de usuario.' })
  @MaxLength(80)
  username!: string;

  @ApiProperty({ format: 'password', minLength: 8, description: 'Al menos 8 caracteres y hasta 72 bytes en UTF-8', example: 'FuncionDeNoche7' })
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres.' })
  declare password: string;
}
