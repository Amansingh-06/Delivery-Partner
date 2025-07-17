// utils/fetchVendorRatingStats.js
import { supabase } from "./Supabase";

export const fetchDpRatingStats = async (DpId) => {
  try {
    const { data, error } = await supabase
      .from("dp_rating")
      .select("rating")
      .eq("dp_id", DpId);

    if (error) {
      console.error("❌ Error fetching rating stats:", error);
      return { success: false, averageRating: 0, totalCustomers: 0 };
    }

    const totalCustomers = data.length;
    const totalRating = data.reduce(
      (sum, row) => sum + (row.rating || 0),
      0
    );
    const averageRating =
      totalCustomers > 0 ? (totalRating / totalCustomers).toFixed(1) : "0.0";

    return {
      success: true,
      averageRating: Number(averageRating),
      totalCustomers,
    };
  } catch (err) {
    console.error("❌ Exception in fetchVendorRatingStats:", err);
    return { success: false, averageRating: 0, totalCustomers: 0 };
  }
};
