import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { manualRevalidate } from '@/lib/revalidation';

export async function POST(request: NextRequest) {
  try {
    const { type, slug, paths } = await request.json();

    // Validate request
    if (!type && !paths) {
      return NextResponse.json(
        { error: 'Missing type or paths parameter' },
        { status: 400 }
      );
    }

    // Use the manual revalidation helper
    const result = await manualRevalidate(paths);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Revalidation failed', details: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Revalidation completed successfully',
      revalidatedPaths: paths || ['all'],
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Revalidation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}