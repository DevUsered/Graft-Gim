import { useState, useEffect } from 'react';
import { apiFetch } from '../utils/api';

interface Membresia {
  idMembresia: number;
  nombre: string;
  precio: number;
  duracionDias: number;
  descripcion: string;
}

interface SuscripcionAPI {
  idSuscripcion: number;
  estado: string;
  cliente: { nombreCompleto: string };
  membresia: { idMembresia: number };
}

export default function Membresias() {
  const rolUsuario = localStorage.getItem('rol') || 'CAJERO';
  const [membresias, setMembresias] = useState<Membresia[]>([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  
  const [membresiaEditando, setMembresiaEditando] = useState<number | null>(null);
  const [mostrarToast, setMostrarToast] = useState(false);
  const [mensajeToast, setMensajeToast] = useState("");
  
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
    apiFetch('/api/membresias')
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

  const verSuscritos = async (idMembresia: number, nombrePlan: string) => {
    setNombrePlanViendo(nombrePlan);
    setNombresSuscritos([]);
    setCargandoSuscritos(true);
    setMostrarModalSuscritos(true);

    try {
      const res = await apiFetch('/api/suscripciones');
      
      if (res.ok) {
        const todasLasSuscripciones: SuscripcionAPI[] = await res.json();
        
        const clientesEnEstePlan = todasLasSuscripciones
          .filter(sub => sub.membresia?.idMembresia === idMembresia && sub.estado === 'VIGENTE')
          .map(sub => sub.cliente?.nombreCompleto);
          
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

    const endpoint = membresiaEditando ? `/api/membresias/${membresiaEditando}` : `/api/membresias`;
    const metodo = membresiaEditando ? 'PUT' : 'POST';

    apiFetch(endpoint, {
      method: metodo,
      body: JSON.stringify({
        ...formulario,
        precio: parseFloat(formulario.precio),
        duracionDias: parseInt(formulario.duracionDias)
      })
    })
    .then(async (respuesta) =>{
      if(!respuesta.ok){
        const errorTexto = await respuesta.text();
        throw new Error(errorTexto || "Ocurrió un error al guardar el plan.")
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
      apiFetch(`/api/membresias/${id}`, {
        method: 'DELETE'
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
    // ⚡ FONDO TRANSPARENTE, TEXTO CLARO
    <div className="p-4 lg:p-8 min-h-full text-white relative">
      
      {/* ⚡ CABECERA */}
      <header className="mb-10 flex flex-col md:flex-row md:justify-between md:items-end gap-4 relative z-10">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tight drop-shadow-md">Planes y Membresías</h2>
          <p className="text-white/60 mt-2 font-medium drop-shadow-sm">Configura los paquetes que ofreces en tu gimnasio.</p>
        </div>
        {rolUsuario ==='ADMIN' &&(
        <button 
          onClick={abrirModalCrear}
          className="bg-[#4a24ff] hover:bg-[#3616d9] text-white px-6 py-3 rounded-xl font-bold transition-all shadow-[0_8px_20px_rgba(74,36,255,0.4)] hover:-translate-y-0.5 border border-[#4a24ff]/50"
        >
          + Nueva Membresía
        </button>
        )}
      </header>

      {/* ⚡ MODAL CREAR/EDITAR GLASSMORPHISM */}
      {mostrarModal && (
        <div className="fixed inset-0 bg-[#1a1446]/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white/10 backdrop-blur-2xl p-8 rounded-3xl shadow-2xl w-full max-w-md border border-white/20">
            <h3 className="text-2xl font-black text-white mb-6 drop-shadow-md">
              {membresiaEditando ? 'Editar Plan' : 'Crear Nuevo Plan'}
            </h3>
            
            <form onSubmit={guardarMembresia} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-white/60 mb-2 uppercase tracking-wide">Nombre del Plan</label>
                <input 
                  type="text" name="nombre" value={formulario.nombre} onChange={manejarCambio} required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:bg-white/10 focus:border-[#4a24ff] focus:ring-4 focus:ring-[#4a24ff]/30 outline-none transition-all font-medium text-white placeholder-white/30"
                  placeholder="Ej: Plan VIP Anual"
                />
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-bold text-white/60 mb-2 uppercase tracking-wide">Precio (Bs.)</label>
                  <input 
                    type="number" step="0.01" name="precio" value={formulario.precio} onChange={manejarCambio} required
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:bg-white/10 focus:border-[#4a24ff] focus:ring-4 focus:ring-[#4a24ff]/30 outline-none transition-all font-medium text-white placeholder-white/30"
                    placeholder="Ej: 200.00"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-bold text-white/60 mb-2 uppercase tracking-wide">Duración (Días)</label>
                  <input 
                    type="number" name="duracionDias" value={formulario.duracionDias} onChange={manejarCambio} required
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:bg-white/10 focus:border-[#4a24ff] focus:ring-4 focus:ring-[#4a24ff]/30 outline-none transition-all font-medium text-white placeholder-white/30"
                    placeholder="Ej: 30"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-white/60 mb-2 uppercase tracking-wide">Descripción</label>
                <textarea 
                  name="descripcion" value={formulario.descripcion} onChange={manejarCambio} rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:bg-white/10 focus:border-[#4a24ff] focus:ring-4 focus:ring-[#4a24ff]/30 outline-none transition-all font-medium text-white resize-none placeholder-white/30"
                  placeholder="Detalles de lo que incluye este plan..."
                ></textarea>
              </div>

              <div className="flex justify-end space-x-3 mt-8 pt-4 border-t border-white/10">
                <button 
                  type="button" onClick={() => { setMostrarModal(false); setMembresiaEditando(null); }}
                  className="px-6 py-3 text-white/60 hover:bg-white/5 hover:text-white rounded-xl font-bold transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="bg-[#4a24ff] hover:bg-[#3616d9] text-white px-6 py-3 rounded-xl font-bold transition-all shadow-[0_4px_12px_rgba(74,36,255,0.4)] border border-[#4a24ff]/50"
                >
                  {membresiaEditando ? 'Guardar Cambios' : 'Guardar Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ⚡ MODAL SUSCRITOS GLASSMORPHISM */}
      {mostrarModalSuscritos && (
        <div className="fixed inset-0 bg-[#1a1446]/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white/10 backdrop-blur-2xl p-8 rounded-3xl shadow-2xl w-full max-w-sm border border-white/20 relative">
            <button 
              onClick={() => setMostrarModalSuscritos(false)}
              className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center bg-white/10 rounded-full text-white/60 hover:bg-white/20 hover:text-white font-bold transition-colors"
            >
              ✕
            </button>
            
            <h3 className="text-2xl font-black text-white mb-1 drop-shadow-md">Clientes Activos</h3>
            <p className="text-[#a78bfa] font-bold text-sm uppercase tracking-wide mb-6 drop-shadow-sm">
              {nombrePlanViendo}
            </p>

            <div className="max-h-60 overflow-y-auto pr-2 custom-scrollbar">
              {cargandoSuscritos ? (
                <p className="text-center text-white/40 font-medium py-4">Buscando clientes...</p>
              ) : nombresSuscritos.length === 0 ? (
                <div className="text-center py-6 bg-white/5 rounded-xl border border-white/10">
                  <span className="text-3xl mb-2 block drop-shadow-md">👻</span>
                  <p className="text-white/50 font-medium text-sm">Nadie está suscrito a este plan actualmente.</p>
                </div>
              ) : (
                <ul className="space-y-2">
                  {nombresSuscritos.map((nombre, i) => (
                    <li key={i} className="bg-[#4a24ff]/20 text-white font-bold px-4 py-3 rounded-xl border border-[#4a24ff]/30 flex items-center gap-3 backdrop-blur-sm">
                      <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 text-[#a78bfa] flex items-center justify-center text-xs shadow-sm">
                        {nombre.charAt(0)}
                      </div>
                      <span className="drop-shadow-sm">{nombre}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            
            <div className="mt-6 pt-4 border-t border-white/10 flex justify-between items-center">
              <span className="text-white/60 font-medium text-sm">Total inscritos:</span>
              <span className="bg-[#4a24ff] text-white px-3 py-1 rounded-lg font-black shadow-md border border-[#4a24ff]/50">{nombresSuscritos.length}</span>
            </div>
          </div>
        </div>
      )}

      {/* ⚡ TABLA DE MEMBRESÍAS DE CRISTAL */}
      <div className="bg-white/5 backdrop-blur-xl rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.2)] border border-white/10 overflow-x-auto relative z-10 custom-scrollbar">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-black/20 border-b border-white/10">
              <th className="p-5 text-xs font-bold text-white/50 uppercase tracking-wider">Plan</th>
              <th className="p-5 text-xs font-bold text-white/50 uppercase tracking-wider">Precio</th>
              <th className="p-5 text-xs font-bold text-white/50 uppercase tracking-wider">Duración</th>
              <th className="p-5 text-xs font-bold text-white/50 uppercase tracking-wider">Descripción</th>
              <th className="p-5 text-xs font-bold text-white/50 uppercase tracking-wider text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {membresias.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-12 text-center text-white/40 font-medium">
                  Cargando planes o no hay planes registrados.
                </td>
              </tr>
            ) : (
              membresias.map((membresia) => (
                <tr key={membresia.idMembresia} className="hover:bg-white/5 transition-colors group">
                  <td className="p-5 font-bold text-white drop-shadow-sm">{membresia.nombre}</td>
                  <td className="p-5 text-green-400 font-bold drop-shadow-sm">
                    Bs. {membresia.precio.toFixed(2)}
                  </td>
                  <td className="p-5 text-white/70 font-medium">
                    {membresia.duracionDias} días
                  </td>
                  <td className="p-5 text-white/50 text-sm">
                    {membresia.descripcion || '—'}
                  </td>
                  <td className="p-5 text-right space-x-2">
                    {/* Botón Ver Suscritos */}
                    <button 
                      onClick={() => verSuscritos(membresia.idMembresia, membresia.nombre)}
                      className="w-10 h-10 inline-flex items-center justify-center rounded-xl bg-green-500/10 text-green-300 border border-transparent hover:border-green-500/30 hover:bg-green-500/20 transition-all"
                      title="Ver Clientes Suscritos"
                    >
                      👥
                    </button>
                    {/* Botones ADMIN */}
                    {rolUsuario ==='ADMIN' && (
                      <>
                    <button 
                      onClick={() => abrirModalEditar(membresia)}
                      className="w-10 h-10 inline-flex items-center justify-center rounded-xl bg-blue-500/10 text-blue-300 border border-transparent hover:border-blue-500/30 hover:bg-blue-500/20 transition-all"
                      title="Editar"
                    >
                      ✏️
                    </button>
                    <button 
                      onClick={() => eliminarMembresia(membresia.idMembresia)}
                      className="w-10 h-10 inline-flex items-center justify-center rounded-xl bg-red-500/10 text-red-300 border border-transparent hover:border-red-500/30 hover:bg-red-500/20 transition-all"
                      title="Eliminar"
                    >
                      🗑️
                    </button>
                    </>
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