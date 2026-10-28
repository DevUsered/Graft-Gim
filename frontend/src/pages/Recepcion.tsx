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
  const paseEnCarrito = carrito.find(item => item.id === productoPaseLibre?.id);

  const agregarAlCarrito = (prod: Producto) => {
    setCarrito(prev => {
      const existe = prev.find(item => item.id === prod.id);
      if (existe) {
        if (existe.cantidad >= prod.stock) {
          alert("Stock máximo alcanzado.");
          return prev;
        }
        return prev.map(item => item.id === prod.id ? { ...item, cantidad: item.cantidad + 1 } : item);
      }
      return [...prev, { ...prod, cantidad: 1 }];
    });
  };

  const quitarDelCarrito = (idProducto: number) => {
    setCarrito(prev => {
      const existe = prev.find(item => item.id === idProducto);
      if (existe && existe.cantidad > 1) {
        return prev.map(item => item.id === idProducto ? { ...item, cantidad: item.cantidad - 1 } : item);
      }
      return prev.filter(item => item.id !== idProducto);
    });
  };

  const eliminarDelCarrito = (idProducto: number) => {
    setCarrito(prev => prev.filter(item => item.id !== idProducto));
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
        payloadCarrito[item.id.toString()] = item.cantidad;
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
    // ⚡ 1. FONDO ELIMINADO PARA TRANSPARENCIA (se quita bg-[#f3f4f6])
    <div className="flex flex-col lg:flex-row h-full max-h-[calc(100vh-2rem)] overflow-hidden text-white">
      <div className="flex-1 flex flex-col p-4 lg:p-6 h-full">
        <header className="mb-4 flex-shrink-0">
          {/* ⚡ TEXTO BLANCO */}
          <h1 className="text-3xl font-extrabold text-white tracking-tight drop-shadow-md">Recepción & POS</h1>
        </header>

        {mensaje && (
          <div className={`p-3 mb-4 rounded-xl text-center font-bold text-sm shadow-sm flex-shrink-0 backdrop-blur-md border ${mensaje.tipo === 'error' ? 'bg-red-500/20 text-red-300 border-red-500/30' : 'bg-green-500/20 text-green-300 border-green-500/30'}`}>
            {mensaje.texto}
          </div>
        )}

        {/* ⚡ 2. BUSCADOR GLASSMORPHISM */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-5 shadow-lg border border-white/20 mb-4 flex-shrink-0">
          <form onSubmit={buscarCliente} className="relative flex items-center mb-4">
            <input 
              type="text" value={ciBuscado} onChange={(e) => setCiBuscado(e.target.value)}
              placeholder="Ingrese el CI del cliente (Ej: 8765432)"
              className="w-full bg-black/20 shadow-inner rounded-xl px-5 py-4 text-lg font-bold text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#4a24ff] border border-white/10 transition-all"
            />
            <button type="submit" disabled={cargando} className="absolute right-2 bg-[#4a24ff] hover:bg-[#3616d9] text-white px-6 py-2.5 rounded-lg font-bold transition-all shadow-md disabled:opacity-50">
              {cargando ? '...' : 'Buscar'}
            </button>
          </form>

          {resultado && resultado.cliente ? (
            <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 p-4">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/10 border border-white/20 rounded-xl flex items-center justify-center text-white text-xl font-bold shadow-sm">
                    {resultado.cliente.nombreCompleto.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white leading-none drop-shadow-sm">{resultado.cliente.nombreCompleto}</h3>
                    <p className="text-white/60 text-sm">CI: {resultado.cliente.carnetIdentidad}</p>
                  </div>
                </div>
                
                {suscripcionActiva ? (
                  <div className="text-right">
                    <span className="bg-green-500/20 text-green-300 border border-green-500/30 px-3 py-1 rounded-full font-bold text-xs">ACTIVO ({calcularDiasRestantes(resultado.suscripcion!.fechaFin)}d)</span>
                  </div>
                ) : (
                  <div className="text-right">
                    <span className="bg-red-500/20 text-red-300 border border-red-500/30 px-3 py-1 rounded-full font-bold text-xs">VENCIDO</span>
                    <button onClick={añadirPaseLibre} className="mt-1 text-xs font-bold text-[#a78bfa] hover:text-white hover:underline block transition-colors">
                      + Cobrar Pase
                    </button>
                  </div>
                )}
              </div>

              {suscripcionActiva && (
                <div className="flex justify-between items-center pt-2 border-t border-white/10">
                  <div className="flex gap-2 items-center">
                    <button onClick={() => setMostrarCalendario(true)} className="text-xl hover:scale-110 transition-transform">📅</button>
                    <div className="flex gap-1">
                      {obtenerUltimos7Dias().map((dia, idx) => (
                        <div key={idx} title={dia.diaSemana} className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${dia.asistio ? 'bg-[#00a870] text-white shadow-sm' : dia.esHoy ? 'border border-[#4a24ff] text-[#a78bfa]' : 'bg-white/5 text-transparent border border-white/10'}`}>
                          {dia.asistio ? '✓' : dia.esHoy ? 'H' : ''}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {carrito.length === 0 && (
                    <button onClick={procesarCobroFinal} disabled={yaIngresoHoy || procesandoCobro} className={`px-4 py-2 rounded-lg font-bold text-sm shadow-md transition-all ${yaIngresoHoy ? 'bg-white/10 text-white/40 cursor-not-allowed' : 'bg-[#00a870] hover:bg-[#008f5f] text-white hover:-translate-y-0.5'}`}>
                      {yaIngresoHoy ? 'Ya ingresó hoy' : 'Marcar Ingreso'}
                    </button>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="flex justify-center mt-1">
              <button onClick={añadirPaseLibre} className={`flex items-center gap-2 font-bold px-6 py-3 rounded-xl border w-full justify-center transition-all shadow-md ${paseEnCarrito ? 'bg-[#4a24ff] text-white border-[#4a24ff]' : 'bg-white/10 text-white border-white/20 hover:bg-white/20 hover:border-white/40'}`}>
                🎟️ {paseEnCarrito ? 'Añadir otro Pase Libre' : 'Visita Casual (Cobrar Pase)'}
              </button>
            </div>
          )}
        </div>

        {/* ==========================================
            CATÁLOGO CON SCROLL INTERNO Y CATEGORÍAS
        ========================================== */}
        <div className="flex-1 overflow-y-auto min-h-0 pb-4 pr-2 custom-scrollbar">
          
          <div className="sticky top-0 pt-1 pb-3 z-10 backdrop-blur-md bg-[#1a1446]/60 border-b border-white/10 mb-4 rounded-t-xl px-2">
            <h3 className="text-lg font-black text-white mb-3 drop-shadow-sm">Catálogo</h3>
            
            <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-2">
              {categoriasUnicas.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategoriaActiva(cat)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all shadow-sm ${
                    categoriaActiva === cat 
                      ? 'bg-[#4a24ff] text-white border border-transparent' 
                      : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10 hover:text-white'
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
                // ⚡ 3. TARJETAS DEL CATÁLOGO GLASSMORPHISM
                <div key={prod.id} onClick={() => !sinStock && agregarAlCarrito(prod)} className={`bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10 flex flex-col items-center text-center shadow-lg ${sinStock ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-white/20 hover:border-white/30 active:scale-95 transition-all'}`}>
                  <div className="w-12 h-12 rounded-full flex items-center justify-center mb-2 bg-black/20 overflow-hidden border border-white/5">
                    {prod.imagen && prod.imagen !== '🎟️' ? <img src={prod.imagen} alt={prod.nombre} className="w-full h-full object-cover" /> : <span className="text-2xl drop-shadow-md">🥤</span>}
                  </div>
                  <h4 className="font-bold text-white text-xs mb-1 line-clamp-1 drop-shadow-sm" title={prod.nombre}>{prod.nombre}</h4>
                  <p className="text-green-400 font-black text-sm drop-shadow-sm">Bs. {prod.precio.toFixed(2)}</p>
                  
                  <p className="text-[10px] font-bold text-white/50 mt-1 uppercase">
                    Stock: <span className={sinStock ? 'text-red-400' : 'text-white/80'}>{prod.stock}</span>
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ==========================================
          LADO DERECHO: Carrito Fijo (30%) GLASSMORPHISM
      ========================================== */}
      <div className="w-full lg:w-96 bg-white/5 backdrop-blur-2xl border-l border-white/10 flex flex-col h-full shadow-[-10px_0_30px_rgba(0,0,0,0.2)] z-20 rounded-l-3xl lg:rounded-l-none lg:rounded-r-3xl my-4 lg:my-0">
        <div className="p-5 border-b border-white/10 bg-black/20 flex-shrink-0 lg:rounded-tr-3xl">
          <h3 className="text-xl font-black text-white flex items-center gap-2 drop-shadow-sm">
            🛒 Carrito <span className="bg-[#4a24ff] text-white text-xs px-2 py-0.5 rounded-full shadow-md">{carrito.length}</span>
          </h3>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0 p-4 space-y-2 custom-scrollbar">
          {carrito.map(item => (
            // ⚡ ITEMS DEL CARRITO
            <div key={item.id} className="flex justify-between items-center p-3 border border-white/10 bg-white/5 rounded-xl shadow-sm hover:bg-white/10 transition-colors">
              <div className="flex-1 min-w-0 pr-2">
                <h4 className={`font-bold text-sm truncate drop-shadow-sm ${item.nombre.toLowerCase().includes('pase') ? 'text-[#a78bfa]' : 'text-white'}`}>
                  {item.nombre.toLowerCase().includes('pase') ? '🎟️ ' : ''}{item.nombre}
                </h4>
                <p className="text-xs font-bold text-green-400 mt-0.5 drop-shadow-sm">Bs. {(item.precio * item.cantidad).toFixed(2)}</p>
              </div>
              
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="flex items-center gap-1.5 bg-black/20 rounded-lg p-1 border border-white/5">
                  <button onClick={() => quitarDelCarrito(item.id)} className="w-6 h-6 rounded bg-white/10 font-black text-white/60 hover:bg-red-500/20 hover:text-red-300 flex items-center justify-center transition-colors">-</button>
                  <span className="w-5 text-center font-black text-white text-sm">{item.cantidad}</span>
                  <button onClick={() => agregarAlCarrito(item)} className="w-6 h-6 rounded bg-white/10 font-black text-white/60 hover:bg-[#4a24ff]/50 hover:text-white flex items-center justify-center transition-colors">+</button>
                </div>
                <button 
                  onClick={() => eliminarDelCarrito(item.id)} 
                  className="w-8 h-8 rounded-lg bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500 hover:text-white flex items-center justify-center transition-colors"
                  title="Quitar del carrito"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}

          {carrito.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
              <span className="text-5xl mb-3 drop-shadow-md">🛒</span>
              <p className="font-bold text-white text-sm">Carrito vacío</p>
            </div>
          )}
        </div>

        <div className="p-5 bg-black/20 border-t border-white/10 flex-shrink-0 lg:rounded-br-3xl">
          <div className="flex justify-between items-end mb-4">
            <span className="text-sm font-bold text-white/50 uppercase tracking-wider">Total</span>
            <span className="text-3xl font-black text-white leading-none drop-shadow-sm">Bs. {granTotal.toFixed(2)}</span>
          </div>

          <button 
            onClick={procesarCobroFinal}
            disabled={(granTotal === 0 && !suscripcionActiva) || procesandoCobro}
            className={`w-full py-4 rounded-xl font-black text-lg transition-all shadow-lg ${
              (granTotal === 0 && !suscripcionActiva) 
                ? 'bg-white/5 text-white/30 border border-white/10 cursor-not-allowed' 
                : 'bg-[#00a870] hover:bg-[#008f5f] text-white border border-[#00a870]/50 hover:-translate-y-0.5'
            }`}
          >
            {procesandoCobro ? '...' : granTotal > 0 ? `Cobrar Bs. ${granTotal.toFixed(2)}` : 'Marcar Ingreso'}
          </button>
        </div>
      </div>

      {/* ⚡ 4. MODAL DEL CALENDARIO GLASSMORPHISM */}
      {mostrarCalendario && (
        <div className="fixed inset-0 bg-[#1a1446]/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white/10 backdrop-blur-2xl p-8 rounded-3xl shadow-2xl w-full max-w-md border border-white/20 relative">
            <button onClick={() => setMostrarCalendario(false)} className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center bg-white/10 rounded-full text-white/60 hover:bg-white/20 hover:text-white font-bold transition-colors">✕</button>
            <h3 className="text-2xl font-black text-white mb-2 drop-shadow-md">Historial de Asistencia</h3>
            <p className="text-white/60 mb-8 font-medium capitalize">{new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}</p>

            <div className="grid grid-cols-7 gap-2 text-center mb-4">
              {['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'].map(dia => (<div key={dia} className="text-xs font-bold text-white/40 uppercase tracking-wider">{dia}</div>))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {generarCalendarioMes().map((item, index) => (
                <div key={index} className="aspect-square flex items-center justify-center">
                  {item ? (
                    <div className={`w-full h-full rounded-xl flex items-center justify-center text-sm font-bold transition-all shadow-sm ${item.asistio ? 'bg-[#00a870] text-white border border-[#00a870]/50' : item.esHoy ? 'bg-[#4a24ff]/20 text-[#a78bfa] border-2 border-[#4a24ff]' : 'bg-white/5 text-white/30 border border-white/10'}`}>
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