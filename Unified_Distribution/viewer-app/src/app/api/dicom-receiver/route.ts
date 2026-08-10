import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const patientName = formData.get('patientName') as string || '';
    const patientId = formData.get('patientId') as string || '';
    const radiographDate = formData.get('radiographDate') as string || '';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400, headers: corsHeaders });
    }

    const tempDir = path.join(process.cwd(), 'public', 'temp-dicom');
    
    // Ensure directory exists
    try {
      await fs.access(tempDir);
    } catch {
      await fs.mkdir(tempDir, { recursive: true });
    }

    // Save the file
    const safeFilename = `pushed_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const filePath = path.join(tempDir, safeFilename);
    
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    await fs.writeFile(filePath, buffer);

    // Write the state file to alert the frontend
    const statePath = path.join(tempDir, 'latest_push.json');
    const stateData = {
      status: 'pending',
      filename: safeFilename,
      url: `/temp-dicom/${safeFilename}`,
      timestamp: Date.now(),
      patientName,
      patientId,
      radiographDate
    };
    await fs.writeFile(statePath, JSON.stringify(stateData));

    return NextResponse.json({ success: true, message: 'File received and frontend alerted.', file: safeFilename }, { headers: corsHeaders });
  } catch (error) {
    console.error('Error receiving DICOM push:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500, headers: corsHeaders });
  }
}
