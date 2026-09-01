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
  // Memorias de nuestra pantalla
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [mostrarModal, setMostrarModal] = useState(false); // Controla si el modal se ve o no
  
  // Memoria para el formulario
  const [formulario, setFormulario] = useState({
    carnetIdentidad: '',
    nombreCompleto: '',
    telefono: ''
  });

  // Función para traer los clientes de la base de datos
  const cargarClientes = () => {
    fetch('http://localhost:8080/api/clientes')
      .then(respuesta => respuesta.json())
      .then(datos => setClientes(datos))
      .catch(error => console.error("Error conectando al backend:", error));
  };

  // Se ejecuta al abrir la pantalla
  useEffect(() => {
    cargarClientes();
  }, []);

  // Función que se activa cada vez que escribes en un input
  const manejarCambio = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormulario({
      ...formulario,
      [e.target.name]: e.target.value
    });
  };

  // Función que se activa al darle "Guardar" en el formulario
  const guardarCliente = (e: React.FormEvent) => {
    e.preventDefault(); // Evita que la página recargue

    // Enviamos los datos a Java
    fetch('http://localhost:8080/api/clientes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formulario)
    })
    .then(respuesta => respuesta.json())
    .then(() => {
      // Si todo salió bien:
      setMostrarModal(false); // 1. Cerramos la ventana emergente
      setFormulario({ carnetIdentidad: '', nombreCompleto: '', telefono: '' }); // 2. Limpiamos el formulario
      cargarClientes(); // 3. Volvemos a pedir la lista actualizada a la base de datos
    })
    .catch(error => console.error("Error al guardar:", error));
  };

  return (
    <>
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Directorio de Clientes</h2>
          <p className="text-gray-500 mt-1">Gestiona las membresías y datos de los usuarios.</p>
        </div>
        {/* Al hacer clic, encendemos el interruptor del modal */}
        <button 
          onClick={() => setMostrarModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm"
        >
          + Nuevo Cliente
        </button>
      </header>

      {/* --- INICIO DEL MODAL --- */}
      {mostrarModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Registrar Cliente</h3>
            
            <form onSubmit={guardarCliente} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Carnet de Identidad</label>
                <input 
                  type="text" 
                  name="carnetIdentidad"
                  value={formulario.carnetIdentidad}
                  onChange={manejarCambio}
                  required
                  className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Ej: 12345678"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                <input 
                  type="text" 
                  name="nombreCompleto"
                  value={formulario.nombreCompleto}
                  onChange={manejarCambio}
                  required
                  className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Ej: Juan Pérez"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                <input 
                  type="text" 
                  name="telefono"
                  value={formulario.telefono}
                  onChange={manejarCambio}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Ej: 71234567"
                />
              </div>

              <div className="flex justify-end space-x-3 mt-8">
                <button 
                  type="button" 
                  onClick={() => setMostrarModal(false)}
                  className="px-5 py-2 text-gray-600 hover:bg-gray-100 rounded-xl font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl font-medium transition-colors"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* --- FIN DEL MODAL --- */}

      {/* --- TABLA DE CLIENTES --- */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative z-0">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="p-4 text-sm font-semibold text-gray-600">ID / Carnet</th>
              <th className="p-4 text-sm font-semibold text-gray-600">Nombre</th>
              <th className="p-4 text-sm font-semibold text-gray-600">Teléfono</th>
              <th className="p-4 text-sm font-semibold text-gray-600">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {clientes.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-gray-500">
                  No hay clientes registrados en la base de datos todavía.
                </td>
              </tr>
            ) : (
              clientes.map((cliente) => (
                <tr key={cliente.idCliente} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 text-gray-600 font-medium">{cliente.carnetIdentidad}</td>
                  <td className="p-4 font-bold text-gray-800">{cliente.nombreCompleto}</td>
                  <td className="p-4 text-gray-600">{cliente.telefono || 'Sin registro'}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      cliente.estado === 'ACTIVO' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {cliente.estado}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}