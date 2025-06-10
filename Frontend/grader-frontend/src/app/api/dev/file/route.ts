// gemini 2.5 pro and claude 4 wrote this

import { files } from '@/lib/api/mock';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const fileIdParam = searchParams.get('fileId');

  if (fileIdParam) {
    const fileId = parseInt(fileIdParam, 10);
    if (isNaN(fileId)) {
      return NextResponse.json({ error: 'Invalid fileId parameter. It must be a number.' }, { status: 400 });
    }

    const file = files.get(fileId);

    if (file) {
      // Serve the specific file as static asset
      const headers = new Headers();
      headers.set('Content-Type', file.type || 'application/octet-stream');
      
      // For images, text files, and HTML, serve inline
      if (file.type?.startsWith('image/') || 
          file.type?.startsWith('text/') || 
          file.type === 'text/html' ||
          file.type === 'application/pdf') {
        headers.set('Content-Disposition', 'inline');
      } else {
        // For other file types, still provide filename but serve inline
        headers.set('Content-Disposition', `inline; filename="${file.name}"`);
      }

      try {
        const buffer = await file.arrayBuffer();
        return new Response(buffer, { headers });
      } catch (error) {
        console.error('Error reading file content:', error);
        return NextResponse.json({ error: 'Error reading file content' }, { status: 500 });
      }
    } else {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }
  } else {
    // If fileId is not provided, also return a 404
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }
}
