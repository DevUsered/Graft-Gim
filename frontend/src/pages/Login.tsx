import { useState } from 'react';

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
      const respuesta = await fetch('https://graftgym-api.onrender.com/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      if (!respuesta.ok) throw new Error('Credenciales incorrectas');

      const datos = await respuesta.json();
      
      // Guardamos la llave mágica en la memoria del navegador
      localStorage.setItem('token', datos.token); 
      
      // Flexibilidad por si el backend usa 'role', 'roles' u otro formato
      const rolAsignado = datos.rol || datos.role || (datos.roles ? datos.roles[0] : '') || '';
      localStorage.setItem('rol', typeof rolAsignado === 'string' ? rolAsignado : JSON.stringify(rolAsignado));
      
      localStorage.setItem('username', username);
      localStorage.setItem('estadoGym', datos.estado || 'ACTIVO');
      localStorage.setItem('vencimientoGym', datos.vencimiento || '');
      localStorage.setItem('nombreGym', datos.nombreGym || 'Panel de Control');

      onLogin(); // Le avisamos a la app que ya podemos entrar
      
    } catch {
      setError('Usuario o contraseña incorrectos.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#fff0e6] via-[#f4edff] to-white p-4">
      <div className="bg-white p-10 rounded-3xl shadow-[0_20px_50px_-20px_rgba(0,0,0,0.1)] w-full max-w-md border border-gray-50">
        
        <div className="text-center mb-10">
          {/*LOGO DE Field*/}
          <div className="flex justify-center mb-4">
            <img 
              src="logo_personal.png"
              alt="Graft Field Logo"
              className="h-16 object-contain drop-shadow-sm"
            />
          </div>
          <h1 className="text-4xl font-black text-[#1a1446] tracking-tight mb-2">
            Graft<span className="text-[#4a24ff]">Gym</span>
          </h1>
          <p className="text-gray-500 font-medium">Panel de Administración</p>
        </div>

        <form onSubmit={manejarLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-500 mb-2 uppercase tracking-wide">Usuario</label>
            <input 
              type="text" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              required
              className="w-full bg-gray-50 border border-transparent rounded-xl px-4 py-3 focus:bg-white focus:border-[#4a24ff] focus:ring-4 focus:ring-[#f4edff] outline-none transition-all font-medium text-[#1a1446]"
              placeholder="Ej: juanito123"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-500 mb-2 uppercase tracking-wide">Contraseña</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required
              className="w-full bg-gray-50 border border-transparent rounded-xl px-4 py-3 focus:bg-white focus:border-[#4a24ff] focus:ring-4 focus:ring-[#f4edff] outline-none transition-all font-medium text-[#1a1446]"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-red-500 font-bold text-sm text-center animate-bounce">{error}</p>}

          <button 
            type="submit" 
            disabled={cargando}
            className="w-full bg-[#4a24ff] hover:bg-[#3616d9] text-white px-6 py-4 rounded-xl font-bold text-lg transition-all shadow-[0_8px_20px_rgba(74,36,255,0.25)] hover:-translate-y-0.5 disabled:opacity-50"
          >
            {cargando ? 'Iniciando sesión...' : 'Ingresar'}
          </button>
        </form>
      </div>
      <div className="absolute bottom-4 w-full text-center px-4 z-0">
        <p className="text-xs text-gray-400 font-bold tracking-wide">
          © {new Date().getFullYear()} Graft Field.
          <span className="block sm:inline sm:ml-1">Software desarrollado por Edgar Perez. Todos los derechos reservados.</span>
        </p>
      </div>
    </div>
  );
}