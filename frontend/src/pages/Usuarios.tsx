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

    // 1. ESCUDO FRONTEND: Validación de contraseña segura
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

      // 2. CAPTURA DEL MENSAJE AMIGABLE: Si el backend rechaza por nombre duplicado
      if (!respuesta.ok) {
        let mensajeError = "Ocurrió un error al guardar el usuario.";
        try {
          const datosError = await respuesta.json();
          if (datosError && datosError.error) {
            mensajeError = datosError.error; // Aquí extrae el mensaje de tu backend
          }
        } catch (e) {
          console.error("No se pudo leer el JSON del error");
        }
        
        alert(`Aviso: ${mensajeError}`);
        return; // Detenemos aquí, el modal se queda abierto para que intente con otro nombre
      }

      // Si todo sale bien, cerramos modal y refrescamos
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
    <div className="p-4 lg:p-8">
      <header className="mb-10 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <h2 className="text-4xl font-black text-[#1a1446] tracking-tight">Staff y Accesos</h2>
          <p className="text-gray-500 mt-2 font-medium">Gestiona las cuentas de los empleados que usan el sistema.</p>
        </div>
        <button 
          onClick={abrirModalCrear}
          className="bg-[#1a1446] hover:bg-[#2d226e] text-white px-6 py-3 rounded-xl font-bold transition-all shadow-[0_8px_20px_rgba(26,20,70,0.25)] hover:-translate-y-0.5"
        >
          + Nuevo Usuario
        </button>
      </header>

      {/* --- INICIO DEL MODAL --- */}
      {mostrarModal && (
        <div className="fixed inset-0 bg-[#1a1446]/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md border border-gray-100">
            <h3 className="text-2xl font-black text-[#1a1446] mb-6">
              {usuarioEditando ? 'Modificar Accesos' : 'Crear Cuenta de Empleado'}
            </h3>
            
            <form onSubmit={guardarUsuario} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-500 mb-2 uppercase tracking-wide">Nombre de Usuario</label>
                <input 
                  type="text" name="username" value={formulario.username} onChange={manejarCambio} required
                  className="w-full bg-gray-50 border border-transparent rounded-xl px-4 py-3 focus:bg-white focus:border-[#4a24ff] focus:ring-4 focus:ring-[#f4edff] outline-none transition-all font-medium text-[#1a1446]"
                  placeholder="Ej: cajero_juan"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-500 mb-2 uppercase tracking-wide">
                  {usuarioEditando ? 'Nueva Contraseña (Opcional)' : 'Contraseña'}
                </label>
                <input 
                  type="password" name="password" value={formulario.password} onChange={manejarCambio} 
                  required={!usuarioEditando}
                  className="w-full bg-gray-50 border border-transparent rounded-xl px-4 py-3 focus:bg-white focus:border-[#4a24ff] focus:ring-4 focus:ring-[#f4edff] outline-none transition-all font-medium text-[#1a1446]"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-500 mb-2 uppercase tracking-wide">Rol en el Sistema</label>
                <select 
                  name="rol" value={formulario.rol} onChange={manejarCambio} required
                  className="w-full bg-gray-50 border border-transparent rounded-xl px-4 py-3 focus:bg-white focus:border-[#4a24ff] focus:ring-4 focus:ring-[#f4edff] outline-none transition-all font-bold text-[#1a1446] cursor-pointer"
                >
                  <option value="CAJERO">Cajero / Recepcionista</option>
                  <option value="ADMIN">Administrador General</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 mt-8 pt-4">
                <button 
                  type="button" onClick={() => { setMostrarModal(false); setUsuarioEditando(null); }}
                  className="px-6 py-3 text-gray-500 hover:bg-gray-100 rounded-xl font-bold transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="bg-[#1a1446] hover:bg-[#2d226e] text-white px-6 py-3 rounded-xl font-bold transition-all shadow-[0_4px_12px_rgba(26,20,70,0.2)]"
                >
                  {usuarioEditando ? 'Actualizar Accesos' : 'Crear Cuenta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- TABLA DE USUARIOS --- */}
      <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-50 overflow-hidden relative z-0">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#fafafa] border-b border-gray-100">
              <th className="p-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Usuario</th>
              <th className="p-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Nivel de Acceso</th>
              <th className="p-5 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {usuarios.length === 0 ? (
              <tr>
                <td colSpan={3} className="p-12 text-center text-gray-400 font-medium">
                  Cargando usuarios...
                </td>
              </tr>
            ) : (
              usuarios.map((usuario) => (
                <tr key={usuario.idUsuario} className="hover:bg-[#fafafa] transition-colors group">
                  <td className="p-5 font-bold text-[#1a1446] flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center text-xs font-black shadow-sm">
                      {usuario.username.charAt(0).toUpperCase()}
                    </div>
                    {usuario.username}
                  </td>
                  <td className="p-5">
                    <span className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-wide ${
                      usuario.rol === 'ADMIN' ? 'bg-[#f4edff] text-[#4a24ff]' : 'bg-[#e0f8f1] text-[#00a870]'
                    }`}>
                      {usuario.rol === 'ADMIN' ? '🛡️ ADMINISTRADOR' : '🎫 CAJERO'}
                    </span>
                  </td>
                  <td className="p-5 text-right space-x-2">
                    <button 
                      onClick={() => abrirModalEditar(usuario)}
                      className="w-10 h-10 inline-flex items-center justify-center rounded-xl text-blue-500 hover:bg-blue-50 transition-colors"
                      title="Editar Contraseña / Rol"
                    >
                      ✏️
                    </button>
                    <button 
                      onClick={() => eliminarUsuario(usuario.idUsuario)}
                      className="w-10 h-10 inline-flex items-center justify-center rounded-xl text-red-500 hover:bg-red-50 transition-colors"
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

      {mostrarToast && (
        <div className="fixed bottom-8 right-8 bg-[#1a1446] text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 z-50 animate-bounce">
          <div className="bg-[#00a870] text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">✓</div>
          <span className="font-medium tracking-wide">{mensajeToast}</span>
        </div>
      )}
    </div>
  );
}