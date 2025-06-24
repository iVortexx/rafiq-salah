import { NextResponse } from 'next/server';
import { checkAndSendPrayerNotifications } from '@/lib/prayer-notifications';

// This is an admin endpoint and should be secured in a production environment
// (e.g., by checking for a secret header or an admin user role).
export async function GET() {
  console.log("Manually triggering notification check...");
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
