import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BajaDto, Documentar } from '../comun/documentacion';
import { ClienteConBoletos } from '../comun/vistas';
import { Cliente } from './cliente.entity';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';
import { ClientesService } from './clientes.service';

@ApiTags('Clientes')
@Controller('clientes')
export class ClientesController {
  constructor(private readonly servicio: ClientesService) {}

  @Get()
  @Documentar({
    resumen: 'Listar clientes', detalle: 'Muestra los clientes que siguen activos.',
    respuesta: Cliente, lista: true,
  })
  listar() { return this.servicio.listar(); }

  @Get(':id')
  @Documentar({
    resumen: 'Consultar un cliente', detalle: 'Muestra sus datos y los boletos activos con sus funciones.',
    respuesta: ClienteConBoletos, buscar: true,
  })
  detalle(@Param('id', ParseIntPipe) id: number) { return this.servicio.detalle(id); }

  @Post()
  @Documentar({
    resumen: 'Crear un cliente', detalle: 'Agrega un cliente y muestra el registro creado.',
    body: CreateClienteDto, describeBody: 'Nombres, apellidos y correo electrónico.',
    respuesta: Cliente, escritura: true, creada: true,
  })
  crear(@Body() dto: CreateClienteDto) { return this.servicio.crear(dto); }

  @Patch(':id')
  @Documentar({
    resumen: 'Actualizar un cliente', detalle: 'Cambia solo los datos que envíes.',
    body: UpdateClienteDto, describeBody: 'Campos que se desean cambiar.',
    respuesta: Cliente, escritura: true, buscar: true,
  })
  actualizar(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateClienteDto) {
    return this.servicio.actualizar(id, dto);
  }

  @Delete(':id')
  @Documentar({
    resumen: 'Dar de baja un cliente', detalle: 'Da de baja al cliente sin borrar su historial.',
    respuesta: BajaDto, escritura: true, buscar: true,
  })
  eliminar(@Param('id', ParseIntPipe) id: number) { return this.servicio.eliminar(id); }
}
