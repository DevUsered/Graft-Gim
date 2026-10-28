import { useState, useEffect } from 'react';
import { apiFetch } from '../utils/api';

interface Cliente {
  idCliente: number;
  carnetIdentidad: string;
  nombreCompleto: string;
  telefono: string;
  fechaRegistro: string;
  estado: string;
}

export default function Clientes() {

  const rolUsuario = localStorage.getItem('rol') || 'CAJERO';
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  
  const [clienteEditando, setClienteEditando] = useState<number | null>(null);
  const [mostrarToast, setMostrarToast] = useState(false);
  const [mensajeToast, setMensajeToast] = useState("");
  
  const [formulario, setFormulario] = useState({
    carnetIdentidad: '',
    nombreCompleto: '',
    telefono: ''
  });

  const cargarClientes = () => {
    apiFetch('/api/clientes')
      .then(respuesta => respuesta.json())
      .then(datos => setClientes(datos))
      .catch(error => console.error("Error conectando al backend:", error));
  };

  useEffect(() => {
    cargarClientes();
  }, []);

  const manejarCambio = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormulario({ ...formulario, [e.target.name]: e.target.value });
  };

  const abrirModalCrear = () => {
    setFormulario({ carnetIdentidad: '', nombreCompleto: '', telefono: '' });
    setClienteEditando(null); 
    setMostrarModal(true);
  };

  const abrirModalEditar = (cliente: Cliente) => {
    setFormulario({
      carnetIdentidad: cliente.carnetIdentidad,
      nombreCompleto: cliente.nombreCompleto,
      telefono: cliente.telefono || ''
    });
    setClienteEditando(cliente.idCliente); 
    setMostrarModal(true);
  };

  const guardarCliente = (e: React.FormEvent) => {
    e.preventDefault();

    const endpoint = clienteEditando ? `/api/clientes/${clienteEditando}` : `/api/clientes`;
    const metodo = clienteEditando ? 'PUT' : 'POST';

    apiFetch(endpoint, {
      method: metodo,
      body: JSON.stringify(formulario)
    })
    .then(async (respuesta) =>{
      if(!respuesta.ok){
        const errorTexto = await respuesta.text();
        throw new Error(errorTexto || "Ocurrió un error al guardar el cliente.");
      }
      return respuesta.json();
    })
    .then(() => {
      setMostrarModal(false); 
      setFormulario({ carnetIdentidad: '', nombreCompleto: '', telefono: '' }); 
      setClienteEditando(null);
      cargarClientes(); 
      
      setMensajeToast(clienteEditando ? "Cliente actualizado exitosamente" : "Cliente guardado exitosamente");
      setMostrarToast(true);
      setTimeout(() => setMostrarToast(false), 3000);
    })
    .catch(error => console.error("Error al guardar:", error));
  };

  const eliminarCliente = (id: number) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este cliente? Esta acción no se puede deshacer.")) {
      apiFetch(`/api/clientes/${id}`, { method: 'DELETE' })
      .then(() => {
        cargarClientes();
        setMensajeToast("Cliente eliminado exitosamente");
        setMostrarToast(true);
        setTimeout(() => setMostrarToast(false), 3000);
      })
      .catch(error => console.error("Error al eliminar:", error));
    }
  };

  return (
    <div className="p-4 lg:p-8 min-h-full text-white relative">
      
      {/* ⚡ CABECERA */}
      <header className="mb-10 flex flex-col md:flex-row md:justify-between md:items-end gap-4 relative z-10">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tight drop-shadow-md">Directorio de Clientes</h2>
          <p className="text-white/60 mt-2 font-medium drop-shadow-sm">Gestiona los datos y el acceso de los usuarios.</p>
        </div>
        <button 
          onClick={abrirModalCrear}
          className="bg-[#4a24ff] hover:bg-[#3616d9] text-white px-6 py-3 rounded-xl font-bold transition-all shadow-[0_8px_20px_rgba(74,36,255,0.4)] hover:-translate-y-0.5 border border-[#4a24ff]/50"
        >
          + Nuevo Cliente
        </button>
      </header>

      {/* ⚡ INICIO DEL MODAL GLASSMORPHISM */}
      {mostrarModal && (
        <div className="fixed inset-0 bg-[#1a1446]/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white/10 backdrop-blur-2xl p-8 rounded-3xl shadow-2xl w-full max-w-md border border-white/20">
            <h3 className="text-2xl font-black text-white mb-6 drop-shadow-md">
              {clienteEditando ? 'Editar Cliente' : 'Registrar Cliente'}
            </h3>
            
            <form onSubmit={guardarCliente} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-white/60 mb-2 uppercase tracking-wide">Carnet de Identidad</label>
                <input 
                  type="text" name="carnetIdentidad" value={formulario.carnetIdentidad} onChange={manejarCambio} required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:bg-white/10 focus:border-[#4a24ff] focus:ring-4 focus:ring-[#4a24ff]/30 outline-none transition-all font-medium text-white placeholder-white/30"
                  placeholder="Ej: 12345678"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-white/60 mb-2 uppercase tracking-wide">Nombre Completo</label>
                <input 
                  type="text" name="nombreCompleto" value={formulario.nombreCompleto} onChange={manejarCambio} required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:bg-white/10 focus:border-[#4a24ff] focus:ring-4 focus:ring-[#4a24ff]/30 outline-none transition-all font-medium text-white placeholder-white/30"
                  placeholder="Ej: Juan Perez"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-white/60 mb-2 uppercase tracking-wide">Teléfono</label>
                <input 
                  type="text" name="telefono" value={formulario.telefono} onChange={manejarCambio}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:bg-white/10 focus:border-[#4a24ff] focus:ring-4 focus:ring-[#4a24ff]/30 outline-none transition-all font-medium text-white placeholder-white/30"
                  placeholder="Ej: 71234567"
                />
              </div>

              <div className="flex justify-end space-x-3 mt-8 pt-4 border-t border-white/10">
                <button 
                  type="button" onClick={() => { setMostrarModal(false); setClienteEditando(null); }}
                  className="px-6 py-3 text-white/60 hover:bg-white/5 hover:text-white rounded-xl font-bold transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="bg-[#4a24ff] hover:bg-[#3616d9] text-white px-6 py-3 rounded-xl font-bold transition-all shadow-[0_4px_12px_rgba(74,36,255,0.4)] border border-[#4a24ff]/50"
                >
                  {clienteEditando ? 'Guardar Cambios' : 'Guardar Registro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ⚡ TABLA DE CLIENTES DE CRISTAL */}
      <div className="bg-white/5 backdrop-blur-xl rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.2)] border border-white/10 overflow-x-auto relative z-10 custom-scrollbar">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-black/20 border-b border-white/10">
              <th className="p-5 text-xs font-bold text-white/50 uppercase tracking-wider">ID / Carnet</th>
              <th className="p-5 text-xs font-bold text-white/50 uppercase tracking-wider">Nombre</th>
              <th className="p-5 text-xs font-bold text-white/50 uppercase tracking-wider">Teléfono</th>
              <th className="p-5 text-xs font-bold text-white/50 uppercase tracking-wider">Estado</th>
              <th className="p-5 text-xs font-bold text-white/50 uppercase tracking-wider text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {clientes.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-12 text-center text-white/40 font-medium">
                  No hay clientes registrados en la base de datos todavía.
                </td>
              </tr>
            ) : (
              clientes.map((cliente) => (
                <tr key={cliente.idCliente} className="hover:bg-white/5 transition-colors group">
                  <td className="p-5 text-white/70 font-medium">{cliente.carnetIdentidad}</td>
                  <td className="p-5 font-bold text-white drop-shadow-sm">{cliente.nombreCompleto}</td>
                  <td className="p-5 text-white/70">{cliente.telefono || '—'}</td>
                  <td className="p-5">
                    <span className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-wide border ${
                      cliente.estado === 'ACTIVO' ? 'bg-green-500/20 text-green-300 border-green-500/30' : 'bg-red-500/20 text-red-300 border-red-500/30'
                    }`}>
                      {cliente.estado}
                    </span>
                  </td>
                  <td className="p-5 text-right space-x-2">
                    {/* Botón Editar */}
                    <button 
                      onClick={() => abrirModalEditar(cliente)}
                      className="w-10 h-10 inline-flex items-center justify-center rounded-xl bg-blue-500/10 text-blue-300 border border-transparent hover:border-blue-500/30 hover:bg-blue-500/20 transition-all"
                      title="Editar"
                    >
                      ✏️
                    </button>
                    {/* Botón Eliminar */}
                    {rolUsuario === 'ADMIN' && (
                    <button 
                      onClick={() => eliminarCliente(cliente.idCliente)}
                      className="w-10 h-10 inline-flex items-center justify-center rounded-xl bg-red-500/10 text-red-300 border border-transparent hover:border-red-500/30 hover:bg-red-500/20 transition-all"
                      title="Eliminar"
                    >
                      🗑️
                    </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ⚡ NOTIFICACIÓN TOAST FLOTANTE */}
      {mostrarToast && (
        <div className="fixed bottom-8 right-8 bg-white/10 backdrop-blur-2xl border border-white/20 text-white px-6 py-4 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.3)] flex items-center gap-4 z-50 animate-bounce">
          <div className="bg-[#00a870] text-white rounded-full w-8 h-8 flex items-center justify-center font-bold shadow-md">✓</div>
          <span className="font-medium tracking-wide drop-shadow-sm">{mensajeToast}</span>
        </div>
      )}
    </div>
  );
}