
import { NextResponse } from 'next/server';
import { firestore } from '@/lib/firebase-admin';

export async function POST(request: Request) {
  try {
    const { token } = await request.json();

    if (!token || typeof token !== 'string') {
      return NextResponse.json({ error: 'Token is required and must be a string' }, { status: 400 });
    }

    // The document ID will be the token itself to prevent duplicates
    const tokenRef = firestore.collection('fcmTokens').doc(token);
    const doc = await tokenRef.get();

    // Save the token if it doesn't already exist
    if (!doc.exists) {
        await tokenRef.set({
            createdAt: new Date(),
        });
        console.log('Saved new FCM token:', token);
    } else {
        // Optionally, you could update a 'lastSeen' timestamp here
        console.log('FCM token already exists:', token);
    }

    return NextResponse.json({ success: true, message: 'Token processed successfully.' });

  } catch (error: any) {
    console.error('Error saving token:', error);
    // Be careful not to leak sensitive error details
    const errorMessage = error.message || 'An unexpected error occurred.';
    return NextResponse.json({ error: 'Internal Server Error', details: errorMessage }, { status: 500 });
  }
}
