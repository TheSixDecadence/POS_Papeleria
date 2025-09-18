'use client';

import { useState, useEffect } from 'react';
import Link from "next/link";
import { ShoppingCart, Package, History, TrendingUp, Wrench, Settings } from "lucide-react";
import LoadingSpinner from '@/components/LoadingSpinner';

interface Stats {
  productsInStock: number;
  salesToday: number;
  dailyRevenue: number;
  equipmentReceived: number;
  equipmentInProgress: number;
  equipmentCompleted: number;
}

export default function HomePage() {
  const [stats, setStats] = useState<Stats>({
    productsInStock: 0,
    salesToday: 0,
    dailyRevenue: 0,
    equipmentReceived: 0,
    equipmentInProgress: 0,
    equipmentCompleted: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [productsRes, salesRes, repairsRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/sales'),
        fetch('/api/repairs')
      ]);

      const products = await productsRes.json();
      const sales = await salesRes.json();
      const repairs = await repairsRes.json();

      // Calculate products in stock
      const productsInStock = Array.isArray(products) ? products.filter(p => p.stock > 0).length : 0;

      // Calculate today's sales
      const today = new Date().toISOString().split('T')[0];
      const salesToday = Array.isArray(sales) ? sales.filter(sale => 
        sale.createdAt.startsWith(today)
      ).length : 0;

      // Calculate daily revenue
      const dailyRevenue = Array.isArray(sales) ? sales
        .filter(sale => sale.createdAt.startsWith(today))
        .reduce((sum, sale) => sum + sale.total, 0) : 0;

      // Calculate repair stats
      const equipmentReceived = Array.isArray(repairs) ? repairs.length : 0;
      const equipmentInProgress = Array.isArray(repairs) ? repairs.filter(r => r.status === 'In Progress').length : 0;
      const equipmentCompleted = Array.isArray(repairs) ? repairs.filter(r => r.status === 'Completed').length : 0;

      setStats({
        productsInStock,
        salesToday,
        dailyRevenue,
        equipmentReceived,
        equipmentInProgress,
        equipmentCompleted,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Cargando estadísticas del sistema..." size="lg" />;
  }
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Bienvenido a Papelería JADI
        </h1>
        <p className="text-xl text-gray-600">
          Este es el sistema de punto de venta y gestión de reparaciones de las compus.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
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
              <p className="text-gray-600">Realizar ventas</p>
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
              <h3 className="text-lg font-semibold text-gray-900">Productos</h3>
              <p className="text-gray-600">Gestionar inventario</p>
            </div>
          </div>
        </Link>

        <Link 
          href="/repairs" 
          className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200"
        >
          <div className="flex items-center space-x-4">
            <div className="bg-orange-100 p-3 rounded-full">
              <Wrench className="text-orange-600" size={24} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Reparaciones</h3>
              <p className="text-gray-600">Registrar equipos</p>
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
              <h3 className="text-lg font-semibold text-gray-900">Historial</h3>
              <p className="text-gray-600">Ver reportes</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="mr-2" size={24} />
            Resumen de Ventas
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{stats.productsInStock}</div>
              <div className="text-gray-600">Productos en Stock</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{stats.salesToday}</div>
              <div className="text-gray-600">Ventas Hoy</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">${stats.dailyRevenue.toFixed(2)}</div>
              <div className="text-gray-600">Ingresos del Día</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
            <Settings className="mr-2" size={24} />
            Resumen de Reparaciones
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{stats.equipmentReceived}</div>
              <div className="text-gray-600">Equipos Recibidos</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600">{stats.equipmentInProgress}</div>
              <div className="text-gray-600">En Proceso</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{stats.equipmentCompleted}</div>
              <div className="text-gray-600">Completados</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">Accesos Rápidos</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link 
            href="/repairs" 
            className="text-center p-3 bg-white rounded-md hover:bg-blue-100 transition-colors"
          >
            <div className="text-blue-600 font-medium">Nuevo Equipo</div>
            <div className="text-sm text-gray-600">Registrar reparación</div>
          </Link>
          <Link 
            href="/repairs/manage" 
            className="text-center p-3 bg-white rounded-md hover:bg-blue-100 transition-colors"
          >
            <div className="text-blue-600 font-medium">Gestionar Tickets</div>
            <div className="text-sm text-gray-600">Ver reparaciones</div>
          </Link>
          <Link 
            href="/pos" 
            className="text-center p-3 bg-white rounded-md hover:bg-blue-100 transition-colors"
          >
            <div className="text-blue-600 font-medium">Nueva Venta</div>
            <div className="text-sm text-gray-600">Procesar venta</div>
          </Link>
          <Link 
            href="/products" 
            className="text-center p-3 bg-white rounded-md hover:bg-blue-100 transition-colors"
          >
            <div className="text-blue-600 font-medium">Nuevo Producto</div>
            <div className="text-sm text-gray-600">Agregar al inventario</div>
          </Link>
        </div>
      </div>
    </div>
  );
}
