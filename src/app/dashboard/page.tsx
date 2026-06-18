'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function DashboardPage() {
  const registros = useLiveQuery(() => db.registros_diarios.toArray());

  if (!registros) return <div className="empty">Cargando datos...</div>;

  // Compute total income
  const totalIncome = registros.reduce((acc, curr) => acc + curr.total, 0);
  const totalEntradas = registros.filter(r => r.tipo.includes('ENTRADA')).length;
  const totalMensualidades = registros.filter(r => r.tipo === 'MENSUALIDAD').length;

  // Process data for Last 30 Days chart
  const ingresosPorFecha: Record<string, number> = {};
  registros.forEach(r => {
    ingresosPorFecha[r.fecha] = (ingresosPorFecha[r.fecha] || 0) + r.total;
  });

  const sortedFechas = Object.keys(ingresosPorFecha).sort();
  const barData = {
    labels: sortedFechas.map(f => f.slice(5)), // MM-DD
    datasets: [
      {
        label: 'Ingresos S/',
        data: sortedFechas.map(f => ingresosPorFecha[f]),
        backgroundColor: 'rgba(37, 211, 74, 0.7)',
        borderColor: '#25d34a',
        borderWidth: 1,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' as const, labels: { color: '#f3f4f6' } },
      title: { display: true, text: 'Ingresos por Día', color: '#25d34a' },
    },
    scales: {
      x: { ticks: { color: '#9ca3af' }, grid: { color: '#374151' } },
      y: { ticks: { color: '#9ca3af' }, grid: { color: '#374151' } }
    }
  };

  // Process data for Top Products chart
  const productos: Record<string, number> = {};
  registros.forEach(r => {
    [r.sup, r.beb, r.pre, r.adi].forEach(p => {
      if (p) productos[p] = (productos[p] || 0) + 1;
    });
  });

  const topProductos = Object.entries(productos).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const pieData = {
    labels: topProductos.map(p => p[0]),
    datasets: [
      {
        data: topProductos.map(p => p[1]),
        backgroundColor: [
          '#25d34a',
          '#3b82f6',
          '#f59e0b',
          '#ef4444',
          '#8b5cf6',
        ],
        borderWidth: 0,
      },
    ],
  };

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'right' as const, labels: { color: '#f3f4f6' } },
      title: { display: true, text: 'Top 5 Productos Más Vendidos', color: '#25d34a' },
    },
  };

  return (
    <>
      <div className="sum">
        <div className="sumbig">
          <div className="n">S/ {totalIncome.toFixed(2)}</div>
          <div className="l">Ingresos Totales (Histórico)</div>
        </div>
        <div className="minis">
          <div className="mini">
            <div className="n" style={{ color: 'var(--green)' }}>{totalMensualidades}</div>
            <div className="l">Mensualidades</div>
          </div>
          <div className="mini">
            <div className="n" style={{ color: 'var(--blue)' }}>{totalEntradas}</div>
            <div className="l">Pagan Diario</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
        <div style={{ background: 'var(--panel)', padding: '20px', borderRadius: '12px', border: '1px solid var(--line)' }}>
          <Bar data={barData} options={barOptions} />
        </div>
        <div style={{ background: 'var(--panel)', padding: '20px', borderRadius: '12px', border: '1px solid var(--line)' }}>
          {topProductos.length > 0 ? (
             <Doughnut data={pieData} options={pieOptions} />
          ) : (
            <div className="empty" style={{ paddingTop: '80px' }}>No hay ventas de productos registradas.</div>
          )}
        </div>
      </div>
    </>
  );
}
