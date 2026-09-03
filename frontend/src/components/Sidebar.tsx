import { useState } from 'react';
import { NavLink } from 'react-router-dom';

export default function Sidebar() {
  // Estado para controlar si el menú está abierto o cerrado
  const [isOpen, setIsOpen] = useState(true);

  const linkClasses = ({ isActive }: { isActive: boolean }) => 
    `flex items-center px-4 py-3 mb-2 rounded-xl transition-all duration-300 font-semibold ${
      isActive 
        ? 'bg-[#f4edff] text-[#4a24ff] shadow-sm' 
        : 'text-gray-500 hover:bg-gray-50 hover:text-[#1a1446]'
    } ${!isOpen && 'justify-center px-0'}`; // Si está cerrado, centramos el icono

  return (
    <aside 
      className={`${
        isOpen ? 'w-72' : 'w-24'
      } bg-white border-r border-gray-100 flex flex-col transition-all duration-300 relative z-20 shadow-[4px_0_24px_rgba(0,0,0,0.02)]`}
    >
      {/* Botón para colapsar/expandir */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="absolute -right-4 top-8 bg-white border border-gray-100 shadow-md w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-[#4a24ff] transition-colors z-30"
      >
        {isOpen ? '◀' : '▶'}
      </button>

      {/* Título / Logo */}
      <div className={`h-24 flex items-center ${isOpen ? 'px-8' : 'justify-center'} border-b border-gray-50`}>
        {isOpen ? (
          <h1 className="text-3xl font-black text-[#1a1446] tracking-tight">
            Graft<span className="text-[#4a24ff]">Gym</span>
          </h1>
        ) : (
          <h1 className="text-3xl font-black text-[#4a24ff]">G</h1>
        )}
      </div>

      {/* Menú de navegación */}
      <nav className="flex-1 px-4 py-8">
        <ul className="space-y-2">
          <li>
            <NavLink to="/" className={linkClasses}>
              <span className="text-xl">📊</span>
              {isOpen && <span className="ml-4">Dashboard</span>}
            </NavLink>
          </li>
          <li>
            <NavLink to="/recepcion" className={linkClasses}>
              <span className="text-xl">🛎️</span>
              {isOpen && <span className="ml-4">Control de Acceso</span>}
            </NavLink>
          </li>
          <li>
            <NavLink to="/clientes" className={linkClasses}>
              <span className="text-xl">👥</span>
              {isOpen && <span className="ml-4">Directorio de Clientes</span>}
            </NavLink>
          </li>
          <li>
            <NavLink to="/membresias" className={linkClasses}>
              <span className="text-xl">🏷️</span>
              {isOpen && <span className="ml-4">Planes y Membresías</span>}
            </NavLink>
          </li>
          <li>
            <NavLink to="/suscripciones" className={linkClasses}>
              <span className="text-xl">⚡</span>
              {isOpen && <span className="ml-4">Suscripciones Activas</span>}
            </NavLink>
          </li>
        </ul>
      </nav>

      {/* Pie del menú (Perfil) */}
      <div className="p-6 border-t border-gray-50">
        <div className={`flex items-center ${isOpen ? 'gap-4 px-4 py-3' : 'justify-center'} bg-[#fafafa] rounded-2xl`}>
          <div className="w-10 h-10 rounded-full bg-[#f4edff] flex items-center justify-center text-[#4a24ff] font-bold shadow-sm shrink-0">
            E
          </div>
          {isOpen && (
            <div className="flex flex-col text-sm overflow-hidden">
              <span className="font-bold text-[#1a1446] truncate">Edgar Perez</span>
              <span className="text-gray-400 font-medium text-xs">Admin</span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}