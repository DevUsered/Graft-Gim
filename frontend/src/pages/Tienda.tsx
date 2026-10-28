import { useState, useEffect, useRef, useCallback } from 'react';
import { apiFetch } from '../utils/api';

interface Producto {
  idProducto: number;
  nombre: string;
  precio: number;
  stock: number;
  categoria: string;
  imagen?: string; 
}

// ⚡ 1. COLORES ADAPTADOS A FONDO OSCURO (Glassmorphism)
const ESTILOS_CATEGORIA: Record<string, { icono: string, bg: string, text: string }> = {
  'Bebidas': { icono: '🥤', bg: 'bg-blue-500/20', text: 'text-blue-300' },
  'Suplementos': { icono: '💊', bg: 'bg-purple-500/20', text: 'text-purple-300' },
  'Snacks': { icono: '🍫', bg: 'bg-orange-500/20', text: 'text-orange-300' },
  'Ropa y Equipo': { icono: '👕', bg: 'bg-pink-500/20', text: 'text-pink-300' },
  'Otros': { icono: '📦', bg: 'bg-white/10', text: 'text-white/60' }
};

const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dhnp0uj36/image/upload";
const CLOUDINARY_PRESET = "graftgym_tienda"; 

export default function Tienda() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [productoEditando, setProductoEditando] = useState<number | null>(null);
  
  const [fotoLocal, setFotoLocal] = useState<File | null>(null);
  const [previewFoto, setPreviewFoto] = useState<string | null>(null);
  const [subiendo, setSubiendo] = useState(false);
  const inputArchivoRef = useRef<HTMLInputElement>(null);

  const [formulario, setFormulario] = useState({
    nombre: '', precio: 0, stock: 0, categoria: 'Bebidas', imagen: ''
  });

  const cargarProductos = useCallback(async () => {
    try {
      const res = await apiFetch('/api/productos');
      if (!res.ok) {
        console.error('Error al cargar los productos:', res.status);
        setProductos([]);
        return;
      }
      const data = await res.json();
      if (Array.isArray(data)) {
        setProductos(data);
      } else {
        console.error("El backend no devolvió una lista:", data);
        setProductos([]); 
      }
    } catch (err) {
      console.error('Error al cargar los productos:', err);
      setProductos([]);
    }
  }, []); 

  useEffect(() => { 
    const inicializarTienda = async () => {
      await cargarProductos();
    };
    inicializarTienda();
  }, [cargarProductos]);

  const abrirModal = (prod?: Producto) => {
    setFotoLocal(null);
    setPreviewFoto(null);

    if (prod) {
      setFormulario({ nombre: prod.nombre, precio: prod.precio, stock: prod.stock, categoria: prod.categoria, imagen: prod.imagen || '' });
      setProductoEditando(prod.idProducto);
      if (prod.imagen) setPreviewFoto(prod.imagen);
    } else {
      setFormulario({ nombre: '', precio: 0, stock: 0, categoria: 'Bebidas', imagen: '' });
      setProductoEditando(null);
    }
    setMostrarModal(true);
  };

  const manejarSeleccionFoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const archivo = e.target.files[0];
      setFotoLocal(archivo);
      setPreviewFoto(URL.createObjectURL(archivo));
    }
  };

  const subirImagenACloudinary = async (archivo: File) => {
    const data = new FormData();
    data.append("file", archivo);
    data.append("upload_preset", CLOUDINARY_PRESET);

    const res = await fetch(CLOUDINARY_URL, {
      method: "POST",
      body: data,
    });
    const archivoSubido = await res.json();
    return archivoSubido.secure_url; 
  };

  const guardarProducto = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubiendo(true);

    try {
      let urlFinal = formulario.imagen;
      
      if (fotoLocal) {
        urlFinal = await subirImagenACloudinary(fotoLocal);
      }

      const endpoint = productoEditando ? `/api/productos/${productoEditando}` : `/api/productos`;
      const metodo = productoEditando ? 'PUT' : 'POST';

      const productoAEnviar = {
        ...formulario,
        imagen: urlFinal
      };

      await apiFetch(endpoint, {
        method: metodo,
        body: JSON.stringify(productoAEnviar)
      });
      
      setMostrarModal(false);
      cargarProductos();
    } catch (error) {
      console.error(error);
      alert("Error al guardar el producto. Intenta de nuevo.");
    } finally {
      setSubiendo(false);
    }
  };

  const eliminarProducto = async (id: number) => {
    if (confirm("¿Eliminar este producto?")) {
      await apiFetch(`/api/productos/${id}`, { method: 'DELETE' });
      cargarProductos();
    }
  };

  return (
    // ⚡ 2. ELIMINADO EL FONDO BLANCO (bg-[#fdfdfd])
    <div className="p-4 lg:p-8 min-h-full">
      
      {/* ⚡ 3. BANNER PRINCIPAL GLASSMORPHISM */}
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2rem] p-8 md:p-12 text-white shadow-2xl mb-10 flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden">
        {/* Luz decorativa en el banner */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#ff4d6d] rounded-full mix-blend-screen filter blur-[80px] opacity-20 pointer-events-none"></div>
        
        <div className="relative z-10">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-2 drop-shadow-md">Punto de Venta 🛒</h1>
          <p className="text-white/80 font-medium text-lg drop-shadow-sm">Gestiona el inventario del gimnasio.</p>
        </div>
        <button onClick={() => abrirModal()} className="relative z-10 bg-[#ff4d6d] hover:bg-[#e63956] text-white border border-[#ff4d6d]/50 px-8 py-4 rounded-2xl font-black text-lg shadow-xl hover:scale-105 transition-all">
          + Agregar Producto
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
        {productos.map(prod => {
          const estilo = ESTILOS_CATEGORIA[prod.categoria] || ESTILOS_CATEGORIA['Otros'];

          return (
            // ⚡ 4. TARJETAS DE CRISTAL PARA CADA PRODUCTO
            <div key={prod.idProducto} className="bg-white/5 backdrop-blur-lg rounded-[2rem] p-6 border border-white/10 shadow-xl hover:bg-white/10 hover:border-white/20 transition-all group relative overflow-hidden flex flex-col justify-between">
              
              <div className="flex justify-between items-start mb-6">
                <div className={`w-24 h-24 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm overflow-hidden border border-white/5 ${!prod.imagen ? estilo.bg : 'bg-white/10 backdrop-blur-sm'}`}>
                  {prod.imagen ? (
                    <img src={prod.imagen} alt={prod.nombre} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-5xl drop-shadow-md">{estilo.icono}</span>
                  )}
                </div>
                
                <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => abrirModal(prod)} className="bg-blue-500/20 border border-blue-500/30 text-blue-300 hover:bg-blue-500 hover:text-white w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors">✏️</button>
                  <button onClick={() => eliminarProducto(prod.idProducto)} className="bg-red-500/20 border border-red-500/30 text-red-300 hover:bg-red-500 hover:text-white w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors">🗑️</button>
                </div>
              </div>
              
              <div>
                <span className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full mb-3 inline-block border border-white/5 ${estilo.bg} ${estilo.text}`}>
                  {prod.categoria}
                </span>
                
                {/* Texto blanco para nombres */}
                <h3 className="text-xl font-black text-white leading-tight mb-4 drop-shadow-sm">{prod.nombre}</h3>
                
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-xs font-bold text-white/50 uppercase tracking-wider mb-1">Precio</p>
                    <p className="text-2xl font-black text-green-400 drop-shadow-sm">Bs. {prod.precio.toFixed(2)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-white/50 uppercase tracking-wider mb-1">Stock</p>
                    <p className={`text-lg font-black drop-shadow-sm ${prod.stock < 5 ? 'text-red-300 bg-red-500/20 px-2 rounded-lg border border-red-500/30' : 'text-white'}`}>
                      {prod.stock} u.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {mostrarModal && (
        <div className="fixed inset-0 bg-[#1a1446]/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          
          {/* ⚡ 5. MODAL GLASSMORPHISM */}
          <div className="bg-white/10 backdrop-blur-2xl border border-white/20 p-8 rounded-3xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
            <h3 className="text-2xl font-black text-white mb-6 drop-shadow-md">{productoEditando ? 'Modificar Producto' : 'Nuevo Producto'}</h3>
            
            <form onSubmit={guardarProducto} className="space-y-5">
              
              <div className="flex flex-col items-center justify-center mb-6">
                <div 
                  onClick={() => inputArchivoRef.current?.click()}
                  className="w-32 h-32 rounded-3xl border-2 border-dashed border-white/30 flex flex-col items-center justify-center cursor-pointer hover:border-[#ff4d6d] bg-white/5 hover:bg-white/10 transition-all overflow-hidden relative group"
                >
                  {previewFoto ? (
                    <>
                      <img src={previewFoto} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                        <span className="text-white font-bold text-sm">Cambiar</span>
                      </div>
                    </>
                  ) : (
                    <div className="text-center text-white/50 group-hover:text-[#ff4d6d]">
                      <span className="text-3xl mb-1 block drop-shadow-md">☁️</span>
                      <span className="text-xs font-bold uppercase">Subir foto</span>
                    </div>
                  )}
                </div>
                <input type="file" ref={inputArchivoRef} onChange={manejarSeleccionFoto} accept="image/png, image/jpeg, image/webp" className="hidden" />
              </div>

              {/* ⚡ 6. INPUTS TRANSLÚCIDOS */}
              <div>
                <label className="block text-xs font-bold text-white/60 uppercase mb-2">Categoría</label>
                <select value={formulario.categoria} onChange={e => setFormulario({...formulario, categoria: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:bg-white/10 focus:border-[#ff4d6d] focus:ring-4 focus:ring-[#ff4d6d]/30 outline-none font-bold text-white cursor-pointer appearance-none">
                  {Object.keys(ESTILOS_CATEGORIA).map(cat => (
                    <option key={cat} value={cat} className="bg-[#1a1446] text-white">{ESTILOS_CATEGORIA[cat].icono} {cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-white/60 uppercase mb-2">Nombre del producto</label>
                <input type="text" value={formulario.nombre} onChange={e => setFormulario({...formulario, nombre: e.target.value})} required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:bg-white/10 focus:border-[#ff4d6d] focus:ring-4 focus:ring-[#ff4d6d]/30 outline-none font-bold text-white placeholder-white/30" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-white/60 uppercase mb-2">Precio (Bs.)</label>
                  <input type="number" step="0.5" min="0" value={formulario.precio === 0 ? '' : formulario.precio} onChange={e => setFormulario({...formulario, precio: parseFloat(e.target.value) || 0})} required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:bg-white/10 focus:border-[#ff4d6d] focus:ring-4 focus:ring-[#ff4d6d]/30 outline-none font-bold text-white" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-white/60 uppercase mb-2">Stock Inicial</label>
                  <input type="number" min="0" value={formulario.stock} onChange={e => setFormulario({...formulario, stock: parseInt(e.target.value)})} required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:bg-white/10 focus:border-[#ff4d6d] focus:ring-4 focus:ring-[#ff4d6d]/30 outline-none font-bold text-white" />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-white/10">
                <button type="button" onClick={() => setMostrarModal(false)} className="px-6 py-3 text-white/60 font-bold hover:bg-white/5 hover:text-white rounded-xl transition-colors">Cancelar</button>
                <button type="submit" disabled={subiendo} className={`bg-[#ff4d6d] hover:bg-[#e63956] text-white px-6 py-3 rounded-xl font-bold shadow-lg transition-transform border border-[#ff4d6d]/50 ${subiendo ? 'opacity-70 cursor-not-allowed' : 'hover:-translate-y-1'}`}>
                  {subiendo ? 'Subiendo...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}