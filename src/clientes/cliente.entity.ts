import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Auditable } from '../comun/auditable';
import { Boleto } from '../boletos/boleto.entity';

@Entity('cliente')
export class Cliente extends Auditable {
  @ApiProperty({ type: 'integer' })
  @PrimaryGeneratedColumn()
  idCliente!: number;

  @ApiProperty()
  @Column({ type: 'varchar', length: 120 })
  nombres!: string;

  @ApiProperty()
  @Column({ type: 'varchar', length: 100 })
  paterno!: string;

  @ApiProperty()
  @Column({ type: 'varchar', length: 100 })
  materno!: string;

  @ApiProperty()
  @Column({ type: 'varchar', length: 254 })
  email!: string;

  @OneToMany(() => Boleto, (boleto) => boleto.cliente)
  boletos!: Boleto[];
}
