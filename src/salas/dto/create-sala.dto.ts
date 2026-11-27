import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsInt, IsString, Matches, Max, MaxLength, Min } from 'class-validator';
import { TIPOS_SALA, type TipoSala } from '../sala.entity';
export class CreateSalaDto {
  @ApiProperty({ description: 'Nombre de la sala', example: "Sala Illimani" })
  @IsString()
  @Matches(/\S/, { message: 'Escribe un nombre para la sala.' })
  @MaxLength(120)
  nombre!: string;

  @ApiProperty({ description: 'Cantidad de asientos de la sala', example: 80, type: 'integer', minimum: 1, maximum: 2147483647 })
  @IsInt({ message: 'La capacidad debe ser un número entero.' })
  @Min(1, { message: 'La capacidad debe ser de al menos un asiento.' })
  @Max(2147483647)
  capacidad!: number;

  @ApiProperty({ description: 'Tipo de sala', example: "3D", enum: [...TIPOS_SALA] })
  @IsIn([...TIPOS_SALA], { message: 'El tipo de sala debe ser 2D, 3D o IMAX.' })
  tipo!: TipoSala;
}
