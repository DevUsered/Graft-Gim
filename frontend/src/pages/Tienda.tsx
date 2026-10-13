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

const ESTILOS_CATEGORIA: Record<string, { icono: string, bg: string, text: string }> = {
  'Bebidas': { icono: '🥤', bg: 'bg-[#e0f2fe]', text: 'text-[#0284c7]' },
  'Suplementos': { icono: '💊', bg: 'bg-[#f3e8ff]', text: 'text-[#9333ea]' },
  'Snacks': { icono: '🍫', bg: 'bg-[#ffedd5]', text: 'text-[#ea580c]' },
  'Ropa y Equipo': { icono: '👕', bg: 'bg-[#fce7f3]', text: 'text-[#db2777]' },
  'Otros': { icono: '📦', bg: 'bg-[#f3f4f6]', text: 'text-[#4b5563]' }
};

const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dhnp0uj36/image/upload";
const CLOUDINARY_PRESET = "graftgym_tienda"; 

export default function Tienda() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [productoEditando, setProductoEditando] = useState<number | null>(null);
  
  const [fotoLocal, setFotoLocal] = useState<File | null>(null);
  const [previewFoto, setPreviewFoto] = useState<string | null>(null);
  const [subiendo, setSubiendo] = useState(false); // Para mostrar "Cargando..."
  const inputArchivoRef = useRef<HTMLInputElement>(null);

  const [formulario, setFormulario] = useState({
    nombre: '', precio: 0, stock: 0, categoria: 'Bebidas', imagen: ''
  });
// Usamos useCallback para que React memorice la función y no marque error
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

  // MAGIA CLOUD: Sube la foto y devuelve la URL final
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

      // Ahora que tenemos la URL, guardamos todo en nuestro backend de Java como JSON
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
    <div className="p-4 lg:p-8 bg-[#fdfdfd] min-h-screen">
      <div className="bg-gradient-to-r from-[#ff4d6d] to-[#ff8fa3] rounded-[2rem] p-8 md:p-12 text-white shadow-[0_20px_40px_rgba(255,77,109,0.2)] mb-10 flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-2">Punto de Venta 🛒</h1>
          <p className="text-[#ffe0e6] font-medium text-lg">Gestiona el inventario del gimnasio.</p>
        </div>
        <button onClick={() => abrirModal()} className="bg-white text-[#ff4d6d] px-8 py-4 rounded-2xl font-black text-lg shadow-xl hover:scale-105 transition-transform">
          + Agregar Producto
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
        {productos.map(prod => {
          const estilo = ESTILOS_CATEGORIA[prod.categoria] || ESTILOS_CATEGORIA['Otros'];

          return (
            <div key={prod.idProducto} className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all group relative overflow-hidden flex flex-col justify-between">
              
              <div className="flex justify-between items-start mb-6">
                <div className={`w-24 h-24 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm overflow-hidden ${!prod.imagen ? estilo.bg : 'bg-gray-50'}`}>
                  {prod.imagen ? (
                    <img src={prod.imagen} alt={prod.nombre} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-5xl">{estilo.icono}</span>
                  )}
                </div>
                
                <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => abrirModal(prod)} className="bg-blue-50 text-blue-500 w-10 h-10 rounded-full flex items-center justify-center font-bold">✏️</button>
                  <button onClick={() => eliminarProducto(prod.idProducto)} className="bg-red-50 text-red-500 w-10 h-10 rounded-full flex items-center justify-center font-bold">🗑️</button>
                </div>
              </div>
              
              <div>
                <span className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full mb-3 inline-block ${estilo.bg} ${estilo.text}`}>
                  {prod.categoria}
                </span>
                
                <h3 className="text-xl font-black text-[#1a1446] leading-tight mb-4">{prod.nombre}</h3>
                
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Precio</p>
                    <p className="text-2xl font-black text-[#00a870]">Bs. {prod.precio.toFixed(2)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Stock</p>
                    <p className={`text-lg font-black ${prod.stock < 5 ? 'text-red-500 bg-red-50 px-2 rounded-lg' : 'text-[#1a1446]'}`}>
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
        <div className="fixed inset-0 bg-[#1a1446]/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-8 rounded-3xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-black text-[#1a1446] mb-6">{productoEditando ? 'Modificar Producto' : 'Nuevo Producto'}</h3>
            <form onSubmit={guardarProducto} className="space-y-5">
              
              <div className="flex flex-col items-center justify-center mb-6">
                <div 
                  onClick={() => inputArchivoRef.current?.click()}
                  className="w-32 h-32 rounded-3xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-[#ff4d6d] hover:bg-[#ffe0e6] transition-all overflow-hidden relative group"
                >
                  {previewFoto ? (
                    <>
                      <img src={previewFoto} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-white font-bold text-sm">Cambiar Foto</span>
                      </div>
                    </>
                  ) : (
                    <div className="text-center text-gray-400 group-hover:text-[#ff4d6d]">
                      <span className="text-3xl mb-1 block">☁️</span>
                      <span className="text-xs font-bold uppercase">Subir a la nube</span>
                    </div>
                  )}
                </div>
                <input type="file" ref={inputArchivoRef} onChange={manejarSeleccionFoto} accept="image/png, image/jpeg, image/webp" className="hidden" />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Categoría</label>
                <select value={formulario.categoria} onChange={e => setFormulario({...formulario, categoria: e.target.value})} className="w-full bg-gray-50 border border-transparent rounded-xl px-4 py-3 focus:bg-white focus:border-[#ff4d6d] focus:ring-4 focus:ring-[#ffe0e6] outline-none font-bold text-[#1a1446] cursor-pointer appearance-none">
                  {Object.keys(ESTILOS_CATEGORIA).map(cat => (
                    <option key={cat} value={cat}>{ESTILOS_CATEGORIA[cat].icono} {cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Nombre del producto</label>
                <input type="text" value={formulario.nombre} onChange={e => setFormulario({...formulario, nombre: e.target.value})} required className="w-full bg-gray-50 border border-transparent rounded-xl px-4 py-3 focus:bg-white focus:border-[#ff4d6d] focus:ring-4 focus:ring-[#ffe0e6] outline-none font-bold text-[#1a1446]" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Precio (Bs.)</label>
                  <input type="number" step="0.5" min="0" value={formulario.precio} onChange={e => setFormulario({...formulario, precio: parseFloat(e.target.value)})} required className="w-full bg-gray-50 border-transparent rounded-xl px-4 py-3 outline-none font-bold text-[#1a1446]" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Stock Inicial</label>
                  <input type="number" min="0" value={formulario.stock} onChange={e => setFormulario({...formulario, stock: parseInt(e.target.value)})} required className="w-full bg-gray-50 border-transparent rounded-xl px-4 py-3 outline-none font-bold text-[#1a1446]" />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-8 pt-4">
                <button type="button" onClick={() => setMostrarModal(false)} className="px-6 py-3 text-gray-500 font-bold hover:bg-gray-100 rounded-xl transition-colors">Cancelar</button>
                <button type="submit" disabled={subiendo} className={`bg-[#ff4d6d] hover:bg-[#e63956] text-white px-6 py-3 rounded-xl font-bold shadow-lg transition-transform ${subiendo ? 'opacity-70 cursor-not-allowed' : 'hover:-translate-y-1'}`}>
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