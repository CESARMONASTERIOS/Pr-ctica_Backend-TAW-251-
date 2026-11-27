import { Body, Controller, Delete, Get, HttpCode, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BajaDto, Documentar } from '../comun/documentacion';
import { PeliculaDetalle, PeliculaConGeneros } from '../comun/vistas';
import { Pelicula } from './pelicula.entity';
import { CreatePeliculaDto } from './dto/create-pelicula.dto';
import { UpdatePeliculaDto } from './dto/update-pelicula.dto';
import { AsignarGenerosDto } from './dto/asignar-generos.dto';
import { PeliculasService } from './peliculas.service';

@ApiTags('Películas')
@Controller('peliculas')
export class PeliculasController {
  constructor(private readonly servicio: PeliculasService) {}

  @Get()
  @Documentar({
    resumen: 'Listar películas', detalle: 'Muestra las películas que siguen en cartelera y sus géneros.',
    respuesta: PeliculaConGeneros, lista: true,
  })
  listar() { return this.servicio.listar(); }

  @Get(':id')
  @Documentar({
    resumen: 'Consultar una película', detalle: 'Muestra sus géneros y las funciones que siguen activas.',
    respuesta: PeliculaDetalle, buscar: true,
  })
  detalle(@Param('id', ParseIntPipe) id: number) { return this.servicio.detalle(id); }

  @Post()
  @Documentar({
    resumen: 'Crear una película', detalle: 'Agrega una película y muestra el registro creado.',
    body: CreatePeliculaDto, describeBody: 'Título, sinopsis, duración, clasificación y lista opcional de géneros.',
    respuesta: PeliculaConGeneros, escritura: true, creada: true, buscar: true,
  })
  crear(@Body() dto: CreatePeliculaDto) { return this.servicio.crear(dto); }

  @Patch(':id')
  @Documentar({
    resumen: 'Actualizar una película', detalle: 'Cambia solo los datos que envíes. Los géneros se administran desde sus rutas.',
    body: UpdatePeliculaDto, describeBody: 'Datos de la película. Los géneros se administran en sus rutas específicas.',
    respuesta: Pelicula, escritura: true, buscar: true,
  })
  actualizar(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePeliculaDto) {
    return this.servicio.actualizar(id, dto);
  }

  @Delete(':id')
  @Documentar({
    resumen: 'Dar de baja una película', detalle: 'Da de baja la película sin borrar su historial.',
    respuesta: BajaDto, escritura: true, buscar: true,
  })
  eliminar(@Param('id', ParseIntPipe) id: number) { return this.servicio.eliminar(id); }

  @Post(':id/generos')
  @HttpCode(200)
  @Documentar({
    resumen: 'Asignar géneros', detalle: 'Añade los géneros indicados sin quitar los que ya tenía. Si repites uno, no se duplica.',
    body: AsignarGenerosDto, describeBody: 'Arreglo de identificadores de géneros.',
    respuesta: PeliculaConGeneros, escritura: true, buscar: true,
  })
  asignar(@Param('id', ParseIntPipe) id: number, @Body() dto: AsignarGenerosDto) {
    return this.servicio.asignar(id, dto.idGeneros);
  }

  @Delete(':id/generos/:idGenero')
  @Documentar({
    resumen: 'Quitar un género', detalle: 'Quita el género indicado de la película, sin dar de baja ninguno de los dos registros.',
    respuesta: PeliculaConGeneros, escritura: true, buscar: true,
  })
  quitar(@Param('id', ParseIntPipe) id: number, @Param('idGenero', ParseIntPipe) idGenero: number) {
    return this.servicio.quitar(id, idGenero);
  }
}
