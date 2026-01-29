import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_BASE_URL = process.env.API_BASE_URL || 'http://51.20.87.226:8000';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ folderId: string }> }
) {
  const { folderId } = await params;
  
  try {
    // Get auth token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch from backend API
    const url = `${API_BASE_URL}/api/inference-results/${folderId}`;
    console.log('[API inference-results] Fetching:', url);

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
      cache: 'no-store',
    });

    console.log('[API inference-results] Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[API inference-results] Error:', errorText);
      return NextResponse.json(
        { error: errorText || 'Failed to fetch inference results' },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('[API inference-results] Success, drawings:', data.drawings?.length || 0);

    return NextResponse.json(data);
  } catch (error) {
    console.error('[API inference-results] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
