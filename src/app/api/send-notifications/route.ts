
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { checkAndSendPrayerNotifications } from '@/lib/prayer-notifications';

// This is an admin endpoint and should be secured in a production environment
// (e.g., by checking for a secret header or an admin user role).
export async function GET(request: Request) {
  const headersList = headers();
  const authHeader = headersList.get('authorization');
  const isDevelopment = process.env.NODE_ENV === 'development';
  const cronSecret = process.env.CRON_SECRET;

  // For production, the cron secret must be provided and must match.
  // In development, we bypass this check for easier manual testing.
  if (!isDevelopment && (!cronSecret || authHeader !== `Bearer ${cronSecret}`)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const testOffsetParam = searchParams.get('test_offset_minutes');
  const testOffsetMinutes = testOffsetParam ? parseInt(testOffsetParam, 10) : undefined;
  
  if (testOffsetParam && isNaN(testOffsetMinutes!)) {
    return NextResponse.json({ success: false, error: 'Invalid test_offset_minutes parameter.' }, { status: 400 });
  }

  console.log("Triggering notification check...");
  try {
    // This function runs asynchronously. We don't need to wait for it to
    // finish to send a response to the client.
    checkAndSendPrayerNotifications(testOffsetMinutes);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Notification check triggered successfully. This process runs in the background. Check server logs for details.' 
    });

  } catch (error: any)
{
    console.error('Error triggering notification check:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
