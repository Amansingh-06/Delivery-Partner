import { supabase } from "./Supabase";

export const fetchOrderById = async (orderId, dpId = null) => {
  try {
    let query = supabase
      .from("orders")
      .select(`
        *,
        user:u_id (*),
        transaction:t_id (*),
        vendor:v_id (*),
        address:addr_id (*),
        order_item:order_item_order_id_fkey (
          *,
          items:item_id (*)
        )
      `)
      .eq("order_id", orderId);

    // ✅ If dpId is provided, apply filter
    if (dpId) {
      query = query.eq("dp_id", dpId);
    }

    const { data, error } = await query.single();

    if (error) {
      console.error("Error fetching order by ID:", error.message);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (err) {
    console.error("Unexpected error in fetchOrderById:", err);
    return { success: false, error: err };
  }
};
