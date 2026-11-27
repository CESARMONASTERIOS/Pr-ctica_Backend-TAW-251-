import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BajaDto, Documentar } from '../comun/documentacion';
import { FuncionDetalle, FuncionEnCartelera } from '../comun/vistas';
import { Funcion } from './funcion.entity';
import { CreateFuncionDto } from './dto/create-funcion.dto';
import { UpdateFuncionDto } from './dto/update-funcion.dto';
import { FuncionesService } from './funciones.service';

@ApiTags('Funciones')
@Controller('funciones')
export class FuncionesController {
  constructor(private readonly servicio: FuncionesService) {}

  @Get()
  @Documentar({
    resumen: 'Listar funciones', detalle: 'Muestra la cartelera ordenada por fecha, con la sala y la película de cada función.',
    respuesta: FuncionEnCartelera, lista: true,
  })
  listar() { return this.servicio.listar(); }

  @Get(':id')
  @Documentar({
    resumen: 'Consultar una función', detalle: 'Muestra la sala, la película y los boletos que siguen activos.',
    respuesta: FuncionDetalle, buscar: true,
  })
  detalle(@Param('id', ParseIntPipe) id: number) { return this.servicio.detalle(id); }

  @Post()
  @Documentar({
    resumen: 'Crear una función', detalle: 'Agrega una función y muestra el registro creado.',
    body: CreateFuncionDto, describeBody: 'Sala y película existentes, fecha con hora y precio.',
    respuesta: Funcion, escritura: true, creada: true, buscar: true,
  })
  crear(@Body() dto: CreateFuncionDto) { return this.servicio.crear(dto); }

  @Patch(':id')
  @Documentar({
    resumen: 'Actualizar una función', detalle: 'Cambia solo los datos que envíes.',
    body: UpdateFuncionDto, describeBody: 'Campos que se desean cambiar.',
    respuesta: Funcion, escritura: true, buscar: true,
  })
  actualizar(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateFuncionDto) {
    return this.servicio.actualizar(id, dto);
  }

  @Delete(':id')
  @Documentar({
    resumen: 'Dar de baja una función', detalle: 'Da de baja la función sin borrar su historial.',
    respuesta: BajaDto, escritura: true, buscar: true,
  })
  eliminar(@Param('id', ParseIntPipe) id: number) { return this.servicio.eliminar(id); }
}
