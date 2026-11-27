import { ApiProperty } from '@nestjs/swagger';
import { Boleto } from '../boletos/boleto.entity';
import { Cliente } from '../clientes/cliente.entity';
import { Funcion } from '../funciones/funcion.entity';
import { Genero } from '../generos/genero.entity';
import { Pelicula } from '../peliculas/pelicula.entity';
import { Sala } from '../salas/sala.entity';

export class SalaConFunciones extends Sala {
  @ApiProperty({ type: [Funcion] }) declare funciones: Funcion[];
}
export class GeneroConPeliculas extends Genero {
  @ApiProperty({ type: [Pelicula] }) declare peliculas: Pelicula[];
}
export class PeliculaConGeneros extends Pelicula {
  @ApiProperty({ type: [Genero] }) declare generos: Genero[];
}
export class PeliculaDetalle extends PeliculaConGeneros {
  @ApiProperty({ type: [Funcion] }) declare funciones: Funcion[];
}
export class FuncionEnCartelera extends Funcion {
  @ApiProperty({ type: Sala, nullable: true }) declare sala: Sala;
  @ApiProperty({ type: Pelicula, nullable: true }) declare pelicula: Pelicula;
}
export class FuncionDetalle extends FuncionEnCartelera {
  @ApiProperty({ type: [Boleto] }) declare boletos: Boleto[];
}
export class BoletoConFuncion extends Boleto {
  @ApiProperty({ type: Funcion, nullable: true }) declare funcion: Funcion;
}
export class BoletoDetalle extends BoletoConFuncion {
  @ApiProperty({ type: Cliente, nullable: true }) declare cliente: Cliente;
}
export class ClienteConBoletos extends Cliente {
  @ApiProperty({ type: [BoletoConFuncion] }) declare boletos: Boleto[];
}
