'use client';

import { useState, useEffect } from 'react';
import { Plus, User, Laptop, FileText } from 'lucide-react';

interface Customer {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
}

interface RepairTicket {
  id: string;
  ticketNumber: string;
  deviceType: string;
  brand: string | null;
  model: string | null;
  serialNumber: string | null;
  problemDescription: string;
  observations: string | null;
  status: string;
  estimatedCost: number | null;
  pickedUpBy: string | null;
  receivedDate: string;
  customer: Customer;
}

export default function RepairsPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  
  const [customerFormData, setCustomerFormData] = useState({
    name: '',
    phone: '',
    email: ''
  });

  const [repairFormData, setRepairFormData] = useState({
    deviceType: 'Laptop',
    brand: '',
    model: '',
    serialNumber: '',
    problemDescription: '',
    observations: '',
    estimatedCost: '',
    pickedUpBy: ''
  });

  const [createdTicket, setCreatedTicket] = useState<RepairTicket | null>(null);
  const [showTicketModal, setShowTicketModal] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/customers');
      const data = await response.json();
      
      // Ensure data is an array before setting it
      if (Array.isArray(data)) {
        setCustomers(data);
      } else {
        console.error('API returned non-array data:', data);
        setCustomers([]);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
      setCustomers([]); // Ensure customers remains an empty array on error
    }
  };

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(customerFormData),
      });

      if (response.ok) {
        const newCustomer = await response.json();
        await fetchCustomers();
        setSelectedCustomer(newCustomer.id);
        setCustomerFormData({ name: '', phone: '', email: '' });
        setShowCustomerForm(false);
      } else {
        const error = await response.json();
        alert(error.error || 'Error al crear cliente');
      }
    } catch (error) {
      console.error('Error creating customer:', error);
      alert('Error al crear cliente');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRepair = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCustomer) {
      alert('Por favor selecciona un cliente');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/repairs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId: selectedCustomer,
          ...repairFormData
        }),
      });

      if (response.ok) {
        const ticket = await response.json();
        setCreatedTicket(ticket);
        setShowTicketModal(true);
        setRepairFormData({
          deviceType: 'Laptop',
          brand: '',
          model: '',
          serialNumber: '',
          problemDescription: '',
          observations: '',
          estimatedCost: '',
          pickedUpBy: ''
        });
        setSelectedCustomer('');
      } else {
        const error = await response.json();
        alert(error.error || 'Error al crear ticket de reparación');
      }
    } catch (error) {
      console.error('Error creating repair ticket:', error);
      alert('Error al crear ticket de reparación');
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = () => {
    if (!createdTicket) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Ticket de Reparación - ${createdTicket.ticketNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
            .section { margin-bottom: 20px; }
            .field { margin-bottom: 8px; }
            .label { font-weight: bold; }
            .footer { margin-top: 40px; border-top: 1px solid #ccc; padding-top: 20px; }
            .signature-box { border: 1px solid #333; height: 60px; margin-top: 10px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>PAPELERÍA & REPARACIONES</h1>
            <h2>Ticket de Reparación</h2>
            <h3>No. ${createdTicket.ticketNumber}</h3>
          </div>
          
          <div class="section">
            <h3>Información del Cliente</h3>
            <div class="field"><span class="label">Nombre:</span> ${createdTicket.customer.name}</div>
            <div class="field"><span class="label">Teléfono:</span> ${createdTicket.customer.phone || 'No proporcionado'}</div>
            <div class="field"><span class="label">Email:</span> ${createdTicket.customer.email || 'No proporcionado'}</div>
          </div>

          <div class="section">
            <h3>Información del Equipo</h3>
            <div class="field"><span class="label">Tipo de Dispositivo:</span> ${createdTicket.deviceType}</div>
            <div class="field"><span class="label">Marca:</span> ${createdTicket.brand || 'No especificada'}</div>
            <div class="field"><span class="label">Modelo:</span> ${createdTicket.model || 'No especificado'}</div>
            <div class="field"><span class="label">Número de Serie:</span> ${createdTicket.serialNumber || 'No proporcionado'}</div>
          </div>

          <div class="section">
            <h3>Descripción del Problema</h3>
            <p>${createdTicket.problemDescription}</p>
          </div>

          ${createdTicket.observations ? `
          <div class="section">
            <h3>Observaciones</h3>
            <p>${createdTicket.observations}</p>
          </div>
          ` : ''}

          <div class="section">
            <div class="field"><span class="label">Fecha de Recepción:</span> ${new Date(createdTicket.receivedDate).toLocaleDateString('es-ES')}</div>
            <div class="field"><span class="label">Estado:</span> ${createdTicket.status}</div>
            ${createdTicket.estimatedCost ? `<div class="field"><span class="label">Costo Estimado:</span> $${createdTicket.estimatedCost.toFixed(2)}</div>` : ''}
          </div>

          <div class="footer">
            <div class="section">
              <p><strong>Términos y Condiciones:</strong></p>
              <ul>
                <li>El equipo será revisado en un plazo de 24-48 horas</li>
                <li>Se proporcionará un presupuesto antes de realizar cualquier reparación</li>
                <li>El cliente debe recoger el equipo en un plazo máximo de 30 días</li>
                <li>La empresa no se hace responsable por pérdida de datos</li>
              </ul>
            </div>
            
            <div style="display: flex; justify-content: space-between; margin-top: 40px;">
              <div style="width: 45%;">
                <p><strong>Firma del Cliente:</strong></p>
                <div class="signature-box"></div>
              </div>
              <div style="width: 45%;">
                <p><strong>Firma del Técnico:</strong></p>
                <div class="signature-box"></div>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Registro de Reparaciones</h1>
      </div>

      {/* Customer Selection/Creation */}
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h2 className="text-gray-700 text-xl font-semibold mb-4 flex items-center">
          <User className="mr-2" size={24} />
          Información del Cliente
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Seleccionar Cliente
            </label>
            <select
              className="text-gray-700 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={selectedCustomer}
              onChange={(e) => setSelectedCustomer(e.target.value)}
            >
              <option value="">Seleccionar cliente existente...</option>
              {(customers || []).map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name} - {customer.phone || 'Sin teléfono'}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              type="button"
              onClick={() => setShowCustomerForm(!showCustomerForm)}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center space-x-2"
            >
              <Plus size={20} />
              <span>Nuevo Cliente</span>
            </button>
          </div>
        </div>

        {/* New Customer Form */}
        {showCustomerForm && (
          <form onSubmit={handleCreateCustomer} className="border-t pt-4">
            <h3 className="text-gray-700 text-lg font-medium mb-3">Crear Nuevo Cliente</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre *
                </label>
                <input
                  type="text"
                  required
                  className="text-gray-700 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={customerFormData.name}
                  onChange={(e) => setCustomerFormData({ ...customerFormData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono
                </label>
                <input
                  type="tel"
                  className="text-gray-700 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={customerFormData.phone}
                  onChange={(e) => setCustomerFormData({ ...customerFormData, phone: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  className="text-gray-700 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={customerFormData.email}
                  onChange={(e) => setCustomerFormData({ ...customerFormData, email: e.target.value })}
                />
              </div>
            </div>
            <div className="mt-4 space-x-2">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
              >
                {loading ? 'Creando...' : 'Crear Cliente'}
              </button>
              <button
                type="button"
                onClick={() => setShowCustomerForm(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Repair Form */}
      {selectedCustomer && (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h2 className="text-gray-700 text-xl font-semibold mb-4 flex items-center">
            <Laptop className="mr-2" size={24} />
            Información del Equipo
          </h2>
          
          <form onSubmit={handleCreateRepair} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Dispositivo *
                </label>
                <select
                  required
                  className="text-gray-700 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={repairFormData.deviceType}
                  onChange={(e) => setRepairFormData({ ...repairFormData, deviceType: e.target.value })}
                >
                  <option value="Laptop">Laptop</option>
                  <option value="Desktop">PC de Escritorio</option>
                  <option value="Tablet">Tablet</option>
                  <option value="Smartphone">Smartphone</option>
                  <option value="Monitor">Monitor</option>
                  <option value="Impresora">Impresora</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Marca
                </label>
                <input
                  type="text"
                  className="text-gray-700 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={repairFormData.brand}
                  onChange={(e) => setRepairFormData({ ...repairFormData, brand: e.target.value })}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Modelo
                </label>
                <input
                  type="text"
                  className="text-gray-700 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={repairFormData.model}
                  onChange={(e) => setRepairFormData({ ...repairFormData, model: e.target.value })}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Número de Serie
                </label>
                <input
                  type="text"
                  className="text-gray-700 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={repairFormData.serialNumber}
                  onChange={(e) => setRepairFormData({ ...repairFormData, serialNumber: e.target.value })}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Costo Estimado
                </label>
                <input
                  type="number"
                  step="0.01"
                  className="text-gray-700 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={repairFormData.estimatedCost}
                  onChange={(e) => setRepairFormData({ ...repairFormData, estimatedCost: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Recogido por
                </label>
                <input
                  type="text"
                  placeholder="Nombre de quien recoge el equipo"
                  className="text-gray-700 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={repairFormData.pickedUpBy}
                  onChange={(e) => setRepairFormData({ ...repairFormData, pickedUpBy: e.target.value })}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción del Problema *
              </label>
              <textarea
                required
                rows={4}
                className="text-gray-700 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={repairFormData.problemDescription}
                onChange={(e) => setRepairFormData({ ...repairFormData, problemDescription: e.target.value })}
                placeholder="Describe detalladamente el problema reportado por el cliente..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Observaciones Adicionales
              </label>
              <textarea
                rows={3}
                className="text-gray-700 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={repairFormData.observations}
                onChange={(e) => setRepairFormData({ ...repairFormData, observations: e.target.value })}
                placeholder="Cualquier observación adicional sobre el estado del equipo..."
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 font-medium"
            >
              {loading ? 'Creando Ticket...' : 'Crear Ticket de Reparación'}
            </button>
          </form>
        </div>
      )}

      {/* Success Modal */}
      {showTicketModal && createdTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="text-center">
              <div className="mb-4">
                <FileText className="mx-auto text-green-600" size={48} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                ¡Ticket Creado Exitosamente!
              </h3>
              <p className="text-gray-600 mb-4">
                Número de ticket: <strong>{createdTicket.ticketNumber}</strong>
              </p>
              <div className="space-y-3">
                <button
                  onClick={generatePDF}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
                >
                  Imprimir Ticket
                </button>
                <button
                  onClick={() => {
                    setShowTicketModal(false);
                    setCreatedTicket(null);
                  }}
                  className="w-full bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}