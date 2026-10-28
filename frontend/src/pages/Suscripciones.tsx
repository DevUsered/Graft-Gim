import { useState, useEffect } from 'react';
import { apiFetch } from '../utils/api';

interface Suscripcion {
  idSuscripcion: number;
  cliente: { idCliente: number; nombreCompleto: string };
  membresia: { idMembresia: number; nombre: string; precio: number };
  fechaInicio: string;
  fechaFin: string;
  estado: string;
}

interface Cliente { idCliente: number; nombreCompleto: string; carnetIdentidad: string; telefono: string; }
interface Membresia { idMembresia: number; nombre: string; precio: number; }

export default function Suscripciones() {
  const rolUsuario = localStorage.getItem('rol') || 'CAJERO';
  const [suscripciones, setSuscripciones] = useState<Suscripcion[]>([]);
  const [membresias, setMembresias] = useState<Membresia[]>([]);
  
  const [mostrarModal, setMostrarModal] = useState(false);
  const [suscripcionEditando, setSuscripcionEditando] = useState<number | null>(null);
  const [mostrarToast, setMostrarToast] = useState(false);
  const [mensajeToast, setMensajeToast] = useState("");

  const [carnetBuscar, setCarnetBuscar] = useState('');
  const [buscandoCliente, setBuscandoCliente] = useState(false);
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null);
  const [esNuevoCliente, setEsNuevoCliente] = useState(false);
  
  const [formulario, setFormulario] = useState({ idMembresia: '', estado: 'VIGENTE' });
  const [nuevoClienteForm, setNuevoClienteForm] = useState({ nombreCompleto: '', telefono: '' });

  const cargarDatos = () => {
    apiFetch('/api/suscripciones')
    .then(res => res.json())
    .then(datos => setSuscripciones(datos));
      
    apiFetch('/api/membresias')
    .then(res => res.json())
    .then(datos => setMembresias(datos));
  };

  useEffect(() => { cargarDatos(); }, []);

  const manejarCambio = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    setFormulario({ ...formulario, [e.target.name]: e.target.value });
  };
  
  const manejarCambioNuevoCliente = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNuevoClienteForm({ ...nuevoClienteForm, [e.target.name]: e.target.value });
  };

  const abrirModalCrear = () => {
    setFormulario({ idMembresia: '', estado: 'VIGENTE' });
    setCarnetBuscar('');
    setClienteSeleccionado(null);
    setEsNuevoCliente(false);
    setNuevoClienteForm({ nombreCompleto: '', telefono: '' });
    setSuscripcionEditando(null);
    setMostrarModal(true);
  };

  const abrirModalEditar = (sub: Suscripcion) => {
    setFormulario({ idMembresia: sub.membresia.idMembresia.toString(), estado: sub.estado });
    setClienteSeleccionado(sub.cliente as Cliente);
    setEsNuevoCliente(false);
    setSuscripcionEditando(sub.idSuscripcion);
    setMostrarModal(true);
  };

  const buscarClientePorCarnet = async () => {
    if (!carnetBuscar.trim()) return;
    
    setBuscandoCliente(true);
    try {
      const res = await apiFetch(`/api/clientes/buscar/${carnetBuscar}`);

      if (res.ok) {
        const clienteEncontrado = await res.json();
        setClienteSeleccionado(clienteEncontrado);
        setEsNuevoCliente(false);
      } else if (res.status === 404) {
        setClienteSeleccionado(null);
        setEsNuevoCliente(true);
      }
    } catch (error) {
      console.error("Error buscando cliente:", error);
    } finally {
      setBuscandoCliente(false);
    }
  };

  const guardarSuscripcion = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      let idDelCliente = suscripcionEditando && clienteSeleccionado ? clienteSeleccionado.idCliente : 0;

      if (!suscripcionEditando && esNuevoCliente) {
        const resCliente = await apiFetch('/api/clientes', {
          method: 'POST',
          body: JSON.stringify({
            carnetIdentidad: carnetBuscar,
            nombreCompleto: nuevoClienteForm.nombreCompleto,
            telefono: nuevoClienteForm.telefono
          })
        });

        if (!resCliente.ok) {
          const errTexto = await resCliente.text();
          throw new Error(errTexto || "Error al registrar el nuevo cliente");
        }
        const clienteCreado = await resCliente.json();
        idDelCliente = clienteCreado.idCliente; 
      } else if (!suscripcionEditando && clienteSeleccionado) {
        idDelCliente = clienteSeleccionado.idCliente;
      }

      if (!idDelCliente) throw new Error("Debes buscar un cliente o ingresar sus datos.");

      const cargaUtil = {
        cliente: { idCliente: idDelCliente },
        membresia: { idMembresia: parseInt(formulario.idMembresia) },
        estado: formulario.estado
      };

      const url = suscripcionEditando 
        ? `/api/suscripciones/${suscripcionEditando}`
        : `/api/suscripciones`;

      const resSub = await apiFetch(url, {
        method: suscripcionEditando ? 'PUT' : 'POST',
        body: JSON.stringify(cargaUtil)
      });

      if (!resSub.ok) throw new Error("Error al guardar la suscripción");

      if (!suscripcionEditando) {
        const membresiaSeleccionada = membresias.find(m => m.idMembresia === parseInt(formulario.idMembresia));
        if (membresiaSeleccionada) {
          const nombreDelCliente = esNuevoCliente ? nuevoClienteForm.nombreCompleto : clienteSeleccionado?.nombreCompleto;
          await apiFetch('/api/pagos', {
            method: 'POST',
            body: JSON.stringify({
              monto: membresiaSeleccionada.precio,
              concepto: `Plan: ${membresiaSeleccionada.nombre}\n${nombreDelCliente}`,
              metodoPago: 'EFECTIVO' 
            })
          });
        }
      }

      setMostrarModal(false);
      cargarDatos();
      setMensajeToast(suscripcionEditando ? "Suscripción actualizada" : "Suscripción y cobro registrados ✅");
      setMostrarToast(true);
      setTimeout(() => setMostrarToast(false), 3000);

    } catch (error) {
      const mensaje = error instanceof Error ? error.message : "Ocurrió un error desconocido";
      alert("Error: " + mensaje);
      console.error("Error al guardar:", error);
    }
  };

  const eliminarSuscripcion = (id: number) => {
    if (window.confirm("¿Anular esta suscripción?")) {
      apiFetch(`/api/suscripciones/${id}`, {
        method: 'DELETE',
      }).then(() => {
        cargarDatos();
        setMensajeToast("Suscripción anulada");
        setMostrarToast(true);
        setTimeout(() => setMostrarToast(false), 3000);
      });
    }
  };

  return (
    // ⚡ 1. FONDO TRANSPARENTE, TEXTO CLARO
    <div className="p-4 lg:p-8 min-h-full text-white relative">
      
      {/* ⚡ CABECERA */}
      <header className="mb-10 flex flex-col md:flex-row md:justify-between md:items-end gap-4 relative z-10">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tight drop-shadow-md">Suscripciones y Caja</h2>
          <p className="text-white/60 mt-2 font-medium drop-shadow-sm">Gestiona las membresías de tus clientes de forma rápida.</p>
        </div>
        <button onClick={abrirModalCrear} className="bg-[#4a24ff] hover:bg-[#3616d9] text-white px-6 py-3 rounded-xl font-bold transition-all shadow-[0_8px_20px_rgba(74,36,255,0.4)] hover:-translate-y-0.5 border border-[#4a24ff]/50">
          + Nueva Venta
        </button>
      </header>

      {/* ⚡ MODAL INTELIGENTE GLASSMORPHISM */}
      {mostrarModal && (
        <div className="fixed inset-0 bg-[#1a1446]/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white/10 backdrop-blur-2xl p-8 rounded-3xl shadow-2xl w-full max-w-md border border-white/20 custom-scrollbar max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-black text-white mb-6 drop-shadow-md">
              {suscripcionEditando ? 'Editar Suscripción' : 'Nueva Suscripción'}
            </h3>
            
            <form onSubmit={guardarSuscripcion} className="space-y-5">
              
              {/* PASO 1: BÚSQUEDA DE CLIENTE */}
              {!suscripcionEditando ? (
                <div>
                  <label className="block text-sm font-bold text-white/60 mb-2 uppercase">Carnet de Identidad</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" value={carnetBuscar} onChange={(e) => setCarnetBuscar(e.target.value)} required
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:bg-white/10 focus:ring-2 focus:ring-[#4a24ff] font-medium text-white placeholder-white/30 transition-all"
                      placeholder="Ej: 1234567"
                    />
                    <button 
                      type="button" onClick={buscarClientePorCarnet} disabled={buscandoCliente}
                      className="bg-white/10 hover:bg-white/20 text-white px-4 rounded-xl font-bold transition-colors border border-white/10 disabled:opacity-50"
                    >
                      {buscandoCliente ? '...' : 'Buscar'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                  <p className="text-sm text-white/50 font-bold uppercase drop-shadow-sm">Cliente Actual</p>
                  <p className="font-black text-white drop-shadow-sm">{clienteSeleccionado?.nombreCompleto}</p>
                </div>
              )}

              {/* RESULTADO DE LA BÚSQUEDA */}
              {clienteSeleccionado && !suscripcionEditando && (
                <div className="bg-green-500/20 border border-green-500/30 p-4 rounded-xl flex items-center gap-3 backdrop-blur-sm">
                  <span className="text-green-300 font-bold text-xl drop-shadow-sm">✓</span>
                  <div>
                    <p className="text-green-300 font-bold text-sm drop-shadow-sm">Cliente Encontrado</p>
                    <p className="text-white font-black drop-shadow-sm">{clienteSeleccionado.nombreCompleto}</p>
                  </div>
                </div>
              )}

              {esNuevoCliente && !suscripcionEditando && (
                <div className="bg-[#4a24ff]/20 border border-[#4a24ff]/30 p-4 rounded-xl space-y-3 animate-fade-in backdrop-blur-sm">
                  <p className="text-[#a78bfa] font-bold text-sm drop-shadow-sm">✨ Nuevo Cliente: Completa sus datos</p>
                  <input 
                    type="text" name="nombreCompleto" value={nuevoClienteForm.nombreCompleto} onChange={manejarCambioNuevoCliente} required
                    className="w-full bg-black/20 rounded-lg px-3 py-2 text-sm outline-none border border-white/10 focus:border-[#a78bfa] text-white placeholder-white/40 transition-colors"
                    placeholder="Nombre Completo"
                  />
                  <input 
                    type="text" name="telefono" value={nuevoClienteForm.telefono} onChange={manejarCambioNuevoCliente}
                    className="w-full bg-black/20 rounded-lg px-3 py-2 text-sm outline-none border border-white/10 focus:border-[#a78bfa] text-white placeholder-white/40 transition-colors"
                    placeholder="Teléfono"
                  />
                </div>
              )}

              {/* PASO 2: SELECCIÓN DE PLAN */}
              <div>
                <label className="block text-sm font-bold text-white/60 mb-2 uppercase">Plan de Membresía</label>
                <select 
                  name="idMembresia" value={formulario.idMembresia} onChange={manejarCambio} required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:bg-white/10 focus:ring-2 focus:ring-[#4a24ff] font-medium text-white cursor-pointer appearance-none"
                >
                  <option value="" disabled className="bg-[#1a1446]">-- Elige un plan --</option>
                  {membresias.map(mem => (
                    <option key={mem.idMembresia} value={mem.idMembresia} className="bg-[#1a1446]">
                      {mem.nombre} - Bs. {mem.precio}
                    </option>
                  ))}
                </select>
              </div>

              {suscripcionEditando && (
                <div>
                  <label className="block text-sm font-bold text-white/60 mb-2 uppercase">Estado</label>
                  <select 
                    name="estado" value={formulario.estado} onChange={manejarCambio} required
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:bg-white/10 focus:ring-2 focus:ring-[#4a24ff] font-medium text-white appearance-none"
                  >
                    <option value="VIGENTE" className="bg-[#1a1446]">VIGENTE</option>
                    <option value="INACTIVO" className="bg-[#1a1446]">INACTIVO</option>
                  </select>
                </div>
              )}

              <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-white/10">
                <button 
                    type="button" 
                    onClick={() => { setMostrarModal(false); setSuscripcionEditando(null); }} 
                    className="px-6 py-3 text-white/60 hover:bg-white/5 hover:text-white rounded-xl font-bold transition-colors"
                  >
                    Cancelar
                  </button>
                <button type="submit" disabled={!clienteSeleccionado && !esNuevoCliente} className="bg-[#4a24ff] hover:bg-[#3616d9] text-white px-6 py-3 rounded-xl font-bold transition-all shadow-[0_4px_12px_rgba(74,36,255,0.4)] border border-[#4a24ff]/50 disabled:opacity-50 disabled:cursor-not-allowed">
                  {suscripcionEditando ? 'Guardar Cambios' : 'Cobrar y Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ⚡ TABLA DE SUSCRIPCIONES DE CRISTAL */}
      <div className="bg-white/5 backdrop-blur-xl rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.2)] border border-white/10 overflow-x-auto relative z-10 custom-scrollbar">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-black/20 border-b border-white/10">
              <th className="p-5 text-xs font-bold text-white/50 uppercase tracking-wider">Cliente</th>
              <th className="p-5 text-xs font-bold text-white/50 uppercase tracking-wider">Plan</th>
              <th className="p-5 text-xs font-bold text-white/50 uppercase tracking-wider">Inicio</th>
              <th className="p-5 text-xs font-bold text-white/50 uppercase tracking-wider">Vencimiento</th>
              <th className="p-5 text-xs font-bold text-white/50 uppercase tracking-wider">Estado</th>
              <th className="p-5 text-xs font-bold text-white/50 uppercase tracking-wider text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {suscripciones.length === 0 ? (
              <tr><td colSpan={6} className="p-12 text-center text-white/40 font-medium">No hay suscripciones registradas todavía.</td></tr>
            ) : (
              suscripciones.map((sub) => (
                <tr key={sub.idSuscripcion} className="hover:bg-white/5 transition-colors group">
                  <td className="p-5 font-bold text-white drop-shadow-sm">{sub.cliente?.nombreCompleto}</td>
                  <td className="p-5 text-[#a78bfa] font-bold drop-shadow-sm">{sub.membresia?.nombre}</td>
                  <td className="p-5 text-white/70 font-medium">{sub.fechaInicio}</td>
                  <td className="p-5 font-bold text-white drop-shadow-sm">{sub.fechaFin}</td>
                  <td className="p-5">
                    <span className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-wide border ${sub.estado === 'VIGENTE' ? 'bg-green-500/20 text-green-300 border-green-500/30' : 'bg-red-500/20 text-red-300 border-red-500/30'}`}>
                      {sub.estado}
                    </span>
                  </td>
                  <td className="p-5 text-right space-x-2">
                    <button onClick={() => abrirModalEditar(sub)} className="w-10 h-10 inline-flex items-center justify-center rounded-xl bg-blue-500/10 text-blue-300 border border-transparent hover:border-blue-500/30 hover:bg-blue-500/20 transition-all" title="Editar">✏️</button>
                    {rolUsuario === 'ADMIN' && (
                    <button onClick={() => eliminarSuscripcion(sub.idSuscripcion)} className="w-10 h-10 inline-flex items-center justify-center rounded-xl bg-red-500/10 text-red-300 border border-transparent hover:border-red-500/30 hover:bg-red-500/20 transition-all" title="Eliminar">🗑️</button>
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
          <div className="bg-[#00a870] text-white rounded-full w-8 h-8 flex justify-center items-center font-bold shadow-md">✓</div>
          <span className="font-medium tracking-wide drop-shadow-sm">{mensajeToast}</span>
        </div>
      )}
    </div>
  );
}