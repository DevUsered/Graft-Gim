import { useState } from 'react';

export default function SuperAdmin() {
  const [formulario, setFormulario] = useState({
    nombreGimnasio: '',
    direccion: '',
    usernameAdmin: '',
    passwordAdmin: ''
  });
  
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState<{ texto: string; tipo: 'exito' | 'error' } | null>(null);

  const manejarCambio = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormulario({ ...formulario, [e.target.name]: e.target.value });
  };

  const registrarGimnasio = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);
    setMensaje(null);

    try {
      const respuesta = await fetch('http://localhost:8080/api/superadmin/registrar-cliente', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + localStorage.getItem('token') 
        },
        body: JSON.stringify(formulario)
      });

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(datos.message || "Error al crear el gimnasio");
      }

      setMensaje({ texto: `¡Éxito! ${datos.mensaje}`, tipo: 'exito' });
      setFormulario({ nombreGimnasio: '', direccion: '', usernameAdmin: '', passwordAdmin: '' });

    } catch (error) {
      // AQUÍ ESTÁ LA CORRECCIÓN SIN 'any':
      const mensajeError = error instanceof Error ? error.message : "No se pudo conectar con el servidor";
      setMensaje({ texto: mensajeError, tipo: 'error' });
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="p-4 lg:p-8 min-h-full bg-[#111111] text-white">
      <header className="mb-10">
        <div className="inline-block bg-[#333] px-3 py-1 rounded-full text-xs font-bold tracking-widest text-[#a594ff] mb-4 border border-[#4a24ff]/30">
          👑 CONSOLA SAAS MULTI-TENANT
        </div>
        <h2 className="text-4xl font-black tracking-tight">Registro de Clientes</h2>
        <p className="text-gray-400 mt-2 font-medium">Vende tu software y despliega un nuevo entorno de gimnasio al instante.</p>
      </header>

      <div className="max-w-2xl bg-[#1a1a1a] p-8 rounded-3xl border border-[#333] shadow-2xl">
        <form onSubmit={registrarGimnasio} className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-[#a594ff] font-bold uppercase tracking-wider text-sm border-b border-[#333] pb-2">1. Datos del Gimnasio</h3>
              
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wide">Nombre de la Empresa</label>
                <input 
                  type="text" name="nombreGimnasio" value={formulario.nombreGimnasio} onChange={manejarCambio} required
                  className="w-full bg-[#222] border border-[#333] rounded-xl px-4 py-3 focus:bg-[#2a2a2a] focus:border-[#4a24ff] outline-none transition-all font-medium text-white"
                  placeholder="Ej: Titan Fitness"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wide">Ciudad / Dirección</label>
                <input 
                  type="text" name="direccion" value={formulario.direccion} onChange={manejarCambio} required
                  className="w-full bg-[#222] border border-[#333] rounded-xl px-4 py-3 focus:bg-[#2a2a2a] focus:border-[#4a24ff] outline-none transition-all font-medium text-white"
                  placeholder="Ej: Cochabamba, Zona Norte"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-[#00a870] font-bold uppercase tracking-wider text-sm border-b border-[#333] pb-2">2. Credenciales del Dueño</h3>
              
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wide">Usuario Administrador</label>
                <input 
                  type="text" name="usernameAdmin" value={formulario.usernameAdmin} onChange={manejarCambio} required
                  className="w-full bg-[#222] border border-[#333] rounded-xl px-4 py-3 focus:bg-[#2a2a2a] focus:border-[#00a870] outline-none transition-all font-medium text-white"
                  placeholder="Ej: admin_titan"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wide">Contraseña Inicial</label>
                <input 
                  type="text" name="passwordAdmin" value={formulario.passwordAdmin} onChange={manejarCambio} required
                  className="w-full bg-[#222] border border-[#333] rounded-xl px-4 py-3 focus:bg-[#2a2a2a] focus:border-[#00a870] outline-none transition-all font-medium text-white"
                  placeholder="Genera una clave segura"
                />
              </div>
            </div>
          </div>

          {mensaje && (
            <div className={`p-4 rounded-xl font-bold text-sm ${mensaje.tipo === 'exito' ? 'bg-[#00a870]/20 text-[#00a870] border border-[#00a870]/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
              {mensaje.texto}
            </div>
          )}

          <div className="pt-6 mt-6 border-t border-[#333] flex justify-end">
            <button 
              type="submit"
              disabled={cargando}
              className="bg-[#4a24ff] hover:bg-[#3616d9] disabled:bg-gray-600 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-[0_4px_20px_rgba(74,36,255,0.4)]"
            >
              {cargando ? 'Procesando despliegue...' : '🚀 Desplegar Nuevo Gimnasio'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}