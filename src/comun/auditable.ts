import { ApiProperty } from '@nestjs/swagger';
import { CreateDateColumn, DeleteDateColumn, UpdateDateColumn } from 'typeorm';

export abstract class Auditable {
  @ApiProperty({ type: String, format: 'date-time' })
  @CreateDateColumn({ type: 'timestamptz' })
  creadoEn!: Date;

  @ApiProperty({ type: String, format: 'date-time' })
  @UpdateDateColumn({ type: 'timestamptz' })
  actualizadoEn!: Date;

  @ApiProperty({ type: String, format: 'date-time', nullable: true })
  @DeleteDateColumn({ type: 'timestamptz' })
  eliminadoEn!: Date | null;
}
