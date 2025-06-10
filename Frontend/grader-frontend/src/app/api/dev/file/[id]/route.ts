import { files } from '@/lib/api/mock-v2';
import { NextRequest, NextResponse } from 'next/server';

// IMPORTANT: The 'files' map is imported from '@/lib/api/mock-v2'.
// Ensure this map is populated with the necessary File objects.
// If the previous route file (at /api/dev/file/route.ts) was responsible
// for populating this map with sample data (like sampleFile1, sampleFile2),
// that logic needs to be moved to an appropriate place (e.g., within mock-v2.ts
// or an initialization script for your application) if you delete the old route file.

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const fileIdParam = params.id;
  const fileId = parseInt(fileIdParam, 10);

  if (isNaN(fileId)) {
    return NextResponse.json({ error: 'Invalid file ID format. It must be a number.' }, { status: 400 });
  }

  const file = files.get(fileId);

  if (file) {
    const headers = new Headers();
    headers.set('Content-Type', file.type || 'application/octet-stream');
    // By not setting 'Content-Disposition: attachment', browsers will attempt to display the content inline.

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
}
