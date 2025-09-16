'use client';

import { useState, useEffect } from 'react';
import { Plus, Minus, ShoppingCart, X } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  category: string;
  sku: string;
}

interface CartItem {
  product: Product;
  quantity: number;
}

export default function POSPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [...new Set(products.map(p => p.category))];
  
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || product.category === selectedCategory;
    return matchesSearch && matchesCategory && product.stock > 0;
  });

  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.product.id === product.id);
    
    if (existingItem) {
      if (existingItem.quantity < product.stock) {
        setCart(cart.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ));
      }
    } else {
      setCart([...cart, { product, quantity: 1 }]);
    }
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    const product = products.find(p => p.id === productId);
    if (product && newQuantity <= product.stock) {
      setCart(cart.map(item =>
        item.product.id === productId
          ? { ...item, quantity: newQuantity }
          : item
      ));
    }
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.product.id !== productId));
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  const processSale = async () => {
    if (cart.length === 0) return;

    setProcessing(true);
    try {
      const saleData = {
        items: cart.map(item => ({
          productId: item.product.id,
          quantity: item.quantity
        }))
      };

      const response = await fetch('/api/sales', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(saleData),
      });

      if (response.ok) {
        alert('¡Venta procesada exitosamente!');
        setCart([]);
        await fetchProducts(); // Refresh product stock
      } else {
        const error = await response.json();
        alert(error.error || 'Error al procesar la venta');
      }
    } catch (error) {
      console.error('Error processing sale:', error);
      alert('Error al procesar la venta');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Cargando productos...</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-screen max-h-screen">
      {/* Products Section */}
      <div className="lg:col-span-2 space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">Punto de Venta</h1>
        
        {/* Search and Filter */}
        <div className="flex space-x-4">
          <input
            type="text"
            placeholder="Buscar productos..."
            className="text-gray-700 flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="text-gray-700 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">Todas las categorías</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 max-h-96 overflow-y-auto">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white p-4 rounded-lg shadow-md border border-gray-200 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => addToCart(product)}
            >
              <div className="text-sm font-medium text-gray-900 mb-1">
                {product.name}
              </div>
              <div className="text-xs text-gray-500 mb-2">
                {product.sku}
              </div>
              <div className="text-lg font-bold text-blue-600 mb-1">
                ${product.price.toFixed(2)}
              </div>
              <div className="text-xs text-gray-500">
                Stock: {product.stock}
              </div>
            </div>
          ))}
        </div>
        
        {filteredProducts.length === 0 && (
          <div className="text-center py-8 text-gray-700">
            No hay productos disponibles
          </div>
        )}
      </div>

      {/* Cart Section */}
      <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200 flex flex-col max-h-screen">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <ShoppingCart className="mr-2" size={24} />
          Carrito de Compras
        </h2>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto space-y-3 mb-4">
          {cart.map((item) => (
            <div key={item.product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">
                  {item.product.name}
                </div>
                <div className="text-xs text-gray-500">
                  ${item.product.price.toFixed(2)} c/u
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                  className="text-gray-700 p-1 rounded-full bg-gray-200 hover:bg-gray-300"
                >
                  <Minus size={12} />
                </button>
                
                <span className="text-gray-700 w-8 text-center text-sm font-medium">
                  {item.quantity}
                </span>
                
                <button
                  onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                  className="text-gray-700 p-1 rounded-full bg-gray-200 hover:bg-gray-300"
                  disabled={item.quantity >= item.product.stock}
                >
                  <Plus size={12} />
                </button>
                
                <button
                  onClick={() => removeFromCart(item.product.id)}
                  className="p-1 rounded-full bg-red-100 hover:bg-red-200 text-red-600 ml-2"
                >
                  <X size={12} />
                </button>
              </div>
              
              <div className="ml-3 text-sm font-medium text-gray-900 min-w-16 text-right">
                ${(item.product.price * item.quantity).toFixed(2)}
              </div>
            </div>
          ))}
          
          {cart.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              El carrito está vacío
            </div>
          )}
        </div>

        {/* Cart Summary */}
        {cart.length > 0 && (
          <div className="border-t pt-4 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-medium text-gray-900">Total:</span>
              <span className="text-2xl font-bold text-blue-600">
                ${getCartTotal().toFixed(2)}
              </span>
            </div>
            
            <div className="space-y-2">
              <button
                onClick={processSale}
                disabled={processing || cart.length === 0}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
              >
                {processing ? 'Procesando...' : 'Procesar Venta'}
              </button>
              
              <button
                onClick={() => setCart([])}
                className="w-full bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600"
              >
                Limpiar Carrito
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}