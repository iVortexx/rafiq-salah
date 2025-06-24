import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { checkAndSendPrayerNotifications } from '@/lib/prayer-notifications';

// This is an admin endpoint and should be secured in a production environment
// (e.g., by checking for a secret header or an admin user role).
export async function GET(request: Request) {
  const headersList = headers();
  const authHeader = headersList.get('authorization');

  // When deployed to Vercel, the CRON_SECRET environment variable must be set.
  // The cron job will send a request with an Authorization header.
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  console.log("Triggering notification check...");
  try {
    // This function runs asynchronously. We don't need to wait for it to
    // finish to send a response to the client.
    checkAndSendPrayerNotifications();
    
    return NextResponse.json({ 
      success: true, 
      message: 'Notification check triggered successfully. This process runs in the background. Check server logs for details.' 
    });

  } catch (error: any) {
    console.error('Error triggering notification check:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
