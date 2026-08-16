export default function App() {
  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-900">
      
      {/* Menú Lateral (Sidebar) */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm">
        <div className="p-6 border-b border-gray-100 flex items-center justify-center">
          <h1 className="text-2xl font-bold text-indigo-600 tracking-tight">Graft Gym</h1>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <a href="#" className="block px-4 py-3 bg-indigo-50 text-indigo-700 rounded-xl font-medium transition-colors">
            Panel Principal
          </a>
          <a href="#" className="block px-4 py-3 text-gray-500 hover:bg-gray-50 hover:text-gray-900 rounded-xl font-medium transition-colors">
            Clientes
          </a>
          <a href="#" className="block px-4 py-3 text-gray-500 hover:bg-gray-50 hover:text-gray-900 rounded-xl font-medium transition-colors">
            Membresías
          </a>
          <a href="#" className="block px-4 py-3 text-gray-500 hover:bg-gray-50 hover:text-gray-900 rounded-xl font-medium transition-colors">
            Reportes
          </a>
        </nav>
      </aside>

      {/* Contenido Principal */}
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800">Resumen de Hoy</h2>
          <p className="text-gray-500 mt-1">Monitorea la actividad de tu gimnasio en tiempo real.</p>
        </header>

        {/* Cuadrícula de Tarjetas (Cards) */}
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
      </main>

    </div>
  );
}