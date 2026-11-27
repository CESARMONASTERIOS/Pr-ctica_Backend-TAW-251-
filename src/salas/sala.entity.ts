import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Auditable } from '../comun/auditable';
import { Funcion } from '../funciones/funcion.entity';

export const TIPOS_SALA = ['2D', '3D', 'IMAX'] as const;
export type TipoSala = (typeof TIPOS_SALA)[number];

@Entity('sala')
export class Sala extends Auditable {
  @ApiProperty({ type: 'integer' })
  @PrimaryGeneratedColumn()
  idSala!: number;

  @ApiProperty()
  @Column({ type: 'varchar', length: 120 })
  nombre!: string;

  @ApiProperty({ type: 'integer' })
  @Column('integer')
  capacidad!: number;

  @ApiProperty({ enum: [...TIPOS_SALA] })
  @Column({ type: 'enum', enum: [...TIPOS_SALA] })
  tipo!: TipoSala;

  @OneToMany(() => Funcion, (funcion) => funcion.sala)
  funciones!: Funcion[];
}
