import { useState } from 'react';

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

export default function Recepcion() {
  const [ciBuscado, setCiBuscado] = useState('');
  const [cargando, setCargando] = useState(false);
  const [resultado, setResultado] = useState<{ cliente?: Cliente; suscripcion?: Suscripcion } | null>(null);
  const [historial, setHistorial] = useState<Asistencia[]>([]);
  const [mensaje, setMensaje] = useState<{ texto: string; tipo: 'error' | 'exito' | 'info' } | null>(null);
  
  // NUEVO: Estado para controlar la ventana del calendario completo
  const [mostrarCalendario, setMostrarCalendario] = useState(false);

  const buscarCliente = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ciBuscado.trim()) return;

    setCargando(true);
    setMensaje(null);
    setResultado(null);
    setHistorial([]);

    try {
      const resClientes = await fetch('http://localhost:8080/api/clientes', {
        method: 'GET',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + localStorage.getItem('token') // <-- AÑADIDO
        }
      });
      const clientes: Cliente[] = await resClientes.json();
      const clienteEncontrado = clientes.find(c => c.carnetIdentidad === ciBuscado.trim());

      if (!clienteEncontrado) {
        setMensaje({ texto: 'No existe ningún cliente con ese Carnet de Identidad.', tipo: 'error' });
        setCargando(false);
        return;
      }

      const resSuscripciones = await fetch('http://localhost:8080/api/suscripciones', {
        method: 'GET',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + localStorage.getItem('token') // <-- AÑADIDO
        }
      });
      const suscripciones: Suscripcion[] = await resSuscripciones.json();
      const suscripcionActiva = suscripciones.find(
        sub => sub.cliente.idCliente === clienteEncontrado.idCliente && sub.estado === 'VIGENTE'
      );

      const resAsistencias = await fetch('http://localhost:8080/api/asistencias', {
        method: 'GET',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + localStorage.getItem('token') // <-- AÑADIDO
        }
      });
      const asistenciasTotales: Asistencia[] = await resAsistencias.json();
      
      // Guardamos TODAS las asistencias de este cliente para armar el calendario
      const asistenciasDelCliente = asistenciasTotales.filter(a => a.cliente.idCliente === clienteEncontrado.idCliente);

      setHistorial(asistenciasDelCliente);
      setResultado({ cliente: clienteEncontrado, suscripcion: suscripcionActiva });

    } catch (error) {
      console.error("Error en la búsqueda:", error);
      setMensaje({ texto: 'Error de conexión con el servidor.', tipo: 'error' });
    } finally {
      setCargando(false);
    }
  };

  const registrarPaseExpress = async () => {
    setCargando(true);
    setMensaje(null);

    try {
      // 1. Buscamos al Cliente Casual
      const resClientes = await fetch('http://localhost:8080/api/clientes', {
        headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
      });
      // Le decimos a TypeScript que esto es un arreglo de clientes
      const clientes: Cliente[] = await resClientes.json(); 
      const clienteCasual = clientes.find((c: Cliente) => c.carnetIdentidad === '0' || c.carnetIdentidad === '0000');

      if (!clienteCasual) {
        setMensaje({ texto: 'Error: Crea un cliente con CI "0" llamado "Cliente Casual".', tipo: 'error' });
        setCargando(false); return;
      }

      // 2. Buscamos el plan llamado "Pase Diario"
      const resPlanes = await fetch('http://localhost:8080/api/membresias', {
        headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
      });
      
      // Creamos un molde (tipo) rápido para que TypeScript reconozca el precio
      type TipoPlan = { idMembresia: number; nombre: string; precio: number };
      const planes: TipoPlan[] = await resPlanes.json();
      
      const planDiario = planes.find((p: TipoPlan) => 
        p.nombre.toLowerCase().includes('pase') || p.nombre.toLowerCase().includes('diario')
      );

      if (!planDiario) {
        setMensaje({ texto: 'Error: Crea un plan llamado "Pase Diario" en la sección de Planes primero.', tipo: 'error' });
        setCargando(false); return;
      }

      // 3. Registramos la Asistencia
      await fetch('http://localhost:8080/api/asistencias', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + localStorage.getItem('token') 
        },
        body: JSON.stringify({ cliente: { idCliente: clienteCasual.idCliente } })
      });

      // 4. Mandamos a caja el precio exacto del plan
      await fetch('http://localhost:8080/api/pagos', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
        body: JSON.stringify({
          monto: planDiario.precio, 
          concepto: planDiario.nombre + ' (Cliente Casual)',
          metodoPago: 'EFECTIVO'
        })
      });

      setMensaje({ texto: `⚡ ${planDiario.nombre} cobrado (Bs. ${planDiario.precio.toFixed(2)}) con éxito`, tipo: 'exito' });
      setTimeout(() => setMensaje(null), 3000);

    } catch (error) {
      console.error("Error Pase Express:", error);
      setMensaje({ texto: 'Error al conectar con el servidor.', tipo: 'error' });
    } finally {
      setCargando(false);
    }
  };

  const calcularDiasRestantes = (fechaFin: string) => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0); 
    const fin = new Date(fechaFin + 'T00:00:00'); 
    return Math.ceil((fin.getTime() - hoy.getTime()) / (1000 * 3600 * 24));
  };

  const verificarIngresoHoy = () => {
    const hoyStr = new Date().toISOString().split('T')[0];
    return historial.some(a => a.fechaHora.startsWith(hoyStr));
  };

  const obtenerUltimos7Dias = () => {
    const dias = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const fechaStr = d.toISOString().split('T')[0];
      const diaSemana = d.toLocaleDateString('es-ES', { weekday: 'short' }).charAt(0).toUpperCase(); 
      const asistio = historial.some(a => a.fechaHora.startsWith(fechaStr));
      dias.push({ fechaStr, diaSemana, asistio, esHoy: i === 0 });
    }
    return dias;
  };

  // NUEVO: Lógica para generar el calendario completo del mes actual
  const generarCalendarioMes = () => {
    const hoy = new Date();
    const anio = hoy.getFullYear();
    const mes = hoy.getMonth();
    const diasEnMes = new Date(anio, mes + 1, 0).getDate();
    const primerDiaSemana = new Date(anio, mes, 1).getDay(); // 0 = Domingo, 1 = Lunes...

    const dias = [];
    // Espacios vacíos antes del primer día del mes
    for (let i = 0; i < primerDiaSemana; i++) {
      dias.push(null);
    }

    // Días reales del mes
    for (let i = 1; i <= diasEnMes; i++) {
      // Formateamos la fecha a YYYY-MM-DD (Ej: 2026-09-05)
      const fechaStr = `${anio}-${String(mes + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const asistio = historial.some(a => a.fechaHora.startsWith(fechaStr));
      dias.push({ dia: i, fechaStr, asistio, esHoy: i === hoy.getDate() });
    }

    return dias;
  };

  const registrarAsistencia = async () => {
    if(!resultado || !resultado.cliente) return;
    try {
      const res = await fetch('http://localhost:8080/api/asistencias', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + localStorage.getItem('token') // <-- AÑADIDO
        },
        body: JSON.stringify({ cliente: { idCliente: resultado.cliente.idCliente } })
      });
      const nuevaAsistencia = await res.json();
      
      setHistorial([...historial, nuevaAsistencia]);
      setMensaje({ texto: '¡Asistencia registrada exitosamente! Pase adelante.', tipo: 'exito' });
      
      setTimeout(() => {
        setResultado(null);
        setCiBuscado('');
        setMensaje(null);
        setHistorial([]);
      }, 3000);
    } catch(error) {
      console.error("Error al registrar asistencia:", error);
      setMensaje({ texto: 'Error al registrar la asistencia. Intente nuevamente.', tipo: 'error' });
    }
  };

  const yaIngresoHoy = verificarIngresoHoy();

  return (
    <div className="min-h-full bg-gradient-to-br from-[#fff0e6] via-[#f4edff] to-white rounded-3xl p-8 lg:p-12">
      
      <header className="mb-12 text-center max-w-2xl mx-auto">
        <h1 className="text-5xl font-extrabold text-[#1a1446] tracking-tight mb-4">
          Control de Acceso
        </h1>
        <p className="text-gray-500 font-medium text-lg">
          Escanea o ingresa el Carnet de Identidad del cliente para verificar su estado.
        </p>
      </header>

      <div className="max-w-2xl mx-auto mb-10">
        <form onSubmit={buscarCliente} className="relative flex items-center mb-6">
          <input 
            type="text" 
            value={ciBuscado}
            onChange={(e) => setCiBuscado(e.target.value)}
            placeholder="Ingrese el CI (Ej: 8765432)"
            className="w-full bg-white shadow-[0_15px_40px_-15px_rgba(0,0,0,0.1)] rounded-2xl px-8 py-6 text-2xl font-bold text-[#1a1446] placeholder-gray-300 focus:outline-none focus:ring-4 focus:ring-[#f4edff] border-2 border-transparent focus:border-[#4a24ff] transition-all"
            autoFocus
          />
          <button 
            type="submit" disabled={cargando}
            className="absolute right-4 bg-[#4a24ff] hover:bg-[#3616d9] text-white px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-[0_8px_20px_rgba(74,36,255,0.25)] disabled:opacity-50"
          >
            {cargando ? 'Buscando...' : 'Verificar'}
          </button>
        </form>

        <div className="flex justify-center">
          <button 
            onClick={registrarPaseExpress} disabled={cargando}
            className="flex items-center gap-2 bg-white text-gray-500 hover:text-[#4a24ff] font-bold px-6 py-3 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 disabled:opacity-50"
          >
            <span className="text-xl">⚡</span> Registrar Pase Diario (Sin Registro)
          </button>
        </div>
      </div>

      {mensaje && (
        <div className={`max-w-2xl mx-auto p-4 mb-8 rounded-2xl text-center font-bold text-lg animate-fade-in-up ${
          mensaje.tipo === 'error' ? 'bg-red-100 text-red-600' : 'bg-[#e0f8f1] text-[#00a870]'
        }`}>
          {mensaje.texto}
        </div>
      )}

      {resultado && resultado.cliente && (
        <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-[0_20px_50px_-20px_rgba(0,0,0,0.1)] overflow-hidden border border-gray-50 transform transition-all animate-fade-in-up">
          
          <div className="p-8 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-[#f4edff] rounded-2xl flex items-center justify-center text-[#4a24ff] text-4xl font-bold">
                {resultado.cliente.nombreCompleto.charAt(0)}
              </div>
              <div>
                <h3 className="text-3xl font-black text-[#1a1446]">{resultado.cliente.nombreCompleto}</h3>
                <p className="text-gray-500 font-medium text-lg mt-1">CI: {resultado.cliente.carnetIdentidad}</p>
              </div>
            </div>
          </div>

          <div className="p-8 bg-[#fafafa]">
            {resultado.suscripcion ? (
              <div className="space-y-8">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Plan Actual</p>
                    <p className="text-2xl font-bold text-[#4a24ff]">{resultado.suscripcion.membresia.nombre}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Vencimiento</p>
                    <p className="text-xl font-bold text-gray-800">{resultado.suscripcion.fechaFin}</p>
                  </div>
                </div>

                {/* Resumen de 7 días con botón de Calendario Completo */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative">
                  <div className="flex justify-between items-center mb-4">
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Últimos 7 Días</p>
                    <button 
                      onClick={() => setMostrarCalendario(true)}
                      className="text-[#4a24ff] text-sm font-bold hover:underline flex items-center gap-1"
                    >
                      📅 Ver Calendario Completo
                    </button>
                  </div>
                  
                  <div className="flex justify-between px-4">
                    {obtenerUltimos7Dias().map((dia, index) => (
                      <div key={index} className="flex flex-col items-center gap-2">
                        <span className={`text-xs font-bold ${dia.esHoy ? 'text-[#4a24ff]' : 'text-gray-400'}`}>
                          {dia.esHoy ? 'Hoy' : dia.diaSemana}
                        </span>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                          dia.asistio 
                            ? 'bg-[#00a870] text-white shadow-[0_4px_10px_rgba(0,168,112,0.3)]' 
                            : 'bg-gray-100 text-transparent border border-gray-200'
                        }`}>
                          {dia.asistio && '✓'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 flex items-center justify-between shadow-sm">
                  <div>
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Estado</p>
                    {calcularDiasRestantes(resultado.suscripcion.fechaFin) > 0 ? (
                      <p className="text-2xl font-black text-[#1a1446]">
                        {calcularDiasRestantes(resultado.suscripcion.fechaFin)} días restantes
                      </p>
                    ) : (
                      <p className="text-2xl font-black text-red-500">Suscripción Vencida</p>
                    )}
                  </div>
                  
                  <button 
                    onClick={registrarAsistencia}
                    disabled={calcularDiasRestantes(resultado.suscripcion.fechaFin) <= 0 || yaIngresoHoy}
                    className={`px-8 py-4 rounded-2xl font-bold text-xl transition-all ${
                      yaIngresoHoy 
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : calcularDiasRestantes(resultado.suscripcion.fechaFin) <= 0
                          ? 'bg-red-100 text-red-400 cursor-not-allowed'
                          : 'bg-[#00a870] hover:bg-[#008f5f] text-white shadow-[0_8px_20px_rgba(0,168,112,0.3)]'
                    }`}
                  >
                    {yaIngresoHoy ? 'Ya ingresó hoy' : 'Marcar Ingreso'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-5xl mb-4">⚠️</div>
                <h4 className="text-2xl font-bold text-[#1a1446] mb-2">Sin Suscripción Activa</h4>
                <p className="text-gray-500 font-medium">Este cliente no tiene ningún plan vigente en este momento.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL DEL CALENDARIO COMPLETO */}
      {mostrarCalendario && (
        <div className="fixed inset-0 bg-[#1a1446]/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md border border-gray-100 relative">
            <button 
              onClick={() => setMostrarCalendario(false)}
              className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200 font-bold"
            >
              ✕
            </button>
            
            <h3 className="text-2xl font-black text-[#1a1446] mb-2">Historial de Asistencia</h3>
            <p className="text-gray-500 mb-8 font-medium capitalize">
              {new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
            </p>

            {/* Cabecera de días (Dom, Lun, Mar...) */}
            <div className="grid grid-cols-7 gap-2 text-center mb-4">
              {['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'].map(dia => (
                <div key={dia} className="text-xs font-bold text-gray-400 uppercase tracking-wider">{dia}</div>
              ))}
            </div>

            {/* Cuadrícula del mes */}
            <div className="grid grid-cols-7 gap-2">
              {generarCalendarioMes().map((item, index) => (
                <div key={index} className="aspect-square flex items-center justify-center">
                  {item ? (
                    <div className={`w-full h-full rounded-xl flex items-center justify-center text-sm font-bold transition-all ${
                      item.asistio
                        ? 'bg-[#00a870] text-white shadow-[0_4px_10px_rgba(0,168,112,0.3)]'
                        : item.esHoy
                          ? 'bg-blue-50 text-[#4a24ff] border-2 border-[#4a24ff]'
                          : 'bg-gray-50 text-gray-400 border border-gray-100'
                    }`}>
                      {item.dia}
                    </div>
                  ) : (
                    <div className="w-full h-full"></div> /* Espacios vacíos de inicio de mes */
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}