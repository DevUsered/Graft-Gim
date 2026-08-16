export default function Clientes() {
  return (
    <>
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Directorio de Clientes</h2>
          <p className="text-gray-500 mt-1">Gestiona las membresías y datos de los usuarios.</p>
        </div>
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm">
          + Nuevo Cliente
        </button>
      </header>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="p-4 text-sm font-semibold text-gray-600">Nombre</th>
              <th className="p-4 text-sm font-semibold text-gray-600">Plan</th>
              <th className="p-4 text-sm font-semibold text-gray-600">Estado</th>
              <th className="p-4 text-sm font-semibold text-gray-600">Vencimiento</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            <tr className="hover:bg-gray-50 transition-colors">
              <td className="p-4 font-medium text-gray-800">Carlos Mendoza</td>
              <td className="p-4 text-gray-600">Pesas + Cardio</td>
              <td className="p-4">
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">Activo</span>
              </td>
              <td className="p-4 text-gray-600">25 Ago 2026</td>
            </tr>
            <tr className="hover:bg-gray-50 transition-colors">
              <td className="p-4 font-medium text-gray-800">Lucía Fernandez</td>
              <td className="p-4 text-gray-600">Zumba</td>
              <td className="p-4">
                <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold">Vencido</span>
              </td>
              <td className="p-4 text-gray-600">14 Ago 2026</td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
}