import Dexie, { type EntityTable } from 'dexie';

export interface Socio {
  id?: number;
  nombre: string;
  dni: string;
  telefono: string;
  fechaInicio: string;
  fechaVencimiento: string;
}

export interface RegistroDiario {
  id?: number;
  socioId?: number;
  nombre: string;
  tipo: string; // MENSUALIDAD, ENTRADA, ENTRADA MENOR
  sup: string;
  beb: string;
  pre: string;
  adi: string;
  total: number;
  fecha: string;
}

export interface Precio {
  id?: number;
  nombre: string;
  precio: number;
  categoria: string; // SUPLEMENTO, BEBIDA, PRE-ENTRENO, ADICIONAL, ENTRADA
}

export interface Inventario {
  id?: number;
  nombre: string;
  stockInicial: number;
  stockActual: number;
}

const db = new Dexie('CesarsGymDB') as Dexie & {
  socios: EntityTable<Socio, 'id'>;
  registros_diarios: EntityTable<RegistroDiario, 'id'>;
  precios: EntityTable<Precio, 'id'>;
  inventario: EntityTable<Inventario, 'id'>;
};

db.version(1).stores({
  socios: '++id, nombre, dni, fechaVencimiento',
  registros_diarios: '++id, socioId, fecha, tipo',
  precios: '++id, nombre, categoria',
  inventario: '++id, nombre'
});

export { db };
