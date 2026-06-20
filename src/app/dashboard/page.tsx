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
  Target,
  ChevronRight,
  TrendingDown,
  UserCheck,
  Zap
} from 'lucide-react';

// Dynamically import ApexCharts to disable Server-Side Rendering (SSR) issues in Next.js
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

// ── ANIMATED COUNTER COMPONENT ──
function AnimatedCounter({ value, duration = 800, decimals = 0, prefix = '', suffix = '' }: {
  value: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    if (start === end) return;

    const totalMiliseconds = duration;
    const incrementTime = 20;
    const totalSteps = Math.ceil(totalMiliseconds / incrementTime);
    const increment = (end - start) / totalSteps;
    
    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      setCount((prev) => {
        const next = prev + increment;
        if (currentStep >= totalSteps) {
          clearInterval(timer);
          return end;
        }
        return next;
      });
    }, incrementTime);

    return () => clearInterval(timer);
  }, [value, duration]);

  return (
    <span>
      {prefix}
      {count.toLocaleString('es-PE', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      })}
      {suffix}
    </span>
  );
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [chartRange, setChartRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  useEffect(() => {
    // Initial page load loader
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  // Premium KPIs con Sparklines
  const kpis = [
    { 
      title: 'Ingresos Hoy', 
      val: 527.00, 
      pct: '+12%', 
      isPositive: true, 
      sub: 'vs ayer (S/ 470)', 
      icon: DollarSign,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
      sparkData: [410, 420, 390, 430, 480, 470, 527]
    },
    { 
      title: 'Ingresos del Mes', 
      val: 6557.90, 
      pct: '+18.4%', 
      isPositive: true, 
      sub: 'vs mes anterior (S/ 5,480)', 
      icon: TrendingUp,
      color: 'text-green-600 bg-green-50 border-green-100',
      sparkData: [4500, 4800, 5100, 4900, 5300, 5800, 6557.9]
    },
    { 
      title: 'Ingresos del Año', 
      val: 78540.00, 
      pct: '+24.1%', 
      isPositive: true, 
      sub: 'Acumulado en 2026', 
      icon: Calendar,
      color: 'text-amber-600 bg-amber-50 border-amber-100',
      sparkData: [52000, 55000, 60000, 63000, 68000, 72000, 78540]
    },
    { 
      title: 'Miembros Activos', 
      val: 43, 
      pct: '+12', 
      isPositive: true, 
      sub: 'vs fin mes anterior (31)', 
      icon: Users,
      color: 'text-blue-600 bg-blue-50 border-blue-100',
      sparkData: [31, 33, 35, 34, 38, 41, 43]
    }
  ];

  // Configuración de Sparklines (ApexCharts)
  const getSparkOptions = (color: string) => ({
    chart: { sparkline: { enabled: true }, animations: { enabled: true, speed: 800 } },
    stroke: { curve: 'smooth' as const, width: 3 },
    colors: [color],
    tooltip: { enabled: false }
  });

  // ApexCharts Main Area Chart Options
  const mainChartData = {
    series: [
      {
        name: 'Ingresos (S/)',
        data: chartRange === '7d' 
          ? [310, 360, 400, 323, 527, 380, 420] 
          : chartRange === '30d'
          ? [120, 250, 180, 320, 210, 380, 150, 360, 250, 310, 257.5, 650, 450, 680, 480, 580, 323, 527, 390, 410, 320, 380, 450, 520, 490, 560, 610, 650, 580, 610]
          : [3400, 4100, 4800, 5200, 5900, 6557.9]
      }
    ],
    options: {
      chart: {
        type: 'area' as const,
        background: 'transparent',
        toolbar: { show: false },
        zoom: { enabled: false },
        fontFamily: 'Inter, sans-serif'
      },
      colors: ['#16A34A'],
      dataLabels: { enabled: false },
      stroke: { curve: 'smooth' as const, width: 3 },
      fill: {
        type: 'gradient',
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.35,
          opacityTo: 0.01,
          stops: [0, 95, 100]
        }
      },
      grid: {
        borderColor: '#F1F5F9',
        strokeDashArray: 4,
        xaxis: { lines: { show: false } }
      },
      markers: { size: 0, hover: { size: 5 } },
      xaxis: {
        categories: chartRange === '7d' 
          ? ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
          : chartRange === '30d'
          ? Array.from({ length: 30 }, (_, i) => `${i + 1} Jun`)
          : ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
        axisBorder: { show: false },
        axisTicks: { show: false },
        labels: { style: { colors: '#94A3B8', fontSize: '10px', fontWeight: 600 } }
      },
      yaxis: {
        labels: {
          formatter: (value: number) => `S/ ${value.toFixed(0)}`,
          style: { colors: '#94A3B8', fontSize: '10px', fontWeight: 600 }
        }
      },
      tooltip: {
        theme: 'light' as const,
        x: { show: true },
        y: { formatter: (val: number) => `S/ ${val.toFixed(2)}` }
      }
    }
  };

  // ApexCharts Donut Chart Options
  const donutChartData = {
    series: [3227.5, 1205.0, 604.0, 554.0, 967.4],
    options: {
      chart: { type: 'donut' as const, fontFamily: 'Inter, sans-serif', animations: { animateGradually: { enabled: true } } },
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
                formatter: () => 'S/ 6,557.90',
                fontSize: '11px',
                fontWeight: 600,
                color: '#64748B'
              },
              value: {
                show: true,
                fontSize: '20px',
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

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-36 bg-white border border-slate-200 rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 bg-white border border-slate-200 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="space-y-8"
    >
      {/* ── 1. EFECTO WOW: RESUMEN EJECUTIVO (TARJETA DESTACADA) ── */}
      <motion.div 
        whileHover={{ scale: 1.01 }}
        transition={{ duration: 0.2 }}
        className="relative overflow-hidden bg-gradient-to-r from-slate-900 to-slate-800 border border-slate-800 text-white rounded-lg p-6 lg:p-8 shadow-premium"
      >
        {/* Glow absolute elements */}
        <div className="absolute right-0 top-0 w-80 h-80 bg-green-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 w-60 h-60 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Resumen Ejecutivo</span>
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight">Rendimiento Comercial del Mes</h2>
            <p className="text-xs text-slate-400 font-medium">Análisis consolidado de metas, captaciones y rentabilidad para el período en curso.</p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-8 lg:min-w-[400px]">
            {/* Meta values */}
            <div className="space-y-1">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Ingreso Recaudado</span>
              <span className="text-2xl font-black text-white block">
                <AnimatedCounter value={6557.90} decimals={2} prefix="S/ " />
              </span>
              <span className="text-[10px] font-bold text-slate-500">Meta Mensual: S/ 8,000</span>
            </div>

            {/* Progress bar */}
            <div className="flex-1 w-full space-y-1">
              <div className="flex justify-between items-baseline text-[10px] font-bold text-slate-400">
                <span>Meta Alcanzada</span>
                <span className="text-green-400 text-xs font-black">
                  <AnimatedCounter value={82} suffix="%" />
                </span>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '82%' }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full shadow-inner shadow-green-900/30"
                />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── 2. KPI CARDS PREMIUM CON SPARKLINES ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi) => (
          <motion.div
            key={kpi.title}
            whileHover={{ scale: 1.02, y: -4 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="bg-white border border-slate-200 hover:border-slate-300 rounded-lg p-6 shadow-premium hover:shadow-premium-hover flex flex-col justify-between h-36 transition-all duration-300 relative overflow-hidden group"
          >
            {/* KPI Header */}
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">{kpi.title}</span>
              <div className={`w-8 h-8 rounded-lg border flex items-center justify-center ${kpi.color}`}>
                <kpi.icon className="w-4 h-4 mx-auto" />
              </div>
            </div>

            {/* Sparkline chart embedded as card background */}
            <div className="absolute bottom-0 left-0 right-0 h-11 overflow-hidden pointer-events-none opacity-40 group-hover:opacity-75 transition-opacity">
              <Chart
                options={getSparkOptions(kpi.isPositive ? '#16A34A' : '#EF4444')}
                series={[{ data: kpi.sparkData }]}
                type="line"
                height="100%"
                width="100%"
              />
            </div>

            {/* KPI Value & Growth */}
            <div className="mt-1 z-10">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900 leading-none tracking-tight">
                  <AnimatedCounter 
                    value={kpi.val} 
                    decimals={kpi.title.includes('Miembros') ? 0 : 2} 
                    prefix={kpi.title.includes('Miembros') ? '' : 'S/ '} 
                  />
                </span>
                <span className={`text-[10px] font-bold flex items-center ${kpi.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  {kpi.isPositive ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : <ArrowDownRight className="w-3 h-3 mr-0.5" />}
                  {kpi.pct}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-semibold mt-1.5 leading-none">{kpi.sub}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── 3. PANEL DE ALERTAS INTELIGENTES ── */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-3 bg-green-600 rounded-full" />
          <h3 className="text-xs font-bold text-slate-400 tracking-widest uppercase">Alertas Inteligentes</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { type: 'danger', icon: UserX, priority: 'Prioridad Alta', msg: 'Frank Samame: Membresía vence hoy', action: 'Ver socio', color: 'bg-red-50/50 border-red-100 text-red-700 btn-red' },
            { type: 'warning', icon: Clock, priority: 'Prioridad Media', msg: '3 membresías vencen mañana', action: 'Ver miembros', color: 'bg-amber-50/50 border-amber-100 text-amber-700 btn-amber' },
            { type: 'warning', icon: Package, priority: 'Prioridad Media', msg: 'Stock bajo: Nitraflex (1), CBum (2)', action: 'Ver inventario', color: 'bg-amber-50/50 border-amber-100 text-amber-700 btn-amber' },
            { type: 'danger', icon: CreditCard, priority: 'Prioridad Alta', msg: 'Pago pendiente: S/ 15.00 — MAX', action: 'Cobrar deuda', color: 'bg-red-50/50 border-red-100 text-red-700 btn-red' },
            { type: 'info', icon: Users, priority: 'Prioridad Baja', msg: '5 clientes inactivos hace 15 días', action: 'Enviar alerta', color: 'bg-slate-50 border-slate-200 text-slate-600 btn-slate' },
            { type: 'info', icon: Calendar, priority: 'Prioridad Baja', msg: '8 renovaciones este mes', action: 'Ver reporte', color: 'bg-slate-50 border-slate-200 text-slate-600 btn-slate' }
          ].map((alert, i) => (
            <div key={i} className={`flex items-center justify-between p-4 rounded-lg border shadow-premium group hover:scale-[1.02] transition-premium duration-200 ${alert.color}`}>
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  alert.type === 'danger' ? 'bg-red-100 text-red-600' : alert.type === 'warning' ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-500'
                }`}>
                  <alert.icon className="w-4 h-4 mx-auto" />
                </div>
                <div>
                  <span className="text-[9px] font-extrabold tracking-wider uppercase block">{alert.priority}</span>
                  <p className="text-xs font-bold text-slate-800 mt-0.5">{alert.msg}</p>
                </div>
              </div>
              <button className={`text-[10px] font-extrabold px-3 py-1.5 rounded-lg transition-premium cursor-pointer ${
                alert.type === 'danger' ? 'bg-red-100 hover:bg-red-200 text-red-800' : alert.type === 'warning' ? 'bg-amber-100 hover:bg-amber-200 text-amber-800' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}>
                {alert.action}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ── 4. CHARTS SECTION ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Area Chart */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-lg p-6 shadow-premium flex flex-col justify-between hover:border-slate-300 transition-premium duration-200">
          <div className="flex justify-between items-center flex-wrap gap-4 mb-4">
            <div>
              <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">Evolución de Ingresos</span>
              <span className="text-xl font-extrabold text-slate-900 mt-0.5 block">Resumen de Ventas MTD</span>
            </div>
            <div className="flex border border-slate-200 rounded-lg p-1 bg-slate-50 gap-0.5 shadow-sm">
              {(['7d', '30d', '90d', '1y'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setChartRange(r)}
                  className={`text-[10px] font-bold px-2.5 py-1.5 rounded-md uppercase tracking-wider transition-premium cursor-pointer ${
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

        {/* Categories Donut Chart */}
        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-premium flex flex-col justify-between hover:border-slate-300 transition-premium duration-200">
          <div>
            <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">Distribución de Ingresos</span>
            <span className="text-xl font-extrabold text-slate-900 mt-0.5 block">Fuentes del Mes</span>
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

      {/* ── 5. DETAILED ANALYTICS AND ACTIVITY ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity Feed */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-lg p-6 shadow-premium space-y-4 hover:border-slate-300 transition-premium duration-200">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <span className="text-sm font-extrabold text-slate-900">Actividad Reciente</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-green-500 animate-pulse" /> En tiempo real
            </span>
          </div>
          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
            {[
              { time: 'Hace 5 minutos', user: 'Juan Pérez', desc: 'renovó membresía mensual (S/ 80.00)', method: 'Yape', icon: UserCheck, color: 'bg-indigo-100 text-indigo-700' },
              { time: 'Hace 15 minutos', user: 'MAX', desc: 'registró ingreso diario (S/ 5.00) por Entrada Menor', method: 'Plin', icon: DollarSign, color: 'bg-emerald-100 text-emerald-700' },
              { time: 'Hace 30 minutos', user: 'SHAEL CALDERON', desc: 'registró asistencia socio (Acceso Código QR)', method: 'QR', icon: Zap, color: 'bg-amber-100 text-amber-700' },
              { time: 'Hace 1 hora', user: 'ANALY', desc: 'registró Entrada (S/ 7.00) en Efectivo', method: 'Efectivo', icon: DollarSign, color: 'bg-green-100 text-green-700' },
              { time: 'Hace 2 horas', user: 'Frank Samame', desc: 'venció membresía mensual', method: 'Sistema', icon: UserX, color: 'bg-red-100 text-red-700' }
            ].map((act, i) => (
              <div key={i} className="flex justify-between items-center text-xs border-b border-slate-50 pb-3 last:border-0 last:pb-0">
                <div className="flex items-center gap-3">
                  {/* Event Avatar Icon */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${act.color} font-bold text-xs`}>
                    <act.icon className="w-4 h-4 mx-auto" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 tracking-tight">
                      {act.user} <span className="text-slate-500 font-medium">{act.desc}</span>
                    </p>
                    <span className="text-[10px] text-slate-400 font-semibold mt-0.5 block">{act.time}</span>
                  </div>
                </div>
                <span className={`text-[9px] font-extrabold px-2.5 py-0.5 rounded-full ${
                  act.method === 'Sistema' 
                    ? 'bg-red-50 text-red-700 border border-red-100' 
                    : act.method === 'QR'
                    ? 'bg-amber-50 text-amber-700 border border-amber-100'
                    : 'bg-green-50 text-green-700 border border-green-100'
                }`}>
                  {act.method}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Advanced Metrics with Animated Numbers */}
        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-premium space-y-4 hover:border-slate-300 transition-premium duration-200">
          <span className="text-sm font-extrabold text-slate-900 block border-b border-slate-100 pb-3">Métricas Avanzadas</span>
          <div className="space-y-4">
            {[
              { name: 'Ticket Promedio', val: 11.20, trend: '▲ +2.3%', isCurrency: true },
              { name: 'ARPU (Ingreso Usuario)', val: 141.50, trend: '▲ +5.1%', isCurrency: true },
              { name: 'Retención de Clientes', val: 92.4, trend: '▲ +1.2%', isCurrency: false, isPercent: true },
              { name: 'Tasa de Churn', val: 2.1, trend: '▼ -0.4%', isCurrency: false, isPercent: true }
            ].map((met, i) => (
              <div key={i} className="p-3.5 rounded-lg bg-slate-50 border border-slate-100 flex justify-between items-center group hover:bg-slate-100/70 hover:border-slate-200 transition-premium">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{met.name}</span>
                  <span className="text-lg font-black text-slate-900 mt-1 block">
                    <AnimatedCounter 
                      value={met.val} 
                      decimals={met.isPercent ? 1 : 2} 
                      prefix={met.isCurrency ? 'S/ ' : ''} 
                      suffix={met.isPercent ? '%' : ''} 
                    />
                  </span>
                </div>
                <span className={`text-[10px] font-extrabold rounded-full px-2.5 py-0.5 border ${
                  met.trend.includes('▼') 
                    ? 'text-red-600 bg-red-50 border-red-100' 
                    : 'text-green-600 bg-green-50 border-green-100'
                }`}>
                  {met.trend}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
