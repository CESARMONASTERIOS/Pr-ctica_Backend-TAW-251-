import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Matches, MaxLength } from 'class-validator';

export class CreateClienteDto {
  @ApiProperty({ description: 'Nombres del cliente', example: "Ana María" })
  @IsString()
  @Matches(/\S/, { message: 'Escribe al menos un nombre.' })
  @MaxLength(120)
  nombres!: string;

  @ApiProperty({ description: 'Apellido paterno', example: "Quispe" })
  @IsString()
  @Matches(/\S/, { message: 'Escribe el apellido paterno.' })
  @MaxLength(100)
  paterno!: string;

  @ApiProperty({ description: 'Apellido materno', example: "Rojas" })
  @IsString()
  @Matches(/\S/, { message: 'Escribe el apellido materno.' })
  @MaxLength(100)
  materno!: string;

  @ApiProperty({ description: 'Correo electrónico', example: "ana@example.com", format: 'email' })
  @IsString()
  @IsEmail({}, { message: 'Ingresa un correo electrónico válido.' })
  @MaxLength(254)
  email!: string;
}
