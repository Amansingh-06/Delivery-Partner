import { supabase } from "./Supabase";
import { fetchOrdersByDP } from "./fetchOrdersByDp"; // ✅ import your existing fetcher

export function subscribeToRealtimeOrders(dpId, setOrders) {
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
                // ✅ Re-fetch complete order with nested vendor, user, order_item etc.
                const result = await fetchOrdersByDP(dpId);
                if (result.success) {
                    setOrders(result.data);
                } else {
                    console.error("Failed to refetch updated orders", result.error);
                }
            }
        )
        .subscribe();

    return channel;
}
