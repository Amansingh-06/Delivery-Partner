import { supabase } from "./Supabase";
export const fetchDpRatings = async (DpId, page = 1, limit = 5) => {
  try {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error } = await supabase
      .from("dp_rating")
      .select(
        `
        id,
        created_at,
        rating,
        
    
        user:user_id (
          user_id,
          name,
          mobile_number,
          dp_url
        )
      `
      )
      .eq("dp_id", DpId)
      .order("created_at", { ascending: false })
      .range(from, to);
    if (error) {
      console.error("❌ Error fetching ratings:", error);
      return { success: false, data: null };
    }
    console.log("Rating data", data);

    return { success: true, data };
  } catch (err) {
    console.error("❌ Exception in fetchVendorRatings:", err);
    return { success: false, data: null };
  }
};
