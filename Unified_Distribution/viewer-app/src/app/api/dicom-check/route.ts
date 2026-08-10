import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';


export async function GET(req: NextRequest) {
  try {
    const statePath = path.join(process.cwd(), 'public', 'temp-dicom', 'latest_push.json');
    
    try {
      const data = await fs.readFile(statePath, 'utf8');
      const state = JSON.parse(data);
      return NextResponse.json(state);
    } catch {
      // File doesn't exist yet, return empty/cleared state
      return NextResponse.json({ status: 'cleared' });
    }
  } catch (error) {
    console.error('Error checking DICOM state:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { action } = await req.json();
    
    if (action === 'clear') {
      const statePath = path.join(process.cwd(), 'public', 'temp-dicom', 'latest_push.json');
      const stateData = {
        status: 'cleared',
        timestamp: Date.now()
      };
      
      // Ensure directory exists
      const tempDir = path.join(process.cwd(), 'public', 'temp-dicom');
      try {
        await fs.access(tempDir);
      } catch {
        await fs.mkdir(tempDir, { recursive: true });
      }
      
      await fs.writeFile(statePath, JSON.stringify(stateData));
      return NextResponse.json({ success: true, message: 'Alert cleared.' });
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error updating DICOM state:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
