import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/customers - Get all customers
export async function GET() {
  try {
    const customers = await prisma.customer.findMany({
      include: {
        repairTickets: {
          select: {
            id: true,
            ticketNumber: true,
            status: true,
            receivedDate: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })
    return NextResponse.json(customers)
  } catch (error) {
    console.error('Error fetching customers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch customers' },
      { status: 500 }
    )
  }
}

// POST /api/customers - Create a new customer
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, phone, email, address } = body

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }

    const customer = await prisma.customer.create({
      data: {
        name,
        phone,
        email,
        address
      }
    })

    return NextResponse.json(customer, { status: 201 })
  } catch (error) {
    console.error('Error creating customer:', error)
    return NextResponse.json(
      { error: 'Failed to create customer' },
      { status: 500 }
    )
  }
}