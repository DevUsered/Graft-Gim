import { useState, useEffect } from 'react';
import { apiFetch } from '../utils/api'; 

interface Gimnasio {
  idGimnasio: number;
  nombre: string;
  direccion: string;
  estado: string;
  fechaVencimiento: string;
}

interface CredencialesNuevas {
  nombre: string;
  usuario: string;
  clave: string;
}

export default function SuperAdmin() {
  const [gimnasios, setGimnasios] = useState<Gimnasio[]>([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [credencialesGeneradas, setCredencialesGeneradas] = useState<CredencialesNuevas | null>(null);
  
  const [formulario, setFormulario] = useState({ 
    nombreGimnasio: '', direccion: '', usernameAdmin: '', passwordAdmin: '', mesesLicencia: 1 
  });
  const [cargando, setCargando] = useState(false);

  const cargarGimnasios = () => {
    apiFetch('/api/superadmin/gimnasios')
    .then(res => res.json())
    .then(datos => setGimnasios(datos))
    .catch(err => console.error("Error al cargar datos:", err));
  };

  useEffect(() => { cargarGimnasios(); }, []);

  const manejarCambio = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormulario({ ...formulario, [e.target.name]: e.target.value });
  };

  const generarCredenciales = () => {
    if (!formulario.nombreGimnasio) {
      alert("Primero escribe el Nombre Comercial del gimnasio.");
      return;
    }
    
    const nombreLimpio = formulario.nombreGimnasio.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    const nuevoUsuario = `admin_${nombreLimpio}${Math.floor(Math.random() * 100)}`;
    const nuevaClave = Math.random().toString(36).slice(-8) + '!';

    setFormulario({ ...formulario, usernameAdmin: nuevoUsuario, passwordAdmin: nuevaClave });
  };

  const calcularDiasRestantes = (fechaFin: string) => {
    if (!fechaFin) return 0;
    const fin = new Date(fechaFin + 'T00:00:00');
    const hoy = new Date();
    hoy.setHours(0,0,0,0);
    const dif = fin.getTime() - hoy.getTime();
    return Math.ceil(dif / (1000 * 3600 * 24));
  };

  const registrarGimnasio = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);
    try {
      const res = await apiFetch('/api/superadmin/gimnasios', {
        method: 'POST',
        body: JSON.stringify(formulario)
      });
      if (!res.ok) throw new Error("Error en registro");
      
      setCredencialesGeneradas({
        nombre: formulario.nombreGimnasio,
        usuario: formulario.usernameAdmin,
        clave: formulario.passwordAdmin
      });

      setFormulario({ nombreGimnasio: '', direccion: '', usernameAdmin: '', passwordAdmin: '', mesesLicencia: 1 });
      setMostrarModal(false);
      cargarGimnasios();
    } catch (error) {
      alert("Error al registrar cliente.");
    } finally {
      setCargando(false);
    }
  };

  const cambiarEstado = async (id: number, estadoActual: string) => {
    const nuevoEstado = estadoActual === 'ACTIVO' ? 'CLAUSURADO' : 'ACTIVO';
    if (!window.confirm(`¿Seguro que deseas cambiar el estado a ${nuevoEstado}?`)) return;
    try {
      await apiFetch(`/api/superadmin/gimnasios/${id}/estado`, {
        method: 'PUT',
        body: JSON.stringify({ estado: nuevoEstado })
      });
      cargarGimnasios();
    } catch (error) { alert("Error al modificar el estado."); }
  };

  const renovarSuscripcion = async (id: number, nombre: string) => {
    const meses = prompt(`¿Cuántos meses renovará la licencia de ${nombre}?`, "1");
    if (!meses || isNaN(Number(meses))) return;

    try {
      await apiFetch(`/api/superadmin/gimnasios/${id}/renovar`, {
        method: 'PUT',
        body: JSON.stringify({ meses: Number(meses) })
      });
      cargarGimnasios();
    } catch (error) { alert("Error al renovar licencia."); }
  };

  const enviarAviso = async (id: number) => {
    if(!window.confirm("¿Enviar recordatorio de pago al cliente? (Simulado)")) return;
    try {
      await apiFetch(`/api/superadmin/gimnasios/${id}/recordatorio`, { method: 'POST' });
      alert("Recordatorio enviado con éxito.");
    } catch (error) { alert("Error al enviar recordatorio."); }
  };

  const enviarPorWhatsApp = () => {
    if (!credencialesGeneradas) return;
    const mensaje = `¡Hola! Tu sistema de gestión para *${credencialesGeneradas.nombre}* está listo. 🚀\n\n*🌐 Enlace:* https://tudominio.com\n*👤 Usuario:* ${credencialesGeneradas.usuario}\n*🔑 Contraseña:* ${credencialesGeneradas.clave}\n\n_Te recomendamos cambiar esta contraseña desde la sección 'Staff y Accesos' al ingresar._`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
    setCredencialesGeneradas(null); 
  };

  return (
    // ⚡ 1. FONDO CLARO CON DECORACIÓN SUTIL
    <div className="p-4 lg:p-8 min-h-screen bg-gray-50 text-gray-800 relative overflow-hidden">
      
      {/* Esferas de luz sutiles para el modo corporativo */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100 rounded-full mix-blend-multiply filter blur-[100px] opacity-60 pointer-events-none -mr-20 -mt-20"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-100 rounded-full mix-blend-multiply filter blur-[100px] opacity-60 pointer-events-none -ml-20 -mb-20"></div>

      <header className="mb-8 flex flex-col md:flex-row md:justify-between md:items-end gap-4 relative z-10">
        <div>
          <h2 className="text-3xl font-black text-[#1a1446] tracking-tight">Panel de Administración SaaS</h2>
          <p className="text-gray-500 mt-1 font-medium">Gestión integral de licencias y clientes corporativos.</p>
        </div>
        <button onClick={() => setMostrarModal(true)} className="bg-[#1a1446] hover:bg-[#2d226e] text-white px-6 py-3 rounded-xl font-bold shadow-[0_8px_20px_rgba(26,20,70,0.2)] transition-all hover:-translate-y-0.5">
          + Registrar Nuevo Cliente
        </button>
      </header>

      {/* ⚡ 2. MÉTRICAS GLOBALES CON LIGHT GLASSMORPHISM */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 relative z-10">
        <div className="bg-white/60 backdrop-blur-md p-6 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.03)] border border-white border-l-4 border-l-[#4a24ff] hover:bg-white/80 transition-colors">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total Licencias</p>
          <p className="text-4xl font-black text-[#1a1446]">{gimnasios.length}</p>
        </div>
        <div className="bg-white/60 backdrop-blur-md p-6 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.03)] border border-white border-l-4 border-l-[#00a870] hover:bg-white/80 transition-colors">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Licencias Activas</p>
          <p className="text-4xl font-black text-[#1a1446]">{gimnasios.filter(g => g.estado === 'ACTIVO' && calcularDiasRestantes(g.fechaVencimiento) >= 0).length}</p>
        </div>
        <div className="bg-white/60 backdrop-blur-md p-6 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.03)] border border-white border-l-4 border-l-red-500 hover:bg-white/80 transition-colors">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Vencidas / Suspendidas</p>
          <p className="text-4xl font-black text-[#1a1446]">{gimnasios.filter(g => g.estado === 'CLAUSURADO' || calcularDiasRestantes(g.fechaVencimiento) < 0).length}</p>
        </div>
      </div>

      {/* ⚡ 3. TABLA CORPORATIVA LIGHT GLASSMORPHISM */}
      <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-white overflow-x-auto relative z-10 custom-scrollbar">
        <table className="w-full text-left border-collapse text-sm min-w-[800px]">
          <thead>
            <tr className="bg-white/50 border-b border-gray-100 backdrop-blur-md">
              <th className="p-5 font-bold text-gray-400 uppercase tracking-wider text-xs">Empresa / ID</th>
              <th className="p-5 font-bold text-gray-400 uppercase tracking-wider text-xs">Vencimiento</th>
              <th className="p-5 font-bold text-gray-400 uppercase tracking-wider text-xs text-center">Estado de Licencia</th>
              <th className="p-5 font-bold text-gray-400 uppercase tracking-wider text-xs text-right">Gestión Administrativa</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {gimnasios.length === 0 ? (
              <tr><td colSpan={4} className="p-12 text-center text-gray-400 font-medium">No hay licencias registradas aún.</td></tr>
            ) : (
              gimnasios.map((gym) => {
                const diasRestantes = calcularDiasRestantes(gym.fechaVencimiento);
                const esVencido = diasRestantes < 0;
                const estaCritico = diasRestantes >= 0 && diasRestantes <= 5;
                
                return (
                  <tr key={gym.idGimnasio} className="hover:bg-white/60 transition-colors group">
                    <td className="p-5">
                      <p className="font-bold text-[#1a1446] text-base">{gym.nombre}</p>
                      <p className="text-xs text-gray-500 font-medium mt-0.5">ID: {gym.idGimnasio} • {gym.direccion}</p>
                    </td>
                    <td className="p-5">
                      <p className="font-bold text-gray-700">{gym.fechaVencimiento || 'No definida'}</p>
                      {gym.fechaVencimiento && (
                        <p className={`text-[10px] uppercase font-black mt-1 ${esVencido ? 'text-red-500' : estaCritico ? 'text-amber-500' : 'text-green-500'}`}>
                          {esVencido ? `Venció hace ${Math.abs(diasRestantes)} días` : `Quedan ${diasRestantes} días`}
                        </p>
                      )}
                    </td>
                    <td className="p-5 text-center">
                      <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide border ${
                        gym.estado === 'ACTIVO' && !esVencido ? 'bg-green-50 text-green-600 border-green-200' : 'bg-red-50 text-red-600 border-red-200'
                      }`}>
                        {gym.estado === 'ACTIVO' ? (esVencido ? 'DEUDA' : 'AL DÍA') : 'SUSPENDIDO'}
                      </span>
                    </td>
                    <td className="p-5 text-right space-x-2">
                      <button onClick={() => enviarAviso(gym.idGimnasio)} title="Enviar Recordatorio" className="p-2 text-gray-400 hover:text-[#4a24ff] transition-colors rounded-xl hover:bg-[#4a24ff]/10">
                        🔔
                      </button>
                      <button onClick={() => renovarSuscripcion(gym.idGimnasio, gym.nombre)} className="px-4 py-2 text-xs font-bold bg-[#00a870]/10 text-[#00a870] hover:bg-[#00a870]/20 rounded-xl transition-colors border border-transparent hover:border-[#00a870]/30">
                        + Renovar
                      </button>
                      <button onClick={() => cambiarEstado(gym.idGimnasio, gym.estado)} className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors border border-transparent ${
                        gym.estado === 'ACTIVO' ? 'bg-red-50 text-red-600 hover:bg-red-100 hover:border-red-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:border-gray-300'
                      }`}>
                        {gym.estado === 'ACTIVO' ? 'Suspender' : 'Reactivar'}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ⚡ 4. MODAL DE CREACIÓN LIGHT GLASSMORPHISM */}
      {mostrarModal && (
        <div className="fixed inset-0 bg-[#1a1446]/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/90 backdrop-blur-xl p-8 rounded-3xl shadow-2xl w-full max-w-md border border-white">
            <h3 className="text-2xl font-black text-[#1a1446] mb-6">Registrar Cliente Corporativo</h3>
            
            <form onSubmit={registrarGimnasio} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Nombre Comercial</label>
                <input type="text" name="nombreGimnasio" value={formulario.nombreGimnasio} onChange={manejarCambio} required className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#4a24ff] focus:ring-4 focus:ring-[#f4edff] transition-all font-bold text-[#1a1446]" placeholder="Ej: Flex Fitness" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Ubicación</label>
                  <input type="text" name="direccion" value={formulario.direccion} onChange={manejarCambio} required className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#4a24ff] focus:ring-4 focus:ring-[#f4edff] transition-all font-medium text-[#1a1446]" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Plan (Meses)</label>
                  <select name="mesesLicencia" value={formulario.mesesLicencia} onChange={manejarCambio} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#4a24ff] focus:ring-4 focus:ring-[#f4edff] transition-all font-bold text-[#1a1446] cursor-pointer">
                    <option value="1">1 Mes</option>
                    <option value="3">3 Meses</option>
                    <option value="6">6 Meses</option>
                    <option value="12">1 Año</option>
                  </select>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100 mt-6">
                <div className="flex justify-between items-end mb-4">
                  <label className="block text-xs font-black text-[#4a24ff] uppercase tracking-wider">Credenciales de Acceso</label>
                  <button type="button" onClick={generarCredenciales} className="text-xs bg-[#4a24ff]/10 text-[#4a24ff] border border-[#4a24ff]/20 px-3 py-1.5 rounded-lg font-bold hover:bg-[#4a24ff] hover:text-white transition-colors">
                    ⚡ Autogenerar
                  </button>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-1">Usuario Admin</label>
                    <input type="text" name="usernameAdmin" value={formulario.usernameAdmin} onChange={manejarCambio} required className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-[#00a870] font-mono text-sm text-[#1a1446]" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-1">Contraseña</label>
                    <input type="text" name="passwordAdmin" value={formulario.passwordAdmin} onChange={manejarCambio} required className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-[#00a870] font-mono text-sm text-[#1a1446]" />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-100 mt-4">
                <button type="button" onClick={() => setMostrarModal(false)} className="px-6 py-3 text-gray-500 hover:bg-gray-100 rounded-xl font-bold transition-colors">Cancelar</button>
                <button type="submit" disabled={cargando} className="bg-[#1a1446] hover:bg-[#2d226e] text-white px-6 py-3 rounded-xl font-bold shadow-[0_4px_12px_rgba(26,20,70,0.2)] transition-all disabled:opacity-50">{cargando ? 'Guardando...' : 'Crear Cliente'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ⚡ 5. MODAL DE ÉXITO Y WHATSAPP LIGHT GLASSMORPHISM */}
      {credencialesGeneradas && (
        <div className="fixed inset-0 bg-[#1a1446]/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/90 backdrop-blur-2xl p-8 rounded-3xl shadow-2xl w-full max-w-sm text-center border border-white animate-fade-in-up">
            <div className="w-20 h-20 bg-[#e0f8f1] rounded-full flex items-center justify-center text-4xl mx-auto mb-6 shadow-inner border border-[#00a870]/20">
              🎉
            </div>
            <h3 className="text-2xl font-black text-[#1a1446] mb-2">¡Cliente Registrado!</h3>
            <p className="text-gray-500 text-sm mb-6">La cuenta de <strong>{credencialesGeneradas.nombre}</strong> está activa.</p>
            
            <div className="bg-gray-50/80 p-5 rounded-2xl border border-gray-200 text-left mb-8 shadow-sm">
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Usuario:</p>
              <p className="font-mono font-bold text-[#1a1446] text-lg mb-4 bg-white p-2 rounded-lg border border-gray-100">{credencialesGeneradas.usuario}</p>
              
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Contraseña:</p>
              <p className="font-mono font-bold text-[#1a1446] text-lg bg-white p-2 rounded-lg border border-gray-100">{credencialesGeneradas.clave}</p>
            </div>

            <button 
              onClick={enviarPorWhatsApp}
              className="w-full bg-[#25D366] hover:bg-[#20b858] text-white px-6 py-4 rounded-xl font-bold transition-all shadow-[0_8px_20px_rgba(37,211,102,0.3)] hover:-translate-y-0.5 flex items-center justify-center gap-2 mb-3"
            >
              <span className="text-xl">💬</span> Enviar por WhatsApp
            </button>
            <button 
              onClick={() => setCredencialesGeneradas(null)}
              className="w-full px-6 py-3 text-gray-400 hover:bg-gray-100 rounded-xl font-bold transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}