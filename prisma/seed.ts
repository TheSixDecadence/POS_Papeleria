import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')
  
  // Create sample products
  const products = [
    {
      name: 'Bolígrafo Azul',
      description: 'Bolígrafo de tinta azul, punta media',
      price: 2.50,
      stock: 100,
      category: 'Escritura',
      sku: 'BOL-001'
    },
    {
      name: 'Cuaderno A4',
      description: 'Cuaderno universitario 100 hojas',
      price: 8.99,
      stock: 50,
      category: 'Cuadernos',
      sku: 'CUA-001'
    },
    {
      name: 'Lápiz HB',
      description: 'Lápiz grafito dureza HB',
      price: 1.25,
      stock: 200,
      category: 'Escritura',
      sku: 'LAP-001'
    },
    {
      name: 'Borrador',
      description: 'Borrador de goma blanco',
      price: 0.75,
      stock: 80,
      category: 'Accesorios',
      sku: 'BOR-001'
    },
    {
      name: 'Resaltador Amarillo',
      description: 'Marcador resaltador color amarillo',
      price: 3.25,
      stock: 60,
      category: 'Marcadores',
      sku: 'RES-001'
    },
    {
      name: 'Folder Manila',
      description: 'Folder tamaño carta color manila',
      price: 1.50,
      stock: 120,
      category: 'Archivadores',
      sku: 'FOL-001'
    },
    {
      name: 'Tijeras',
      description: 'Tijeras escolares punta roma',
      price: 4.99,
      stock: 30,
      category: 'Accesorios',
      sku: 'TIJ-001'
    },
    {
      name: 'Pegamento en Barra',
      description: 'Pegamento en barra 20g',
      price: 2.75,
      stock: 45,
      category: 'Adhesivos',
      sku: 'PEG-001'
    }
  ]

  for (const product of products) {
    await prisma.product.create({
      data: product
    })
  }

  console.log('Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })