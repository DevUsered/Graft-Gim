import { NavLink } from 'react-router-dom';
import { useState } from 'react';
import logoAndrade from '../assets/perfil_logo.png'; 

export default function Sidebar({ onLogout }: { onLogout: () => void }) {
  const [isOpen, setIsOpen] = useState(true);

  const nombreUsuario = localStorage.getItem('username') || 'Administrador';
  const nombreGym = localStorage.getItem('nombreGym') || 'Mi Gimnasio'; 
  const rolUsuario = localStorage.getItem('rol') || 'CAJERO';

  const linkClasses = ({ isActive }: { isActive: boolean }) =>
    `flex items-center p-4 my-2 transition-all rounded-2xl font-bold border border-transparent backdrop-blur-sm ${
      isActive
        ? 'bg-white/20 text-white shadow-[0_4px_15px_rgba(255,255,255,0.1)] border-white/30'
        : 'text-white/60 hover:bg-white/10 hover:text-white hover:border-white/20'
    } ${!isOpen ? 'justify-center' : ''}`;

  return (
    <div className={`relative bg-[#1a1446]/60 backdrop-blur-2xl border-r border-white/10 flex flex-col transition-all duration-300 ${isOpen ? 'w-72' : 'w-24'} shrink-0 z-20`}>
      
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-[#4a24ff]/20 to-transparent pointer-events-none"></div>

      <div className="relative z-10 p-6 flex items-center justify-between border-b border-white/10 h-24">
        {isOpen && (
          <div className="flex items-center gap-3 animate-fade-in overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-white/20 to-white/5 border border-white/20 flex items-center justify-center shrink-0 shadow-lg backdrop-blur-sm">
              <span className="text-white text-xl font-black drop-shadow-md">
                {nombreGym.charAt(0).toUpperCase()}
              </span>
            </div>
            <h1
              className="text-2xl font-black text-white tracking-tight truncate drop-shadow-md"
              title={nombreGym}
            >
              {nombreGym}
            </h1>
          </div>
        )}
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="text-white/50 hover:text-white bg-white/5 hover:bg-white/10 border border-transparent hover:border-white/20 p-2 rounded-xl transition-all min-w-[40px] backdrop-blur-sm"
        >
          {isOpen ? '◀' : '▶'}
        </button>
      </div>

      {/* ENLACES DEL MENÚ */}
      <nav className="relative z-10 flex-1 p-4 overflow-y-auto custom-scrollbar">
        <ul className="space-y-1">
          <li>
            <NavLink to="/" className={linkClasses}>
              <span className="text-2xl drop-shadow-sm">📊</span>
              {isOpen && <span className="ml-4 tracking-wide">Dashboard</span>}
            </NavLink>
          </li>
          <li>
            <NavLink to="/recepcion" className={linkClasses}>
              <span className="text-2xl drop-shadow-sm">🎯</span>
              {isOpen && <span className="ml-4 tracking-wide">Recepción</span>}
            </NavLink>
          </li>
          <li>
            <NavLink to="/clientes" className={linkClasses}>
              <span className="text-2xl drop-shadow-sm">👥</span>
              {isOpen && <span className="ml-4 tracking-wide">Clientes</span>}
            </NavLink>
          </li>
          <li>
            <NavLink to="/membresias" className={linkClasses}>
              <span className="text-2xl drop-shadow-sm">💳</span>
              {isOpen && <span className="ml-4 tracking-wide">Planes</span>}
            </NavLink>
          </li>
          <li>
            <NavLink to="/suscripciones" className={linkClasses}>
              <span className="text-2xl drop-shadow-sm">📝</span>
              {isOpen && <span className="ml-4 tracking-wide">Suscripciones</span>}
            </NavLink>
          </li>
          {rolUsuario === 'ADMIN' && (
            <li>
              <NavLink to="/finanzas" className={linkClasses}>
                <span className="text-2xl drop-shadow-sm">💰</span>
                {isOpen && <span className="ml-4 tracking-wide">Caja y Finanzas</span>}
              </NavLink>
            </li>
          )}
          {rolUsuario === 'ADMIN' && (
            <li>
              <NavLink to="/usuarios" className={linkClasses}>
                <span className="text-2xl drop-shadow-sm">🔐</span>
                {isOpen && <span className="ml-4 tracking-wide">Staff y Accesos</span>}
              </NavLink>
            </li>
          )}
        </ul>
      </nav>

      {/* SECCIÓN DEL USUARIO Y LOGOUT (ZONA INFERIOR) */}
      <div className="relative z-10 p-4 border-t border-white/10 bg-black/10 backdrop-blur-md">
        <div className={`flex items-center ${!isOpen ? 'justify-center' : 'justify-between'} bg-white/5 p-3 rounded-2xl border border-white/10 shadow-sm backdrop-blur-sm`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 text-white flex items-center justify-center font-bold text-lg shrink-0">
              {nombreUsuario.charAt(0).toUpperCase()}
            </div>
            {isOpen && (
              <div className="animate-fade-in overflow-hidden">
                <p className="text-sm font-black text-white truncate drop-shadow-sm">{nombreUsuario}</p>
                <p className="text-xs font-bold text-[#a78bfa] drop-shadow-sm">{rolUsuario.toLowerCase()}</p>
              </div>
            )}
          </div>
          
          {isOpen && (
            <button 
              onClick={onLogout}
              className="w-10 h-10 shrink-0 rounded-xl bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all shadow-sm backdrop-blur-md"
              title="Cerrar Sesión"
            >
              🚪
            </button>
          )}
        </div>
        
        {!isOpen && (
          <button 
            onClick={onLogout}
            className="w-full mt-2 h-10 rounded-xl bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all shadow-sm backdrop-blur-md"
            title="Cerrar Sesión"
          >
            🚪
          </button>
        )}

        {/* LOGO DE ANDRADE CRAFT */}
        {isOpen && (
          <div className="text-center mt-6 flex flex-col items-center animate-fade-in">
            <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2">
              Powered by
            </p>
            <img 
              src={logoAndrade} 
              alt="Andrade Craft" 
              className="h-7 w-auto object-contain mb-1 opacity-70 brightness-0 invert transition-opacity hover:opacity-100" 
            />
            <p className="text-xs font-bold text-white/60 drop-shadow-sm">
              Andrade Craft Systems
            </p>
          </div>
        )}
      </div>
    </div>
  );
}