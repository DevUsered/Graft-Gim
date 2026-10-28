import { useState, useEffect } from 'react';
import { apiFetch } from '../utils/api'; 
import { useNavigate } from 'react-router-dom';

interface Metricas {
  ingresosHoy: number;
  clientesActivos: number;
  asistenciasHoy: number;
  totalClientes: number;
}

export default function Dashboard() {
  // 1. Invocamos la función de navegación
  const navigate = useNavigate();

  const [metricas, setMetricas] = useState<Metricas>({
    ingresosHoy: 0,
    clientesActivos: 0,
    asistenciasHoy: 0,
    totalClientes: 0
  });
  const [cargando, setCargando] = useState(true);

  const rolUsuario = localStorage.getItem('rol') || 'CAJERO';
  const adminName = localStorage.getItem('username') || 'Usuario';

  useEffect(() => {
    const cargarDashboard = async () => {
      try {
        const respuesta = await apiFetch('/api/dashboard/metricas');
        const datos = await respuesta.json();
        setMetricas(datos);
      } catch (error) {
        console.error("Error al cargar el Dashboard:", error);
      } finally {
        setCargando(false);
      }
    };

    cargarDashboard();
  }, []);

  if (cargando) {
    return (
      <div className="flex h-full items-center justify-center p-10">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-[#f4edff] border-t-[#4a24ff] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="font-bold text-gray-400">Cargando métricas en tiempo real...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 min-h-full">
      <header className="mb-10 relative z-10">
        <h2 className="text-4xl font-black text-white tracking-tight capitalize drop-shadow-md">
          Hola, {adminName} 👋
        </h2>
        <p className="text-white/70 mt-2 font-medium text-lg drop-shadow-sm">Este es el resumen del gimnasio el día de hoy.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-12">
        {rolUsuario === 'ADMIN' && (
          <div className="bg-gradient-to-br from-[#1a1446] to-[#2d226e] rounded-3xl p-6 text-white shadow-xl relative overflow-hidden group hover:-translate-y-1 transition-transform">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white opacity-5 rounded-full -mr-4 -mt-4 transition-transform group-hover:scale-150"></div>
            <div className="flex justify-between items-start mb-4">
              <p className="text-[#a594ff] font-bold uppercase tracking-wider text-xs">Caja Hoy</p>
              <span className="text-2xl">💰</span>
            </div>
            <h3 className="text-4xl font-black">Bs. {metricas.ingresosHoy.toFixed(2)}</h3>
          </div>
        )}

        
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.12)] relative overflow-hidden group hover:-translate-y-1 transition-all hover:bg-white/20">
          <div className="flex justify-between items-start mb-4">
            <p className="text-white/60 font-bold uppercase tracking-wider text-xs">Flujo Hoy</p>
            <span className="text-2xl">🏃‍♂️</span>
          </div>
          <h3 className="text-4xl font-black text-white">{metricas.asistenciasHoy}</h3>
          <p className="text-sm font-bold text-green-300 mt-2">Personas ingresaron hoy</p>
        </div>

        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.12)] relative overflow-hidden group hover:-translate-y-1 transition-all hover:bg-white/20">
          <div className="flex justify-between items-start mb-4">
            <p className="text-white/60 font-bold uppercase tracking-wider text-xs">Suscripciones Activas</p>
            <span className="text-2xl">⭐</span>
          </div>
          <h3 className="text-4xl font-black text-white">{metricas.clientesActivos}</h3>
          <p className="text-sm font-bold text-[#a594ff] mt-2">Personas con suscripción</p>
        </div>

        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.12)] relative overflow-hidden group hover:-translate-y-1 transition-all hover:bg-white/20">
          <div className="flex justify-between items-start mb-4">
            <p className="text-white/60 font-bold uppercase tracking-wider text-xs">Directorio Total</p>
            <span className="text-2xl">👥</span>
          </div>
          <h3 className="text-4xl font-black text-white">{metricas.totalClientes}</h3>
          <p className="text-sm font-medium text-white mt-2">Registrados históricamente</p>
        </div>
      </div>

     
      <div 
        onClick={() => navigate('/tienda')}
        className="mb-12 bg-gradient-to-r from-[#ff4d6d] to-[#ff8fa3] rounded-3xl p-8 cursor-pointer transform transition-all hover:scale-[1.02] hover:shadow-2xl shadow-xl flex justify-between items-center group overflow-hidden relative"
      >
        <div className="absolute -right-6 -top-10 text-[140px] opacity-20 transform group-hover:rotate-12 transition-transform select-none">
          🛒
        </div>
        <div className="relative z-10">
          <h3 className="text-3xl md:text-4xl font-black text-white mb-2 tracking-tight">Punto de Venta</h3>
          <p className="text-[#ffe0e6] font-medium text-lg max-w-md">
            Gestiona y vende agua, energizantes, suplementos y más productos del gimnasio.
          </p>
        </div>
        <div className="relative z-10 bg-white/20 backdrop-blur-md p-4 rounded-2xl text-white shadow-inner hidden md:block">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 group-hover:translate-x-2 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </div>
      </div>

      <h3 className="text-xl font-bold text-white drop-shadow-md mb-6 relative z-10">Accesos Rápidos</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <a href="/recepcion" className="bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 p-6 rounded-3xl flex items-center gap-4 transition-all shadow-white/5">
          <div className="w-14 h-14 bg-white/20 text-white rounded-2xl flex items-center justify-center text-2xl shadow-sm">🎯</div>
          <div>
            <h4 className="font-black text-white text-lg">Modo Recepción</h4>
            <p className="text-sm font-medium text-white">Controlar el acceso ahora</p>
          </div>
        </a>
        
        <a href="/suscripciones" className="bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 p-6 rounded-3xl flex items-center gap-4 transition-all shadow-white/5">
          <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-2xl shadow-sm">📝</div>
          <div>
            <h4 className="font-black text-white text-lg">Inscribir Cliente</h4>
            <p className="text-sm font-medium text-white">Vender una membresía</p>
          </div>
        </a>

        {rolUsuario === 'ADMIN' && (
          <a href="/finanzas" className="bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 p-6 rounded-3xl flex items-center gap-4 transition-colors">
            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-2xl shadow-sm">💰</div>
            <div>
              <h4 className="font-black text-white text-lg">Revisar Caja</h4>
              <p className="text-sm font-medium text-white">Ver historial de ingresos</p>
            </div>
          </a>
        )}
      </div>
    </div>
  );
}