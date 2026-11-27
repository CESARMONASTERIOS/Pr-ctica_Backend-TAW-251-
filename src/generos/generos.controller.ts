import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BajaDto, Documentar } from '../comun/documentacion';
import { GeneroConPeliculas } from '../comun/vistas';
import { Genero } from './genero.entity';
import { CreateGeneroDto } from './dto/create-genero.dto';
import { UpdateGeneroDto } from './dto/update-genero.dto';
import { GenerosService } from './generos.service';

@ApiTags('Géneros')
@Controller('generos')
export class GenerosController {
  constructor(private readonly servicio: GenerosService) {}

  @Get()
  @Documentar({
    resumen: 'Listar géneros', detalle: 'Muestra los géneros que siguen activos.',
    respuesta: Genero, lista: true,
  })
  listar() { return this.servicio.listar(); }

  @Get(':id')
  @Documentar({
    resumen: 'Consultar un género', detalle: 'Muestra sus datos y las películas asociadas.',
    respuesta: GeneroConPeliculas, buscar: true,
  })
  detalle(@Param('id', ParseIntPipe) id: number) { return this.servicio.detalle(id); }

  @Post()
  @Documentar({
    resumen: 'Crear un género', detalle: 'Agrega un género y muestra el registro creado.',
    body: CreateGeneroDto, describeBody: 'Nombre y descripción del género.',
    respuesta: Genero, escritura: true, creada: true,
  })
  crear(@Body() dto: CreateGeneroDto) { return this.servicio.crear(dto); }

  @Patch(':id')
  @Documentar({
    resumen: 'Actualizar un género', detalle: 'Cambia solo los datos que envíes.',
    body: UpdateGeneroDto, describeBody: 'Campos que se desean cambiar.',
    respuesta: Genero, escritura: true, buscar: true,
  })
  actualizar(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateGeneroDto) {
    return this.servicio.actualizar(id, dto);
  }

  @Delete(':id')
  @Documentar({
    resumen: 'Dar de baja un género', detalle: 'Da de baja el género sin borrar su historial.',
    respuesta: BajaDto, escritura: true, buscar: true,
  })
  eliminar(@Param('id', ParseIntPipe) id: number) { return this.servicio.eliminar(id); }
}
