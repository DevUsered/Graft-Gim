import { useState } from 'react';

// Interfaces de lo que recibimos del backend
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

export default function Recepcion() {
  const [ciBuscado, setCiBuscado] = useState('');
  const [cargando, setCargando] = useState(false);
  const [resultado, setResultado] = useState<{ cliente?: Cliente; suscripcion?: Suscripcion } | null>(null);
  const [mensaje, setMensaje] = useState<{ texto: string; tipo: 'error' | 'exito' | 'info' } | null>(null);

  // Función principal del cajero
  const buscarCliente = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ciBuscado.trim()) return;

    setCargando(true);
    setMensaje(null);
    setResultado(null);

    try {
      // 1. Traemos todos los clientes (idealmente luego haremos un endpoint específico en Java)
      const resClientes = await fetch('http://localhost:8080/api/clientes');
      const clientes: Cliente[] = await resClientes.json();
      
      const clienteEncontrado = clientes.find(c => c.carnetIdentidad === ciBuscado.trim());

      if (!clienteEncontrado) {
        setMensaje({ texto: 'No existe ningún cliente con ese Carnet de Identidad.', tipo: 'error' });
        setCargando(false);
        return;
      }

      // 2. Si existe, buscamos sus suscripciones
      const resSuscripciones = await fetch('http://localhost:8080/api/suscripciones');
      const suscripciones: Suscripcion[] = await resSuscripciones.json();

      // Buscamos la suscripción activa de este cliente
      const suscripcionActiva = suscripciones.find(
        sub => sub.cliente.idCliente === clienteEncontrado.idCliente && sub.estado === 'VIGENTE'
      );

      setResultado({ cliente: clienteEncontrado, suscripcion: suscripcionActiva });

    } catch (error) {
      console.error("Error en la búsqueda:", error);
      setMensaje({ texto: 'Error de conexión con el servidor.', tipo: 'error' });
    } finally {
      setCargando(false);
    }
  };

  // Función matemática para calcular días restantes
  const calcularDiasRestantes = (fechaFin: string) => {
    const hoy = new Date();
    // Normalizamos la fecha de hoy para ignorar la hora
    hoy.setHours(0, 0, 0, 0); 
    const fin = new Date(fechaFin + 'T00:00:00'); // Aseguramos zona horaria local
    
    const diferenciaTiempo = fin.getTime() - hoy.getTime();
    const diferenciaDias = Math.ceil(diferenciaTiempo / (1000 * 3600 * 24));
    
    return diferenciaDias;
  };

  const registrarAsistencia = () => {
    // Aquí luego conectaremos con un endpoint POST /api/asistencias
    setMensaje({ texto: '¡Asistencia registrada exitosamente! Pase adelante.', tipo: 'exito' });
    setTimeout(() => {
      setResultado(null);
      setCiBuscado('');
      setMensaje(null);
    }, 4000);
  };

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

      {/* Buscador Central Gigante */}
      <div className="max-w-2xl mx-auto mb-10">
        <form onSubmit={buscarCliente} className="relative flex items-center">
          <input 
            type="text" 
            value={ciBuscado}
            onChange={(e) => setCiBuscado(e.target.value)}
            placeholder="Ingrese el CI (Ej: 8765432)"
            className="w-full bg-white shadow-[0_15px_40px_-15px_rgba(0,0,0,0.1)] rounded-2xl px-8 py-6 text-2xl font-bold text-[#1a1446] placeholder-gray-300 focus:outline-none focus:ring-4 focus:ring-[#f4edff] border-2 border-transparent focus:border-[#4a24ff] transition-all"
            autoFocus
          />
          <button 
            type="submit"
            disabled={cargando}
            className="absolute right-4 bg-[#4a24ff] hover:bg-[#3616d9] text-white px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-[0_8px_20px_rgba(74,36,255,0.25)] disabled:opacity-50"
          >
            {cargando ? 'Buscando...' : 'Verificar'}
          </button>
        </form>
      </div>

      {/* Mensajes de Alerta */}
      {mensaje && (
        <div className={`max-w-2xl mx-auto p-4 rounded-2xl text-center font-bold text-lg animate-bounce ${
          mensaje.tipo === 'error' ? 'bg-red-100 text-red-600' : 'bg-[#e0f8f1] text-[#00a870]'
        }`}>
          {mensaje.texto}
        </div>
      )}

      {/* Tarjeta de Resultados (Se muestra solo si hay un cliente) */}
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
              <div className="space-y-6">
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

                {/* Cálculo visual de días restantes */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 flex items-center justify-between shadow-sm">
                  <div>
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Tiempo Restante</p>
                    {calcularDiasRestantes(resultado.suscripcion.fechaFin) > 0 ? (
                      <p className="text-4xl font-black text-[#00a870]">
                        {calcularDiasRestantes(resultado.suscripcion.fechaFin)} días
                      </p>
                    ) : (
                      <p className="text-4xl font-black text-red-500">Vencido</p>
                    )}
                  </div>
                  
                  {/* Botón de Acción Principal */}
                  <button 
                    onClick={registrarAsistencia}
                    disabled={calcularDiasRestantes(resultado.suscripcion.fechaFin) <= 0}
                    className="bg-[#00a870] hover:bg-[#008f5f] text-white px-8 py-4 rounded-2xl font-bold text-xl transition-all shadow-[0_8px_20px_rgba(0,168,112,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Marcar Ingreso
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-5xl mb-4">⚠️</div>
                <h4 className="text-2xl font-bold text-[#1a1446] mb-2">Sin Suscripción Activa</h4>
                <p className="text-gray-500 font-medium">Este cliente no tiene ningún plan vigente en este momento. Diríjalo a ventas.</p>
              </div>
            )}
          </div>
        </div>
      )}
      
    </div>
  );
}