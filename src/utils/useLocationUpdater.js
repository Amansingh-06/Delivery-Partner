import { useEffect, useRef } from 'react';
import { supabase } from './Supabase';

const useLocationUpdater = (userId, intervalMs = 10000) => {
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!userId) {
      console.log("❌ No userId passed to location hook");
      return;
    }

    const updateLocationIfAvailable = async () => {
      console.log("📍 Checking availability for userId:", userId);

      // 🔄 Step 1: Check availability
      const { data, error: fetchError } = await supabase
        .from('delivery_partner')
        .select('available')
        .eq('dp_id', userId) // ✅ use correct field here
        .single();

      if (fetchError) {
        console.error("❌ Failed to fetch availability:", fetchError);
        return;
      }

      console.log("📦 Availability data:", data);

      if (!data?.available) {
        console.log("🟡 Not available, skipping location update.");
        return;
      }

      // 🌐 Step 2: Get current location
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            const latitude = pos.coords.latitude;
            const longitude = pos.coords.longitude;
            const now = new Date().toISOString();

            console.log("✅ Location fetched:", latitude, longitude);

            // 💾 Step 3: Update delivery_partner
            const { error: updateError } = await supabase
              .from('delivery_partner')
              .update({
                lat: latitude,
                long: longitude,
                last_available_ts: now,
              
              })
              .eq('dp_id', userId); // ✅ same as above

            if (updateError) {
              console.error("❌ Supabase update error:", updateError);
            } else {
              console.log("✅ Location updated to Supabase");
            }
          },
          (err) => {
            console.error("❌ Geolocation error:", err.message);
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
          }
        );
      }
    };

    updateLocationIfAvailable(); // first call
    intervalRef.current = setInterval(updateLocationIfAvailable, intervalMs);

    return () => clearInterval(intervalRef.current);
  }, [userId, intervalMs]);
};

export default useLocationUpdater;
