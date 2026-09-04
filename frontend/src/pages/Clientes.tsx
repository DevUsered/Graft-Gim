import { useState, useEffect } from 'react';

interface Cliente {
  idCliente: number;
  carnetIdentidad: string;
  nombreCompleto: string;
  telefono: string;
  fechaRegistro: string;
  estado: string;
}

export default function Clientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  
  // NUEVO: Estados para manejar la edición y el mensaje dinámico
  const [clienteEditando, setClienteEditando] = useState<number | null>(null);
  const [mostrarToast, setMostrarToast] = useState(false);
  const [mensajeToast, setMensajeToast] = useState("");
  
  const [formulario, setFormulario] = useState({
    carnetIdentidad: '',
    nombreCompleto: '',
    telefono: ''
  });

  const cargarClientes = () => {
    fetch('http://localhost:8080/api/clientes',{
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('token')
      }
    })
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

  // NUEVO: Funciones para abrir el modal en diferentes modos
  const abrirModalCrear = () => {
    setFormulario({ carnetIdentidad: '', nombreCompleto: '', telefono: '' });
    setClienteEditando(null); // Modo Crear
    setMostrarModal(true);
  };

  const abrirModalEditar = (cliente: Cliente) => {
    setFormulario({
      carnetIdentidad: cliente.carnetIdentidad,
      nombreCompleto: cliente.nombreCompleto,
      telefono: cliente.telefono || ''
    });
    setClienteEditando(cliente.idCliente); // Modo Editar
    setMostrarModal(true);
  };

  // ACTUALIZADO: Maneja tanto POST (Crear) como PUT (Editar)
  const guardarCliente = (e: React.FormEvent) => {
    e.preventDefault();

    const url = clienteEditando 
      ? `http://localhost:8080/api/clientes/${clienteEditando}`
      : 'http://localhost:8080/api/clientes';
      
    const metodo = clienteEditando ? 'PUT' : 'POST';

    fetch(url, {
      method: metodo,
      headers: { 'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + localStorage.getItem('token')
       },
      body: JSON.stringify(formulario)
    })
    .then(respuesta => respuesta.json())
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

  // NUEVO: Función para eliminar
  const eliminarCliente = (id: number) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este cliente? Esta acción no se puede deshacer.")) {
      fetch(`http://localhost:8080/api/clientes/${id}`, 
        {
        method: 'DELETE',
        headers: {
          'Authorization': 'Bearer ' + localStorage.getItem('token')
        }
      })
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
    <div className="p-4 lg:p-8">
      <header className="mb-10 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <h2 className="text-4xl font-black text-[#1a1446] tracking-tight">Directorio de Clientes</h2>
          <p className="text-gray-500 mt-2 font-medium">Gestiona los datos y el acceso de los usuarios.</p>
        </div>
        <button 
          onClick={abrirModalCrear}
          className="bg-[#4a24ff] hover:bg-[#3616d9] text-white px-6 py-3 rounded-xl font-bold transition-all shadow-[0_8px_20px_rgba(74,36,255,0.25)] hover:-translate-y-0.5"
        >
          + Nuevo Cliente
        </button>
      </header>

      {/* --- INICIO DEL MODAL --- */}
      {mostrarModal && (
        <div className="fixed inset-0 bg-[#1a1446]/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md border border-gray-100">
            <h3 className="text-2xl font-black text-[#1a1446] mb-6">
              {clienteEditando ? 'Editar Cliente' : 'Registrar Cliente'}
            </h3>
            
            <form onSubmit={guardarCliente} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-500 mb-2 uppercase tracking-wide">Carnet de Identidad</label>
                <input 
                  type="text" name="carnetIdentidad" value={formulario.carnetIdentidad} onChange={manejarCambio} required
                  className="w-full bg-gray-50 border border-transparent rounded-xl px-4 py-3 focus:bg-white focus:border-[#4a24ff] focus:ring-4 focus:ring-[#f4edff] outline-none transition-all font-medium text-[#1a1446]"
                  placeholder="Ej: 12345678"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-500 mb-2 uppercase tracking-wide">Nombre Completo</label>
                <input 
                  type="text" name="nombreCompleto" value={formulario.nombreCompleto} onChange={manejarCambio} required
                  className="w-full bg-gray-50 border border-transparent rounded-xl px-4 py-3 focus:bg-white focus:border-[#4a24ff] focus:ring-4 focus:ring-[#f4edff] outline-none transition-all font-medium text-[#1a1446]"
                  placeholder="Ej: Juan Perez"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-500 mb-2 uppercase tracking-wide">Teléfono</label>
                <input 
                  type="text" name="telefono" value={formulario.telefono} onChange={manejarCambio}
                  className="w-full bg-gray-50 border border-transparent rounded-xl px-4 py-3 focus:bg-white focus:border-[#4a24ff] focus:ring-4 focus:ring-[#f4edff] outline-none transition-all font-medium text-[#1a1446]"
                  placeholder="Ej: 71234567"
                />
              </div>

              <div className="flex justify-end space-x-3 mt-8 pt-4">
                <button 
                  type="button" onClick={() => { setMostrarModal(false); setClienteEditando(null); }}
                  className="px-6 py-3 text-gray-500 hover:bg-gray-100 rounded-xl font-bold transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="bg-[#4a24ff] hover:bg-[#3616d9] text-white px-6 py-3 rounded-xl font-bold transition-all shadow-[0_4px_12px_rgba(74,36,255,0.2)]"
                >
                  {clienteEditando ? 'Guardar Cambios' : 'Guardar Registro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- TABLA DE CLIENTES --- */}
      <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-50 overflow-hidden relative z-0">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#fafafa] border-b border-gray-100">
              <th className="p-5 text-xs font-bold text-gray-400 uppercase tracking-wider">ID / Carnet</th>
              <th className="p-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Nombre</th>
              <th className="p-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Teléfono</th>
              <th className="p-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Estado</th>
              <th className="p-5 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {clientes.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-12 text-center text-gray-400 font-medium">
                  No hay clientes registrados en la base de datos todavía.
                </td>
              </tr>
            ) : (
              clientes.map((cliente) => (
                <tr key={cliente.idCliente} className="hover:bg-[#fafafa] transition-colors group">
                  <td className="p-5 text-gray-500 font-medium">{cliente.carnetIdentidad}</td>
                  <td className="p-5 font-bold text-[#1a1446]">{cliente.nombreCompleto}</td>
                  <td className="p-5 text-gray-500">{cliente.telefono || '—'}</td>
                  <td className="p-5">
                    <span className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-wide ${
                      cliente.estado === 'ACTIVO' ? 'bg-[#e0f8f1] text-[#00a870]' : 'bg-red-50 text-red-600'
                    }`}>
                      {cliente.estado}
                    </span>
                  </td>
                  <td className="p-5 text-right space-x-2">
                    {/* Botón Editar */}
                    <button 
                      onClick={() => abrirModalEditar(cliente)}
                      className="w-10 h-10 inline-flex items-center justify-center rounded-xl text-blue-500 hover:bg-blue-50 transition-colors"
                      title="Editar"
                    >
                      ✏️
                    </button>
                    {/* Botón Eliminar */}
                    <button 
                      onClick={() => eliminarCliente(cliente.idCliente)}
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