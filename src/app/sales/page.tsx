'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar, DollarSign, Package2, Eye } from 'lucide-react';

interface SaleItem {
  id: string;
  quantity: number;
  price: number;
  product: {
    id: string;
    name: string;
    sku: string;
  };
}

interface Sale {
  id: string;
  total: number;
  createdAt: string;
  items: SaleItem[];
}

export default function SalesPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    try {
      const response = await fetch('/api/sales');
      const data = await response.json();
      setSales(data);
    } catch (error) {
      console.error('Error fetching sales:', error);
    } finally {
      setLoading(false);
    }
  };

  const openSaleModal = (sale: Sale) => {
    setSelectedSale(sale);
    setShowModal(true);
  };

  const closeSaleModal = () => {
    setSelectedSale(null);
    setShowModal(false);
  };

  // Calculate statistics
  const totalSales = sales.length;
  const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);
  const totalItems = sales.reduce((sum, sale) => 
    sum + sale.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0
  );

  // Group sales by date
  const salesByDate = sales.reduce((groups, sale) => {
    const date = format(new Date(sale.createdAt), 'yyyy-MM-dd');
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(sale);
    return groups;
  }, {} as Record<string, Sale[]>);

  if (loading) {
    return <div className="text-center py-8">Cargando historial de ventas...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Historial de Ventas</h1>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-full mr-4">
              <Package2 className="text-blue-600" size={24} />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{totalSales}</div>
              <div className="text-gray-600">Total de Ventas</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-full mr-4">
              <DollarSign className="text-green-600" size={24} />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">${totalRevenue.toFixed(2)}</div>
              <div className="text-gray-600">Ingresos Totales</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center">
            <div className="bg-purple-100 p-3 rounded-full mr-4">
              <Package2 className="text-purple-600" size={24} />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{totalItems}</div>
              <div className="text-gray-600">Productos Vendidos</div>
            </div>
          </div>
        </div>
      </div>

      {/* Sales History */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Movimientos de Venta</h2>
        </div>
        
        {sales.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No hay ventas registradas
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {Object.entries(salesByDate)
              .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
              .map(([date, dateSales]) => (
                <div key={date}>
                  {/* Date Header */}
                  <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
                    <div className="flex items-center">
                      <Calendar className="mr-2 text-gray-500" size={16} />
                      <span className="text-sm font-medium text-gray-900">
                        {format(new Date(date), 'EEEE, d \'de\' MMMM \'de\' yyyy', { locale: es })}
                      </span>
                      <span className="ml-auto text-sm text-gray-500">
                        {dateSales.length} {dateSales.length === 1 ? 'venta' : 'ventas'}
                      </span>
                    </div>
                  </div>

                  {/* Sales for this date */}
                  {dateSales
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .map((sale) => (
                      <div key={sale.id} className="px-6 py-4 hover:bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-4">
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  Venta #{sale.id.slice(-8)}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {format(new Date(sale.createdAt), 'HH:mm:ss')}
                                </div>
                              </div>
                              <div className="text-sm text-gray-600">
                                {sale.items.length} {sale.items.length === 1 ? 'producto' : 'productos'}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-4">
                            <div className="text-right">
                              <div className="text-lg font-semibold text-gray-900">
                                ${sale.total.toFixed(2)}
                              </div>
                            </div>
                            
                            <button
                              onClick={() => openSaleModal(sale)}
                              className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-full"
                              title="Ver detalles"
                            >
                              <Eye size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Sale Detail Modal */}
      {showModal && selectedSale && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-900">
                Detalles de Venta #{selectedSale.id.slice(-8)}
              </h3>
              <button
                onClick={closeSaleModal}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Fecha:</span>
                  <div className="font-medium">
                    {format(new Date(selectedSale.createdAt), 'PPpp', { locale: es })}
                  </div>
                </div>
                <div>
                  <span className="text-gray-500">Total:</span>
                  <div className="font-medium text-lg text-green-600">
                    ${selectedSale.total.toFixed(2)}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Productos:</h4>
                <div className="space-y-2">
                  {selectedSale.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <div className="font-medium text-gray-900">
                          {item.product.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          SKU: {item.product.sku}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">
                          {item.quantity} × ${item.price.toFixed(2)}
                        </div>
                        <div className="font-medium text-gray-900">
                          ${(item.quantity * item.price).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={closeSaleModal}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}