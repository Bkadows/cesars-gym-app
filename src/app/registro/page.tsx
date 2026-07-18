'use client';

import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type Socio, type RegistroDiario, type Precio } from '@/lib/db';

export default function RegistroPage() {
  const socios = useLiveQuery(() => db.socios.toArray());
  const precios = useLiveQuery(() => db.precios.toArray());
  const registros = useLiveQuery(() => db.registros_diarios.toArray());
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState<Partial<RegistroDiario>>({ tipo: 'ENTRADA' });
  
  const today = new Date().toISOString().split('T')[0];

  const handleSave = async () => {
    // Basic total calculation (we can expand this later by looking up `precios`)
    const total = form.tipo === 'MENSUALIDAD' ? 0 : 7; // e.g. 7 soles for daily entrance
    await db.registros_diarios.add({
      ...form,
      nombre: form.nombre || 'Desconocido',
      tipo: form.tipo || 'ENTRADA',
      fecha: today,
      total,
      sup: form.sup || '',
      beb: form.beb || '',
      pre: form.pre || '',
      adi: form.adi || ''
    } as RegistroDiario);
    setIsModalOpen(false);
    setForm({ tipo: 'ENTRADA' });
  };

  return (
    <>
      <div className="barbtns">
        <button className="addbtn" onClick={() => setIsModalOpen(true)}>＋ Agregar Entrada Hoy</button>
      </div>

      <table className="tbl">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Tipo</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {(!registros || registros.length === 0) && (
            <tr><td colSpan={3} className="empty">No hay registros hoy.</td></tr>
          )}
          {registros?.filter(r => r.fecha === today).map(r => (
            <tr key={r.id}>
              <td style={{ fontWeight: 800 }}>{r.nombre}</td>
              <td><span className="chip t-ENTRADA">{r.tipo}</span></td>
              <td style={{ color: 'var(--main)', fontWeight: 'bold', fontSize: '18px' }}>S/ {r.total.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal */}
      <div className={`ov ${isModalOpen ? 'show' : ''}`}>
        <div className="modal">
          <h3>Registrar Entrada</h3>
          
          <div className="fld">
            <label>Nombre del Cliente</label>
            <input 
              list="socios-list"
              value={form.nombre || ''} 
              onChange={e => setForm({...form, nombre: e.target.value})} 
              placeholder="Escribe o selecciona..."
            />
            <datalist id="socios-list">
              {socios?.map(s => <option key={s.id} value={s.nombre} />)}
            </datalist>
          </div>
          
          <div className="fld">
            <label>Tipo de Entrada</label>
            <select value={form.tipo || 'ENTRADA'} onChange={e => setForm({...form, tipo: e.target.value})}>
              <option value="MENSUALIDAD">Mensualidad (Socio)</option>
              <option value="ENTRADA">Entrada (Diario - S/ 7.00)</option>
            </select>
          </div>

          <div className="mbtns" style={{ marginTop: '16px' }}>
            <button className="cancel" onClick={() => setIsModalOpen(false)}>Cancelar</button>
            <button className="save" onClick={handleSave}>Guardar</button>
          </div>
        </div>
      </div>
    </>
  );
}
