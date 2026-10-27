import { useState } from 'react';
import logoAndrade from '../assets/perfil_logo.png';

export default function Login({ onLogin }: { onLogin: () => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const manejarLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);
    setError('');

    try {
      const respuesta = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      if (!respuesta.ok) throw new Error('Credenciales incorrectas');

      const datos = await respuesta.json();
      
      localStorage.setItem('token', datos.token); 
      
      const rolEncontrado = datos.rol || datos.role || (datos.roles ? datos.roles[0] : '') || 'CAJERO';
      const rolFinal = typeof rolEncontrado === 'string' ? rolEncontrado.toUpperCase() : 'CAJERO';

      localStorage.setItem('rol', rolFinal);
      localStorage.setItem('username', username);
      localStorage.setItem('estadoGym', datos.estado || 'ACTIVO');
      localStorage.setItem('vencimientoGym', datos.vencimiento || '');
      localStorage.setItem('nombreGym', datos.nombreGym || 'Panel de Control');

      onLogin(); 
      
    } catch {
      setError('Usuario o contraseña incorrectos.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-[#1a1446] via-[#4a24ff] to-[#8b5cf6] p-4 relative overflow-hidden">
      
      {/* Círculos decorativos desenfocados detrás del panel para potenciar el glassmorfismo */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
      <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-4000"></div>

      {/* 2. EL PANEL DE VIDRIO (Glass Panel) */}
      <div className="relative z-10 w-full max-w-md p-10 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)]">
        
        <div className="text-center mb-10">
          {/*LOGO DE Field*/}
          <div className="flex justify-center mb-4">
            <img 
              src={logoAndrade}
              alt="Andrade Craft Logo"
              className="h-16 object-contain drop-shadow-md brightness-0 invert" 
              /* brightness-0 invert hace que el logo se vea blanco, ideal para fondos oscuros. Quítalo si tu logo ya tiene color claro */
            />
          </div>
          {/* Títulos en blanco/colores claros para contrastar con el fondo */}
          <h1 className="text-4xl font-black text-white tracking-tight mb-2 drop-shadow-md">
            Craft<span className="text-[#a78bfa]">Gym</span>
          </h1>
          <p className="text-white/70 font-medium">Panel de Administración</p>
        </div>

        <form onSubmit={manejarLogin} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-white/80 mb-2 uppercase tracking-wide">Usuario</label>
            {/* Input translúcido */}
            <input 
              type="text" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:bg-white/20 focus:border-white/30 focus:ring-4 focus:ring-[#8b5cf6]/30 outline-none transition-all font-medium text-white placeholder-white/40"
              placeholder="Ej: juanito123"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-white/80 mb-2 uppercase tracking-wide">Contraseña</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:bg-white/20 focus:border-white/30 focus:ring-4 focus:ring-[#8b5cf6]/30 outline-none transition-all font-medium text-white placeholder-white/40"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-red-300 font-bold text-sm text-center animate-bounce bg-red-900/30 py-2 rounded-lg border border-red-500/30 backdrop-blur-sm">{error}</p>}

          <button 
            type="submit" 
            disabled={cargando}
            className="w-full bg-white text-[#4a24ff] hover:bg-gray-100 hover:shadow-lg hover:shadow-white/20 px-6 py-4 rounded-xl font-black text-lg transition-all hover:-translate-y-0.5 disabled:opacity-50"
          >
            {cargando ? 'Iniciando sesión...' : 'Ingresar'}
          </button>
        </form>
      </div>

      <div className="absolute bottom-4 w-full text-center px-4 z-10">
        <p className="text-xs text-white/50 font-bold tracking-wide">
          © {new Date().getFullYear()} Andrade Craft.
          <span className="block sm:inline sm:ml-1">Software desarrollado por Edgar Perez. Todos los derechos reservados.</span>
        </p>
      </div>
    </div>
  );
}