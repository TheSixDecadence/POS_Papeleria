import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface SaleItem {
  productId: string
  quantity: number
}

// GET /api/sales - Get all sales with items
export async function GET() {
  try {
    const sales = await prisma.sale.findMany({
      include: {
        items: {
          include: {
            product: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    return NextResponse.json(sales)
  } catch (error) {
    console.error('Error fetching sales:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sales' },
      { status: 500 }
    )
  }
}

// POST /api/sales - Create a new sale and update inventory
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { items }: { items: SaleItem[] } = body

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'No items provided for sale' },
        { status: 400 }
      )
    }

    // Start a transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      let total = 0
      const saleItemsData = []

      // Validate all items and calculate total
      for (const item of items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId }
        })

        if (!product) {
          throw new Error(`Product with ID ${item.productId} not found`)
        }

        if (product.stock < item.quantity) {
          throw new Error(
            `Insufficient stock for ${product.name}. Available: ${product.stock}, Required: ${item.quantity}`
          )
        }

        const itemTotal = product.price * item.quantity
        total += itemTotal

        saleItemsData.push({
          productId: item.productId,
          quantity: item.quantity,
          price: product.price
        })
      }

      // Create the sale
      const sale = await tx.sale.create({
        data: {
          total,
          items: {
            create: saleItemsData
          }
        },
        include: {
          items: {
            include: {
              product: true
            }
          }
        }
      })

      // Update inventory for each product
      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity
            }
          }
        })
      }

      return sale
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('Error creating sale:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create sale' },
      { status: 500 }
    )
  }
}