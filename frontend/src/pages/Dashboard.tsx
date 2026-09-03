import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// SOLUCIÓN AL ERROR: Le decimos a TypeScript exactamente qué datos esperar
interface SuscripcionEstado {
  estado: string;
}

export default function Dashboard() {
  const [estadisticas, setEstadisticas] = useState({
    clientesTotales: 0,
    suscripcionesActivas: 0,
    planesDisponibles: 0
  });

  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('http://localhost:8080/api/clientes').then(res => res.json()),
      fetch('http://localhost:8080/api/suscripciones').then(res => res.json()),
      fetch('http://localhost:8080/api/membresias').then(res => res.json())
    ])
    .then(([clientes, suscripciones, membresias]) => {
      // Usamos la interfaz en lugar de 'any'
      const activas = suscripciones.filter((sub: SuscripcionEstado) => sub.estado === 'VIGENTE').length;

      setEstadisticas({
        clientesTotales: clientes.length,
        suscripcionesActivas: activas,
        planesDisponibles: membresias.length
      });
      setCargando(false);
    })
    .catch(error => {
      console.error("Error al cargar el dashboard:", error);
      setCargando(false);
    });
  }, []);

  return (
    <div className="min-h-full pb-12">
      {/* Encabezado Moderno */}
      <header className="mb-12 relative">
        <div className="absolute -top-10 -left-10 w-32 h-32 bg-violet-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute -top-10 left-40 w-32 h-32 bg-fuchsia-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        
        <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 tracking-tight relative z-10">
          Hola, Edgar <span className="inline-block hover:animate-bounce cursor-default">👋</span>
        </h2>
        <p className="text-gray-500 mt-2 font-medium relative z-10">El rendimiento de tu gimnasio hoy, a simple vista.</p>
      </header>

      {/* Tarjetas Electrizantes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        
        {/* Tarjeta 1: Clientes (Crema + Azul Eléctrico) */}
        <div className="relative overflow-hidden bg-[#FAFAFA] p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(59,130,246,0.15)] group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-gradient-to-br from-blue-400 to-cyan-300 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
          <p className="text-sm font-bold text-gray-400 tracking-wider uppercase mb-2">Clientes Registrados</p>
          <div className="flex items-end justify-between">
            <h3 className="text-5xl font-black text-gray-800">
              {cargando ? '...' : estadisticas.clientesTotales}
            </h3>
            <div className="w-14 h-14 bg-white shadow-sm rounded-2xl flex items-center justify-center text-blue-500 text-2xl border border-blue-50">
              👥
            </div>
          </div>
        </div>

        {/* Tarjeta 2: Suscripciones (Crema + Verde/Morado Vibrante) */}
        <div className="relative overflow-hidden bg-[#FAFAFA] p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(139,92,246,0.15)] group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-gradient-to-br from-violet-500 to-fuchsia-400 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
          <p className="text-sm font-bold text-gray-400 tracking-wider uppercase mb-2">Suscripciones Activas</p>
          <div className="flex items-end justify-between">
            <h3 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600">
              {cargando ? '...' : estadisticas.suscripcionesActivas}
            </h3>
            <div className="w-14 h-14 bg-white shadow-sm rounded-2xl flex items-center justify-center text-violet-500 text-2xl border border-violet-50">
              🔥
            </div>
          </div>
        </div>

        {/* Tarjeta 3: Planes (Crema + Naranja Neón) */}
        <div className="relative overflow-hidden bg-[#FAFAFA] p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(249,115,22,0.15)] group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-gradient-to-br from-orange-400 to-rose-400 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
          <p className="text-sm font-bold text-gray-400 tracking-wider uppercase mb-2">Planes Ofrecidos</p>
          <div className="flex items-end justify-between">
            <h3 className="text-5xl font-black text-gray-800">
              {cargando ? '...' : estadisticas.planesDisponibles}
            </h3>
            <div className="w-14 h-14 bg-white shadow-sm rounded-2xl flex items-center justify-center text-orange-500 text-2xl border border-orange-50">
              🏷️
            </div>
          </div>
        </div>

      </div>

      {/* Acciones Rápidas (Estilo Botones Gigantes Neón/Minimal) */}
      <div className="flex items-center justify-between mb-6 mt-12">
        <h3 className="text-2xl font-black text-gray-800">Acceso Rápido</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Botón Principal (Vibrante) */}
        <Link to="/suscripciones" className="group relative overflow-hidden rounded-[2rem] p-8 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/30 hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700"></div>
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
          
          <div className="relative z-10 flex items-center gap-6">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-3xl shadow-inner border border-white/30">
              ⚡
            </div>
            <div>
              <span className="block font-black text-2xl text-white mb-1">Inscribir Cliente</span>
              <span className="block text-indigo-100 font-medium">Conectar usuario a una membresía</span>
            </div>
          </div>
        </Link>
        
        {/* Botón Secundario (Crema/Minimalista con hover vibrante) */}
        <Link to="/clientes" className="group relative overflow-hidden rounded-[2rem] p-8 bg-white border-2 border-transparent hover:border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-gradient-to-br from-emerald-400 to-cyan-400 opacity-0 group-hover:opacity-10 rounded-full blur-3xl transition-all duration-700"></div>
          
          <div className="relative z-10 flex items-center gap-6">
            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-3xl border border-gray-100 group-hover:scale-110 transition-transform duration-300">
              ➕
            </div>
            <div>
              <span className="block font-black text-2xl text-gray-800 mb-1">Nuevo Cliente</span>
              <span className="block text-gray-400 font-medium group-hover:text-gray-500 transition-colors">Registrar persona al sistema</span>
            </div>
          </div>
        </Link>

      </div>
    </div>
  );
}