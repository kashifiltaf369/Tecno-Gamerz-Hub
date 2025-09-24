import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const apiUrl = process.env.API_URL || 'http://localhost:3001';
    
    // Get authorization header if present
    const authorization = request.headers.get('authorization');
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (authorization) {
      headers.Authorization = authorization;
    }

    const response = await fetch(`${apiUrl}/videos/${params.id}`, {
      method: 'GET',
      headers,
    });

    const data = await response.json();

    return NextResponse.json({
      success: response.ok,
      data: data,
      message: response.ok ? 'Video retrieved successfully' : data.message || 'Failed to fetch video',
    }, { status: response.status });

  } catch (error) {
    console.error('Video API Error:', error);
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