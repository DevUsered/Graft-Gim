import { useState, useEffect } from 'react';
import { apiFetch } from '../utils/api';

interface Usuario {
  idUsuario: number;
  username: string;
  rol: string;
}

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  
  const [usuarioEditando, setUsuarioEditando] = useState<number | null>(null);
  const [mostrarToast, setMostrarToast] = useState(false);
  const [mensajeToast, setMensajeToast] = useState("");
  
  const [formulario, setFormulario] = useState({
    username: '',
    password: '',
    rol: 'CAJERO'
  });

  const cargarUsuarios = () => {
    apiFetch('/api/usuarios')
      .then(respuesta => respuesta.json())
      .then(datos => setUsuarios(datos))
      .catch(error => console.error("Error conectando al backend:", error));
  };

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const manejarCambio = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormulario({ ...formulario, [e.target.name]: e.target.value });
  };

  const abrirModalCrear = () => {
    setFormulario({ username: '', password: '', rol: 'CAJERO' });
    setUsuarioEditando(null);
    setMostrarModal(true);
  };

  const abrirModalEditar = (usuario: Usuario) => {
    setFormulario({
      username: usuario.username,
      password: '', 
      rol: usuario.rol
    });
    setUsuarioEditando(usuario.idUsuario);
    setMostrarModal(true);
  };

  const guardarUsuario = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!usuarioEditando && formulario.password.length < 8) {
      alert("Por seguridad, la contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (usuarioEditando && formulario.password && formulario.password.length < 8) {
      alert("Por seguridad, la nueva contraseña debe tener al menos 8 caracteres.");
      return;
    }

    const endpoint = usuarioEditando ? `/api/usuarios/${usuarioEditando}` : `/api/usuarios`;
    const metodo = usuarioEditando ? 'PUT' : 'POST';

    const { password, ...restoFormulario } = formulario;
    const bodyAEnviar = (usuarioEditando && !password) ? restoFormulario : formulario;

    try {
      const respuesta = await apiFetch(endpoint, {
        method: metodo,
        body: JSON.stringify(bodyAEnviar)
      });

      if (!respuesta.ok) {
        let mensajeError = "Ocurrió un error al guardar el usuario.";
        try {
          const datosError = await respuesta.json();
          if (datosError && datosError.error) {
            mensajeError = datosError.error; 
          }
        } catch (e) {
          console.error("No se pudo leer el JSON del error");
        }
        
        alert(`Aviso: ${mensajeError}`);
        return; 
      }

      setMostrarModal(false); 
      setFormulario({ username: '', password: '', rol: 'CAJERO' }); 
      setUsuarioEditando(null);
      cargarUsuarios(); 
      
      setMensajeToast(usuarioEditando ? "Credenciales actualizadas" : "Nuevo empleado registrado");
      setMostrarToast(true);
      setTimeout(() => setMostrarToast(false), 3000);

    } catch (error: any) {
      alert(`Error de red: ${error.message}`);
    }
  };

  const eliminarUsuario = (id: number) => {
    if (window.confirm("¿Estás seguro de que deseas revocar el acceso a este usuario? Ya no podrá iniciar sesión.")) {
      apiFetch(`/api/usuarios/${id}`, { method: 'DELETE' })
      .then(() => {
        cargarUsuarios();
        setMensajeToast("Usuario eliminado exitosamente");
        setMostrarToast(true);
        setTimeout(() => setMostrarToast(false), 3000);
      })
      .catch(error => console.error("Error al eliminar:", error));
    }
  };

  return (
    // ⚡ 1. FONDO TRANSPARENTE, TEXTO CLARO
    <div className="p-4 lg:p-8 min-h-full text-white relative">
      
      {/* ⚡ CABECERA */}
      <header className="mb-10 flex flex-col md:flex-row md:justify-between md:items-end gap-4 relative z-10">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tight drop-shadow-md">Staff y Accesos</h2>
          <p className="text-white/60 mt-2 font-medium drop-shadow-sm">Gestiona las cuentas de los empleados que usan el sistema.</p>
        </div>
        <button 
          onClick={abrirModalCrear}
          className="bg-[#4a24ff] hover:bg-[#3616d9] text-white px-6 py-3 rounded-xl font-bold transition-all shadow-[0_8px_20px_rgba(74,36,255,0.4)] hover:-translate-y-0.5 border border-[#4a24ff]/50"
        >
          + Nuevo Usuario
        </button>
      </header>

      {/* ⚡ MODAL GLASSMORPHISM */}
      {mostrarModal && (
        <div className="fixed inset-0 bg-[#1a1446]/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white/10 backdrop-blur-2xl p-8 rounded-3xl shadow-2xl w-full max-w-md border border-white/20">
            <h3 className="text-2xl font-black text-white mb-6 drop-shadow-md">
              {usuarioEditando ? 'Modificar Accesos' : 'Crear Cuenta de Empleado'}
            </h3>
            
            <form onSubmit={guardarUsuario} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-white/60 mb-2 uppercase tracking-wide">Nombre de Usuario</label>
                <input 
                  type="text" name="username" value={formulario.username} onChange={manejarCambio} required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:bg-white/10 focus:border-[#4a24ff] focus:ring-4 focus:ring-[#4a24ff]/30 outline-none transition-all font-medium text-white placeholder-white/30"
                  placeholder="Ej: cajero_juan"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-white/60 mb-2 uppercase tracking-wide">
                  {usuarioEditando ? 'Nueva Contraseña (Opcional)' : 'Contraseña'}
                </label>
                <input 
                  type="password" name="password" value={formulario.password} onChange={manejarCambio} 
                  required={!usuarioEditando}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:bg-white/10 focus:border-[#4a24ff] focus:ring-4 focus:ring-[#4a24ff]/30 outline-none transition-all font-medium text-white placeholder-white/30"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-white/60 mb-2 uppercase tracking-wide">Rol en el Sistema</label>
                <select 
                  name="rol" value={formulario.rol} onChange={manejarCambio} required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:bg-white/10 focus:border-[#4a24ff] focus:ring-4 focus:ring-[#4a24ff]/30 outline-none transition-all font-bold text-white cursor-pointer appearance-none"
                >
                  <option value="CAJERO" className="bg-[#1a1446]">Cajero / Recepcionista</option>
                  <option value="ADMIN" className="bg-[#1a1446]">Administrador General</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 mt-8 pt-4 border-t border-white/10">
                <button 
                  type="button" onClick={() => { setMostrarModal(false); setUsuarioEditando(null); }}
                  className="px-6 py-3 text-white/60 hover:bg-white/5 hover:text-white rounded-xl font-bold transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="bg-[#4a24ff] hover:bg-[#3616d9] text-white px-6 py-3 rounded-xl font-bold transition-all shadow-[0_4px_12px_rgba(74,36,255,0.4)] border border-[#4a24ff]/50"
                >
                  {usuarioEditando ? 'Actualizar Accesos' : 'Crear Cuenta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ⚡ TABLA DE USUARIOS GLASSMORPHISM */}
      <div className="bg-white/5 backdrop-blur-xl rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.2)] border border-white/10 overflow-x-auto relative z-10 custom-scrollbar">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="bg-black/20 border-b border-white/10">
              <th className="p-5 text-xs font-bold text-white/50 uppercase tracking-wider">Usuario</th>
              <th className="p-5 text-xs font-bold text-white/50 uppercase tracking-wider">Nivel de Acceso</th>
              <th className="p-5 text-xs font-bold text-white/50 uppercase tracking-wider text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {usuarios.length === 0 ? (
              <tr>
                <td colSpan={3} className="p-12 text-center text-white/40 font-medium">
                  Cargando usuarios...
                </td>
              </tr>
            ) : (
              usuarios.map((usuario) => (
                <tr key={usuario.idUsuario} className="hover:bg-white/5 transition-colors group">
                  <td className="p-5 font-bold text-white flex items-center gap-3 drop-shadow-sm">
                    <div className="w-8 h-8 rounded-full bg-white/10 text-white/80 border border-white/20 flex items-center justify-center text-xs font-black shadow-sm backdrop-blur-sm">
                      {usuario.username.charAt(0).toUpperCase()}
                    </div>
                    {usuario.username}
                  </td>
                  <td className="p-5">
                    <span className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-wide border ${
                      usuario.rol === 'ADMIN' ? 'bg-[#4a24ff]/20 text-[#a78bfa] border-[#4a24ff]/30' : 'bg-green-500/20 text-green-300 border-green-500/30'
                    }`}>
                      {usuario.rol === 'ADMIN' ? '🛡️ ADMINISTRADOR' : '🎫 CAJERO'}
                    </span>
                  </td>
                  <td className="p-5 text-right space-x-2">
                    <button 
                      onClick={() => abrirModalEditar(usuario)}
                      className="w-10 h-10 inline-flex items-center justify-center rounded-xl bg-blue-500/10 text-blue-300 border border-transparent hover:border-blue-500/30 hover:bg-blue-500/20 transition-all"
                      title="Editar Contraseña / Rol"
                    >
                      ✏️
                    </button>
                    <button 
                      onClick={() => eliminarUsuario(usuario.idUsuario)}
                      className="w-10 h-10 inline-flex items-center justify-center rounded-xl bg-red-500/10 text-red-300 border border-transparent hover:border-red-500/30 hover:bg-red-500/20 transition-all"
                      title="Eliminar Cuenta"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ⚡ TOAST DE ÉXITO FLOTANTE */}
      {mostrarToast && (
        <div className="fixed bottom-8 right-8 bg-white/10 backdrop-blur-2xl border border-white/20 text-white px-6 py-4 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.3)] flex items-center gap-4 z-50 animate-bounce">
          <div className="bg-[#00a870] text-white rounded-full w-8 h-8 flex items-center justify-center font-bold shadow-md">✓</div>
          <span className="font-medium tracking-wide drop-shadow-sm">{mensajeToast}</span>
        </div>
      )}
    </div>
  );
}