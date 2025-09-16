import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { Package, ShoppingCart, History, Home, Wrench } from "lucide-react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Papelería & Reparaciones POS",
  description: "Sistema de punto de venta y gestión de reparaciones",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="min-h-screen bg-gray-50">
          {/* Navigation */}
          <nav className="bg-blue-600 text-white shadow-lg">
            <div className="max-w-7xl mx-auto px-4">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center space-x-8">
                  <Link href="/" className="text-xl font-bold">
                    Papelería & Reparaciones
                  </Link>
                  <div className="hidden md:flex space-x-4">
                    <Link 
                      href="/" 
                      className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-blue-700 transition-colors"
                    >
                      <Home size={20} />
                      <span>Inicio</span>
                    </Link>
                    <Link 
                      href="/pos" 
                      className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-blue-700 transition-colors"
                    >
                      <ShoppingCart size={20} />
                      <span>Punto de Venta</span>
                    </Link>
                    <Link 
                      href="/products" 
                      className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-blue-700 transition-colors"
                    >
                      <Package size={20} />
                      <span>Productos</span>
                    </Link>
                    <Link 
                      href="/sales" 
                      className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-blue-700 transition-colors"
                    >
                      <History size={20} />
                      <span>Ventas</span>
                    </Link>
                    
                    {/* Repair Section Dropdown */}
                    <div className="relative group">
                      <button className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-blue-700 transition-colors">
                        <Wrench size={20} />
                        <span>Reparaciones</span>
                      </button>
                      <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                        <div className="py-1">
                          <Link 
                            href="/repairs" 
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            Registrar Equipo
                          </Link>
                          <Link 
                            href="/repairs/manage" 
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            Gestionar Tickets
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </nav>

          {/* Main Content */}
          <main className="max-w-7xl mx-auto py-6 px-4">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
