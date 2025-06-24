# **App Name**: Prayer Pal

## Core Features:

- Location Detection: Use the browser’s Geolocation API to get the user’s current coordinates. Fallback UI for manual location entry (city name or coordinates) if permission is denied or the browser doesn't support GPS.
- Prayer Times Display: Use the AlAdhan API to fetch daily prayer times based on the user’s location. Display the following times: Fajr, Sunrise, Dhuhr, Asr, Maghrib, Isha. Highlight the next upcoming prayer visually.
- Countdown Timer: Show a real-time countdown to the next prayer time (live-updating). Automatically resets after each prayer.
- Prayer Notifications: Ask for browser permission to send notifications. Use Web Push API and a Service Worker to schedule notifications even when the site is closed but the browser is running. Notifications should contain the prayer name and time.
- Dual Calendar: Show both the Gregorian and Hijri dates on the home screen. Hijri date can be fetched from AlAdhan or calculated manually if needed.

## Style Guidelines:

- Primary Color: Serene Blue #4A8FE7
- Background Color: Light Grey #F0F4F8
- Accent Color: Soft Gold #D4A275
- Body Text: 'PT Sans', sans-serif
- Headlines: 'Playfair Display', serif
- Use line-based icons (e.g., [Lucide](https://lucide.dev) or [Heroicons](https://heroicons.com)) for prayer times, location, settings, and notifications.
- Clean and minimal design. Responsive across mobile, tablet, and desktop. Grid or flex-based layout using TailwindCSS. Optional glassmorphism or soft cards for prayer boxes.
- Subtle fade or slide transitions for: Prayer time updates, Countdown refresh, Notification toggle. Use @tailwindcss/transition or Framer Motion (optional)