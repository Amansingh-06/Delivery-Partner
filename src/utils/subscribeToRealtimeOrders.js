import { supabase } from "./Supabase";
import { fetchOrdersByDP } from "./fetchOrdersByDp";

// Now accepting `status` filter as well
export function subscribeToRealtimeOrders(dpId, status, setOrders) {
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
            async () => {
                // ✅ Pass dpId and status filter
                const result = await fetchOrdersByDP(dpId, status);
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
