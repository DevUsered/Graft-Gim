import { useState, useEffect } from 'react';

interface Gimnasio {
  idGimnasio: number;
  nombre: string;
  direccion: string;
  estado: string;
  fechaVencimiento: string;
}

export default function SuperAdmin() {
  const [gimnasios, setGimnasios] = useState<Gimnasio[]>([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [formulario, setFormulario] = useState({ 
    nombreGimnasio: '', direccion: '', usernameAdmin: '', passwordAdmin: '', mesesLicencia: 1 
  });
  const [cargando, setCargando] = useState(false);

  const cargarGimnasios = () => {
    fetch('${import.meta.env.VITE_API_URL}/api/superadmin/gimnasios', {
      headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
    })
    .then(res => res.json())
    .then(datos => setGimnasios(datos))
    .catch(err => console.error("Error al cargar datos:", err));
  };

  useEffect(() => { cargarGimnasios(); }, []);

  const manejarCambio = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormulario({ ...formulario, [e.target.name]: e.target.value });
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
      const res = await fetch('${import.meta.env.VITE_API_URL}/api/superadmin/gimnasios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + localStorage.getItem('token') },
        body: JSON.stringify(formulario)
      });
      if (!res.ok) throw new Error("Error en registro");
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
      await fetch(`${import.meta.env.VITE_API_URL}/api/superadmin/gimnasios/${id}/estado`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + localStorage.getItem('token') },
        body: JSON.stringify({ estado: nuevoEstado })
      });
      cargarGimnasios();
    } catch (error) { alert("Error al modificar el estado."); }
  };

  const renovarSuscripcion = async (id: number, nombre: string) => {
    const meses = prompt(`¿Cuántos meses renovará la licencia de ${nombre}?`, "1");
    if (!meses || isNaN(Number(meses))) return;

    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/superadmin/gimnasios/${id}/renovar`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + localStorage.getItem('token') },
        body: JSON.stringify({ meses: Number(meses) })
      });
      cargarGimnasios();
    } catch (error) { alert("Error al renovar licencia."); }
  };

  const enviarAviso = async (id: number) => {
    if(!window.confirm("¿Enviar recordatorio de pago al cliente? (Simulado)")) return;
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/superadmin/gimnasios/${id}/recordatorio`, {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
      });
      alert("Recordatorio enviado con éxito.");
    } catch (error) { alert("Error al enviar recordatorio."); }
  };

  return (
    <div className="p-4 lg:p-8 min-h-screen bg-[#f3f4f6] text-gray-800">
      <header className="mb-8 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <h2 className="text-3xl font-black text-[#1a1446] tracking-tight">Panel de Administración SaaS</h2>
          <p className="text-gray-500 mt-1 font-medium">Gestión integral de licencias y clientes corporativos.</p>
        </div>
        <button onClick={() => setMostrarModal(true)} className="bg-[#1a1446] hover:bg-[#2d226e] text-white px-6 py-2.5 rounded-lg font-bold shadow-md transition-colors">
          + Registrar Nuevo Cliente
        </button>
      </header>

      {/* MÉTRICAS GLOBALES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-[#4a24ff]">
          <p className="text-sm font-bold text-gray-400 uppercase">Total Licencias</p>
          <p className="text-3xl font-black text-[#1a1446]">{gimnasios.length}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-[#00a870]">
          <p className="text-sm font-bold text-gray-400 uppercase">Licencias Activas</p>
          <p className="text-3xl font-black text-[#1a1446]">{gimnasios.filter(g => g.estado === 'ACTIVO' && calcularDiasRestantes(g.fechaVencimiento) >= 0).length}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-red-500">
          <p className="text-sm font-bold text-gray-400 uppercase">Vencidas / Suspendidas</p>
          <p className="text-3xl font-black text-[#1a1446]">{gimnasios.filter(g => g.estado === 'CLAUSURADO' || calcularDiasRestantes(g.fechaVencimiento) < 0).length}</p>
        </div>
      </div>

      {/* TABLA CORPORATIVA */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="p-4 font-bold text-gray-500 uppercase">Empresa / ID</th>
              <th className="p-4 font-bold text-gray-500 uppercase">Vencimiento</th>
              <th className="p-4 font-bold text-gray-500 uppercase text-center">Estado de Licencia</th>
              <th className="p-4 font-bold text-gray-500 uppercase text-right">Gestión Administrativa</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {gimnasios.map((gym) => {
              const diasRestantes = calcularDiasRestantes(gym.fechaVencimiento);
              const esVencido = diasRestantes < 0;
              const estaCritico = diasRestantes >= 0 && diasRestantes <= 5;
              
              return (
                <tr key={gym.idGimnasio} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4">
                    <p className="font-bold text-gray-900 text-base">{gym.nombre}</p>
                    <p className="text-xs text-gray-400">ID: {gym.idGimnasio} • {gym.direccion}</p>
                  </td>
                  <td className="p-4">
                    <p className="font-semibold text-gray-800">{gym.fechaVencimiento || 'No definida'}</p>
                    {gym.fechaVencimiento && (
                      <p className={`text-xs font-bold mt-1 ${esVencido ? 'text-red-500' : estaCritico ? 'text-amber-500' : 'text-green-600'}`}>
                        {esVencido ? `Venció hace ${Math.abs(diasRestantes)} días` : `Quedan ${diasRestantes} días`}
                      </p>
                    )}
                  </td>
                  <td className="p-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                      gym.estado === 'ACTIVO' && !esVencido ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {gym.estado === 'ACTIVO' ? (esVencido ? 'DEUDA' : 'AL DÍA') : 'SUSPENDIDO'}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button onClick={() => enviarAviso(gym.idGimnasio)} title="Enviar Recordatorio" className="p-2 text-gray-400 hover:text-[#4a24ff] transition-colors rounded-lg hover:bg-[#4a24ff]/10">
                      🔔
                    </button>
                    <button onClick={() => renovarSuscripcion(gym.idGimnasio, gym.nombre)} className="px-3 py-1.5 text-xs font-bold bg-[#e0f8f1] text-[#00a870] hover:bg-[#cbf1e6] rounded-lg transition-colors">
                      + Renovar
                    </button>
                    <button onClick={() => cambiarEstado(gym.idGimnasio, gym.estado)} className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                      gym.estado === 'ACTIVO' ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}>
                      {gym.estado === 'ACTIVO' ? 'Suspender' : 'Reactivar'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* MODAL SERIO */}
      {mostrarModal && (
        <div className="fixed inset-0 bg-gray-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md">
            <h3 className="text-xl font-bold text-[#1a1446] mb-4 border-b pb-2">Registrar Nueva Cuenta Corporativa</h3>
            <form onSubmit={registrarGimnasio} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Nombre Comercial</label>
                <input type="text" name="nombreGimnasio" value={formulario.nombreGimnasio} onChange={manejarCambio} required className="w-full border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-[#4a24ff] text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Ubicación</label>
                  <input type="text" name="direccion" value={formulario.direccion} onChange={manejarCambio} required className="w-full border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-[#4a24ff] text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Plan (Meses)</label>
                  <select name="mesesLicencia" value={formulario.mesesLicencia} onChange={manejarCambio} className="w-full border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-[#4a24ff] text-sm">
                    <option value="1">1 Mes</option>
                    <option value="3">3 Meses</option>
                    <option value="6">6 Meses</option>
                    <option value="12">1 Año</option>
                  </select>
                </div>
              </div>
              <div className="pt-2">
                <label className="block text-xs font-bold text-gray-500 mb-1">Usuario Administrativo</label>
                <input type="text" name="usernameAdmin" value={formulario.usernameAdmin} onChange={manejarCambio} required className="w-full border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-[#00a870] text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Contraseña Provisoria</label>
                <input type="text" name="passwordAdmin" value={formulario.passwordAdmin} onChange={manejarCambio} required className="w-full border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-[#00a870] text-sm" />
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <button type="button" onClick={() => setMostrarModal(false)} className="px-4 py-2 text-gray-500 hover:text-gray-700 text-sm font-bold">Cancelar</button>
                <button type="submit" disabled={cargando} className="bg-[#1a1446] text-white px-5 py-2 rounded-lg text-sm font-bold">{cargando ? 'Guardando...' : 'Crear Cliente'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}