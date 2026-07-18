'use client';

import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type Socio } from '@/lib/db';

export default function SociosPage() {
  const socios = useLiveQuery(() => db.socios.toArray());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSocio, setEditingSocio] = useState<Partial<Socio>>({});

  const today = new Date().toISOString().split('T')[0];

  const getStatus = (vencimiento: string) => {
    if (!vencimiento) return { text: 'N/A', color: 'var(--muted)' };
    const diff = (new Date(vencimiento).getTime() - new Date(today).getTime()) / (1000 * 3600 * 24);
    if (diff < 0) return { text: 'VENCIDO', color: 'var(--red)' };
    if (diff <= 3) return { text: 'POR VENCER', color: 'var(--gold)' };
    return { text: 'ACTIVO', color: 'var(--main)' };
  };

  const handleSave = async () => {
    if (!editingSocio.nombre) return;
    if (editingSocio.id) {
      await db.socios.update(editingSocio.id, editingSocio);
    } else {
      await db.socios.add(editingSocio as Socio);
    }
    setIsModalOpen(false);
    setEditingSocio({});
  };

  const handleDelete = async () => {
    if (editingSocio.id) {
      await db.socios.delete(editingSocio.id);
      setIsModalOpen(false);
      setEditingSocio({});
    }
  };

  return (
    <>
      <button className="addbtn" onClick={() => { setEditingSocio({}); setIsModalOpen(true); }}>
        ＋ Agregar Socio
      </button>

      <table className="tbl">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>DNI</th>
            <th>Vencimiento</th>
            <th>Estado</th>
            <th style={{ width: '50px' }}></th>
          </tr>
        </thead>
        <tbody>
          {(!socios || socios.length === 0) && (
            <tr><td colSpan={5} className="empty">No hay socios registrados.</td></tr>
          )}
          {socios?.map(socio => {
            const status = getStatus(socio.fechaVencimiento);
            return (
              <tr key={socio.id}>
                <td style={{ fontWeight: 800 }}>{socio.nombre}</td>
                <td>{socio.dni || '-'}</td>
                <td>{socio.fechaVencimiento || '-'}</td>
                <td style={{ color: status.color, fontWeight: 700, fontSize: '11px', letterSpacing: '0.5px' }}>
                  {status.text}
                </td>
                <td>
                  <button className="iconbtn" onClick={() => { setEditingSocio(socio); setIsModalOpen(true); }}>
                    ✎
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Modal */}
      <div className={`ov ${isModalOpen ? 'show' : ''}`}>
        <div className="modal">
          <h3>{editingSocio.id ? 'Editar Socio' : 'Nuevo Socio'}</h3>
          
          <div className="fld">
            <label>Nombre</label>
            <input 
              value={editingSocio.nombre || ''} 
              onChange={e => setEditingSocio({...editingSocio, nombre: e.target.value})} 
              placeholder="Ej: Juan Pérez" 
            />
          </div>
          
          <div className="row2">
            <div className="fld">
              <label>DNI</label>
              <input 
                value={editingSocio.dni || ''} 
                onChange={e => setEditingSocio({...editingSocio, dni: e.target.value})} 
              />
            </div>
            <div className="fld">
              <label>Teléfono</label>
              <input 
                value={editingSocio.telefono || ''} 
                onChange={e => setEditingSocio({...editingSocio, telefono: e.target.value})} 
              />
            </div>
          </div>

          <div className="row2">
            <div className="fld">
              <label>Fecha de Inicio</label>
              <input 
                type="date"
                value={editingSocio.fechaInicio || ''} 
                onChange={e => setEditingSocio({...editingSocio, fechaInicio: e.target.value})} 
                style={{ colorScheme: 'dark' }}
              />
            </div>
            <div className="fld">
              <label>Fecha de Vencimiento</label>
              <input 
                type="date"
                value={editingSocio.fechaVencimiento || ''} 
                onChange={e => setEditingSocio({...editingSocio, fechaVencimiento: e.target.value})} 
                style={{ colorScheme: 'dark' }}
              />
            </div>
          </div>

          <div className="mbtns" style={{ marginTop: '16px' }}>
            {editingSocio.id && (
              <button className="del" onClick={handleDelete}>Eliminar</button>
            )}
            <button className="cancel" onClick={() => setIsModalOpen(false)}>Cancelar</button>
            <button className="save" onClick={handleSave}>Guardar</button>
          </div>
        </div>
      </div>
    </>
  );
}
