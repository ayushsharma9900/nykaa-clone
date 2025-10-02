import { NextRequest, NextResponse } from 'next/server';
import { runQuery, getQuery, ensureDatabaseInitialized } from '@/lib/database';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Ensure app_settings table exists
async function ensureSettingsTable() {
  await runQuery(`
    CREATE TABLE IF NOT EXISTS app_settings (
      id TEXT PRIMARY KEY,
      json TEXT NOT NULL,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

export async function GET() {
  try {
    await ensureDatabaseInitialized();
    await ensureSettingsTable();

    const row = await getQuery('SELECT json FROM app_settings WHERE id = ?', ['app']);
    let settings = {} as any;
    if (row && row.json) {
      try {
        settings = JSON.parse(row.json);
      } catch {
        settings = {};
      }
    }

    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error('❌ Error loading settings:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to load settings' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await ensureDatabaseInitialized();
    await ensureSettingsTable();

    const body = await request.json();
    const incoming = body?.settings || {};
    const json = JSON.stringify(incoming);

    // Upsert row
    const usePostgres = !!(process.env.VERCEL || process.env.POSTGRES_URL || process.env.DATABASE_URL);
    if (usePostgres) {
      await runQuery(
        `INSERT INTO app_settings (id, json, updatedAt) VALUES (?, ?, NOW())
         ON CONFLICT (id) DO UPDATE SET json = EXCLUDED.json, updatedAt = EXCLUDED.updatedAt`,
        ['app', json]
      );
    } else {
      await runQuery(
        `INSERT OR REPLACE INTO app_settings (id, json, updatedAt) VALUES (?, ?, CURRENT_TIMESTAMP)`,
        ['app', json]
      );
    }

    return NextResponse.json({ success: true, message: 'Settings saved' });
  } catch (error) {
    console.error('❌ Error saving settings:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to save settings' },
      { status: 500 }
    );
  }
}