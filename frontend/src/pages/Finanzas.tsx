import { useState, useEffect } from 'react';

interface Pago {
  idPago: number;
  monto: number;
  concepto: string;
  metodoPago: string;
  fechaHora: string;
}

export default function Finanzas() {
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarToast, setMostrarToast] = useState(false);
  
  const [formulario, setFormulario] = useState({
    monto: '',
    concepto: '',
    metodoPago: 'EFECTIVO'
  });

  const cargarPagos = () => {
    fetch('http://localhost:8080/api/pagos', {
      headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
    })
      .then(res => res.json())
      .then(datos => {
        // Ordenamos los pagos para que los más recientes salgan arriba
        const ordenados = datos.sort((a: Pago, b: Pago) => 
          new Date(b.fechaHora).getTime() - new Date(a.fechaHora).getTime()
        );
        setPagos(ordenados);
      })
      .catch(error => console.error("Error al cargar finanzas:", error));
  };

  useEffect(() => {
    cargarPagos();
  }, []);

  const manejarCambio = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormulario({ ...formulario, [e.target.name]: e.target.value });
  };

  const guardarPago = (e: React.FormEvent) => {
    e.preventDefault();

    fetch('http://localhost:8080/api/pagos', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + localStorage.getItem('token')
      },
      body: JSON.stringify({
        monto: parseFloat(formulario.monto),
        concepto: formulario.concepto,
        metodoPago: formulario.metodoPago
      })
    })
    .then(res => res.json())
    .then(() => {
      setMostrarModal(false);
      setFormulario({ monto: '', concepto: '', metodoPago: 'EFECTIVO' });
      cargarPagos();
      setMostrarToast(true);
      setTimeout(() => setMostrarToast(false), 3000);
    })
    .catch(error => console.error("Error al registrar pago:", error));
  };

  // Cálculos matemáticos para el Dashboard financiero
  const hoyStr = new Date().toISOString().split('T')[0];
  
  const totalHistorico = pagos.reduce((suma, p) => suma + p.monto, 0);
  const totalHoy = pagos
    .filter(p => p.fechaHora.startsWith(hoyStr))
    .reduce((suma, p) => suma + p.monto, 0);

  // Función para darle formato bonito a la fecha (Ej: "4 sep 2026, 14:30")
  const formatearFecha = (fechaOriginal: string) => {
    const fecha = new Date(fechaOriginal);
    return new Intl.DateTimeFormat('es-BO', { 
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' 
    }).format(fecha);
  };

  return (
    <div className="p-4 lg:p-8">
      <header className="mb-10 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <h2 className="text-4xl font-black text-[#1a1446] tracking-tight">Finanzas y Caja</h2>
          <p className="text-gray-500 mt-2 font-medium">Lleva el control de todos los ingresos del gimnasio.</p>
        </div>
        <button 
          onClick={() => setMostrarModal(true)}
          className="bg-[#00a870] hover:bg-[#008f5f] text-white px-6 py-3 rounded-xl font-bold transition-all shadow-[0_8px_20px_rgba(0,168,112,0.25)] hover:-translate-y-0.5"
        >
          + Registrar Ingreso
        </button>
      </header>

      {/* --- TARJETAS DE RESUMEN (ESTILO FINTECH) --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <div className="bg-gradient-to-br from-[#1a1446] to-[#2d226e] rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-10 -mt-10"></div>
          <p className="text-[#a594ff] font-bold uppercase tracking-wider text-sm mb-2">Ingresos de Hoy</p>
          <h3 className="text-5xl font-black">Bs. {totalHoy.toFixed(2)}</h3>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col justify-center">
          <p className="text-gray-400 font-bold uppercase tracking-wider text-sm mb-2">Total Histórico</p>
          <h3 className="text-4xl font-black text-[#1a1446]">Bs. {totalHistorico.toFixed(2)}</h3>
        </div>
      </div>

      {/* --- MODAL PARA REGISTRAR PAGO MANUAL --- */}
      {mostrarModal && (
        <div className="fixed inset-0 bg-[#1a1446]/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md border border-gray-100">
            <h3 className="text-2xl font-black text-[#1a1446] mb-6">Registrar Ingreso</h3>
            
            <form onSubmit={guardarPago} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-500 mb-2 uppercase tracking-wide">Monto (Bs.)</label>
                <input 
                  type="number" step="0.01" name="monto" value={formulario.monto} onChange={manejarCambio} required
                  className="w-full bg-gray-50 border border-transparent rounded-xl px-4 py-3 focus:bg-white focus:border-[#4a24ff] focus:ring-4 focus:ring-[#f4edff] outline-none transition-all font-bold text-[#1a1446] text-2xl"
                  placeholder="0.00" autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-500 mb-2 uppercase tracking-wide">Concepto</label>
                <input 
                  type="text" name="concepto" value={formulario.concepto} onChange={manejarCambio} required
                  className="w-full bg-gray-50 border border-transparent rounded-xl px-4 py-3 focus:bg-white focus:border-[#4a24ff] focus:ring-4 focus:ring-[#f4edff] outline-none transition-all font-medium text-[#1a1446]"
                  placeholder="Ej: Venta de Botella de Agua"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-500 mb-2 uppercase tracking-wide">Método de Pago</label>
                <select 
                  name="metodoPago" value={formulario.metodoPago} onChange={manejarCambio} required
                  className="w-full bg-gray-50 border border-transparent rounded-xl px-4 py-3 focus:bg-white focus:border-[#4a24ff] focus:ring-4 focus:ring-[#f4edff] outline-none transition-all font-medium text-[#1a1446] cursor-pointer"
                >
                  <option value="EFECTIVO">💵 Efectivo</option>
                  <option value="QR">📱 Pago por QR</option>
                  <option value="TRANSFERENCIA">🏦 Transferencia Bancaria</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 mt-8 pt-4">
                <button 
                  type="button" onClick={() => setMostrarModal(false)}
                  className="px-6 py-3 text-gray-500 hover:bg-gray-100 rounded-xl font-bold transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="bg-[#00a870] hover:bg-[#008f5f] text-white px-6 py-3 rounded-xl font-bold transition-all shadow-[0_4px_12px_rgba(0,168,112,0.2)]"
                >
                  Guardar Ingreso
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- TABLA DE HISTORIAL DE CAJA --- */}
      <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-50 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#fafafa] border-b border-gray-100">
              <th className="p-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Fecha y Hora</th>
              <th className="p-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Concepto</th>
              <th className="p-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Método</th>
              <th className="p-5 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Monto</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {pagos.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-12 text-center text-gray-400 font-medium">
                  Aún no hay pagos registrados en la caja.
                </td>
              </tr>
            ) : (
              pagos.map((pago) => (
                <tr key={pago.idPago} className="hover:bg-[#fafafa] transition-colors">
                  <td className="p-5 text-gray-500 font-medium text-sm">
                    {formatearFecha(pago.fechaHora)}
                  </td>
                  <td className="p-5 font-bold text-[#1a1446]">
                    {pago.concepto}
                  </td>
                  <td className="p-5">
                    <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-bold tracking-wide">
                      {pago.metodoPago === 'EFECTIVO' ? '💵 EFECTIVO' : pago.metodoPago === 'QR' ? '📱 QR' : '🏦 TRANSF.'}
                    </span>
                  </td>
                  <td className="p-5 text-right font-black text-[#00a870] text-lg">
                    + Bs. {pago.monto.toFixed(2)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* TOAST DE ÉXITO */}
      {mostrarToast && (
        <div className="fixed bottom-8 right-8 bg-[#1a1446] text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 z-50 animate-bounce">
          <div className="bg-[#00a870] text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">✓</div>
          <span className="font-medium tracking-wide">Ingreso registrado en caja</span>
        </div>
      )}
    </div>
  );
}