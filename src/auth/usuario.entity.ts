import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';
import { Auditable } from '../comun/auditable';

@Entity('usuario')
@Index('uq_usuario_email', ['email'], { unique: true })
export class Usuario extends Auditable {
  @ApiProperty({ type: 'integer' })
  @PrimaryGeneratedColumn()
  idUsuario!: number;

  @ApiProperty()
  @Column({ type: 'varchar', length: 80 })
  username!: string;

  @ApiProperty()
  @Column({ type: 'varchar', length: 254 })
  email!: string;

  @Column({ type: 'varchar', length: 60, select: false })
  password!: string;
}
