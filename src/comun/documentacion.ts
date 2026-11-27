import { applyDecorators, Type } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBearerAuth, ApiBody, ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiProperty, ApiUnauthorizedResponse } from '@nestjs/swagger';

export class BajaDto {
  @ApiProperty({ example: 'El boleto 1 quedó anulado' })
  mensaje!: string;
}

interface OpcionesOperacion {
  resumen: string;
  detalle: string;
  respuesta: Type<unknown>;
  lista?: boolean;
  creada?: boolean;
  escritura?: boolean;
  buscar?: boolean;
  body?: Type<unknown>;
  describeBody?: string;
}

export function Documentar(o: OpcionesOperacion) {
  const exito = o.creada ? ApiCreatedResponse : ApiOkResponse;
  const decoradores = [
    ApiOperation({ summary: o.resumen, description: o.detalle }),
    exito({ type: o.respuesta, isArray: o.lista ?? false, description: o.resumen }),
  ];
  if (o.body) decoradores.push(ApiBody({ type: o.body, description: o.describeBody }));
  if (o.escritura || o.buscar) decoradores.push(ApiBadRequestResponse({ description: 'Revisa los datos enviados y las reglas de esta operación.' }));
  if (o.buscar) decoradores.push(ApiNotFoundResponse({ description: 'No se encontró el recurso o alguno de los registros relacionados.' }));
  if (o.escritura) decoradores.push(ApiBearerAuth(), ApiUnauthorizedResponse({ description: 'Inicia sesión con un token válido para realizar esta operación.' }));
  return applyDecorators(...decoradores);
}
