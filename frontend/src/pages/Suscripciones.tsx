import { useState, useEffect } from 'react';

interface Suscripcion {
  idSuscripcion: number;
  cliente: { idCliente: number; nombreCompleto: string };
  membresia: { idMembresia: number; nombre: string };
  fechaInicio: string;
  fechaFin: string;
  estado: string;
}

interface Cliente { idCliente: number; nombreCompleto: string; }
interface Membresia { idMembresia: number; nombre: string; }

export default function Suscripciones() {
  const [suscripciones, setSuscripciones] = useState<Suscripcion[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [membresias, setMembresias] = useState<Membresia[]>([]);
  
  const [mostrarModal, setMostrarModal] = useState(false);
  
  // Estados para manejar la edición y notificaciones
  const [suscripcionEditando, setSuscripcionEditando] = useState<number | null>(null);
  const [mostrarToast, setMostrarToast] = useState(false);
  const [mensajeToast, setMensajeToast] = useState("");

  const [formulario, setFormulario] = useState({
    idCliente: '',
    idMembresia: '',
    estado: 'VIGENTE' // Agregamos estado para poder editarlo
  });

  const cargarDatos = () => {
    // 1. Agregamos el Token al GET de Suscripciones
    fetch('http://localhost:8080/api/suscripciones', {
      headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
    })
      .then(res => res.json()).then(datos => setSuscripciones(datos));
      
    // 2. Agregamos el Token al GET de Clientes
    fetch('http://localhost:8080/api/clientes', {
      headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
    })
      .then(res => res.json()).then(datos => setClientes(datos));
      
    // 3. Agregamos el Token al GET de Membresias
    fetch('http://localhost:8080/api/membresias', {
      headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
    })
      .then(res => res.json()).then(datos => setMembresias(datos));
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const manejarCambio = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormulario({ ...formulario, [e.target.name]: e.target.value });
  };

  const abrirModalCrear = () => {
    setFormulario({ idCliente: '', idMembresia: '', estado: 'VIGENTE' });
    setSuscripcionEditando(null);
    setMostrarModal(true);
  };

  const abrirModalEditar = (sub: Suscripcion) => {
    setFormulario({
      idCliente: sub.cliente.idCliente.toString(),
      idMembresia: sub.membresia.idMembresia.toString(),
      estado: sub.estado
    });
    setSuscripcionEditando(sub.idSuscripcion);
    setMostrarModal(true);
  };

  const guardarSuscripcion = (e: React.FormEvent) => {
    e.preventDefault();

    const cargaUtil = {
      cliente: { idCliente: parseInt(formulario.idCliente) },
      membresia: { idMembresia: parseInt(formulario.idMembresia) },
      estado: formulario.estado
    };

    const url = suscripcionEditando 
      ? `http://localhost:8080/api/suscripciones/${suscripcionEditando}`
      : 'http://localhost:8080/api/suscripciones';
      
    const metodo = suscripcionEditando ? 'PUT' : 'POST';

    // 4. Agregamos el Token al POST/PUT (Guardar/Editar)
    fetch(url, {
      method: metodo,
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + localStorage.getItem('token')
      },
      body: JSON.stringify(cargaUtil)
    })
    .then(respuesta => respuesta.json())
    .then(() => {
      setMostrarModal(false);
      setFormulario({ idCliente: '', idMembresia: '', estado: 'VIGENTE' }); 
      setSuscripcionEditando(null);
      cargarDatos();
      
      setMensajeToast(suscripcionEditando ? "Suscripción actualizada exitosamente" : "Suscripción registrada con éxito");
      setMostrarToast(true);
      setTimeout(() => setMostrarToast(false), 3000);
    })
    .catch(error => console.error("Error al guardar:", error));
  };

  const eliminarSuscripcion = (id: number) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar esta suscripción del historial?")) {
      
      // 5. Agregamos el Token al DELETE (Eliminar)
      fetch(`http://localhost:8080/api/suscripciones/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': 'Bearer ' + localStorage.getItem('token')
        }
      })
      .then(() => {
        cargarDatos();
        setMensajeToast("Suscripción eliminada exitosamente");
        setMostrarToast(true);
        setTimeout(() => setMostrarToast(false), 3000);
      })
      .catch(error => console.error("Error al eliminar:", error));
    }
  };

  return (
    <div className="p-4 lg:p-8">
      <header className="mb-10 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <h2 className="text-4xl font-black text-[#1a1446] tracking-tight">Suscripciones Activas</h2>
          <p className="text-gray-500 mt-2 font-medium">Inscribe a tus clientes en los planes del gimnasio.</p>
        </div>
        <button 
          onClick={abrirModalCrear}
          className="bg-[#4a24ff] hover:bg-[#3616d9] text-white px-6 py-3 rounded-xl font-bold transition-all shadow-[0_8px_20px_rgba(74,36,255,0.25)] hover:-translate-y-0.5"
        >
          + Nueva Suscripción
        </button>
      </header>

      {/* --- INICIO DEL MODAL --- */}
      {mostrarModal && (
        <div className="fixed inset-0 bg-[#1a1446]/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md border border-gray-100">
            <h3 className="text-2xl font-black text-[#1a1446] mb-6">
              {suscripcionEditando ? 'Editar Suscripción' : 'Inscribir Cliente'}
            </h3>
            
            <form onSubmit={guardarSuscripcion} className="space-y-5">
              
              <div>
                <label className="block text-sm font-bold text-gray-500 mb-2 uppercase tracking-wide">Seleccionar Cliente</label>
                <select 
                  name="idCliente" value={formulario.idCliente} onChange={manejarCambio} required
                  className="w-full bg-gray-50 border border-transparent rounded-xl px-4 py-3 focus:bg-white focus:border-[#4a24ff] focus:ring-4 focus:ring-[#f4edff] outline-none transition-all font-medium text-[#1a1446] appearance-none cursor-pointer"
                >
                  <option value="" disabled>-- Elige un cliente --</option>
                  {clientes.map(cli => (
                    <option key={cli.idCliente} value={cli.idCliente}>{cli.nombreCompleto}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-500 mb-2 uppercase tracking-wide">Plan de Membresía</label>
                <select 
                  name="idMembresia" value={formulario.idMembresia} onChange={manejarCambio} required
                  className="w-full bg-gray-50 border border-transparent rounded-xl px-4 py-3 focus:bg-white focus:border-[#4a24ff] focus:ring-4 focus:ring-[#f4edff] outline-none transition-all font-medium text-[#1a1446] appearance-none cursor-pointer"
                >
                  <option value="" disabled>-- Elige un plan --</option>
                  {membresias.map(mem => (
                    <option key={mem.idMembresia} value={mem.idMembresia}>{mem.nombre}</option>
                  ))}
                </select>
              </div>

              {/* Si estamos editando, mostramos la opción para cambiar el estado */}
              {suscripcionEditando && (
                <div>
                  <label className="block text-sm font-bold text-gray-500 mb-2 uppercase tracking-wide">Estado</label>
                  <select 
                    name="estado" value={formulario.estado} onChange={manejarCambio} required
                    className="w-full bg-gray-50 border border-transparent rounded-xl px-4 py-3 focus:bg-white focus:border-[#4a24ff] focus:ring-4 focus:ring-[#f4edff] outline-none transition-all font-medium text-[#1a1446] appearance-none cursor-pointer"
                  >
                    <option value="VIGENTE">VIGENTE</option>
                    <option value="INACTIVO">INACTIVO</option>
                  </select>
                </div>
              )}

              <div className="flex justify-end space-x-3 mt-8 pt-4">
                <button 
                  type="button" onClick={() => { setMostrarModal(false); setSuscripcionEditando(null); }}
                  className="px-6 py-3 text-gray-500 hover:bg-gray-100 rounded-xl font-bold transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="bg-[#4a24ff] hover:bg-[#3616d9] text-white px-6 py-3 rounded-xl font-bold transition-all shadow-[0_4px_12px_rgba(74,36,255,0.2)]"
                >
                  {suscripcionEditando ? 'Guardar Cambios' : 'Inscribir'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- TABLA DE SUSCRIPCIONES --- */}
      <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-50 overflow-hidden relative z-0">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#fafafa] border-b border-gray-100">
              <th className="p-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Cliente</th>
              <th className="p-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Plan</th>
              <th className="p-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Inicio</th>
              <th className="p-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Vencimiento</th>
              <th className="p-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Estado</th>
              <th className="p-5 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {suscripciones.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-12 text-center text-gray-400 font-medium">
                  No hay suscripciones registradas todavía.
                </td>
              </tr>
            ) : (
              suscripciones.map((sub) => (
                <tr key={sub.idSuscripcion} className="hover:bg-[#fafafa] transition-colors group">
                  <td className="p-5 font-bold text-[#1a1446]">
                    {sub.cliente.nombreCompleto}
                  </td>
                  <td className="p-5 text-[#4a24ff] font-bold">
                    {sub.membresia.nombre}
                  </td>
                  <td className="p-5 text-gray-500 font-medium">
                    {sub.fechaInicio}
                  </td>
                  <td className="p-5 font-bold text-[#1a1446]">
                    {sub.fechaFin}
                  </td>
                  <td className="p-5">
                    <span className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-wide ${
                      sub.estado === 'VIGENTE' ? 'bg-[#e0f8f1] text-[#00a870]' : 'bg-red-50 text-red-600'
                    }`}>
                      {sub.estado}
                    </span>
                  </td>
                  <td className="p-5 text-right space-x-2">
                    <button 
                      onClick={() => abrirModalEditar(sub)}
                      className="w-10 h-10 inline-flex items-center justify-center rounded-xl text-blue-500 hover:bg-blue-50 transition-colors"
                      title="Editar"
                    >
                      ✏️
                    </button>
                    <button 
                      onClick={() => eliminarSuscripcion(sub.idSuscripcion)}
                      className="w-10 h-10 inline-flex items-center justify-center rounded-xl text-red-500 hover:bg-red-50 transition-colors"
                      title="Eliminar"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* NOTIFICACIÓN TOAST FLOTANTE */}
      {mostrarToast && (
        <div className="fixed bottom-8 right-8 bg-[#1a1446] text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 z-50 animate-bounce">
          <div className="bg-[#00a870] text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">✓</div>
          <span className="font-medium tracking-wide">{mensajeToast}</span>
        </div>
      )}
    </div>
  );
}