import { OmitType, PartialType } from '@nestjs/swagger';
import { CreatePeliculaDto } from './create-pelicula.dto';

export class UpdatePeliculaDto extends OmitType(
  PartialType(CreatePeliculaDto, { skipNullProperties: false }),
  ['idGeneros'] as const,
) {}
