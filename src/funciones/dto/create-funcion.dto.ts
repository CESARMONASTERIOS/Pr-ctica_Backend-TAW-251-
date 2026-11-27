import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsInt, IsNumber, Matches, Max, Min } from 'class-validator';

export class CreateFuncionDto {
  @ApiProperty({ description: 'Identificador de una sala activa', example: 1, type: 'integer', minimum: 1, maximum: 2147483647 })
  @IsInt({ message: 'El identificador de la sala debe ser un número entero.' })
  @Min(1, { message: 'El identificador de la sala debe ser mayor que cero.' })
  @Max(2147483647)
  idSala!: number;

  @ApiProperty({ description: 'Identificador de una película activa', example: 1, type: 'integer', minimum: 1, maximum: 2147483647 })
  @IsInt({ message: 'El identificador de la película debe ser un número entero.' })
  @Min(1, { message: 'El identificador de la película debe ser mayor que cero.' })
  @Max(2147483647)
  idPelicula!: number;

  @ApiProperty({ description: 'Inicio de la proyección en formato ISO 8601', example: "2026-12-12T19:30:00-04:00", format: 'date-time' })
  @IsDateString({ strict: true }, { message: 'La fecha y hora debe tener formato ISO 8601.' })
  @Matches(/T\d{2}:\d{2}/, { message: 'Incluye también la hora de la función.' })
  fechaHora!: string;

  @ApiProperty({ description: 'Precio regular de un boleto', example: 35.5, minimum: 0, maximum: 99999999.99, multipleOf: 0.01 })
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'El precio debe tener hasta dos decimales.' })
  @Min(0)
  @Max(99999999.99)
  precio!: number;
}
