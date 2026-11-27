import type { ValueTransformer } from 'typeorm';

// PostgreSQL entrega numeric como texto. La API expone importes JSON numéricos.
export const dinero: ValueTransformer = {
  to: (valor: number) => valor,
  from: (valor: string) => Number(valor),
};
