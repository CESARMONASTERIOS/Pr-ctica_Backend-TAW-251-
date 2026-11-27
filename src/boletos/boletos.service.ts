import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Not, Repository } from 'typeorm';
import { buscarPorId, eliminarPorId } from '../comun/registros';
import { CreateBoletoDto } from './dto/create-boleto.dto';
import { UpdateBoletoDto } from './dto/update-boleto.dto';
import { Boleto } from './boleto.entity';
import { violaUnicidad } from '../comun/errores-bd';
import { Funcion } from '../funciones/funcion.entity';
import { Cliente } from '../clientes/cliente.entity';
import { Sala } from '../salas/sala.entity';

@Injectable()
export class BoletosService {
  constructor(@InjectRepository(Boleto) private readonly repo: Repository<Boleto>) {}

  listar() {
    return this.repo.find({ order: { idBoleto: 'ASC' } });
  }

  detalle(id: number) {
    return buscarPorId(this.repo, id, { relations: { funcion: true, cliente: true } });
  }

  private ocupado(idFuncion: number, asiento: number) {
    return new BadRequestException(`El asiento ${asiento} ya está ocupado en la función ${idFuncion}`);
  }

  private async validarAsiento(em: EntityManager, idFuncion: number, asiento: number, idBoleto?: number) {
    const lectura = { lock: { mode: 'pessimistic_read' as const } };
    const funcion = await buscarPorId(em.getRepository(Funcion), idFuncion, lectura);
    const sala = await buscarPorId(em.getRepository(Sala), funcion.idSala, lectura);
    if (asiento < 1 || asiento > sala.capacidad) {
      throw new BadRequestException(`El asiento debe estar entre 1 y ${sala.capacidad} para esta sala`);
    }
    const existe = await em.getRepository(Boleto).existsBy({
      idFuncion, numeroAsiento: asiento, ...(idBoleto === undefined ? {} : { idBoleto: Not(idBoleto) }),
    });
    if (existe) throw this.ocupado(idFuncion, asiento);
    return funcion;
  }

  private async guardar(repo: Repository<Boleto>, boleto: Boleto) {
    try {
      return await repo.save(boleto);
    } catch (error) {
      // Dos ventas pueden superar la consulta previa. El índice único resuelve la carrera.
      if (violaUnicidad(error, 'uq_boleto_funcion_asiento_activo')) {
        throw this.ocupado(boleto.idFuncion, boleto.numeroAsiento);
      }
      throw error;
    }
  }

  crear(dto: CreateBoletoDto) {
    return this.repo.manager.transaction(async (em) => {
      const funcion = await this.validarAsiento(em, dto.idFuncion, dto.numeroAsiento);
      await buscarPorId(em.getRepository(Cliente), dto.idCliente, { lock: { mode: 'pessimistic_read' } });
      const repo = em.getRepository(Boleto);
      return this.guardar(repo, repo.create({ ...dto, precioPagado: dto.precioPagado ?? funcion.precio }));
    });
  }

  actualizar(id: number, dto: UpdateBoletoDto) {
    return this.repo.manager.transaction(async (em) => {
      const repo = em.getRepository(Boleto);
      const boleto = await buscarPorId(repo, id, { lock: { mode: 'pessimistic_write' } });
      await this.validarAsiento(em, boleto.idFuncion, dto.numeroAsiento ?? boleto.numeroAsiento, id);
      return this.guardar(repo, repo.merge(boleto, dto));
    });
  }

  eliminar(id: number) {
    return eliminarPorId(this.repo, id);
  }
}
