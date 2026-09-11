import { useState, useEffect } from 'react';

interface Membresia {
  idMembresia: number;
  nombre: string;
  precio: number;
  duracionDias: number;
  descripcion: string;
}

// NUEVO: Interfaz para leer las suscripciones y sacar los nombres
interface SuscripcionAPI {
  idSuscripcion: number;
  estado: string;
  cliente: { nombreCompleto: string };
  membresia: { idMembresia: number };
}

export default function Membresias() {
  const [membresias, setMembresias] = useState<Membresia[]>([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  
  const [membresiaEditando, setMembresiaEditando] = useState<number | null>(null);
  const [mostrarToast, setMostrarToast] = useState(false);
  const [mensajeToast, setMensajeToast] = useState("");
  
  // NUEVO: Estados para el Modal de Suscritos
  const [mostrarModalSuscritos, setMostrarModalSuscritos] = useState(false);
  const [nombresSuscritos, setNombresSuscritos] = useState<string[]>([]);
  const [nombrePlanViendo, setNombrePlanViendo] = useState("");
  const [cargandoSuscritos, setCargandoSuscritos] = useState(false);

  const [formulario, setFormulario] = useState({
    nombre: '',
    precio: '',
    duracionDias: '',
    descripcion: ''
  });

  const cargarMembresias = () => {
    fetch(`${import.meta.env.VITE_API_URL}/api/membresias`,{
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + localStorage.getItem('token')
      },
    })
      .then(respuesta => respuesta.json())
      .then(datos => setMembresias(datos))
      .catch(error => console.error("Error conectando al backend:", error));
  };

  useEffect(() => {
    cargarMembresias();
  }, []);

  const manejarCambio = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormulario({ ...formulario, [e.target.name]: e.target.value });
  };

  const abrirModalCrear = () => {
    setFormulario({ nombre: '', precio: '', duracionDias: '', descripcion: '' });
    setMembresiaEditando(null); 
    setMostrarModal(true);
  };

  const abrirModalEditar = (membresia: Membresia) => {
    setFormulario({
      nombre: membresia.nombre,
      precio: membresia.precio.toString(),
      duracionDias: membresia.duracionDias.toString(),
      descripcion: membresia.descripcion || ''
    });
    setMembresiaEditando(membresia.idMembresia); 
    setMostrarModal(true);
  };

  // NUEVO: Función que busca quién está inscrito en el plan
  const verSuscritos = async (idMembresia: number, nombrePlan: string) => {
    setNombrePlanViendo(nombrePlan);
    setNombresSuscritos([]);
    setCargandoSuscritos(true);
    setMostrarModalSuscritos(true);

    try {
      // Reutilizamos tu endpoint de suscripciones
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/suscripciones`, {
        headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
      });
      
      if (res.ok) {
        const todasLasSuscripciones: SuscripcionAPI[] = await res.json();
        
        // Filtramos: Solo los que tienen este plan y están VIGENTES
        const clientesEnEstePlan = todasLasSuscripciones
          .filter(sub => sub.membresia?.idMembresia === idMembresia && sub.estado === 'VIGENTE')
          .map(sub => sub.cliente?.nombreCompleto);
          
        // Quitamos duplicados (por si un cliente compró el mismo plan dos veces)
        const nombresUnicos = Array.from(new Set(clientesEnEstePlan));
        
        setNombresSuscritos(nombresUnicos);
      }
    } catch (error) {
      console.error("Error al obtener suscritos:", error);
    } finally {
      setCargandoSuscritos(false);
    }
  };

  const guardarMembresia = (e: React.FormEvent) => {
    e.preventDefault();

    const url = membresiaEditando 
      ? `${import.meta.env.VITE_API_URL}/api/membresias/${membresiaEditando}`
      : `${import.meta.env.VITE_API_URL}/api/membresias`;
      
    const metodo = membresiaEditando ? 'PUT' : 'POST';

    fetch(url, {
      method: metodo,
      headers: { 'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + localStorage.getItem('token')
       },
      body: JSON.stringify({
        ...formulario,
        precio: parseFloat(formulario.precio),
        duracionDias: parseInt(formulario.duracionDias)
      })
    })
    .then(async (respuesta) =>{
      if(!respuesta.ok){
        const errorTexto = await respuesta.text();
        throw new Error(errorTexto || "Ocurrió un error al guardar la membresia.")
      }
    })
    .then(() => {
      setMostrarModal(false);
      setFormulario({ nombre: '', precio: '', duracionDias: '', descripcion: '' });
      setMembresiaEditando(null);
      cargarMembresias();
      
      setMensajeToast(membresiaEditando ? "Plan actualizado exitosamente" : "Plan guardado exitosamente");
      setMostrarToast(true);
      setTimeout(() => setMostrarToast(false), 3000);
    })
    .catch(error => console.error("Error al guardar:", error));
  };

  const eliminarMembresia = (id: number) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este plan? Si hay clientes suscritos a él, podría causar conflictos.")) {
      fetch(`${import.meta.env.VITE_API_URL}/api/membresias/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': 'Bearer ' + localStorage.getItem('token')
        }
      })
      .then(() => {
        cargarMembresias();
        setMensajeToast("Plan eliminado exitosamente");
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
          <h2 className="text-4xl font-black text-[#1a1446] tracking-tight">Planes y Membresías</h2>
          <p className="text-gray-500 mt-2 font-medium">Configura los paquetes que ofreces en tu gimnasio.</p>
        </div>
        <button 
          onClick={abrirModalCrear}
          className="bg-[#4a24ff] hover:bg-[#3616d9] text-white px-6 py-3 rounded-xl font-bold transition-all shadow-[0_8px_20px_rgba(74,36,255,0.25)] hover:-translate-y-0.5"
        >
          + Nueva Membresía
        </button>
      </header>

      {/* --- INICIO DEL MODAL CREAR/EDITAR --- */}
      {mostrarModal && (
        <div className="fixed inset-0 bg-[#1a1446]/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md border border-gray-100">
            <h3 className="text-2xl font-black text-[#1a1446] mb-6">
              {membresiaEditando ? 'Editar Plan' : 'Crear Nuevo Plan'}
            </h3>
            
            <form onSubmit={guardarMembresia} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-500 mb-2 uppercase tracking-wide">Nombre del Plan</label>
                <input 
                  type="text" name="nombre" value={formulario.nombre} onChange={manejarCambio} required
                  className="w-full bg-gray-50 border border-transparent rounded-xl px-4 py-3 focus:bg-white focus:border-[#4a24ff] focus:ring-4 focus:ring-[#f4edff] outline-none transition-all font-medium text-[#1a1446]"
                  placeholder="Ej: Plan VIP Anual"
                />
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-bold text-gray-500 mb-2 uppercase tracking-wide">Precio (Bs.)</label>
                  <input 
                    type="number" step="0.01" name="precio" value={formulario.precio} onChange={manejarCambio} required
                    className="w-full bg-gray-50 border border-transparent rounded-xl px-4 py-3 focus:bg-white focus:border-[#4a24ff] focus:ring-4 focus:ring-[#f4edff] outline-none transition-all font-medium text-[#1a1446]"
                    placeholder="Ej: 200.00"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-bold text-gray-500 mb-2 uppercase tracking-wide">Duración (Días)</label>
                  <input 
                    type="number" name="duracionDias" value={formulario.duracionDias} onChange={manejarCambio} required
                    className="w-full bg-gray-50 border border-transparent rounded-xl px-4 py-3 focus:bg-white focus:border-[#4a24ff] focus:ring-4 focus:ring-[#f4edff] outline-none transition-all font-medium text-[#1a1446]"
                    placeholder="Ej: 30"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-500 mb-2 uppercase tracking-wide">Descripción</label>
                <textarea 
                  name="descripcion" value={formulario.descripcion} onChange={manejarCambio} rows={3}
                  className="w-full bg-gray-50 border border-transparent rounded-xl px-4 py-3 focus:bg-white focus:border-[#4a24ff] focus:ring-4 focus:ring-[#f4edff] outline-none transition-all font-medium text-[#1a1446] resize-none"
                  placeholder="Detalles de lo que incluye este plan..."
                ></textarea>
              </div>

              <div className="flex justify-end space-x-3 mt-8 pt-4">
                <button 
                  type="button" onClick={() => { setMostrarModal(false); setMembresiaEditando(null); }}
                  className="px-6 py-3 text-gray-500 hover:bg-gray-100 rounded-xl font-bold transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="bg-[#4a24ff] hover:bg-[#3616d9] text-white px-6 py-3 rounded-xl font-bold transition-all shadow-[0_4px_12px_rgba(74,36,255,0.2)]"
                >
                  {membresiaEditando ? 'Guardar Cambios' : 'Guardar Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- NUEVO: MODAL PARA VER SUSCRITOS --- */}
      {mostrarModalSuscritos && (
        <div className="fixed inset-0 bg-[#1a1446]/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-sm border border-gray-100 relative">
            <button 
              onClick={() => setMostrarModalSuscritos(false)}
              className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200 font-bold"
            >
              ✕
            </button>
            
            <h3 className="text-2xl font-black text-[#1a1446] mb-1">Clientes Activos</h3>
            <p className="text-[#4a24ff] font-bold text-sm uppercase tracking-wide mb-6">
              {nombrePlanViendo}
            </p>

            <div className="max-h-60 overflow-y-auto pr-2">
              {cargandoSuscritos ? (
                <p className="text-center text-gray-400 font-medium py-4">Buscando clientes...</p>
              ) : nombresSuscritos.length === 0 ? (
                <div className="text-center py-6 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="text-3xl mb-2 block">👻</span>
                  <p className="text-gray-500 font-medium text-sm">Nadie está suscrito a este plan actualmente.</p>
                </div>
              ) : (
                <ul className="space-y-2">
                  {nombresSuscritos.map((nombre, i) => (
                    <li key={i} className="bg-[#f4edff] text-[#1a1446] font-bold px-4 py-3 rounded-xl border border-[#4a24ff]/10 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-white text-[#4a24ff] flex items-center justify-center text-xs shadow-sm">
                        {nombre.charAt(0)}
                      </div>
                      {nombre}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center">
              <span className="text-gray-500 font-medium text-sm">Total inscritos:</span>
              <span className="bg-[#1a1446] text-white px-3 py-1 rounded-lg font-black">{nombresSuscritos.length}</span>
            </div>
          </div>
        </div>
      )}

      {/* --- TABLA DE MEMBRESÍAS --- */}
      <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-50 overflow-hidden relative z-0">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#fafafa] border-b border-gray-100">
              <th className="p-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Plan</th>
              <th className="p-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Precio</th>
              <th className="p-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Duración</th>
              <th className="p-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Descripción</th>
              <th className="p-5 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {membresias.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-12 text-center text-gray-400 font-medium">
                  Cargando planes o no hay planes registrados.
                </td>
              </tr>
            ) : (
              membresias.map((membresia) => (
                <tr key={membresia.idMembresia} className="hover:bg-[#fafafa] transition-colors group">
                  <td className="p-5 font-bold text-[#1a1446]">{membresia.nombre}</td>
                  <td className="p-5 text-[#4a24ff] font-bold">
                    Bs. {membresia.precio.toFixed(2)}
                  </td>
                  <td className="p-5 text-gray-500 font-medium">
                    {membresia.duracionDias} días
                  </td>
                  <td className="p-5 text-gray-500 text-sm">
                    {membresia.descripcion || '—'}
                  </td>
                  <td className="p-5 text-right space-x-2">
                    {/* NUEVO: Botón Ver Suscritos */}
                    <button 
                      onClick={() => verSuscritos(membresia.idMembresia, membresia.nombre)}
                      className="w-10 h-10 inline-flex items-center justify-center rounded-xl text-[#00a870] hover:bg-[#e0f8f1] transition-colors"
                      title="Ver Clientes Suscritos"
                    >
                      👥
                    </button>
                    {/* Botón Editar */}
                    <button 
                      onClick={() => abrirModalEditar(membresia)}
                      className="w-10 h-10 inline-flex items-center justify-center rounded-xl text-blue-500 hover:bg-blue-50 transition-colors"
                      title="Editar"
                    >
                      ✏️
                    </button>
                    {/* Botón Eliminar */}
                    <button 
                      onClick={() => eliminarMembresia(membresia.idMembresia)}
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