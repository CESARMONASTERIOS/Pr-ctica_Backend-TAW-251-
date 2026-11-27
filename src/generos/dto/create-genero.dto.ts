import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches, MaxLength } from 'class-validator';

export class CreateGeneroDto {
  @ApiProperty({ description: 'Nombre del género', example: "Aventura" })
  @IsString()
  @Matches(/\S/, { message: 'Escribe un nombre para el género.' })
  @MaxLength(100)
  nombre!: string;

  @ApiProperty({ description: 'Descripción del género', example: "Historias de viajes y exploración." })
  @IsString()
  @Matches(/\S/, { message: 'Escribe una descripción para el género.' })
  descripcion!: string;
}
