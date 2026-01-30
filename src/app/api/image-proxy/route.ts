import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_BASE_URL = process.env.API_BASE_URL || 'http://51.20.87.226:8000';

export async function GET(request: NextRequest) {
  try {
    // Get the image URL from query params
    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get('url');

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Missing url parameter' },
        { status: 400 }
      );
    }

    // Get auth token from cookies (for non-S3 URLs)
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    // Determine if this is a relative URL or absolute URL
    let fetchUrl = imageUrl;
    if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
      // Relative URL - prepend API base URL
      fetchUrl = `${API_BASE_URL}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
    }

    console.log('[API image-proxy] Fetching:', fetchUrl);

    // Check if this is an S3 URL - S3 URLs don't need/want Bearer token auth
    // S3 uses pre-signed URLs or public access
    const isS3Url = fetchUrl.includes('.s3.') || fetchUrl.includes('s3.amazonaws.com');
    
    // Build headers based on URL type
    const headers: HeadersInit = {};
    
    if (!isS3Url) {
      // For non-S3 URLs (like backend API), include auth token
      if (!token) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
      headers['Authorization'] = `Bearer ${token}`;
      headers['ngrok-skip-browser-warning'] = 'true';
    }
    // For S3 URLs, don't add any auth headers - they should be pre-signed or public

    // Fetch the image
    const response = await fetch(fetchUrl, { headers });

    console.log('[API image-proxy] Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text().catch(() => response.statusText);
      console.error('[API image-proxy] Error:', response.status, errorText);
      return NextResponse.json(
        { error: `Failed to fetch image: ${response.status} ${errorText}` },
        { status: response.status }
      );
    }

    // Get the image data
    const imageBuffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'image/png';

    // Return the image with proper headers
    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error('[API image-proxy] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
