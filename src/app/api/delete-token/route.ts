
import { NextResponse } from 'next/server';
import { firestore } from '@/lib/firebase-admin';

export async function POST(request: Request) {
  try {
    const { token } = await request.json();

    if (!token || typeof token !== 'string') {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    // The document ID is the token itself
    const tokenRef = firestore.collection('fcmTokens').doc(token);
    
    await tokenRef.delete();

    console.log(`Successfully deleted token: ${token.substring(0, 10)}...`);
    return NextResponse.json({ success: true, message: 'Token deleted successfully.' });

  } catch (error: any) {
    console.error('Error deleting token:', error);
    const errorMessage = error.message || 'An unexpected error occurred.';
    return NextResponse.json({ error: 'Internal Server Error', details: errorMessage }, { status: 500 });
  }
}
