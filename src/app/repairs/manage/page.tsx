'use client';

import { useState, useEffect } from 'react';
import { Search, Eye, Edit, Clock, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import LoadingSpinner from '@/components/LoadingSpinner';

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
  finalCost: number | null;
  receivedDate: string;
  completedDate: string | null;
  deliveredDate: string | null;
  customer: Customer;
}

export default function RepairManagementPage() {
  const [tickets, setTickets] = useState<RepairTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<RepairTicket | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [editFormData, setEditFormData] = useState({
    status: '',
    estimatedCost: '',
    finalCost: '',
    observations: ''
  });

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const response = await fetch('/api/repairs');
      const data = await response.json();
      
      // Ensure data is an array before setting it
      if (Array.isArray(data)) {
        setTickets(data);
      } else {
        console.error('API returned non-array data:', data);
        setTickets([]);
      }
    } catch (error) {
      console.error('Error fetching repair tickets:', error);
      setTickets([]); // Ensure tickets remains an empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket) return;

    try {
      const response = await fetch(`/api/repairs/${selectedTicket.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...editFormData,
          completedDate: editFormData.status === 'Completed' ? new Date().toISOString() : null,
          deliveredDate: editFormData.status === 'Delivered' ? new Date().toISOString() : null
        }),
      });

      if (response.ok) {
        await fetchTickets();
        setShowEditModal(false);
        setSelectedTicket(null);
      } else {
        const error = await response.json();
        alert(error.error || 'Error al actualizar ticket');
      }
    } catch (error) {
      console.error('Error updating ticket:', error);
      alert('Error al actualizar ticket');
    }
  };

  const openEditModal = (ticket: RepairTicket) => {
    setSelectedTicket(ticket);
    setEditFormData({
      status: ticket.status,
      estimatedCost: ticket.estimatedCost?.toString() || '',
      finalCost: ticket.finalCost?.toString() || '',
      observations: ticket.observations || ''
    });
    setShowEditModal(true);
  };

  const openViewModal = (ticket: RepairTicket) => {
    setSelectedTicket(ticket);
    setShowModal(true);
  };

  const filteredTickets = (tickets || []).filter(ticket => {
    const matchesSearch = 
      ticket.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.deviceType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ticket.brand && ticket.brand.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = !statusFilter || ticket.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Received': return 'bg-blue-100 text-blue-800';
      case 'In Progress': return 'bg-yellow-100 text-yellow-800';
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'Delivered': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Received': return <Clock size={16} />;
      case 'In Progress': return <Edit size={16} />;
      case 'Completed': return <CheckCircle size={16} />;
      case 'Delivered': return <XCircle size={16} />;
      default: return <Clock size={16} />;
    }
  };

  if (loading) {
    return <LoadingSpinner message="Cargando tickets de reparación..." size="lg" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Reparaciones</h1>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
          <div className="text-2xl font-bold text-blue-600">
            {tickets.filter(t => t.status === 'Received').length}
          </div>
          <div className="text-gray-600">Recibidos</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
          <div className="text-2xl font-bold text-yellow-600">
            {tickets.filter(t => t.status === 'In Progress').length}
          </div>
          <div className="text-gray-600">En Proceso</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
          <div className="text-2xl font-bold text-green-600">
            {tickets.filter(t => t.status === 'Completed').length}
          </div>
          <div className="text-gray-600">Completados</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
          <div className="text-2xl font-bold text-gray-600">
            {tickets.filter(t => t.status === 'Delivered').length}
          </div>
          <div className="text-gray-600">Entregados</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar por ticket, cliente, dispositivo o marca..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">Todos los estados</option>
          <option value="Received">Recibido</option>
          <option value="In Progress">En Proceso</option>
          <option value="Completed">Completado</option>
          <option value="Delivered">Entregado</option>
        </select>
      </div>

      {/* Tickets Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ticket
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cliente
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Dispositivo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredTickets.map((ticket) => (
              <tr key={ticket.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {ticket.ticketNumber}
                  </div>
                  {ticket.estimatedCost && (
                    <div className="text-sm text-gray-500">
                      Est: ${ticket.estimatedCost.toFixed(2)}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {ticket.customer.name}
                  </div>
                  <div className="text-sm text-gray-500">
                    {ticket.customer.phone || 'Sin teléfono'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {ticket.deviceType}
                  </div>
                  <div className="text-sm text-gray-500">
                    {ticket.brand} {ticket.model}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                    {getStatusIcon(ticket.status)}
                    <span className="ml-1">{ticket.status}</span>
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {format(new Date(ticket.receivedDate), 'dd/MM/yyyy')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button
                    onClick={() => openViewModal(ticket)}
                    className="text-blue-600 hover:text-blue-900"
                    title="Ver detalles"
                  >
                    <Eye size={16} />
                  </button>
                  <button
                    onClick={() => openEditModal(ticket)}
                    className="text-green-600 hover:text-green-900"
                    title="Editar"
                  >
                    <Edit size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredTickets.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No se encontraron tickets de reparación
          </div>
        )}
      </div>

      {/* View Modal */}
      {showModal && selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-900">
                Detalles del Ticket {selectedTicket.ticketNumber}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900">Cliente:</h4>
                  <p className="text-gray-600">{selectedTicket.customer.name}</p>
                  <p className="text-gray-600">{selectedTicket.customer.phone}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Dispositivo:</h4>
                  <p className="text-gray-600">{selectedTicket.deviceType}</p>
                  <p className="text-gray-600">{selectedTicket.brand} {selectedTicket.model}</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900">Descripción del Problema:</h4>
                <p className="text-gray-600">{selectedTicket.problemDescription}</p>
              </div>
              
              {selectedTicket.observations && (
                <div>
                  <h4 className="font-medium text-gray-900">Observaciones:</h4>
                  <p className="text-gray-600">{selectedTicket.observations}</p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900">Estado:</h4>
                  <p className="text-gray-600">{selectedTicket.status}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Fecha de Recepción:</h4>
                  <p className="text-gray-600">
                    {format(new Date(selectedTicket.receivedDate), 'PPp', { locale: es })}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-900">
                Editar Ticket {selectedTicket.ticketNumber}
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleUpdateTicket} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estado
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={editFormData.status}
                  onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                >
                  <option value="Received">Recibido</option>
                  <option value="In Progress">En Proceso</option>
                  <option value="Completed">Completado</option>
                  <option value="Delivered">Entregado</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Costo Estimado
                </label>
                <input
                  type="number"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={editFormData.estimatedCost}
                  onChange={(e) => setEditFormData({ ...editFormData, estimatedCost: e.target.value })}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Costo Final
                </label>
                <input
                  type="number"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={editFormData.finalCost}
                  onChange={(e) => setEditFormData({ ...editFormData, finalCost: e.target.value })}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Observaciones
                </label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={editFormData.observations}
                  onChange={(e) => setEditFormData({ ...editFormData, observations: e.target.value })}
                />
              </div>
              
              <div className="flex space-x-2">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
                >
                  Actualizar
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}