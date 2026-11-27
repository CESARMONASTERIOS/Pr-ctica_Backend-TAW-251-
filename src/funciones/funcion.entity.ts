import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Auditable } from '../comun/auditable';
import { dinero } from '../comun/dinero';
import { Sala } from '../salas/sala.entity';
import { Pelicula } from '../peliculas/pelicula.entity';
import { Boleto } from '../boletos/boleto.entity';

@Entity('funcion')
export class Funcion extends Auditable {
  @ApiProperty({ type: 'integer' })
  @PrimaryGeneratedColumn()
  idFuncion!: number;

  @ApiProperty({ type: 'integer' })
  @Column('integer')
  idSala!: number;

  @ApiProperty({ type: 'integer' })
  @Column('integer')
  idPelicula!: number;

  @ApiProperty({ type: String, format: 'date-time' })
  @Column('timestamptz')
  fechaHora!: Date;

  @ApiProperty()
  @Column({ type: 'numeric', precision: 10, scale: 2, transformer: dinero })
  precio!: number;

  @ManyToOne(() => Sala, (sala) => sala.funciones, { nullable: false })
  @JoinColumn({ name: 'idSala' })
  sala!: Sala;

  @ManyToOne(() => Pelicula, (pelicula) => pelicula.funciones, { nullable: false })
  @JoinColumn({ name: 'idPelicula' })
  pelicula!: Pelicula;

  @OneToMany(() => Boleto, (boleto) => boleto.funcion)
  boletos!: Boleto[];
}
