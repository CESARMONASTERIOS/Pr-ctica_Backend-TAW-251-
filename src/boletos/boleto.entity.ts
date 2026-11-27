import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Auditable } from '../comun/auditable';
import { dinero } from '../comun/dinero';
import { Funcion } from '../funciones/funcion.entity';
import { Cliente } from '../clientes/cliente.entity';

@Entity('boleto')
@Index('uq_boleto_funcion_asiento_activo', ['idFuncion', 'numeroAsiento'], {
  unique: true,
  where: '"eliminadoEn" IS NULL',
})
export class Boleto extends Auditable {
  @ApiProperty({ type: 'integer' })
  @PrimaryGeneratedColumn()
  idBoleto!: number;

  @ApiProperty({ type: 'integer' })
  @Column('integer')
  idFuncion!: number;

  @ApiProperty({ type: 'integer' })
  @Column('integer')
  idCliente!: number;

  @ApiProperty({ type: 'integer' })
  @Column('integer')
  numeroAsiento!: number;

  @ApiProperty()
  @Column({ type: 'numeric', precision: 10, scale: 2, transformer: dinero })
  precioPagado!: number;

  @ManyToOne(() => Funcion, (funcion) => funcion.boletos, { nullable: false })
  @JoinColumn({ name: 'idFuncion' })
  funcion!: Funcion;

  @ManyToOne(() => Cliente, (cliente) => cliente.boletos, { nullable: false })
  @JoinColumn({ name: 'idCliente' })
  cliente!: Cliente;
}
