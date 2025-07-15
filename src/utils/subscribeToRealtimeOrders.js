import { supabase } from "./Supabase";

export function subscribeToRealtimeOrders(dpId, getStatus, setOrders) {
  // ✅ Channel: updates where dp_id matches
  const dpChannel = supabase.channel("realtime-orders-dp");

  dpChannel
    .on(
      "postgres_changes",
      {
        event: "*", // ✅ Covers INSERT / UPDATE / DELETE
        schema: "public",
        table: "orders",
        filter: `dp_id=eq.${dpId}`,
      },
      async (payload) => {
        console.log("📡 [DP Channel] Event Received:", payload);

        const updatedOrder = payload.new;
        const statusFilter = getStatus();

        const matchesFilter =
          (statusFilter === "Pick up" &&
            ["accepted", "preparing", "prepared"].includes(updatedOrder.status)) ||
          (statusFilter === "With You" && updatedOrder.status === "on the way") ||
          (statusFilter === "Delivered" && updatedOrder.status === "delivered");

        if (!matchesFilter) {
          console.log("❌ [DP Channel] Doesn't match filter");
          setOrders((prev) =>
            prev.filter((o) => o.order_id !== updatedOrder.order_id)
          );
          return;
        }

        console.log("✅ [DP Channel] Updating order");
        setOrders((prev) => {
          const index = prev.findIndex(
            (o) => o.order_id === updatedOrder.order_id
          );
          if (index === -1) return [...prev, updatedOrder];

          const updated = [...prev];
          updated[index] = { ...updated[index], ...updatedOrder };
          return updated;
        });
      }
    )
    .subscribe();

  // ✅ Broad Channel: newly assigned to this DP
  const broadChannel = supabase.channel("realtime-orders-dp-broad");

  broadChannel
    .on(
      "postgres_changes",
      {
        event: "*", // ✅ ALL events
        schema: "public",
        table: "orders",
      },
      async (payload) => {
        console.log("📡 [Broad Channel] Event:", payload);

        const oldDp = payload.old?.dp_id;
        const newDp = payload.new?.dp_id;

        if (oldDp === null && newDp === dpId) {
          const updatedOrder = payload.new;
          const statusFilter = getStatus();

          const matchesFilter =
            (statusFilter === "Pick up" &&
              ["accepted", "preparing", "prepared"].includes(updatedOrder.status)) ||
            (statusFilter === "With You" && updatedOrder.status === "on the way") ||
            (statusFilter === "Delivered" && updatedOrder.status === "delivered");

          if (!matchesFilter) return;

          console.log("🆕 [Broad Channel] Newly assigned to this DP");

          setOrders((prev) => {
            const index = prev.findIndex(
              (o) => o.order_id === updatedOrder.order_id
            );
            if (index === -1) return [...prev, updatedOrder];

            const updated = [...prev];
            updated[index] = { ...updated[index], ...updatedOrder };
            return updated;
          });
        }
      }
    )
    .subscribe();

  return {
    unsubscribe: () => {
      console.log("🧹 Unsubscribing realtime...");
      dpChannel.unsubscribe();
      broadChannel.unsubscribe();
    },
  };
}
