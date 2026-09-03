import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Clientes from './pages/Clientes';
import Membresias from './pages/Membresias';
import Suscripciones from './pages/Suscripciones';
import Recepcion from './pages/Recepcion';

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex h-screen bg-gray-50 font-sans text-gray-900">
        
        <Sidebar />

        <main className="flex-1 p-8 overflow-y-auto">
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