import { Link } from 'react-router-dom';

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm">
      <div className="p-6 border-b border-gray-100 flex items-center justify-center">
        <h1 className="text-2xl font-bold text-indigo-600 tracking-tight">Graft Gym</h1>
      </div>
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        <Link to="/" className="block px-4 py-3 bg-indigo-50 text-indigo-700 rounded-xl font-medium transition-colors">
          Panel Principal
        </Link>
        <Link to="/clientes" className="block px-4 py-3 text-gray-500 hover:bg-gray-50 hover:text-gray-900 rounded-xl font-medium transition-colors">
          Clientes
        </Link>
        <Link to="/membresias" className="block px-4 py-3 text-gray-500 hover:bg-gray-50 hover:text-gray-900 rounded-xl font-medium transition-colors">
          Membresías
        </Link>
      </nav>
    </aside>
  );
}