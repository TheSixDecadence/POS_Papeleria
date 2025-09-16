import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/repairs/[id] - Get a specific repair ticket
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const repairTicket = await prisma.repairTicket.findUnique({
      where: {
        id: params.id
      },
      include: {
        customer: true
      }
    })

    if (!repairTicket) {
      return NextResponse.json(
        { error: 'Repair ticket not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(repairTicket)
  } catch (error) {
    console.error('Error fetching repair ticket:', error)
    return NextResponse.json(
      { error: 'Failed to fetch repair ticket' },
      { status: 500 }
    )
  }
}

// PUT /api/repairs/[id] - Update a repair ticket
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { 
      status,
      estimatedCost,
      finalCost,
      observations,
      completedDate,
      deliveredDate
    } = body

    // Check if repair ticket exists
    const existingTicket = await prisma.repairTicket.findUnique({
      where: { id: params.id }
    })

    if (!existingTicket) {
      return NextResponse.json(
        { error: 'Repair ticket not found' },
        { status: 404 }
      )
    }

    const updatedTicket = await prisma.repairTicket.update({
      where: {
        id: params.id
      },
      data: {
        status,
        estimatedCost: estimatedCost ? parseFloat(estimatedCost) : undefined,
        finalCost: finalCost ? parseFloat(finalCost) : undefined,
        observations,
        completedDate: completedDate ? new Date(completedDate) : undefined,
        deliveredDate: deliveredDate ? new Date(deliveredDate) : undefined
      },
      include: {
        customer: true
      }
    })

    return NextResponse.json(updatedTicket)
  } catch (error) {
    console.error('Error updating repair ticket:', error)
    return NextResponse.json(
      { error: 'Failed to update repair ticket' },
      { status: 500 }
    )
  }
}