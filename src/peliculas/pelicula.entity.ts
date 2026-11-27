import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Auditable } from '../comun/auditable';
import { Genero } from '../generos/genero.entity';
import { Funcion } from '../funciones/funcion.entity';

export const CLASIFICACIONES = ['ATP', '+13', '+18'] as const;
export type Clasificacion = (typeof CLASIFICACIONES)[number];

@Entity('pelicula')
export class Pelicula extends Auditable {
  @ApiProperty({ type: 'integer' })
  @PrimaryGeneratedColumn()
  idPelicula!: number;

  @ApiProperty()
  @Column({ type: 'varchar', length: 180 })
  titulo!: string;

  @ApiProperty()
  @Column('text')
  sinopsis!: string;

  @ApiProperty({ type: 'integer' })
  @Column('integer')
  duracionMin!: number;

  @ApiProperty({ enum: [...CLASIFICACIONES] })
  @Column({ type: 'enum', enum: [...CLASIFICACIONES] })
  clasificacion!: Clasificacion;

  @ManyToMany(() => Genero, (genero) => genero.peliculas)
  @JoinTable({
    name: 'pelicula_genero',
    joinColumn: { name: 'idPelicula', referencedColumnName: 'idPelicula' },
    inverseJoinColumn: { name: 'idGenero', referencedColumnName: 'idGenero' },
  })
  generos!: Genero[];

  @OneToMany(() => Funcion, (funcion) => funcion.pelicula)
  funciones!: Funcion[];
}
