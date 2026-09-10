import { NavLink } from 'react-router-dom';
import { useState } from 'react';

export default function Sidebar({ onLogout }: { onLogout: () => void }) {
  const [isOpen, setIsOpen] = useState(true);

  // Recuperamos el nombre del usuario y el del gimnasio
  const nombreUsuario = localStorage.getItem('username') || 'Administrador';
  const nombreGym = localStorage.getItem('nombreGym') || 'Mi Gimnasio'; // <-- ¡NUEVO!

  const linkClasses = ({ isActive }: { isActive: boolean }) =>
    `flex items-center p-4 my-2 transition-all rounded-2xl font-bold ${
      isActive
        ? 'bg-[#4a24ff] text-white shadow-[0_8px_20px_rgba(74,36,255,0.3)]'
        : 'text-gray-400 hover:bg-[#f4edff] hover:text-[#4a24ff]'
    } ${!isOpen ? 'justify-center' : ''}`;

  return (
    <div className={`bg-white h-screen shadow-[10px_0_40px_rgba(0,0,0,0.03)] border-r border-gray-100 flex flex-col transition-all duration-300 ${isOpen ? 'w-72' : 'w-24'} shrink-0`}>
      
      {/* CABECERA Y LOGO DINÁMICO */}
      <div className="p-6 flex items-center justify-between border-b border-gray-50 h-24">
        {isOpen && (
          <div className="flex items-center gap-3 animate-fade-in overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#4a24ff] to-[#8b5cf6] flex items-center justify-center shrink-0 shadow-[0_4px_12px_rgba(74,36,255,0.3)]">
              <span className="text-white text-xl font-black drop-shadow-md">
                {nombreGym.charAt(0).toUpperCase()}
              </span>
            </div>
            <h1
            className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-[#1a1446] via-[#4a24f6] to-[#8b5cf6] tracking-tight truncate"
            title="nombreGym">{nombreGym}</h1>
          </div>
        )}
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="text-gray-400 hover:text-[#4a24ff] bg-gray-50 hover:bg-[#f4edff] p-2 rounded-xl transition-colors min-w-[40px]"
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
          <li>
            <NavLink to="/finanzas" className={linkClasses}>
              <span className="text-2xl">💰</span>
              {isOpen && <span className="ml-4 tracking-wide"> Caja y Finanzas</span>}
            </NavLink>
          </li>
        </ul>
      </nav>

      {/* SECCIÓN DEL USUARIO Y LOGOUT */}
      <div className="p-4 border-t border-gray-50 bg-[#fafafa]">
        <div className={`flex items-center ${!isOpen ? 'justify-center' : 'justify-between'} bg-white p-3 rounded-2xl border border-gray-100 shadow-sm`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#f4edff] text-[#4a24ff] flex items-center justify-center font-bold text-lg shrink-0">
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
              className="w-10 h-10 shrink-0 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all shadow-sm"
              title="Cerrar Sesión"
            >
              🚪
            </button>
          )}
        </div>
        
        {!isOpen && (
          <button 
            onClick={onLogout}
            className="w-full mt-2 h-10 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all shadow-sm"
            title="Cerrar Sesión"
          >
            🚪
          </button>
        )}

        {isOpen && (
          <div className="text-center mt-6 flex flex-col items-center animate-fade-in">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
              Powered by
            </p>
            <img 
              src="/logo_personal.png" 
              alt="Graft Field" 
              className="h-6 w-auto object-contain mb-1 opacity-80" 
            />
            <p className="text-xs font-bold text-[#1a1446]">
              Graft Field Systems
            </p>
          </div>
        )}
      </div>
    </div>
  );
}