import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Auditable } from '../comun/auditable';
import { Pelicula } from '../peliculas/pelicula.entity';

@Entity('genero')
export class Genero extends Auditable {
  @ApiProperty({ type: 'integer' })
  @PrimaryGeneratedColumn()
  idGenero!: number;

  @ApiProperty()
  @Column({ type: 'varchar', length: 100 })
  nombre!: string;

  @ApiProperty()
  @Column('text')
  descripcion!: string;

  @ManyToMany(() => Pelicula, (pelicula) => pelicula.generos)
  peliculas!: Pelicula[];
}
