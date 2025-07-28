import { supabase } from './Supabase';


// import { supabase } from './supabaseClient';

export const connectSupport = async () => {
  try {
    const { data, error } = await supabase
      .from('support_team')
      .select('user_id, user(mobile_number)')  // Join with user table to get mobile number
      .eq('status', 'available')
      .limit(1);  // ❌ remove `.single()`

    if (error) {
      return { success: false, message: error.message, error };
    }

    const supportMember = data?.[0];  // ✅ Get first item from array

    if (supportMember?.user?.mobile_number) {
      // ✅ Redirect to WhatsApp with the mobile number
      window.location.href = `https://wa.me/${supportMember.user.mobile_number}`;
      return { success: true };
    } else {
      return { success: false, message: "No one is available from the support team right now,Try later." };
    }

  } catch (err) {
    return { success: false, message: "Something went wrong.", error: err };
  }
};

