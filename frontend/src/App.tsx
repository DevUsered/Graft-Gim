import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Clientes from './pages/Clientes';

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex h-screen bg-gray-50 font-sans text-gray-900">
        
        <Sidebar />

        <main className="flex-1 p-8 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/clientes" element={<Clientes />} />
          </Routes>
        </main>

      </div>
    </BrowserRouter>
  );
}