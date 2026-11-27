import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNumber, Max, Min, ValidateIf } from 'class-validator';

export class CreateBoletoDto {
  @ApiProperty({ description: 'Identificador de una función activa', example: 1, type: 'integer', minimum: 1, maximum: 2147483647 })
  @IsInt({ message: 'El identificador de la función debe ser un número entero.' })
  @Min(1, { message: 'El identificador de la función debe ser mayor que cero.' })
  @Max(2147483647)
  idFuncion!: number;

  @ApiProperty({ description: 'Identificador de un cliente activo', example: 1, type: 'integer', minimum: 1, maximum: 2147483647 })
  @IsInt({ message: 'El identificador del cliente debe ser un número entero.' })
  @Min(1, { message: 'El identificador del cliente debe ser mayor que cero.' })
  @Max(2147483647)
  idCliente!: number;

  @ApiProperty({ description: 'Número de asiento en la sala', example: 3, type: 'integer', minimum: 1, maximum: 2147483647 })
  @IsInt({ message: 'El número de asiento debe ser un entero.' })
  @Min(1, { message: 'El número de asiento debe ser mayor que cero.' })
  @Max(2147483647)
  numeroAsiento!: number;

  @ApiPropertyOptional({ description: 'Precio de la venta. Si se omite al vender, se toma el precio de la función.', example: 35.5, minimum: 0, maximum: 99999999.99, multipleOf: 0.01 })
  @ValidateIf((_, valor) => valor !== undefined)
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'El precio pagado debe tener hasta dos decimales.' })
  @Min(0)
  @Max(99999999.99)
  precioPagado?: number;
}
