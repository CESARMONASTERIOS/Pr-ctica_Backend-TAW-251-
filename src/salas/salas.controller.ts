import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BajaDto, Documentar } from '../comun/documentacion';
import { SalaConFunciones } from '../comun/vistas';
import { Sala } from './sala.entity';
import { CreateSalaDto } from './dto/create-sala.dto';
import { UpdateSalaDto } from './dto/update-sala.dto';
import { SalasService } from './salas.service';

@ApiTags('Salas')
@Controller('salas')
export class SalasController {
  constructor(private readonly servicio: SalasService) {}

  @Get()
  @Documentar({
    resumen: 'Listar salas', detalle: 'Muestra las salas que siguen activas.',
    respuesta: Sala, lista: true,
  })
  listar() { return this.servicio.listar(); }

  @Get(':id')
  @Documentar({
    resumen: 'Consultar una sala', detalle: 'Muestra sus datos y las funciones activas que tiene programadas.',
    respuesta: SalaConFunciones, buscar: true,
  })
  detalle(@Param('id', ParseIntPipe) id: number) { return this.servicio.detalle(id); }

  @Post()
  @Documentar({
    resumen: 'Crear una sala', detalle: 'Agrega una sala y muestra el registro creado.',
    body: CreateSalaDto, describeBody: 'Nombre, capacidad y formato de proyección.',
    respuesta: Sala, escritura: true, creada: true,
  })
  crear(@Body() dto: CreateSalaDto) { return this.servicio.crear(dto); }

  @Patch(':id')
  @Documentar({
    resumen: 'Actualizar una sala', detalle: 'Cambia solo los datos que envíes.',
    body: UpdateSalaDto, describeBody: 'Campos que se desean cambiar.',
    respuesta: Sala, escritura: true, buscar: true,
  })
  actualizar(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateSalaDto) {
    return this.servicio.actualizar(id, dto);
  }

  @Delete(':id')
  @Documentar({
    resumen: 'Dar de baja una sala', detalle: 'Da de baja la sala sin borrar su historial.',
    respuesta: BajaDto, escritura: true, buscar: true,
  })
  eliminar(@Param('id', ParseIntPipe) id: number) { return this.servicio.eliminar(id); }
}
