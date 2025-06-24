import { supabase } from "./Supabase";
export function subscribeToRealtimeOrders(dpId, statusFilter, setOrders) {
    const channel = supabase.channel('realtime-orders-dp');
  
    channel
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `dp_id=eq.${dpId}`,
        },
        async (payload) => {
          const updatedOrder = payload.new;
  
          const matchesFilter =
            (statusFilter === 'Pick up' &&
              ['accepted', 'preparing', 'prepared'].includes(updatedOrder.status)) ||
            (statusFilter === 'With You' && updatedOrder.status === 'on the way') ||
            (statusFilter === 'Delivered' && updatedOrder.status === 'delivered');
  
          if (!matchesFilter) return;
  
          // ✅ Just update matching order, don't overwrite whole array
          setOrders((prevOrders) => {
            const index = prevOrders.findIndex(o => o.order_id === updatedOrder.order_id);
            if (index === -1) return prevOrders;
  
            const updated = [...prevOrders];
            updated[index] = {
              ...updated[index],
              ...updatedOrder
            };
            return updated;
          });
        }
      )
      .subscribe();
  
    return channel;
  }
  