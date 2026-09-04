import { useState, useEffect } from 'react';

export default function Dashboard() {
  const [metricas, setMetricas] = useState({
    ingresosHoy: 0,
    clientesActivos: 0,
    asistenciasHoy: 0,
    totalClientes: 0
  });
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarDashboard = async () => {
      try {
        const headers = { 'Authorization': 'Bearer ' + localStorage.getItem('token') };
        
        // Ejecutamos las 4 consultas al mismo tiempo para que cargue rapidísimo
        const [resPagos, resSuscripciones, resAsistencias, resClientes] = await Promise.all([
          fetch('http://localhost:8080/api/pagos', { headers }),
          fetch('http://localhost:8080/api/suscripciones', { headers }),
          fetch('http://localhost:8080/api/asistencias', { headers }),
          fetch('http://localhost:8080/api/clientes', { headers })
        ]);

        const pagos = await resPagos.json();
        const suscripciones = await resSuscripciones.json();
        const asistencias = await resAsistencias.json();
        const clientes = await resClientes.json();

        // 1. Calcular Ingresos de Hoy
        const hoyStr = new Date().toISOString().split('T')[0];
        const ingresosHoy = pagos
          .filter((p: any) => p.fechaHora.startsWith(hoyStr))
          .reduce((suma: number, p: any) => suma + p.monto, 0);

        // 2. Calcular Clientes con Suscripción Vigente
        const clientesActivos = suscripciones.filter((s: any) => {
          if (s.estado !== 'VIGENTE') return false;
          // Verificamos si la fecha de fin aún no ha pasado
          const hoy = new Date();
          hoy.setHours(0, 0, 0, 0);
          const fin = new Date(s.fechaFin + 'T00:00:00');
          return fin >= hoy;
        }).length;

        // 3. Calcular Asistencias de Hoy
        const asistenciasHoy = asistencias.filter((a: any) => a.fechaHora.startsWith(hoyStr)).length;

        setMetricas({
          ingresosHoy,
          clientesActivos,
          asistenciasHoy,
          totalClientes: clientes.length
        });

      } catch (error) {
        console.error("Error al cargar el Dashboard:", error);
      } finally {
        setCargando(false);
      }
    };

    cargarDashboard();
  }, []);

  // Obtenemos el nombre del administrador para darle la bienvenida
  const adminName = localStorage.getItem('username') || 'Administrador';

  if (cargando) {
    return <div className="p-10 text-center font-bold text-gray-400">Cargando métricas en tiempo real...</div>;
  }

  return (
    <div className="p-4 lg:p-8 min-h-full">
      <header className="mb-10">
        <h2 className="text-4xl font-black text-[#1a1446] tracking-tight capitalize">
          Hola, {adminName} 👋
        </h2>
        <p className="text-gray-500 mt-2 font-medium text-lg">Este es el resumen de tu gimnasio el día de hoy.</p>
      </header>

      {/* --- TARJETAS DE MÉTRICAS --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-12">
        
        {/* Tarjeta 1: Ingresos */}
        <div className="bg-gradient-to-br from-[#1a1446] to-[#2d226e] rounded-3xl p-6 text-white shadow-xl relative overflow-hidden group hover:-translate-y-1 transition-transform">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white opacity-5 rounded-full -mr-4 -mt-4 transition-transform group-hover:scale-150"></div>
          <div className="flex justify-between items-start mb-4">
            <p className="text-[#a594ff] font-bold uppercase tracking-wider text-xs">Caja Hoy</p>
            <span className="text-2xl">💰</span>
          </div>
          <h3 className="text-4xl font-black">Bs. {metricas.ingresosHoy.toFixed(2)}</h3>
        </div>

        {/* Tarjeta 2: Asistencias */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm relative overflow-hidden group hover:-translate-y-1 transition-transform">
          <div className="flex justify-between items-start mb-4">
            <p className="text-gray-400 font-bold uppercase tracking-wider text-xs">Flujo Hoy</p>
            <span className="text-2xl">🏃‍♂️</span>
          </div>
          <h3 className="text-4xl font-black text-[#1a1446]">{metricas.asistenciasHoy}</h3>
          <p className="text-sm font-bold text-[#00a870] mt-2">Personas ingresaron hoy</p>
        </div>

        {/* Tarjeta 3: Clientes Activos */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm relative overflow-hidden group hover:-translate-y-1 transition-transform">
          <div className="flex justify-between items-start mb-4">
            <p className="text-gray-400 font-bold uppercase tracking-wider text-xs">Suscripciones Activas</p>
            <span className="text-2xl">⭐</span>
          </div>
          <h3 className="text-4xl font-black text-[#1a1446]">{metricas.clientesActivos}</h3>
          <p className="text-sm font-bold text-[#4a24ff] mt-2">Generando valor constante</p>
        </div>

        {/* Tarjeta 4: Total Clientes */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm relative overflow-hidden group hover:-translate-y-1 transition-transform">
          <div className="flex justify-between items-start mb-4">
            <p className="text-gray-400 font-bold uppercase tracking-wider text-xs">Directorio Total</p>
            <span className="text-2xl">👥</span>
          </div>
          <h3 className="text-4xl font-black text-[#1a1446]">{metricas.totalClientes}</h3>
          <p className="text-sm font-medium text-gray-400 mt-2">Registrados históricamente</p>
        </div>

      </div>

      {/* --- SECCIÓN EXTRA: ACCESOS RÁPIDOS --- */}
      <h3 className="text-xl font-bold text-[#1a1446] mb-6">Accesos Rápidos</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <a href="/recepcion" className="bg-[#f4edff] hover:bg-[#e9deff] p-6 rounded-3xl flex items-center gap-4 transition-colors">
          <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-2xl shadow-sm">🎯</div>
          <div>
            <h4 className="font-black text-[#4a24ff] text-lg">Modo Recepción</h4>
            <p className="text-sm font-medium text-[#1a1446] opacity-70">Controlar el acceso ahora</p>
          </div>
        </a>
        
        <a href="/suscripciones" className="bg-[#e0f8f1] hover:bg-[#cbf1e6] p-6 rounded-3xl flex items-center gap-4 transition-colors">
          <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-2xl shadow-sm">📝</div>
          <div>
            <h4 className="font-black text-[#00a870] text-lg">Inscribir Cliente</h4>
            <p className="text-sm font-medium text-[#1a1446] opacity-70">Vender una membresía</p>
          </div>
        </a>

        <a href="/finanzas" className="bg-gray-50 hover:bg-gray-100 p-6 rounded-3xl flex items-center gap-4 transition-colors">
          <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-2xl shadow-sm">💰</div>
          <div>
            <h4 className="font-black text-gray-700 text-lg">Revisar Caja</h4>
            <p className="text-sm font-medium text-gray-500">Ver historial de ingresos</p>
          </div>
        </a>
      </div>
    </div>
  );
}