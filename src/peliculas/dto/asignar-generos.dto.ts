import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, ArrayUnique, IsArray, IsInt, Max, Min } from 'class-validator';

export class AsignarGenerosDto {
  @ApiProperty({ description: 'Géneros que se añadirán a la película', type: [Number], example: [1, 2], minItems: 1, uniqueItems: true })
  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsInt({ each: true })
  @Min(1, { each: true })
  @Max(2147483647, { each: true })
  idGeneros!: number[];
}
