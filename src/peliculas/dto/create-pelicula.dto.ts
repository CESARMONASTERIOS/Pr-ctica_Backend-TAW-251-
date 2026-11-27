import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ArrayUnique, IsArray, IsIn, IsInt, IsString, Matches, Max, MaxLength, Min, ValidateIf } from 'class-validator';
import { CLASIFICACIONES, type Clasificacion } from '../pelicula.entity';
export class CreatePeliculaDto {
  @ApiProperty({ description: 'Título de la película', example: "La última función" })
  @IsString()
  @Matches(/\S/, { message: 'Escribe el título de la película.' })
  @MaxLength(180)
  titulo!: string;

  @ApiProperty({ description: 'Resumen de la historia', example: "Una proyeccionista intenta salvar el cine de su barrio." })
  @IsString()
  @Matches(/\S/, { message: 'Escribe una sinopsis para la película.' })
  sinopsis!: string;

  @ApiProperty({ description: 'Duración en minutos', example: 105, type: 'integer', minimum: 1, maximum: 2147483647 })
  @IsInt({ message: 'La duración debe indicarse en minutos enteros.' })
  @Min(1, { message: 'La duración debe ser de al menos un minuto.' })
  @Max(2147483647)
  duracionMin!: number;

  @ApiProperty({ description: 'Clasificación por edad', example: "ATP", enum: [...CLASIFICACIONES] })
  @IsIn([...CLASIFICACIONES], { message: 'La clasificación debe ser ATP, +13 o +18.' })
  clasificacion!: Clasificacion;

  @ApiPropertyOptional({ description: 'Identificadores de géneros activos', example: [1,2], type: [Number], uniqueItems: true })
  @ValidateIf((_, valor) => valor !== undefined)
  @IsArray()
  @ArrayUnique()
  @IsInt({ each: true })
  @Min(1, { each: true })
  @Max(2147483647, { each: true })
  idGeneros?: number[];
}
