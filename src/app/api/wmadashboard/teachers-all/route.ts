import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const response = await fetch('https://wma-dashboard-stg.azurewebsites.net/api/teachers/teachers-all', {
      headers: {
        'Authorization': request.headers.get('Authorization') || '',
      },
    });

    if (!response.ok) {
      return new NextResponse(
        JSON.stringify({ error: 'Failed to fetch teachers availability' }),
        {
          status: response.status,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching teachers availability:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
} 