import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { buscarPorId, eliminarPorId } from '../comun/registros';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';
import { Cliente } from './cliente.entity';

@Injectable()
export class ClientesService {
  constructor(@InjectRepository(Cliente) private readonly repo: Repository<Cliente>) {}

  listar() {
    return this.repo.find({ order: { idCliente: 'ASC' } });
  }

  detalle(id: number) {
    return buscarPorId(this.repo, id, { relations: { boletos: { funcion: true } } });
  }

  crear(dto: CreateClienteDto) {
    return this.repo.save(this.repo.create(dto));
  }

  actualizar(id: number, dto: UpdateClienteDto) {
    return this.repo.manager.transaction(async (em) => {
      const repo = em.getRepository(Cliente);
      const registro = await buscarPorId(repo, id, { lock: { mode: 'pessimistic_write' } });
      return repo.save(repo.merge(registro, dto));
    });
  }

  eliminar(id: number) {
    return eliminarPorId(this.repo, id);
  }
}
