# Papelería POS - Sistema de Punto de Venta

Un sistema completo de punto de venta desarrollado con Next.js para gestión de inventario y ventas de una papelería.

## Características

- ✅ **Gestión de Productos**: Agregar, editar, eliminar y buscar productos
- ✅ **Control de Inventario**: Seguimiento automático del stock
- ✅ **Punto de Venta**: Interfaz intuitiva para procesar ventas
- ✅ **Historial de Ventas**: Ver todas las transacciones y movimientos
- ✅ **Actualización Automática**: El inventario se actualiza automáticamente al procesar ventas
- ✅ **Interfaz Responsiva**: Diseño profesional con Tailwind CSS

## Tecnologías Utilizadas

- **Frontend**: Next.js 15 con TypeScript
- **Backend**: API Routes de Next.js
- **Base de Datos**: SQLite con Prisma ORM
- **Estilos**: Tailwind CSS
- **Iconos**: Lucide React

## Instalación y Configuración

### Prerrequisitos
- Node.js 18+ instalado
- npm o yarn

### Pasos de Instalación

1. **Navegar al directorio del proyecto**
   ```bash
   cd papeleria-pos
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar la base de datos**
   ```bash
   # Generar la base de datos SQLite
   npx prisma migrate dev --name init
   
   # Poblar con datos de ejemplo
   npx tsx prisma/seed.ts
   ```

4. **Iniciar el servidor de desarrollo**
   ```bash
   npm run dev
   ```

5. **Abrir en el navegador**
   Ir a [http://localhost:3000](http://localhost:3000)

## Uso del Sistema

### 1. Página Principal
- Dashboard con resumen del sistema
- Acceso rápido a las principales funciones
- Estadísticas básicas

### 2. Gestión de Productos (`/products`)
- **Ver productos**: Lista todos los productos con información detallada
- **Buscar**: Filtrar productos por nombre, categoría o SKU
- **Agregar producto**: Formulario para crear nuevos productos
- **Editar producto**: Modificar información existente
- **Eliminar producto**: Remover productos del inventario

### 3. Punto de Venta (`/pos`)
- **Interfaz dividida**: Productos a la izquierda, carrito a la derecha
- **Buscar productos**: Por nombre o SKU
- **Filtrar por categoría**: Ver solo productos de una categoría específica
- **Agregar al carrito**: Click en producto para agregarlo
- **Gestionar cantidades**: Aumentar/disminuir cantidad en el carrito
- **Procesar venta**: Automáticamente actualiza el inventario

### 4. Historial de Ventas (`/sales`)
- **Ver todas las ventas**: Organizadas por fecha
- **Detalles de venta**: Click en "Ver detalles" para información completa
- **Estadísticas**: Total de ventas, ingresos y productos vendidos
