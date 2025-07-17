import { supabase } from './Supabase';

export const connectSupport = async () => {
  try {
    const { data, error } = await supabase
      .from('support_team')
      .select('user_id, user(mobile_number)')  // ✅ Join with user table to get mobile number
      .eq('status', 'available')
      .limit(1)
      .single();

    if (error) {
      console.error("Error fetching support:", error);
      return { success: false, message: error.message, error };
    }

    console.log('✅ Support Team Data:', data);

    if (data?.user?.mobile_number) {
      // ✅ Redirect to WhatsApp with the mobile number
      window.location.href = `https://wa.me/${data.user.mobile_number}`;
      return { success: true };
    } else {
      return { success: false, message: "No available support team member right now." };
    }

  } catch (err) {
    console.error("Unexpected error:", err);
    return { success: false, message: "Something went wrong.", error: err };
  }
};
