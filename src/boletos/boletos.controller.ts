import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BajaDto, Documentar } from '../comun/documentacion';
import { BoletoDetalle } from '../comun/vistas';
import { Boleto } from './boleto.entity';
import { CreateBoletoDto } from './dto/create-boleto.dto';
import { UpdateBoletoDto } from './dto/update-boleto.dto';
import { BoletosService } from './boletos.service';

@ApiTags('Boletos')
@Controller('boletos')
export class BoletosController {
  constructor(private readonly servicio: BoletosService) {}

  @Get()
  @Documentar({
    resumen: 'Listar boletos', detalle: 'Muestra los boletos que siguen activos.',
    respuesta: Boleto, lista: true,
  })
  listar() { return this.servicio.listar(); }

  @Get(':id')
  @Documentar({
    resumen: 'Consultar un boleto', detalle: 'Muestra quién lo compró y a qué función corresponde.',
    respuesta: BoletoDetalle, buscar: true,
  })
  detalle(@Param('id', ParseIntPipe) id: number) { return this.servicio.detalle(id); }

  @Post()
  @Documentar({
    resumen: 'Vender un boleto', detalle: 'Comprueba que el asiento esté libre y dentro del aforo. Si no envías precioPagado, se usa el precio de la función.',
    body: CreateBoletoDto, describeBody: 'Función, cliente, número de asiento y precio pagado opcional.',
    respuesta: Boleto, escritura: true, creada: true, buscar: true,
  })
  crear(@Body() dto: CreateBoletoDto) { return this.servicio.crear(dto); }

  @Patch(':id')
  @Documentar({
    resumen: 'Actualizar un boleto', detalle: 'Comprueba el asiento nuevo. Si no envías precioPagado, se conserva el importe original.',
    body: UpdateBoletoDto, describeBody: 'Nuevo asiento, precio pagado o ambos.',
    respuesta: Boleto, escritura: true, buscar: true,
  })
  actualizar(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateBoletoDto) {
    return this.servicio.actualizar(id, dto);
  }

  @Delete(':id')
  @Documentar({
    resumen: 'Anular un boleto', detalle: 'Anula el boleto y deja el asiento disponible para otra venta.',
    respuesta: BajaDto, escritura: true, buscar: true,
  })
  eliminar(@Param('id', ParseIntPipe) id: number) { return this.servicio.eliminar(id); }
}
