import { supabase } from "./Supabase";
import { fetchOrderById } from "./fetchOrderById";

export function subscribeToRealtimeOrders(dpId, getStatus, setOrders) {
  if (!dpId) {
    console.warn("⚠️ Realtime subscription skipped: No DP ID provided");
    return { unsubscribe: () => {} };
  }

  console.log("📡 Subscribing to realtime orders for DP:", dpId);

  // ✅ DP Channel (only for orders already assigned to this DP)
  const dpChannel = supabase.channel("realtime-orders-dp");

  dpChannel
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "orders", filter: `dp_id=eq.${dpId}` },
      async (payload) => {
        console.log("📡 [DP Channel] Event:", payload);

        const updatedOrder = payload.new;
        const deletedOrder = payload.old;
        const currentStatus = getStatus();

        console.log("🧭 Current Tab Status:", currentStatus);
        console.log("📦 Updated Order Status:", updatedOrder?.status);

        if (payload.eventType === "DELETE") {
          console.log("🗑️ [DP] Order deleted:", deletedOrder.order_id);
          setOrders((prev) => prev.filter((o) => o.order_id !== deletedOrder.order_id));
          return;
        }

        // Check if order matches current status tab
        const statusMismatch =
          (currentStatus === "Pick up" && !['pending', 'accepted', 'preparing', 'prepared'].includes(updatedOrder.status)) ||
          (currentStatus === "With You" && updatedOrder.status !== "on the way") ||
          (currentStatus === "Delivered" && updatedOrder.status !== "delivered");

        console.log("🔍 Status Mismatch:", statusMismatch);

        if (statusMismatch) {
          console.log("⛔ Order removed due to status mismatch:", updatedOrder.order_id);
          setOrders((prev) => prev.filter((o) => o.order_id !== updatedOrder.order_id));
          return;
        }

        console.log("🔄 Refetching full order:", updatedOrder.order_id);
        const { data: fullOrder, success } = await fetchOrderById(updatedOrder.order_id);
        if (!success || !fullOrder) {
          console.warn("⚠️ Failed to fetch full order details");
          return;
        }

        console.log("✅ Updating order in list:", fullOrder.order_id);
        setOrders((prev) => {
          const index = prev.findIndex((o) => o.order_id === fullOrder.order_id);
          if (index === -1) return [...prev, fullOrder]; // new addition
          const updated = [...prev];
          updated[index] = fullOrder; // just replace that row
          return updated;
        });
      }
    )
    .subscribe();

  // ✅ Broad Channel (for assigned/unassigned)
  const broadChannel = supabase.channel("realtime-orders-dp-broad");

  broadChannel
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "orders" },
      async (payload) => {
        const oldDp = payload.old?.dp_id;
        const newDp = payload.new?.dp_id;
        const deletedOrder = payload.old;
        const updatedOrder = payload.new;

        console.log("📡 [Broad Channel] Event:");
        console.log("   ▶️ oldDp:", oldDp);
        console.log("   ▶️ newDp:", newDp);

        if (payload.eventType === "DELETE") {
          if (deletedOrder.dp_id === dpId) {
            console.log("🗑️ [Broad] Order deleted for this DP:", deletedOrder.order_id);
            setOrders((prev) => prev.filter((o) => o.order_id !== deletedOrder.order_id));
          }
          return;
        }

        if (newDp === dpId) {
          console.log("🆕 [Broad] Order assigned to this DP:", updatedOrder.order_id);

          const { data: fullOrder, success } = await fetchOrderById(updatedOrder.order_id);
          if (!success || !fullOrder) return;

          setOrders((prev) => {
            const index = prev.findIndex((o) => o.order_id === fullOrder.order_id);
            if (index === -1) return [...prev, fullOrder];
            const updated = [...prev];
            updated[index] = fullOrder;
            return updated;
          });
        }

        if (oldDp === dpId && newDp !== dpId) {
          console.log("❌ [Broad] Order unassigned from this DP:", deletedOrder.order_id);
          setOrders((prev) => prev.filter((o) => o.order_id !== deletedOrder.order_id));
        }
      }
    )
    .subscribe();

  return {
    unsubscribe: () => {
      console.log("🧹 Unsubscribing from realtime updates");
      dpChannel.unsubscribe();
      broadChannel.unsubscribe();
    },
  };
}
