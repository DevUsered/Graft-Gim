import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '../utils/api';

// Interfaces
interface Cliente {
  idCliente: number;
  carnetIdentidad: string;
  nombreCompleto: string;
  estado: string;
}

interface Suscripcion {
  idSuscripcion: number;
  cliente: Cliente;
  membresia: { nombre: string };
  fechaInicio: string;
  fechaFin: string;
  estado: string;
}

interface Asistencia {
  idAsistencia: number;
  cliente: Cliente;
  fechaHora: string;
}

interface Producto {
  id: number; 
  nombre: string;
  precio: number;
  stock: number;
  categoria: string;
  imagen?: string;
}

interface ItemCarrito extends Producto {
  cantidad: number;
}

export default function Recepcion() {
  const [ciBuscado, setCiBuscado] = useState('');
  const [cargando, setCargando] = useState(false);
  const [resultado, setResultado] = useState<{ cliente?: Cliente; suscripcion?: Suscripcion } | null>(null);
  const [historial, setHistorial] = useState<Asistencia[]>([]);
  const [mensaje, setMensaje] = useState<{ texto: string; tipo: 'error' | 'exito' | 'info' } | null>(null);
  const [mostrarCalendario, setMostrarCalendario] = useState(false);

  const [productos, setProductos] = useState<Producto[]>([]);
  const [carrito, setCarrito] = useState<ItemCarrito[]>([]);
  const [procesandoCobro, setProcesandoCobro] = useState(false);
  const [categoriaActiva, setCategoriaActiva] = useState<string>('Todos');

  const cargarInventario = useCallback(async () => {
    try {
      const res = await apiFetch('/api/productos');
      const data = await res.json();
      if (Array.isArray(data)) setProductos(data);
    } catch (err) {
      console.error("Error al cargar productos:", err);
    }
  }, []);
  
  useEffect(() => {
    const inicializarRecepcion = async () => {
      await cargarInventario();
    };
    inicializarRecepcion();
  }, [cargarInventario]);

  const buscarCliente = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ciBuscado.trim()) return;

    setCargando(true);
    setMensaje(null);
    setResultado(null);
    setHistorial([]);

    try {
      const resCliente = await apiFetch(`/api/clientes/buscar/${ciBuscado.trim()}`);

      if (resCliente.status === 404) {
        setMensaje({ texto: 'No existe ningún cliente con ese Carnet de Identidad.', tipo: 'error' });
        setCargando(false);
        return;
      }
      const clienteEncontrado = await resCliente.json();

      const resSuscripcion = await apiFetch(`/api/suscripciones/cliente/${clienteEncontrado.idCliente}/activa`);
      const suscripcionActiva = resSuscripcion.ok ? await resSuscripcion.json() : null;

      const resAsistencias = await apiFetch(`/api/asistencias/cliente/${clienteEncontrado.idCliente}`);
      const asistenciasDelCliente = resAsistencias.ok ? await resAsistencias.json() : [];

      setHistorial(asistenciasDelCliente);
      setResultado({ cliente: clienteEncontrado, suscripcion: suscripcionActiva });

    } catch (error) {
      console.error("Error en la búsqueda:", error);
      setMensaje({ texto: 'Error de conexión con el servidor.', tipo: 'error' });
    } finally {
      setCargando(false);
    }
  };

  const productoPaseLibre = productos.find(p => p.nombre.toLowerCase().includes('pase'));
  const paseEnCarrito = carrito.find(item => item.id === productoPaseLibre?.id); // ⚡ CORRECCIÓN id

  const agregarAlCarrito = (prod: Producto) => {
    setCarrito(prev => {
      const existe = prev.find(item => item.id === prod.id); // ⚡ CORRECCIÓN id
      if (existe) {
        if (existe.cantidad >= prod.stock) {
          alert("Stock máximo alcanzado.");
          return prev;
        }
        return prev.map(item => item.id === prod.id ? { ...item, cantidad: item.cantidad + 1 } : item); // ⚡ CORRECCIÓN id
      }
      return [...prev, { ...prod, cantidad: 1 }];
    });
  };

  const quitarDelCarrito = (idProducto: number) => {
    setCarrito(prev => {
      const existe = prev.find(item => item.id === idProducto); // ⚡ CORRECCIÓN id
      if (existe && existe.cantidad > 1) {
        return prev.map(item => item.id === idProducto ? { ...item, cantidad: item.cantidad - 1 } : item); // ⚡ CORRECCIÓN id
      }
      return prev.filter(item => item.id !== idProducto); // ⚡ CORRECCIÓN id
    });
  };

  const eliminarDelCarrito = (idProducto: number) => {
    setCarrito(prev => prev.filter(item => item.id !== idProducto)); // ⚡ CORRECCIÓN id
  };

  const añadirPaseLibre = () => {
    if (!productoPaseLibre) {
      alert("El admin no ha creado el producto 'Pase Libre' en la Tienda.");
      return;
    }
    agregarAlCarrito(productoPaseLibre);
  };

  const calcularDiasRestantes = (fechaFin: string) => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0); 
    const fin = new Date(fechaFin + 'T00:00:00'); 
    return Math.ceil((fin.getTime() - hoy.getTime()) / (1000 * 3600 * 24));
  };

  const yaIngresoHoy = historial.some(a => a.fechaHora.startsWith(new Date().toISOString().split('T')[0]));
  const suscripcionActiva = resultado?.suscripcion && calcularDiasRestantes(resultado.suscripcion.fechaFin) > 0;

  const granTotal = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);

  const categoriasUnicas = ['Todos', ...Array.from(new Set(
    productos.filter(p => !p.nombre.toLowerCase().includes('pase')).map(p => p.categoria)
  ))];

  const productosFiltrados = productos.filter(p => {
    if (p.nombre.toLowerCase().includes('pase')) return false;
    if (categoriaActiva === 'Todos') return true;
    return p.categoria === categoriaActiva;
  });

  const procesarCobroFinal = async () => {
    setProcesandoCobro(true);
    setMensaje(null);

    try {
      const payloadCarrito: Record<string, number> = {};
      carrito.forEach(item => {
        payloadCarrito[item.id.toString()] = item.cantidad; // ⚡ CORRECCIÓN id
      });

      const requestBody = {
        incluyePaseLibre: !!paseEnCarrito,
        idCliente: suscripcionActiva ? resultado?.cliente?.idCliente : null,
        carritoProductos: payloadCarrito
      };

      const res = await apiFetch('/api/recepcion/cobrar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Error al procesar el cobro en el servidor.");
      }

      setMensaje({ texto: `✅ ¡Procesado con éxito! Total cobrado: Bs. ${granTotal.toFixed(2)}`, tipo: 'exito' });
      
      setTimeout(() => {
        setCarrito([]);
        setResultado(null);
        setCiBuscado('');
        setHistorial([]);
        setMensaje(null);
        cargarInventario(); 
      }, 3000);

    } catch (error) {
      const mensajeError = error instanceof Error ? error.message : "Error desconocido al procesar el cobro.";
      setMensaje({ texto: mensajeError, tipo: 'error' });
    } finally {
      setProcesandoCobro(false);
    }
  };

  const obtenerUltimos7Dias = () => {
    const dias = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const fechaStr = d.toISOString().split('T')[0];
      const diaSemana = d.toLocaleDateString('es-ES', { weekday: 'short' }).charAt(0).toUpperCase(); 
      dias.push({ fechaStr, diaSemana, asistio: historial.some(a => a.fechaHora.startsWith(fechaStr)), esHoy: i === 0 });
    }
    return dias;
  };

  const generarCalendarioMes = () => {
    const hoy = new Date(); const anio = hoy.getFullYear(); const mes = hoy.getMonth();
    const diasEnMes = new Date(anio, mes + 1, 0).getDate();
    const primerDiaSemana = new Date(anio, mes, 1).getDay();
    const dias = Array(primerDiaSemana).fill(null);
    for (let i = 1; i <= diasEnMes; i++) {
      const fechaStr = `${anio}-${String(mes + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      dias.push({ dia: i, fechaStr, asistio: historial.some(a => a.fechaHora.startsWith(fechaStr)), esHoy: i === hoy.getDate() });
    }
    return dias;
  };

  return (
    <div className="flex flex-col lg:flex-row h-full max-h-screen overflow-hidden bg-[#f3f4f6]">
      <div className="flex-1 flex flex-col p-4 lg:p-6 h-full">
        <header className="mb-4 flex-shrink-0">
          <h1 className="text-3xl font-extrabold text-[#1a1446] tracking-tight">Recepción & POS</h1>
        </header>

        {mensaje && (
          <div className={`p-3 mb-4 rounded-xl text-center font-bold text-sm shadow-sm flex-shrink-0 ${mensaje.tipo === 'error' ? 'bg-red-100 text-red-600' : 'bg-[#e0f8f1] text-[#00a870]'}`}>
            {mensaje.texto}
          </div>
        )}

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-4 flex-shrink-0">
          <form onSubmit={buscarCliente} className="relative flex items-center mb-4">
            <input 
              type="text" value={ciBuscado} onChange={(e) => setCiBuscado(e.target.value)}
              placeholder="Ingrese el CI del cliente (Ej: 8765432)"
              className="w-full bg-gray-50 shadow-inner rounded-xl px-5 py-4 text-lg font-bold text-[#1a1446] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4a24ff] transition-all"
            />
            <button type="submit" disabled={cargando} className="absolute right-2 bg-[#4a24ff] hover:bg-[#3616d9] text-white px-6 py-2.5 rounded-lg font-bold transition-all disabled:opacity-50">
              {cargando ? '...' : 'Buscar'}
            </button>
          </form>

          {resultado && resultado.cliente ? (
            <div className="bg-[#fafafa] rounded-xl border border-gray-100 p-4">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#f4edff] rounded-xl flex items-center justify-center text-[#4a24ff] text-xl font-bold">
                    {resultado.cliente.nombreCompleto.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-[#1a1446] leading-none">{resultado.cliente.nombreCompleto}</h3>
                    <p className="text-gray-500 text-sm">CI: {resultado.cliente.carnetIdentidad}</p>
                  </div>
                </div>
                
                {suscripcionActiva ? (
                  <div className="text-right">
                    <span className="bg-[#e0f8f1] text-[#00a870] px-3 py-1 rounded-full font-bold text-xs">ACTIVO ({calcularDiasRestantes(resultado.suscripcion!.fechaFin)}d)</span>
                  </div>
                ) : (
                  <div className="text-right">
                    <span className="bg-[#ffe0e6] text-[#ff4d6d] px-3 py-1 rounded-full font-bold text-xs">VENCIDO</span>
                    <button onClick={añadirPaseLibre} className="mt-1 text-xs font-bold text-[#4a24ff] hover:underline block">
                      + Cobrar Pase
                    </button>
                  </div>
                )}
              </div>

              {suscripcionActiva && (
                <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                  <div className="flex gap-2 items-center">
                    <button onClick={() => setMostrarCalendario(true)} className="text-xl">📅</button>
                    <div className="flex gap-1">
                      {obtenerUltimos7Dias().map((dia, idx) => (
                        <div key={idx} title={dia.diaSemana} className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${dia.asistio ? 'bg-[#00a870] text-white' : dia.esHoy ? 'border border-[#4a24ff] text-[#4a24ff]' : 'bg-gray-100 text-transparent'}`}>
                          {dia.asistio ? '✓' : dia.esHoy ? 'H' : ''}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {carrito.length === 0 && (
                    <button onClick={procesarCobroFinal} disabled={yaIngresoHoy || procesandoCobro} className={`px-4 py-2 rounded-lg font-bold text-sm ${yaIngresoHoy ? 'bg-gray-200 text-gray-500' : 'bg-[#00a870] text-white'}`}>
                      {yaIngresoHoy ? 'Ya ingresó hoy' : 'Marcar Ingreso'}
                    </button>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="flex justify-center mt-1">
              <button onClick={añadirPaseLibre} className={`flex items-center gap-2 font-bold px-6 py-3 rounded-xl border w-full justify-center transition-all ${paseEnCarrito ? 'bg-[#4a24ff] text-white border-[#4a24ff]' : 'bg-white text-[#1a1446] border-gray-200 hover:border-[#4a24ff]'}`}>
                🎟️ {paseEnCarrito ? 'Añadir otro Pase Libre' : 'Visita Casual (Cobrar Pase)'}
              </button>
            </div>
          )}
        </div>

        {/* ==========================================
            CATÁLOGO CON SCROLL INTERNO Y CATEGORÍAS
        ========================================== */}
        <div className="flex-1 overflow-y-auto min-h-0 pb-4 pr-2 custom-scrollbar">
          
          <div className="sticky top-0 bg-[#f3f4f6] pt-1 pb-3 z-10">
            <h3 className="text-lg font-black text-[#1a1446] mb-3">Catálogo</h3>
            
            {/* ⚡ BOTONES AUTOGENERADOS DE CATEGORÍAS */}
            <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-2">
              {categoriasUnicas.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategoriaActiva(cat)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                    categoriaActiva === cat 
                      ? 'bg-[#4a24ff] text-white shadow-md' 
                      : 'bg-white text-gray-500 border border-gray-200 hover:border-[#4a24ff] hover:text-[#4a24ff]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
            {productosFiltrados.map(prod => {
              const sinStock = prod.stock <= 0;

              return (
                <div key={prod.id} onClick={() => !sinStock && agregarAlCarrito(prod)} className={`bg-white rounded-xl p-3 border border-gray-100 flex flex-col items-center text-center ${sinStock ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-[#4a24ff] active:scale-95 transition-transform'}`}>
                  <div className="w-12 h-12 rounded-full flex items-center justify-center mb-2 bg-gray-50 overflow-hidden">
                    {prod.imagen && prod.imagen !== '🎟️' ? <img src={prod.imagen} alt={prod.nombre} className="w-full h-full object-cover" /> : <span className="text-2xl">🥤</span>}
                  </div>
                  <h4 className="font-bold text-[#1a1446] text-xs mb-1 line-clamp-1" title={prod.nombre}>{prod.nombre}</h4>
                  <p className="text-[#00a870] font-black text-sm">Bs. {prod.precio.toFixed(2)}</p>
                  
                  <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase">
                    Stock: <span className={sinStock ? 'text-red-500' : 'text-gray-500'}>{prod.stock}</span>
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="w-full lg:w-96 bg-white border-l border-gray-100 flex flex-col h-full shadow-[-5px_0_15px_rgba(0,0,0,0.03)] z-10">
        <div className="p-5 border-b border-gray-100 bg-[#fafafa] flex-shrink-0">
          <h3 className="text-xl font-black text-[#1a1446] flex items-center gap-2">
            🛒 Carrito <span className="bg-[#1a1446] text-white text-xs px-2 py-0.5 rounded-full">{carrito.length}</span>
          </h3>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0 p-4 space-y-2 custom-scrollbar">
          {carrito.map(item => (
            <div key={item.id} className="flex justify-between items-center p-3 border border-gray-100 bg-white rounded-xl">
              <div className="flex-1 min-w-0 pr-2">
                <h4 className={`font-bold text-sm truncate ${item.nombre.toLowerCase().includes('pase') ? 'text-[#4a24ff]' : 'text-[#1a1446]'}`}>
                  {item.nombre.toLowerCase().includes('pase') ? '🎟️ ' : ''}{item.nombre}
                </h4>
                <p className="text-xs font-bold text-[#00a870] mt-0.5">Bs. {(item.precio * item.cantidad).toFixed(2)}</p>
              </div>
              
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="flex items-center gap-1.5 bg-gray-50 rounded-lg p-1">
                  <button onClick={() => quitarDelCarrito(item.id)} className="w-6 h-6 rounded bg-white font-black text-gray-500 shadow-sm hover:text-red-500 flex items-center justify-center">-</button>
                  <span className="w-5 text-center font-black text-[#1a1446] text-sm">{item.cantidad}</span>
                  <button onClick={() => agregarAlCarrito(item)} className="w-6 h-6 rounded bg-white font-black text-gray-500 shadow-sm hover:text-[#4a24ff] flex items-center justify-center">+</button>
                </div>
                <button 
                  onClick={() => eliminarDelCarrito(item.id)} 
                  className="w-8 h-8 rounded-lg bg-red-50 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center transition-colors"
                  title="Quitar del carrito"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}

          {carrito.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
              <span className="text-5xl mb-3">🛒</span>
              <p className="font-bold text-[#1a1446] text-sm">Carrito vacío</p>
            </div>
          )}
        </div>

        <div className="p-5 bg-white border-t border-gray-100 flex-shrink-0">
          <div className="flex justify-between items-end mb-4">
            <span className="text-sm font-bold text-gray-400 uppercase tracking-wider">Total</span>
            <span className="text-3xl font-black text-[#1a1446] leading-none">Bs. {granTotal.toFixed(2)}</span>
          </div>

          <button 
            onClick={procesarCobroFinal}
            disabled={(granTotal === 0 && !suscripcionActiva) || procesandoCobro}
            className={`w-full py-4 rounded-xl font-black text-lg transition-all ${(granTotal === 0 && !suscripcionActiva) ? 'bg-gray-100 text-gray-400' : 'bg-[#00a870] text-white shadow-[0_4px_15px_rgba(0,168,112,0.3)] hover:scale-[1.02]'}`}
          >
            {procesandoCobro ? '...' : granTotal > 0 ? `Cobrar Bs. ${granTotal.toFixed(2)}` : 'Marcar Ingreso'}
          </button>
        </div>
      </div>

      {mostrarCalendario && (
        <div className="fixed inset-0 bg-[#1a1446]/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md border border-gray-100 relative">
            <button onClick={() => setMostrarCalendario(false)} className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200 font-bold">✕</button>
            <h3 className="text-2xl font-black text-[#1a1446] mb-2">Historial de Asistencia</h3>
            <p className="text-gray-500 mb-8 font-medium capitalize">{new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}</p>

            <div className="grid grid-cols-7 gap-2 text-center mb-4">
              {['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'].map(dia => (<div key={dia} className="text-xs font-bold text-gray-400 uppercase tracking-wider">{dia}</div>))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {generarCalendarioMes().map((item, index) => (
                <div key={index} className="aspect-square flex items-center justify-center">
                  {item ? (
                    <div className={`w-full h-full rounded-xl flex items-center justify-center text-sm font-bold transition-all ${item.asistio ? 'bg-[#00a870] text-white shadow-md' : item.esHoy ? 'bg-blue-50 text-[#4a24ff] border-2 border-[#4a24ff]' : 'bg-gray-50 text-gray-400 border border-gray-100'}`}>
                      {item.dia}
                    </div>
                  ) : (<div className="w-full h-full"></div>)}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}