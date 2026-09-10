import { useState, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Clientes from './pages/Clientes';
import Membresias from './pages/Membresias';
import Suscripciones from './pages/Suscripciones';
import Recepcion from './pages/Recepcion';
import Finanzas from './pages/Finanzas';
import Login from './pages/Login'; 
import SuperAdmin from './pages/SuperAdmin'; 

// 1. EL TIEMPO LÍMITE VA AQUÍ AFUERA (Para que React no se queje)
const TIEMPO_LIMITE = 30 * 60 * 1000; // 30 minutos

export default function App() {
  const [autenticado, setAutenticado] = useState(!!localStorage.getItem('token'));
  const [rol, setRol] = useState(localStorage.getItem('rol'));
  const [estadoGym, setEstadoGym] = useState(localStorage.getItem('estadoGym'));
  const [vencimientoGym, setVencimientoGym] = useState(localStorage.getItem('vencimientoGym'));

  // 2. EL TEMPORIZADOR VA AQUÍ ADENTRO (Con el tipo de dato universal)
  const temporizadorInactividad = useRef<ReturnType<typeof setTimeout> | null>(null);

  const manejarLogin = () => {
    setRol(localStorage.getItem('rol'));
    setEstadoGym(localStorage.getItem('estadoGym'));
    setVencimientoGym(localStorage.getItem('vencimientoGym'));
    setAutenticado(true);
  };

  const manejarLogout = () => {
    localStorage.clear();
    setRol(null);
    setAutenticado(false);
  };

  // --- LÓGICA DE AUTO-CIERRE POR INACTIVIDAD ---
  useEffect(() => {
    if (autenticado) {
      const reiniciarTemporizador = () => {
        if (temporizadorInactividad.current) clearTimeout(temporizadorInactividad.current);
        
        temporizadorInactividad.current = setTimeout(() => {
          alert("Tu sesión ha expirado por 30 minutos de inactividad. Por seguridad, vuelve a ingresar.");
          manejarLogout();
        }, TIEMPO_LIMITE);
      };

      // Iniciamos el contador
      reiniciarTemporizador();

      // Escuchamos cualquier actividad del usuario
      const eventos = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
      eventos.forEach(evento => window.addEventListener(evento, reiniciarTemporizador));

      // Limpiamos los escuchadores si el componente se desmonta (al salir)
      return () => {
        if (temporizadorInactividad.current) clearTimeout(temporizadorInactividad.current);
        eventos.forEach(evento => window.removeEventListener(evento, reiniciarTemporizador));
      };
    }
  }, [autenticado]);

  const calcularDias = (fecha: string | null) => {
    if (!fecha) return 999; 
    const fin = new Date(fecha + 'T00:00:00');
    const hoy = new Date();
    hoy.setHours(0,0,0,0);
    return Math.ceil((fin.getTime() - hoy.getTime()) / (1000 * 3600 * 24));
  };

  if (!autenticado) {
    return <Login onLogin={manejarLogin} />;
  }

  // --- PORTAL 1: MODO SUPERADMIN (Tú) ---
  if (rol === 'SUPERADMIN') {
    return (
      <BrowserRouter>
        <div className="flex h-screen bg-[#f3f4f6] font-sans overflow-hidden">
          <div className="w-20 bg-[#1a1446] border-r border-[#2d226e] flex flex-col justify-between items-center py-6 shadow-2xl z-10">
            <div className="text-3xl">⚙️</div>
            <button onClick={manejarLogout} className="w-12 h-12 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all" title="Cerrar Sesión">
              🚪
            </button>
          </div>
          <main className="flex-1 overflow-y-auto"><SuperAdmin /></main>
        </div>
      </BrowserRouter>
    );
  }

  // --- LÓGICA DE BLOQUEO PARA CLIENTES ---
  const diasRestantes = calcularDias(vencimientoGym);
  const estaVencido = diasRestantes < 0 || estadoGym === 'CLAUSURADO';
  const estaPorVencer = diasRestantes >= 0 && diasRestantes <= 3; 

  if (estaVencido) {
    return (
      <div className="h-screen w-full bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 md:p-12 rounded-3xl shadow-2xl max-w-lg text-center border-t-8 border-red-500">
          <div className="text-6xl mb-6">🔒</div>
          <h2 className="text-3xl font-black text-gray-900 mb-2">Licencia Expirada</h2>
          <p className="text-gray-500 mb-8 font-medium">El periodo de uso de su sistema ha finalizado. Para seguir utilizando la plataforma y no perder el acceso a sus datos, por favor renueve su suscripción.</p>
          
          <div className="bg-gray-50 p-6 rounded-2xl mb-8 border border-gray-200">
            <h3 className="font-bold text-gray-800 mb-2">Pasos para reactivar:</h3>
            <p className="text-sm text-gray-500 mb-4">Realice el pago de su mensualidad mediante QR o Transferencia y envíe el comprobante.</p>
            <a href="https://wa.me/59170000000?text=Hola,%20quiero%20renovar%20mi%20licencia%20del%20sistema" target="_blank" rel="noreferrer" 
               className="inline-block bg-[#25D366] hover:bg-[#20b858] text-white px-6 py-3 rounded-xl font-bold transition-colors w-full shadow-lg">
              💬 Enviar Comprobante por WhatsApp
            </a>
          </div>

          <button onClick={manejarLogout} className="text-gray-400 hover:text-gray-600 font-bold text-sm">
            Cancelar y salir
          </button>
        </div>
      </div>
    );
  }

  // --- PORTAL 2: MODO GIMNASIO NORMAL ---
  return (
    <BrowserRouter>
      <div className="flex h-screen bg-[#f8f9fa] font-sans text-gray-900 overflow-hidden relative">
        <Sidebar onLogout={manejarLogout} />
        
        <main className="flex-1 flex flex-col overflow-y-auto">
          {estaPorVencer && (
            <div className="bg-amber-100 border-l-4 border-amber-500 p-4 m-4 md:mx-8 md:mt-8 rounded-r-lg shadow-sm flex items-center justify-between z-10 shrink-0">
              <div className="flex items-center gap-3">
                <span className="text-2xl">⚠️</span>
                <div>
                  <h4 className="font-bold text-amber-800">Su licencia vence en {diasRestantes} {diasRestantes === 1 ? 'día' : 'días'}</h4>
                  <p className="text-sm text-amber-700">Evite interrupciones en su sistema. Contacte a soporte para realizar el pago de su mensualidad.</p>
                </div>
              </div>
              <a href="https://wa.me/59170000000" target="_blank" rel="noreferrer" className="bg-amber-500 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-amber-600 hidden md:block">
                Pagar ahora
              </a>
            </div>
          )}

          <div className="flex-1">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/clientes" element={<Clientes />} />
              <Route path="/membresias" element={<Membresias />} />
              <Route path="/suscripciones" element={<Suscripciones />} />
              <Route path="/recepcion" element={<Recepcion />} />
              <Route path="/finanzas" element={<Finanzas />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
        </main>
      </div>
    </BrowserRouter>
  );
}