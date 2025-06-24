
import { NextResponse } from 'next/server';
import { firestore } from '@/lib/firebase-admin';

export async function POST(request: Request) {
  try {
    const { token, location, language } = await request.json();

    if (!token || typeof token !== 'string' || !location || typeof location !== 'string' || !language) {
      return NextResponse.json({ error: 'Token, location, and language are required' }, { status: 400 });
    }

    // The document ID will be the token itself to prevent duplicates
    const tokenRef = firestore.collection('fcmTokens').doc(token);
    
    // Save or update the token with its location and language
    await tokenRef.set({
        location,
        language,
        createdAt: new Date(),
    }, { merge: true }); // Use merge: true to update if it exists

    return NextResponse.json({ success: true, message: 'Token processed successfully.' });

  } catch (error: any) {
    console.error('Error saving token:', error);
    // Be careful not to leak sensitive error details
    const errorMessage = error.message || 'An unexpected error occurred.';
    return NextResponse.json({ error: 'Internal Server Error', details: errorMessage }, { status: 500 });
  }
}
