import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const apiUrl = process.env.API_URL || 'http://localhost:3001';
    
    // Get authorization header
    const authorization = request.headers.get('authorization');
    
    if (!authorization) {
      return NextResponse.json(
        { success: false, message: 'Authorization required' },
        { status: 401 }
      );
    }

    const body = await request.json();

    const response = await fetch(`${apiUrl}/videos/${params.id}/interaction`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authorization,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    return NextResponse.json({
      success: response.ok,
      data: data,
      message: response.ok ? 'Interaction recorded successfully' : data.message || 'Failed to record interaction',
    }, { status: response.status });

  } catch (error) {
    console.error('Video Interaction API Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}