import { NavLink } from 'react-router-dom';
import { useState } from 'react';

// Recibimos la función de cerrar sesión desde App.tsx
export default function Sidebar({ onLogout }: { onLogout: () => void }) {
  const [isOpen, setIsOpen] = useState(true);

  // Recuperamos el nombre del usuario (Ej: 'edgar')
  const nombreUsuario = localStorage.getItem('username') || 'Administrador';

  const linkClasses = ({ isActive }: { isActive: boolean }) =>
    `flex items-center p-4 my-2 transition-all rounded-2xl font-bold ${
      isActive
        ? 'bg-[#4a24ff] text-white shadow-[0_8px_20px_rgba(74,36,255,0.3)]'
        : 'text-gray-400 hover:bg-[#f4edff] hover:text-[#4a24ff]'
    } ${!isOpen ? 'justify-center' : ''}`;

  return (
    <div className={`bg-white h-screen shadow-[10px_0_40px_rgba(0,0,0,0.03)] border-r border-gray-100 flex flex-col transition-all duration-300 ${isOpen ? 'w-72' : 'w-24'}`}>
      
      {/* CABECERA Y LOGO */}
      <div className="p-6 flex items-center justify-between border-b border-gray-50">
        {isOpen && (
          <h1 className="text-3xl font-black text-[#1a1446] tracking-tight animate-fade-in">
            Graft<span className="text-[#4a24ff]">Gym</span>
          </h1>
        )}
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="text-gray-400 hover:text-[#4a24ff] bg-gray-50 hover:bg-[#f4edff] p-2 rounded-xl transition-colors"
        >
          {isOpen ? '◀' : '▶'}
        </button>
      </div>

      {/* ENLACES DEL MENÚ */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-1">
          <li>
            <NavLink to="/" className={linkClasses}>
              <span className="text-2xl">📊</span>
              {isOpen && <span className="ml-4 tracking-wide">Dashboard</span>}
            </NavLink>
          </li>
          <li>
            <NavLink to="/recepcion" className={linkClasses}>
              <span className="text-2xl">🎯</span>
              {isOpen && <span className="ml-4 tracking-wide">Recepción</span>}
            </NavLink>
          </li>
          <li>
            <NavLink to="/clientes" className={linkClasses}>
              <span className="text-2xl">👥</span>
              {isOpen && <span className="ml-4 tracking-wide">Clientes</span>}
            </NavLink>
          </li>
          <li>
            <NavLink to="/membresias" className={linkClasses}>
              <span className="text-2xl">💳</span>
              {isOpen && <span className="ml-4 tracking-wide">Planes</span>}
            </NavLink>
          </li>
          <li>
            <NavLink to="/suscripciones" className={linkClasses}>
              <span className="text-2xl">📝</span>
              {isOpen && <span className="ml-4 tracking-wide">Suscripciones</span>}
            </NavLink>
          </li>
        </ul>
      </nav>

      {/* SECCIÓN DEL USUARIO Y LOGOUT (EN LA PARTE INFERIOR) */}
      <div className="p-4 border-t border-gray-50 bg-[#fafafa]">
        <div className={`flex items-center ${!isOpen ? 'justify-center' : 'justify-between'} bg-white p-3 rounded-2xl border border-gray-100 shadow-sm`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#f4edff] text-[#4a24ff] flex items-center justify-center font-bold text-lg">
              {nombreUsuario.charAt(0).toUpperCase()}
            </div>
            {isOpen && (
              <div className="animate-fade-in overflow-hidden">
                <p className="text-sm font-black text-[#1a1446] truncate">{nombreUsuario}</p>
                <p className="text-xs font-bold text-gray-400">Administrador</p>
              </div>
            )}
          </div>
          
          {isOpen && (
            <button 
              onClick={onLogout}
              className="w-10 h-10 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all shadow-sm"
              title="Cerrar Sesión"
            >
              🚪
            </button>
          )}
        </div>
        
        {/* Botón de logout cuando el menú está cerrado */}
        {!isOpen && (
          <button 
            onClick={onLogout}
            className="w-full mt-2 h-10 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all shadow-sm"
            title="Cerrar Sesión"
          >
            🚪
          </button>
        )}
      </div>

    </div>
  );
}