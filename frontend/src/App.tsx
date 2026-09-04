import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Clientes from './pages/Clientes';
import Membresias from './pages/Membresias';
import Suscripciones from './pages/Suscripciones';
import Recepcion from './pages/Recepcion';
import Login from './pages/Login'; // Importamos el Login

export default function App() {
  // Verificamos si ya hay un token en la memoria
  const [autenticado, setAutenticado] = useState(!!localStorage.getItem('token'));

  const manejarLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setAutenticado(false);
  };
  // Si no está autenticado, solo mostramos la pantalla de Login
  if (!autenticado) {
    return <Login onLogin={() => setAutenticado(true)} />;
  }

  // Si sí está autenticado, mostramos el sistema completo
  return (
    <BrowserRouter>
      <div className="flex h-screen bg-[#f8f9fa] font-sans text-gray-900 overflow-hidden">
        
        <Sidebar onLogout={manejarLogout} />

        <main className="flex-1 p-0 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/clientes" element={<Clientes />} />
            <Route path="/membresias" element={<Membresias />} />
            <Route path="/suscripciones" element={<Suscripciones />} />
            <Route path="/recepcion" element={<Recepcion />} />
          </Routes>
        </main>

      </div>
    </BrowserRouter>
  );
}