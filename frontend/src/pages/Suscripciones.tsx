import { useState, useEffect } from 'react';

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
  const [suscripciones, setSuscripciones] = useState<Suscripcion[]>([]);
  const [membresias, setMembresias] = useState<Membresia[]>([]);
  
  const [mostrarModal, setMostrarModal] = useState(false);
  const [suscripcionEditando, setSuscripcionEditando] = useState<number | null>(null);
  const [mostrarToast, setMostrarToast] = useState(false);
  const [mensajeToast, setMensajeToast] = useState("");

  // ESTADOS PARA LA BÚSQUEDA INTELIGENTE
  const [carnetBuscar, setCarnetBuscar] = useState('');
  const [buscandoCliente, setBuscandoCliente] = useState(false);
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null);
  const [esNuevoCliente, setEsNuevoCliente] = useState(false);
  
  // ESTADOS DEL FORMULARIO
  const [formulario, setFormulario] = useState({ idMembresia: '', estado: 'VIGENTE' });
  const [nuevoClienteForm, setNuevoClienteForm] = useState({ nombreCompleto: '', telefono: '' });

  const cargarDatos = () => {
    fetch(`${import.meta.env.VITE_API_URL}/api/suscripciones`, {
      headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
    }).then(res => res.json()).then(datos => setSuscripciones(datos));
      
    fetch(`${import.meta.env.VITE_API_URL}/api/membresias`, {
      headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
    }).then(res => res.json()).then(datos => setMembresias(datos));
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
    setClienteSeleccionado(sub.cliente as Cliente); // Al editar, ya conocemos al cliente
    setEsNuevoCliente(false);
    setSuscripcionEditando(sub.idSuscripcion);
    setMostrarModal(true);
  };

  // --- LA MAGIA: Buscar cliente en el backend ---
  const buscarClientePorCarnet = async () => {
    if (!carnetBuscar.trim()) return;
    
    setBuscandoCliente(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/clientes/buscar/${carnetBuscar}`, {
        headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
      });

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

  // --- EL GUARDADO DE DOS PASOS ---
  const guardarSuscripcion = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      let idDelCliente = suscripcionEditando && clienteSeleccionado ? clienteSeleccionado.idCliente : 0;

      // FASE 1: Si es nuevo cliente, lo creamos primero silenciosamente
      if (!suscripcionEditando && esNuevoCliente) {
        const resCliente = await fetch(`${import.meta.env.VITE_API_URL}/api/clientes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + localStorage.getItem('token') },
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
        idDelCliente = clienteCreado.idCliente; // Capturamos el ID del nuevo cliente
      } else if (!suscripcionEditando && clienteSeleccionado) {
        idDelCliente = clienteSeleccionado.idCliente;
      }

      if (!idDelCliente) throw new Error("Debes buscar un cliente o ingresar sus datos.");

      // FASE 2: Crear la suscripción vinculada
      const cargaUtil = {
        cliente: { idCliente: idDelCliente },
        membresia: { idMembresia: parseInt(formulario.idMembresia) },
        estado: formulario.estado
      };

      const url = suscripcionEditando 
        ? `${import.meta.env.VITE_API_URL}/api/suscripciones/${suscripcionEditando}`
        : `${import.meta.env.VITE_API_URL}/api/suscripciones`;

      const resSub = await fetch(url, {
        method: suscripcionEditando ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + localStorage.getItem('token') },
        body: JSON.stringify(cargaUtil)
      });

      if (!resSub.ok) throw new Error("Error al guardar la suscripción");

      // AUTOMATIZACIÓN DE PAGOS (Tu código original)
      if (!suscripcionEditando) {
        const membresiaSeleccionada = membresias.find(m => m.idMembresia === parseInt(formulario.idMembresia));
        if (membresiaSeleccionada) {
          await fetch(`${import.meta.env.VITE_API_URL}/api/pagos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + localStorage.getItem('token') },
            body: JSON.stringify({
              monto: membresiaSeleccionada.precio,
              concepto: `Plan: ${membresiaSeleccionada.nombre}`,
              metodoPago: 'EFECTIVO' 
            })
          });
        }
      }

      // CIERRE EXITOSO
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
      fetch(`${import.meta.env.VITE_API_URL}/api/suscripciones/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
      }).then(() => {
        cargarDatos();
        setMensajeToast("Suscripción anulada");
        setMostrarToast(true);
        setTimeout(() => setMostrarToast(false), 3000);
      });
    }
  };

  return (
    <div className="p-4 lg:p-8">
      <header className="mb-10 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <h2 className="text-4xl font-black text-[#1a1446] tracking-tight">Suscripciones y Caja</h2>
          <p className="text-gray-500 mt-2 font-medium">Gestiona las membresías de tus clientes de forma rápida.</p>
        </div>
        <button onClick={abrirModalCrear} className="bg-[#4a24ff] hover:bg-[#3616d9] text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg hover:-translate-y-0.5">
          + Nueva Venta
        </button>
      </header>

      {/* --- INICIO DEL MODAL INTELIGENTE --- */}
      {mostrarModal && (
        <div className="fixed inset-0 bg-[#1a1446]/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md border border-gray-100">
            <h3 className="text-2xl font-black text-[#1a1446] mb-6">
              {suscripcionEditando ? 'Editar Suscripción' : 'Nueva Suscripción'}
            </h3>
            
            <form onSubmit={guardarSuscripcion} className="space-y-5">
              
              {/* PASO 1: BÚSQUEDA DE CLIENTE */}
              {!suscripcionEditando ? (
                <div>
                  <label className="block text-sm font-bold text-gray-500 mb-2 uppercase">Carnet de Identidad</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" value={carnetBuscar} onChange={(e) => setCarnetBuscar(e.target.value)} required
                      className="w-full bg-gray-50 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#4a24ff] font-medium"
                      placeholder="Ej: 1234567"
                    />
                    <button 
                      type="button" onClick={buscarClientePorCarnet} disabled={buscandoCliente}
                      className="bg-gray-100 hover:bg-gray-200 text-[#1a1446] px-4 rounded-xl font-bold transition-colors"
                    >
                      {buscandoCliente ? '...' : 'Buscar'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <p className="text-sm text-gray-500 font-bold uppercase">Cliente Actual</p>
                  <p className="font-black text-[#1a1446]">{clienteSeleccionado?.nombreCompleto}</p>
                </div>
              )}

              {/* RESULTADO DE LA BÚSQUEDA */}
              {clienteSeleccionado && !suscripcionEditando && (
                <div className="bg-[#e0f8f1] border border-[#00a870]/20 p-4 rounded-xl flex items-center gap-3">
                  <span className="text-[#00a870] font-bold text-xl">✓</span>
                  <div>
                    <p className="text-[#00a870] font-bold text-sm">Cliente Encontrado</p>
                    <p className="text-[#1a1446] font-black">{clienteSeleccionado.nombreCompleto}</p>
                  </div>
                </div>
              )}

              {esNuevoCliente && !suscripcionEditando && (
                <div className="bg-[#f4edff] border border-[#4a24ff]/20 p-4 rounded-xl space-y-3 animate-fade-in">
                  <p className="text-[#4a24ff] font-bold text-sm">✨ Nuevo Cliente: Completa sus datos</p>
                  <input 
                    type="text" name="nombreCompleto" value={nuevoClienteForm.nombreCompleto} onChange={manejarCambioNuevoCliente} required
                    className="w-full bg-white rounded-lg px-3 py-2 text-sm outline-none border border-transparent focus:border-[#4a24ff]"
                    placeholder="Nombre Completo"
                  />
                  <input 
                    type="text" name="telefono" value={nuevoClienteForm.telefono} onChange={manejarCambioNuevoCliente}
                    className="w-full bg-white rounded-lg px-3 py-2 text-sm outline-none border border-transparent focus:border-[#4a24ff]"
                    placeholder="Teléfono"
                  />
                </div>
              )}

              {/* PASO 2: SELECCIÓN DE PLAN */}
              <div>
                <label className="block text-sm font-bold text-gray-500 mb-2 uppercase">Plan de Membresía</label>
                <select 
                  name="idMembresia" value={formulario.idMembresia} onChange={manejarCambio} required
                  className="w-full bg-gray-50 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#4a24ff] font-medium cursor-pointer"
                >
                  <option value="" disabled>-- Elige un plan --</option>
                  {membresias.map(mem => (
                    <option key={mem.idMembresia} value={mem.idMembresia}>{mem.nombre} - Bs. {mem.precio}</option>
                  ))}
                </select>
              </div>

              {suscripcionEditando && (
                <div>
                  <label className="block text-sm font-bold text-gray-500 mb-2 uppercase">Estado</label>
                  <select 
                    name="estado" value={formulario.estado} onChange={manejarCambio} required
                    className="w-full bg-gray-50 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#4a24ff] font-medium"
                  >
                    <option value="VIGENTE">VIGENTE</option>
                    <option value="INACTIVO">INACTIVO</option>
                  </select>
                </div>
              )}

              <div className="flex justify-end gap-3 mt-8 pt-4">
                <button type="button" onClick={abrirModalCrear} className="px-6 py-3 text-gray-500 hover:bg-gray-100 rounded-xl font-bold">Cancelar</button>
                <button type="submit" disabled={!clienteSeleccionado && !esNuevoCliente} className="bg-[#4a24ff] hover:bg-[#3616d9] text-white px-6 py-3 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                  {suscripcionEditando ? 'Guardar Cambios' : 'Cobrar y Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- TABLA (Se mantiene igual que la tuya) --- */}
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
              <tr><td colSpan={6} className="p-12 text-center text-gray-400 font-medium">No hay suscripciones registradas todavía.</td></tr>
            ) : (
              suscripciones.map((sub) => (
                <tr key={sub.idSuscripcion} className="hover:bg-[#fafafa] transition-colors group">
                  <td className="p-5 font-bold text-[#1a1446]">{sub.cliente?.nombreCompleto}</td>
                  <td className="p-5 text-[#4a24ff] font-bold">{sub.membresia?.nombre}</td>
                  <td className="p-5 text-gray-500 font-medium">{sub.fechaInicio}</td>
                  <td className="p-5 font-bold text-[#1a1446]">{sub.fechaFin}</td>
                  <td className="p-5">
                    <span className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-wide ${sub.estado === 'VIGENTE' ? 'bg-[#e0f8f1] text-[#00a870]' : 'bg-red-50 text-red-600'}`}>
                      {sub.estado}
                    </span>
                  </td>
                  <td className="p-5 text-right space-x-2">
                    <button onClick={() => abrirModalEditar(sub)} className="w-10 h-10 rounded-xl text-blue-500 hover:bg-blue-50">✏️</button>
                    <button onClick={() => eliminarSuscripcion(sub.idSuscripcion)} className="w-10 h-10 rounded-xl text-red-500 hover:bg-red-50">🗑️</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {mostrarToast && (
        <div className="fixed bottom-8 right-8 bg-[#1a1446] text-white px-6 py-4 rounded-2xl shadow-xl flex items-center gap-4 animate-bounce z-50">
          <div className="bg-[#00a870] rounded-full w-8 h-8 flex justify-center items-center font-bold">✓</div>
          <span className="font-medium">{mensajeToast}</span>
        </div>
      )}
    </div>
  );
}