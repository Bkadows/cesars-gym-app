'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  DollarSign, 
  Users, 
  TrendingUp, 
  Calendar, 
  Percent, 
  Activity, 
  ShieldAlert, 
  Package, 
  Clock, 
  UserX,
  CreditCard,
  Target
} from 'lucide-react';

// Dynamically import ApexCharts to disable Server-Side Rendering (SSR) issues in Next.js
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [chartRange, setChartRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  useEffect(() => {
    // Simulate initial skeleton loading for premium UX feel
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  // Static Mock Data for SaaS showcase conforming to Cesar's Gym real figures
  const kpis = [
    { 
      title: 'Ingresos Hoy', 
      val: 'S/ 461.00', 
      pct: '+43%', 
      isPositive: true, 
      sub: 'vs ayer (S/ 323)', 
      icon: DollarSign,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
      sparkData: [323, 340, 310, 360, 400, 323, 461]
    },
    { 
      title: 'Ingresos del Mes', 
      val: 'S/ 6,491.50', 
      pct: '+18.4%', 
      isPositive: true, 
      sub: 'vs mes anterior (S/ 5,480)', 
      icon: TrendingUp,
      color: 'text-green-600 bg-green-50 border-green-100',
      sparkData: [4500, 4800, 5100, 4900, 5300, 5800, 6491.5]
    },
    { 
      title: 'Ingresos del Año', 
      val: 'S/ 78,540.00', 
      pct: '+24.1%', 
      isPositive: true, 
      sub: 'Acumulado en 2026', 
      icon: Calendar,
      color: 'text-amber-600 bg-amber-50 border-amber-100',
      sparkData: [52000, 55000, 60000, 63000, 68000, 72000, 78540]
    },
    { 
      title: 'Miembros Activos', 
      val: '43', 
      pct: '+12', 
      isPositive: true, 
      sub: 'vs fin mes anterior (31)', 
      icon: Users,
      color: 'text-blue-600 bg-blue-50 border-blue-100',
      sparkData: [31, 33, 35, 34, 38, 41, 43]
    }
  ];

  // Primary Line/Area Chart Options & Data
  const mainChartData = {
    series: [
      {
        name: 'Ingresos (S/)',
        data: chartRange === '7d' 
          ? [310, 360, 400, 323, 461, 380, 420] 
          : chartRange === '30d'
          ? [120, 250, 180, 320, 210, 380, 150, 360, 250, 310, 257.5, 650, 450, 680, 480, 580, 323, 461, 390, 410, 320, 380, 450, 520, 490, 560, 610, 650, 580, 610]
          : [3400, 4100, 4800, 5200, 5900, 6491]
      }
    ],
    options: {
      chart: {
        type: 'area' as const,
        toolbar: { show: false },
        zoom: { enabled: false },
        fontFamily: 'Inter, sans-serif'
      },
      colors: ['#16A34A'],
      dataLabels: { enabled: false },
      stroke: { curve: 'smooth' as const, width: 2 },
      fill: {
        type: 'gradient',
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.25,
          opacityTo: 0.02,
          stops: [0, 90, 100]
        }
      },
      grid: {
        borderColor: '#F1F5F9',
        strokeDashArray: 4,
        xaxis: { lines: { show: false } }
      },
      xaxis: {
        categories: chartRange === '7d' 
          ? ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
          : chartRange === '30d'
          ? Array.from({ length: 30 }, (_, i) => `${i + 1} Jun`)
          : ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
        axisBorder: { show: false },
        axisTicks: { show: false },
        labels: { style: { colors: '#94A3B8', fontSize: '10px', fontWeight: 500 } }
      },
      yaxis: {
        labels: {
          formatter: (value: number) => `S/ ${value.toFixed(0)}`,
          style: { colors: '#94A3B8', fontSize: '10px', fontWeight: 500 }
        }
      },
      tooltip: {
        theme: 'light' as const,
        x: { show: true },
        y: { formatter: (val: number) => `S/ ${val.toFixed(2)}` }
      }
    }
  };

  // Donut Chart for Income Categories
  const donutChartData = {
    series: [3227.5, 1205.0, 604.0, 554.0, 492.0],
    options: {
      chart: { type: 'donut' as const, fontFamily: 'Inter, sans-serif' },
      labels: ['Entradas', 'Membresías', 'Pre-entrenos', 'Bebidas', 'Otros/Supl.'],
      colors: ['#16A34A', '#3B82F6', '#F59E0B', '#EF4444', '#94A3B8'],
      stroke: { width: 0 },
      dataLabels: { enabled: false },
      legend: {
        position: 'bottom' as const,
        fontSize: '11px',
        fontWeight: 600,
        labels: { colors: '#64748B' },
        markers: { size: 4, shape: 'circle' as const }
      },
      plotOptions: {
        pie: {
          donut: {
            size: '72%',
            labels: {
              show: true,
              total: {
                show: true,
                label: 'Total del Mes',
                formatter: () => 'S/ 6,082.50',
                fontSize: '11px',
                fontWeight: 600,
                color: '#64748B'
              },
              value: {
                show: true,
                fontSize: '18px',
                fontWeight: 800,
                color: '#0F172A',
                formatter: (val: string) => `S/ ${Number(val).toFixed(0)}`
              }
            }
          }
        }
      },
      tooltip: {
        y: { formatter: (val: number) => `S/ ${val.toFixed(2)}` }
      }
    }
  };

  // Advanced SaaS Metrics
  const advancedMetrics = [
    { name: 'Ticket Promedio', val: 'S/ 11.20', sub: 'Por venta', trend: '▲ +2.3%' },
    { name: 'ARPU', val: 'S/ 141.50', sub: 'Membresías/Socios', trend: '▲ +5.1%' },
    { name: 'Retención de Clientes', val: '92.4%', sub: 'Renovaciones', trend: '▲ +1.2%' },
    { name: 'Tasa de Churn', val: '2.1%', sub: 'Cancelaciones', trend: '▼ -0.4%' }
  ];

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        {/* KPI Skeletons */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 bg-white border border-slate-200 rounded-lg p-6 space-y-4">
              <div className="flex justify-between items-center">
                <div className="w-24 h-4 bg-slate-100 rounded" />
                <div className="w-8 h-8 bg-slate-100 rounded-lg" />
              </div>
              <div className="w-32 h-8 bg-slate-100 rounded" />
              <div className="w-40 h-3 bg-slate-100 rounded" />
            </div>
          ))}
        </div>
        {/* Dashboard grid skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-[400px] bg-white border border-slate-200 rounded-lg" />
          <div className="h-[400px] bg-white border border-slate-200 rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="space-y-8"
    >
      {/* 1. TOP METRICS / KPIs SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, idx) => (
          <motion.div
            key={kpi.title}
            whileHover={{ y: -4 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="bg-white border border-slate-200 hover:border-slate-300 rounded-lg p-6 shadow-premium hover:shadow-premium-hover flex flex-col justify-between h-36 transition-all duration-300 relative overflow-hidden group"
          >
            {/* Header */}
            <div className="flex justify-between items-start">
              <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">{kpi.title}</span>
              <div className={`w-8 h-8 rounded-lg border flex items-center justify-center ${kpi.color}`}>
                <kpi.icon className="w-4 h-4 mx-auto" />
              </div>
            </div>

            {/* Sparkline mini-graph background */}
            <div className="absolute bottom-0 left-0 right-0 h-10 overflow-hidden pointer-events-none opacity-40 group-hover:opacity-75 transition-opacity">
              <Chart
                options={{
                  chart: { sparkline: { enabled: true } },
                  stroke: { curve: 'smooth', width: 1.5 },
                  colors: [kpi.isPositive ? '#16A34A' : '#EF4444'],
                  tooltip: { enabled: false }
                }}
                series={[{ data: kpi.sparkData }]}
                type="line"
                height="100%"
                width="100%"
              />
            </div>

            {/* Content */}
            <div className="mt-1 z-10">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-extrabold text-slate-900 leading-none">{kpi.val}</span>
                <span className={`text-[10px] font-bold flex items-center ${kpi.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  {kpi.isPositive ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : <ArrowDownRight className="w-3 h-3 mr-0.5" />}
                  {kpi.pct}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium mt-1 leading-none">{kpi.sub}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* 2. EXECUTIVE DASHBOARD ADDITIONAL KPIS */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {[
          { name: 'Gastos Totales', value: 'S/ 840.00', icon: CreditCard, color: 'text-red-500' },
          { name: 'Ganancia Neta', value: 'S/ 5,651.50', icon: DollarSign, color: 'text-emerald-500' },
          { name: 'Renovaciones Pendientes', value: '8 socios', icon: Clock, color: 'text-amber-500' },
          { name: 'Por Vencer (7 días)', value: '3 socios', icon: ShieldAlert, color: 'text-amber-600' },
          { name: 'Meta del Mes (S/ 8K)', value: '81%', icon: Target, color: 'text-green-600' }
        ].map((item, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-lg p-4 flex items-center justify-between shadow-premium hover:shadow-premium-hover transition-premium">
            <div>
              <span className="text-[9px] font-bold text-slate-400 tracking-wider uppercase block">{item.name}</span>
              <span className="text-base font-extrabold text-slate-900 mt-0.5 block">{item.value}</span>
            </div>
            <item.icon className={`w-4 h-4 ${item.color}`} />
          </div>
        ))}
      </div>

      {/* 3. CHARTS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Line Area Chart */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-lg p-6 shadow-premium flex flex-col justify-between">
          <div className="flex justify-between items-center flex-wrap gap-4 mb-4">
            <div>
              <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">Evolución de Ingresos</span>
              <span className="text-xl font-extrabold text-slate-900 mt-0.5 block">Resumen General</span>
            </div>
            <div className="flex border border-slate-200 rounded-lg p-1 bg-slate-50 gap-0.5">
              {(['7d', '30d', '90d', '1y'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setChartRange(r)}
                  className={`text-[10px] font-bold px-2.5 py-1.5 rounded-md uppercase tracking-wider transition-premium ${
                    chartRange === r ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-700'
                  }`}
                >
                  {r === '1y' ? '1 año' : r}
                </button>
              ))}
            </div>
          </div>
          <div className="h-72">
            <Chart
              options={mainChartData.options}
              series={mainChartData.series}
              type="area"
              height="100%"
            />
          </div>
        </div>

        {/* Donut Chart (Income Distribution) */}
        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-premium flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">Distribución de Ingresos</span>
            <span className="text-xl font-extrabold text-slate-900 mt-0.5 block">Categorías</span>
          </div>
          <div className="h-64 my-auto flex items-center justify-center">
            <Chart
              options={donutChartData.options}
              series={donutChartData.series}
              type="donut"
              width="100%"
              height="240px"
            />
          </div>
        </div>
      </div>

      {/* 4. ALERTS AND TIMELINE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Smart Alerts Feed */}
        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-premium space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <span className="text-sm font-extrabold text-slate-900">Panel de Alertas</span>
            <span className="bg-red-50 text-red-600 font-bold text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider">Acción Requerida</span>
          </div>
          <div className="space-y-3">
            {[
              { type: 'danger', msg: 'Membresía vence hoy: Frank Samame', icon: UserX },
              { type: 'warning', msg: 'Membresías por vencer mañana (2 socios)', icon: Clock },
              { type: 'warning', msg: 'Stock bajo: Nitraflex (1 unid), CBum (2 unid)', icon: Package },
              { type: 'danger', msg: 'Pago pendiente: S/ 15.00 - MAX', icon: CreditCard }
            ].map((alert, i) => (
              <div key={i} className={`flex items-start gap-3 p-3 rounded-lg border text-xs ${
                alert.type === 'danger' 
                  ? 'bg-red-50/50 border-red-100/80 text-red-700' 
                  : 'bg-amber-50/50 border-amber-100/80 text-amber-700'
              }`}>
                <alert.icon className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span className="font-semibold">{alert.msg}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity Feed */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-lg p-6 shadow-premium space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <span className="text-sm font-extrabold text-slate-900">Actividad Reciente</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Activity className="w-3.5 h-3.5" /> En tiempo real
            </span>
          </div>
          <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
            {[
              { time: '19:35', user: 'MAX', desc: 'registró ingreso diario (S/ 5.00) vía Plin', badge: 'Venta' },
              { time: '19:25', user: 'LIZ', desc: 'registró Entrada (S/ 7.00) + H2O (S/ 2.50) en Efectivo', badge: 'Venta' },
              { time: '18:44', user: 'SHAEL CALDERON', desc: 'registró asistencia socio (Acceso QR)', badge: 'Acceso' },
              { time: '17:15', user: 'ANALY', desc: 'registró Entrada (S/ 7.00) en Efectivo', badge: 'Venta' }
            ].map((act, i) => (
              <div key={i} className="flex justify-between items-start text-xs border-b border-slate-50 pb-2.5 last:border-0 last:pb-0">
                <div className="flex items-start gap-2">
                  <span className="text-slate-400 font-bold text-[10px] mt-0.5">{act.time}</span>
                  <div>
                    <span className="font-bold text-slate-800">{act.user}</span>{' '}
                    <span className="text-slate-500 font-medium">{act.desc}</span>
                  </div>
                </div>
                <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ${
                  act.badge === 'Venta' ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-700'
                }`}>
                  {act.badge}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. ADVANCED METRICS WITH MINI GRAPH REPRESENTATIONS */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-premium space-y-4">
        <span className="text-sm font-extrabold text-slate-900 block border-b border-slate-100 pb-3">Métricas Avanzadas (SaaS)</span>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {advancedMetrics.map((met, i) => (
            <div key={i} className="p-4 rounded-lg bg-slate-50 border border-slate-100 flex justify-between items-center group hover:bg-slate-100 hover:border-slate-200 transition-premium">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{met.name}</span>
                <span className="text-lg font-extrabold text-slate-900 mt-1 block">{met.val}</span>
                <span className="text-[9px] text-slate-400 font-medium block mt-0.5">{met.sub}</span>
              </div>
              <span className="text-[10px] font-bold text-green-600 bg-green-50 group-hover:bg-green-100 border border-green-100/50 rounded-full px-2 py-0.5">
                {met.trend}
              </span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
