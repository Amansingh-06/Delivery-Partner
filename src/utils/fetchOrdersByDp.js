import { supabase } from './Supabase';

export const fetchOrdersByDP = async (dp_id, statusFilter) => {
  try {
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
      .eq('dp_id', dp_id);

    // Apply status filters based on tab
    if (statusFilter === 'Pick up') {
      query = query.in('status', ['accepted', 'preparing', 'prepared']);
    } else if (statusFilter === 'With You') {
      query = query.eq('status', 'on the way');
    } else if (statusFilter === 'Delivered') {
      query = query.eq('status', 'delivered');
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching orders:', error.message);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (err) {
    console.error('Unexpected error:', err);
    return { success: false, error: err };
  }
};
