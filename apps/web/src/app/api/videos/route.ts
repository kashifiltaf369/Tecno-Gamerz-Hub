import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const apiUrl = process.env.API_URL || 'http://localhost:3001';
    
    // Forward all query parameters
    const params = new URLSearchParams();
    searchParams.forEach((value, key) => {
      params.append(key, value);
    });

    // Get authorization header if present
    const authorization = request.headers.get('authorization');
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (authorization) {
      headers.Authorization = authorization;
    }

    const response = await fetch(`${apiUrl}/videos?${params.toString()}`, {
      method: 'GET',
      headers,
    });

    const data = await response.json();

    return NextResponse.json({
      success: response.ok,
      data: data,
      message: response.ok ? 'Videos retrieved successfully' : data.message || 'Failed to fetch videos',
    }, { status: response.status });

  } catch (error) {
    console.error('Videos API Error:', error);
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