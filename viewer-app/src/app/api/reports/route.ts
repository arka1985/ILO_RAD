import { NextResponse } from 'next/server';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import os from 'os';
import path from 'path';
import fs from 'fs';

// Determine the cross-platform path to the Documents folder
const homeDir = os.homedir();
const dbFolderPath = path.join(homeDir, 'Documents', 'ILO_RAD_Database');
const dbFilePath = path.join(dbFolderPath, 'reports.db');

// Ensure the directory exists
if (!fs.existsSync(dbFolderPath)) {
  fs.mkdirSync(dbFolderPath, { recursive: true });
}

let dbInstance: any = null;

async function getDb() {
  if (!dbInstance) {
    dbInstance = await open({
      filename: dbFilePath,
      driver: sqlite3.Database
    });
    
    // Create table if it doesn't exist
    await dbInstance.exec(`
      CREATE TABLE IF NOT EXISTS reports (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        historyId INTEGER UNIQUE,
        historyDate TEXT,
        patientId TEXT,
        patientName TEXT,
        data JSON
      )
    `);
  }
  return dbInstance;
}

export async function GET(request: Request) {
  try {
    const db = await getDb();
    const reports = await db.all('SELECT * FROM reports ORDER BY historyId DESC');
    
    // Parse the JSON data string back into an object
    const parsedReports = reports.map((row: any) => JSON.parse(row.data));
    return NextResponse.json(parsedReports);
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const db = await getDb();
    
    // Insert or replace based on historyId
    await db.run(
      `INSERT OR REPLACE INTO reports (historyId, historyDate, patientId, patientName, data) 
       VALUES (?, ?, ?, ?, ?)`,
      [
        data.historyId, 
        data.historyDate, 
        data.patientId || '', 
        data.patientName || '', 
        JSON.stringify(data)
      ]
    );
    
    return NextResponse.json({ success: true, message: 'Report saved to database' });
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json({ error: 'Failed to save report' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const historyId = url.searchParams.get('historyId');
    
    if (!historyId) {
      return NextResponse.json({ error: 'historyId is required' }, { status: 400 });
    }

    const db = await getDb();
    await db.run('DELETE FROM reports WHERE historyId = ?', [historyId]);
    
    return NextResponse.json({ success: true, message: 'Report deleted' });
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json({ error: 'Failed to delete report' }, { status: 500 });
  }
}
