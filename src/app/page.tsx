import Link from "next/link";
import { ShoppingCart, Package, History, TrendingUp } from "lucide-react";

export default function HomePage() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Bienvenido al Punto de Venta
        </h1>
        <p className="text-xl text-gray-600">
          Esto es un mensaje de prueba que debo cambiar luego
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <Link 
          href="/pos" 
          className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200"
        >
          <div className="flex items-center space-x-4">
            <div className="bg-green-100 p-3 rounded-full">
              <ShoppingCart className="text-green-600" size={24} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Punto de Venta</h3>
              <p className="text-gray-600">Realizar ventas y procesar pagos</p>
            </div>
          </div>
        </Link>

        <Link 
          href="/products" 
          className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200"
        >
          <div className="flex items-center space-x-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <Package className="text-blue-600" size={24} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Gestión de Productos</h3>
              <p className="text-gray-600">Administrar inventario y productos</p>
            </div>
          </div>
        </Link>

        <Link 
          href="/sales" 
          className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200"
        >
          <div className="flex items-center space-x-4">
            <div className="bg-purple-100 p-3 rounded-full">
              <History className="text-purple-600" size={24} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Historial de Ventas</h3>
              <p className="text-gray-600">Ver reportes y movimientos</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
          <TrendingUp className="mr-2" size={24} />
          Resumen del Sistema
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">8</div>
            <div className="text-gray-600">Productos en Stock</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">0</div>
            <div className="text-gray-600">Ventas Hoy</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">$0</div>
            <div className="text-gray-600">Ingresos del Día</div>
          </div>
        </div>
      </div>
    </div>
  );
}
