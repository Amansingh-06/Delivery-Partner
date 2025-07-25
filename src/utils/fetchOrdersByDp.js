import { supabase } from "./Supabase";

export const fetchOrdersByDP = async (dp_id, statusFilter, limit = 10, offset = 0) => {
  try {
    console.log("🔎 Fetching orders for DP:", dp_id, "with status:", statusFilter);

    // Special case: If statusFilter is 'Delivered', fetch using dp_id directly
    if (statusFilter === 'Delivered') {
      console.log("📦 Fetching Delivered orders directly using dp_id...");

      const { data, error } = await supabase
        .from('orders')
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
        .eq('dp_id', dp_id)
        .eq('status', 'delivered')
        .order('delivered_ts', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('❌ Error fetching delivered orders:', error.message);
        return { success: false, error };
      }

      console.log("✅ Delivered orders fetched:", data.length);
      return { success: true, data };
    }

    // Step 1: Get current_group_id of the DP
    console.log("📍 Getting current_group_id for DP:", dp_id);

    const { data: dpData, error: dpError } = await supabase
      .from('delivery_partner')
      .select('curr_group_id')
      .eq('dp_id', dp_id)
      .single();

    if (dpError) {
      console.error('❌ Error fetching current group ID:', dpError.message);
      return { success: false, error: dpError };
    }

    console.log("📍 current_group_id:", dpData?.curr_group_id);

    if (!dpData?.curr_group_id || dpData.curr_group_id === 'NA') {
      console.warn("⚠️ No current group assigned or group_id is 'NA'");
      return { success: true, data: [] };
    }

    const currentGroupId = dpData.curr_group_id;

    // Step 2: Fetch orders using current_group_id
    console.log("🛒 Fetching group orders for group_id:", currentGroupId, "with status:", statusFilter);

    let query = supabase
      .from('orders')
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
      .eq('group_id', currentGroupId)
      .order('group_seq_no', { ascending: true })
      .range(offset, offset + limit - 1);

    // Status Filters for group-based orders
    if (statusFilter === 'Pick up') {
      query = query.in('status', ['pending', 'accepted', 'preparing', 'prepared']);
      console.log("📦 Applied Pick up filter");
    } else if (statusFilter === 'With You') {
      query = query.eq('status', 'on the way');
      console.log("📦 Applied With You filter");
    }

    const { data, error } = await query;

    if (error) {
      console.error('❌ Error fetching orders:', error.message);
      return { success: false, error };
    }

    console.log(`✅ Orders fetched: ${data.length}`);
    return { success: true, data };
  } catch (err) {
    console.error('❌ Unexpected error:', err);
    return { success: false, error: err };
  }
};
