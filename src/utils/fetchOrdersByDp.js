import { supabase } from './Supabase';

export const fetchOrdersByDP = async (dp_id, statusFilter) => {
  try {
    let data = [];

    // ✅ For Delivered: use `completed_order` table
    if (statusFilter === 'Delivered') {
      const { data: completedOrders, error: completedError } = await supabase
        .from('completed_orders')
        .select('*')
        .eq('dp_id', dp_id);

      if (completedError) throw completedError;

      const orderIds = completedOrders.map(order => order.order_id);
      const userIds = completedOrders.map(order => order.u_id);
      const vendorIds = completedOrders.map(order => order.v_id);
      const addressIds = completedOrders.map(order => order.addr_id);
      const transactionIds = completedOrders.map(order => order.t_id);

      // Fetch related tables
      const [{ data: itemsData }, { data: users }, { data: vendors }, { data: addresses }, { data: transactions }] = await Promise.all([
        supabase
          .from('order_item')
          .select(`
            *,
            items:item_id (
              *
            )
          `)
          .in('order_id', orderIds),

        supabase.from('user').select('*').in('u_id', userIds),
        supabase.from('vendor').select('*').in('v_id', vendorIds),
        supabase.from('address').select('*').in('addr_id', addressIds),
        supabase.from('transaction').select('*').in('t_id', transactionIds)
      ]);

      // Merge everything manually
      data = completedOrders.map(order => ({
        ...order,
        order_item: itemsData?.filter(i => i.order_id === order.order_id) || [],
        user: users?.find(u => u.u_id === order.u_id) || null,
        vendor: vendors?.find(v => v.v_id === order.v_id) || null,
        address: addresses?.find(a => a.addr_id === order.addr_id) || null,
        transaction: transactions?.find(t => t.t_id === order.t_id) || null
      }));
    }

    // ✅ For other statuses: use `orders` table with join
    else {
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

      if (statusFilter === 'Pick up') {
        query = query.in('status', ['preparing', 'prepared', 'accepted']);
      } else if (statusFilter === 'With You') {
        query = query.eq('status', 'on the way');
      }

      const { data: orderData, error } = await query;

      if (error) {
        console.error('Error fetching data:', error.message);
        return { success: false, error };
      }

      data = orderData;
    }

    return { success: true, data };
  } catch (err) {
    console.error('Unexpected error:', err);
    return { success: false, error: err };
  }
};
