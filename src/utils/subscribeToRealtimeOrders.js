import { supabase } from "./Supabase";

export function subscribeToRealtimeOrders(dpId, getStatus, setOrders) {
  const channel = supabase.channel("realtime-orders-dp");

  channel
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "orders",
        filter: `dp_id=eq.${dpId}`,
      },
      async (payload) => {
        const updatedOrder = payload.new;
        const statusFilter = getStatus(); // ✅ dynamically get current tab

        const matchesFilter =
          (statusFilter === "Pick up" &&
            ["accepted", "preparing", "prepared"].includes(updatedOrder.status)) ||
          (statusFilter === "With You" && updatedOrder.status === "on the way") ||
          (statusFilter === "Delivered" && updatedOrder.status === "delivered");

        if (!matchesFilter) {
          // ❌ Remove from list if no longer matches
          setOrders((prevOrders) =>
            prevOrders.filter((o) => o.order_id !== updatedOrder.order_id)
          );
          return;
        }

        // ✅ Update or insert order into list
        setOrders((prevOrders) => {
          const index = prevOrders.findIndex(
            (o) => o.order_id === updatedOrder.order_id
          );

          if (index === -1) {
            return [...prevOrders, updatedOrder];
          }

          const updated = [...prevOrders];
          updated[index] = {
            ...updated[index],
            ...updatedOrder,
          };
          return updated;
        });
      }
    )
    .subscribe();

  return channel;
}
