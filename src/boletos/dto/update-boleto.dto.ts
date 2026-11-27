import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateBoletoDto } from './create-boleto.dto';

export class UpdateBoletoDto extends OmitType(
  PartialType(CreateBoletoDto, { skipNullProperties: false }),
  ['idFuncion', 'idCliente'] as const,
) {}
