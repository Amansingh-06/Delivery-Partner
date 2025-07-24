import { supabase } from "./Supabase";
import { fetchOrderById } from "./fetchOrderById";

export function subscribeToRealtimeOrders(dpId, getStatus, setOrders) {
  if (!dpId) {
    console.warn("⚠️ Realtime subscription skipped: No DP ID provided");
    return { unsubscribe: () => {} };
  }

  console.log("📡 Subscribing to realtime orders for DP:", dpId);

  // ✅ DP Channel (only for events where dp_id already matched)
  const dpChannel = supabase.channel("realtime-orders-dp");

  dpChannel
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "orders", filter: `dp_id=eq.${dpId}` },
      async (payload) => {
        console.log("📡 [DP Channel] Event:", payload);

        if (payload.eventType === "DELETE") {
          const deletedOrder = payload.old;
          console.log("🗑️ [DP] Order deleted:", deletedOrder.order_id);

          setOrders((prev) => prev.filter((o) => o.order_id !== deletedOrder.order_id));
          return;
        }


const updatedOrder = payload.new;

// Optional: statusFilter check logic (you can customize this if needed)
const currentStatus = getStatus();

if (
  (currentStatus === "Pick up" && !['accepted', 'preparing', 'prepared'].includes(updatedOrder.status)) ||
  (currentStatus === "With You" && updatedOrder.status !== "on the way") ||
  (currentStatus === "Delivered" && updatedOrder.status !== "delivered")
) {
  // If order no longer matches filter, remove it
  setOrders((prev) => prev.filter((o) => o.order_id !== updatedOrder.order_id));
  return;
}

// ✅ Re-fetch full order details
const { data: fullOrder } = await fetchOrderById(updatedOrder.order_id);
if (!fullOrder) return;

setOrders((prev) => {
  const index = prev.findIndex((o) => o.order_id === fullOrder.order_id);
  if (index === -1) return [...prev, fullOrder];
  const updated = [...prev];
  updated[index] = { ...updated[index], ...fullOrder };
  return updated;
});

      }
    )
    .subscribe();

  // ✅ Broad Channel (watches all dp_id changes and deletions)
  const broadChannel = supabase.channel("realtime-orders-dp-broad");

  broadChannel
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "orders" },
      async (payload) => {
        const oldDp = payload.old?.dp_id;
        const newDp = payload.new?.dp_id;
        const updatedOrder = payload.new;

        console.log("📡 [Broad Channel] Event Received");
        console.log("   ▶️ oldDp:", oldDp);
        console.log("   ▶️ newDp:", newDp);
        console.log("   ▶️ this dpId:", dpId);

        if (payload.eventType === "DELETE") {
          const deletedOrder = payload.old;
          if (deletedOrder.dp_id === dpId) {
            console.log("🗑️ [Broad] Order deleted for this DP:", deletedOrder.order_id);
            setOrders((prev) => prev.filter((o) => o.order_id !== deletedOrder.order_id));
          }
          return;
        }

        // ✅ If this DP is newly assigned
        if (newDp === dpId) {
          console.log("🆕 [Broad] Order assigned to this DP");
          setOrders((prev) => {
            const index = prev.findIndex((o) => o.order_id === updatedOrder.order_id);
            if (index === -1) return [...prev, updatedOrder];
            const updated = [...prev];
            updated[index] = { ...updated[index], ...updatedOrder };
            return updated;
          });
        }

        // ✅ If this DP is unassigned
        if (oldDp === dpId && newDp !== dpId) {
          console.log("❌ [Broad] Order removed from this DP");
          setOrders((prev) =>
            prev.filter((o) => o.order_id !== payload.old.order_id)
          );
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
