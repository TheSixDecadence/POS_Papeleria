import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/repairs - Get all repair tickets
export async function GET() {
  try {
    const repairs = await prisma.repairTicket.findMany({
      include: {
        customer: true
      },
      orderBy: {
        receivedDate: 'desc'
      }
    })
    return NextResponse.json(repairs)
  } catch (error) {
    console.error('Error fetching repair tickets:', error)
    return NextResponse.json(
      { error: 'Failed to fetch repair tickets' },
      { status: 500 }
    )
  }
}

// POST /api/repairs - Create a new repair ticket
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      customerId, 
      deviceType, 
      brand, 
      model, 
      serialNumber, 
      problemDescription, 
      observations,
      estimatedCost 
    } = body

    // Validate required fields
    if (!customerId || !deviceType || !problemDescription) {
      return NextResponse.json(
        { error: 'Customer, device type, and problem description are required' },
        { status: 400 }
      )
    }

    // Generate ticket number
    const currentDate = new Date()
    const year = currentDate.getFullYear()
    const month = String(currentDate.getMonth() + 1).padStart(2, '0')
    const day = String(currentDate.getDate()).padStart(2, '0')
    
    // Get count of tickets today to create unique number
    const startOfDay = new Date(currentDate.setHours(0, 0, 0, 0))
    const endOfDay = new Date(currentDate.setHours(23, 59, 59, 999))
    
    const todayTicketsCount = await prisma.repairTicket.count({
      where: {
        receivedDate: {
          gte: startOfDay,
          lte: endOfDay
        }
      }
    })

    const ticketNumber = `REP-${year}${month}${day}-${String(todayTicketsCount + 1).padStart(3, '0')}`

    const repairTicket = await prisma.repairTicket.create({
      data: {
        ticketNumber,
        customerId,
        deviceType,
        brand,
        model,
        serialNumber,
        problemDescription,
        observations,
        estimatedCost: estimatedCost ? parseFloat(estimatedCost) : null
      },
      include: {
        customer: true
      }
    })

    return NextResponse.json(repairTicket, { status: 201 })
  } catch (error) {
    console.error('Error creating repair ticket:', error)
    return NextResponse.json(
      { error: 'Failed to create repair ticket' },
      { status: 500 }
    )
  }
}