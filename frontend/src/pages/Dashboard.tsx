export default function Dashboard() {
  return (
    <>
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800">Resumen de Hoy</h2>
        <p className="text-gray-500 mt-1">Monitorea la actividad de tu gimnasio en tiempo real.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Clientes Activos</h3>
          <p className="text-4xl font-extrabold text-gray-800">142</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Vencimientos Hoy</h3>
          <p className="text-4xl font-extrabold text-red-500">8</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Accesos Diarios</h3>
          <p className="text-4xl font-extrabold text-indigo-600">56</p>
        </div>
      </div>
    </>
  );
}