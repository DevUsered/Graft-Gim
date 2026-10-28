import { useState, useEffect } from 'react';
import { apiFetch } from '../utils/api';

interface Pago {
  idPago: number;
  monto: number;
  concepto: string;
  metodoPago: string;
  fechaHora: string;
}

interface ResumenFinanzas {
  listaPagos: Pago[];
  totalHistorico: number;
  totalHoy: number;
}

export default function Finanzas() {
  const [resumen, setResumen] = useState<ResumenFinanzas>({
    listaPagos: [],
    totalHistorico: 0,
    totalHoy: 0
  });
  
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarToast, setMostrarToast] = useState(false);
  const [refresh, setRefresh] = useState(0);
  
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  
  const [formulario, setFormulario] = useState({
    monto: '',
    concepto: '',
    metodoPago: 'EFECTIVO'
  });

  useEffect(() => {
    const fetchFinanzas = async () => {
      try {
        const queryParams = new URLSearchParams();
        if (fechaInicio) queryParams.append('inicio', `${fechaInicio}T00:00:00`);
        if (fechaFin) queryParams.append('fin', `${fechaFin}T23:59:59`);
        
        const url = `/api/pagos/resumen${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
        
        const res = await apiFetch(url);
        
        if (res.ok) {
          const datos = await res.json();
          setResumen(datos);
        }
      } catch (error) {
        console.error("Error al cargar finanzas:", error);
      }
    };

    fetchFinanzas();
  }, [refresh, fechaInicio, fechaFin]);

  const manejarCambio = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormulario({ ...formulario, [e.target.name]: e.target.value });
  };

  const guardarPago = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await apiFetch('/api/pagos', {
        method: 'POST',
        body: JSON.stringify({
          monto: parseFloat(formulario.monto),
          concepto: formulario.concepto,
          metodoPago: formulario.metodoPago
        })
      });

      if (!res.ok) {
        const errorTexto = await res.text();
        throw new Error(errorTexto || "Error al registrar en caja.");
      }

      setMostrarModal(false);
      setFormulario({ monto: '', concepto: '', metodoPago: 'EFECTIVO' });
      setRefresh(prev => prev + 1);
      
      setMostrarToast(true);
      setTimeout(() => setMostrarToast(false), 3000);
      
    } catch (error) { 
      const mensaje = error instanceof Error ? error.message : "Ocurrió un problema inesperado";
      alert("Error: " + mensaje);
    }
  };

  const formatearFecha = (fechaOriginal: string) => {
    const fecha = new Date(fechaOriginal);
    return new Intl.DateTimeFormat('es-BO', { 
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' 
    }).format(fecha);
  };

  const limpiarFiltros = () => {
    setFechaInicio('');
    setFechaFin('');
  };

  return (
    // ⚡ 1. FONDO TRANSPARENTE, TEXTO CLARO
    <div className="p-4 lg:p-8 min-h-full text-white relative">
      
      {/* ⚡ CABECERA */}
      <header className="mb-8 flex flex-col md:flex-row md:justify-between md:items-end gap-4 relative z-10">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tight drop-shadow-md">Finanzas y Caja</h2>
          <p className="text-white/60 mt-2 font-medium drop-shadow-sm">Lleva el control de todos los ingresos del gimnasio.</p>
        </div>
        <button 
          onClick={() => setMostrarModal(true)}
          className="bg-[#00a870] hover:bg-[#008f5f] text-white px-6 py-3 rounded-xl font-bold transition-all shadow-[0_8px_20px_rgba(0,168,112,0.4)] hover:-translate-y-0.5 border border-[#00a870]/50"
        >
          + Registrar Ingreso
        </button>
      </header>

      {/* ⚡ BARRA DE FILTRO DE FECHAS GLASSMORPHISM */}
      <div className="bg-white/10 backdrop-blur-xl p-5 rounded-3xl shadow-lg border border-white/20 flex flex-col md:flex-row gap-4 items-end mb-8 relative z-10">
        <div className="w-full md:w-auto flex-1">
          <label className="block text-xs font-bold text-white/60 uppercase tracking-wider mb-2">Fecha Inicio</label>
          <input 
            type="date" 
            value={fechaInicio} 
            onChange={(e) => setFechaInicio(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:bg-white/10 focus:border-[#4a24ff] focus:ring-4 focus:ring-[#4a24ff]/30 outline-none transition-all font-medium text-white appearance-none"
            style={{ colorScheme: 'dark' }} // ⚡ Truco para que el calendario del navegador salga oscuro
          />
        </div>
        <div className="w-full md:w-auto flex-1">
          <label className="block text-xs font-bold text-white/60 uppercase tracking-wider mb-2">Fecha Fin</label>
          <input 
            type="date" 
            value={fechaFin} 
            onChange={(e) => setFechaFin(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:bg-white/10 focus:border-[#4a24ff] focus:ring-4 focus:ring-[#4a24ff]/30 outline-none transition-all font-medium text-white appearance-none"
            style={{ colorScheme: 'dark' }}
          />
        </div>
        {(fechaInicio || fechaFin) && (
          <button 
            onClick={limpiarFiltros}
            className="w-full md:w-auto px-6 py-3 bg-red-500/10 text-red-300 hover:bg-red-500 hover:text-white border border-transparent hover:border-red-500/50 rounded-xl font-bold transition-all shadow-md"
          >
            Limpiar Filtro
          </button>
        )}
      </div>

      {/* ⚡ TARJETAS DE RESUMEN GLASSMORPHISM */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10 relative z-10">
        <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl p-8 text-white shadow-[0_8px_32px_rgba(0,0,0,0.2)] relative overflow-hidden group hover:-translate-y-1 transition-transform">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#a78bfa] rounded-full mix-blend-screen filter blur-[60px] opacity-20 group-hover:opacity-40 transition-opacity pointer-events-none"></div>
          <p className="text-[#a78bfa] font-bold uppercase tracking-wider text-sm mb-2 drop-shadow-sm">
            {fechaInicio || fechaFin ? 'Total del Periodo' : 'Ingresos de Hoy'}
          </p>
          <h3 className="text-5xl font-black drop-shadow-md text-white">Bs. {resumen.totalHoy.toFixed(2)}</h3>
        </div>

        <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-8 shadow-lg border border-white/10 flex flex-col justify-center hover:bg-white/10 transition-colors">
          <p className="text-white/60 font-bold uppercase tracking-wider text-sm mb-2">Total Histórico</p>
          <h3 className="text-4xl font-black text-white drop-shadow-sm">Bs. {resumen.totalHistorico.toFixed(2)}</h3>
        </div>
      </div>

      {/* ⚡ MODAL REGISTRAR PAGO GLASSMORPHISM */}
      {mostrarModal && (
        <div className="fixed inset-0 bg-[#1a1446]/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white/10 backdrop-blur-2xl p-8 rounded-3xl shadow-2xl w-full max-w-md border border-white/20">
            <h3 className="text-2xl font-black text-white mb-6 drop-shadow-md">Registrar Ingreso</h3>
            
            <form onSubmit={guardarPago} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-white/60 mb-2 uppercase tracking-wide">Monto (Bs.)</label>
                <input 
                  type="number" step="0.01" name="monto" value={formulario.monto} onChange={manejarCambio} required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:bg-white/10 focus:border-[#4a24ff] focus:ring-4 focus:ring-[#4a24ff]/30 outline-none transition-all font-bold text-green-400 text-2xl placeholder-white/20"
                  placeholder="0.00" autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-white/60 mb-2 uppercase tracking-wide">Concepto</label>
                <input 
                  type="text" name="concepto" value={formulario.concepto} onChange={manejarCambio} required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:bg-white/10 focus:border-[#4a24ff] focus:ring-4 focus:ring-[#4a24ff]/30 outline-none transition-all font-medium text-white placeholder-white/30"
                  placeholder="Ej: Venta de Botella de Agua"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-white/60 mb-2 uppercase tracking-wide">Método de Pago</label>
                <select 
                  name="metodoPago" value={formulario.metodoPago} onChange={manejarCambio} required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:bg-white/10 focus:border-[#4a24ff] focus:ring-4 focus:ring-[#4a24ff]/30 outline-none transition-all font-medium text-white cursor-pointer appearance-none"
                >
                  <option value="EFECTIVO" className="bg-[#1a1446]">💵 Efectivo</option>
                  <option value="QR" className="bg-[#1a1446]">📱 Pago por QR</option>
                  <option value="TRANSFERENCIA" className="bg-[#1a1446]">🏦 Transferencia Bancaria</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 mt-8 pt-4 border-t border-white/10">
                <button 
                  type="button" onClick={() => setMostrarModal(false)}
                  className="px-6 py-3 text-white/60 hover:bg-white/5 hover:text-white rounded-xl font-bold transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="bg-[#00a870] hover:bg-[#008f5f] text-white px-6 py-3 rounded-xl font-bold transition-all shadow-[0_4px_12px_rgba(0,168,112,0.4)] border border-[#00a870]/50"
                >
                  Guardar Ingreso
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ⚡ TABLA DE HISTORIAL DE CAJA GLASSMORPHISM */}
      <div className="bg-white/5 backdrop-blur-xl rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.2)] border border-white/10 overflow-x-auto relative z-10 custom-scrollbar">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-black/20 border-b border-white/10">
              <th className="p-5 text-xs font-bold text-white/50 uppercase tracking-wider">Fecha y Hora</th>
              <th className="p-5 text-xs font-bold text-white/50 uppercase tracking-wider">Concepto</th>
              <th className="p-5 text-xs font-bold text-white/50 uppercase tracking-wider">Método</th>
              <th className="p-5 text-xs font-bold text-white/50 uppercase tracking-wider text-right">Monto</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {resumen.listaPagos.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-12 text-center text-white/40 font-medium">
                  {fechaInicio || fechaFin ? 'No hay pagos registrados en este rango de fechas.' : 'Aún no hay pagos registrados en la caja hoy.'}
                </td>
              </tr>
            ) : (
              resumen.listaPagos.map((pago) => (
                <tr key={pago.idPago} className="hover:bg-white/5 transition-colors">
                  <td className="p-5 text-white/70 font-medium text-sm">
                    {formatearFecha(pago.fechaHora)}
                  </td>
                  <td className="p-5 font-bold text-white drop-shadow-sm">
                    {pago.concepto}
                  </td>
                  <td className="p-5">
                    <span className="px-3 py-1 bg-white/10 text-white/80 border border-white/20 rounded-lg text-xs font-bold tracking-wide backdrop-blur-sm">
                      {pago.metodoPago === 'EFECTIVO' ? '💵 EFECTIVO' : pago.metodoPago === 'QR' ? '📱 QR' : '🏦 TRANSF.'}
                    </span>
                  </td>
                  <td className="p-5 text-right font-black text-green-400 text-lg drop-shadow-sm">
                    + Bs. {pago.monto.toFixed(2)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ⚡ TOAST DE ÉXITO FLOTANTE */}
      {mostrarToast && (
        <div className="fixed bottom-8 right-8 bg-white/10 backdrop-blur-2xl border border-white/20 text-white px-6 py-4 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.3)] flex items-center gap-4 z-50 animate-bounce">
          <div className="bg-[#00a870] text-white rounded-full w-8 h-8 flex items-center justify-center font-bold shadow-md">✓</div>
          <span className="font-medium tracking-wide drop-shadow-sm">Ingreso registrado en caja</span>
        </div>
      )}
    </div>
  );
}