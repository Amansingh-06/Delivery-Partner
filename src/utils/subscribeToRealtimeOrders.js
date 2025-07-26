import { supabase } from "./Supabase";
import { fetchOrderById } from "./fetchOrderById";

export function subscribeToRealtimeOrders(dpId, getStatus, setOrders) {
  if (!dpId) {
    console.warn("⚠️ Realtime subscription skipped: No DP ID provided");
    return { unsubscribe: () => {} };
  }

  console.log("📡 Subscribing to realtime orders for DP:", dpId);

  // ✅ Helper to upsert order in list
  const upsertOrder = (orders, newOrder) => {
    const index = orders.findIndex((o) => o.order_id === newOrder.order_id);
    if (index === -1) return [...orders, newOrder];
    const updated = [...orders];
    updated[index] = newOrder;
    return updated;
  };

  // ✅ DP Channel — handles updates/deletes for already assigned orders
  const dpChannel = supabase.channel("realtime-orders-dp");

  dpChannel
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "orders" },
      async (payload) => {
        const { eventType, new: updatedOrder, old: deletedOrder } = payload;

        const order = eventType === "DELETE" ? deletedOrder : updatedOrder;
        if (order?.dp_id !== dpId) return; // 🧠 Manual filter

        const currentStatus = getStatus();
        console.log("📡 [DP Channel] Event:", eventType, order?.order_id);
        console.log("🧭 Current Tab:", currentStatus);
        console.log("📦 Order Status:", order?.status);

        if (eventType === "DELETE") {
          console.log("🗑️ Order deleted:", order.order_id);
          setOrders((prev) => prev.filter((o) => o.order_id !== order.order_id));
          return;
        }

        // ✅ Status Mismatch check
        const statusMismatch =
          (currentStatus === "Pick up" && !['pending', 'accepted', 'preparing', 'prepared'].includes(updatedOrder.status)) ||
          (currentStatus === "With You" && updatedOrder.status !== "on the way") ||
          (currentStatus === "Delivered" && updatedOrder.status !== "delivered");

        if (statusMismatch) {
          console.log("⛔ Status mismatch, removing:", updatedOrder.order_id);
          setOrders((prev) => prev.filter((o) => o.order_id !== updatedOrder.order_id));
          return;
        }

        // ✅ Fetch full order and upsert
        console.log("🔄 Refetching order:", updatedOrder.order_id);
        const { data: fullOrder, success } = await fetchOrderById(updatedOrder.order_id);
        if (!success || !fullOrder) {
          console.warn("⚠️ Failed to fetch order:", updatedOrder.order_id);
          return;
        }

        console.log("✅ Order updated:", fullOrder.order_id);
        setOrders((prev) => upsertOrder(prev, fullOrder));
      }
    )
    .subscribe();

  // ✅ Broad Channel — handles assignment/unassignment of orders
  const broadChannel = supabase.channel("realtime-orders-dp-broad");

  broadChannel
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "orders" },
      async (payload) => {
        const { eventType, new: updatedOrder, old: deletedOrder } = payload;
        const oldDp = deletedOrder?.dp_id;
        const newDp = updatedOrder?.dp_id;

        console.log("📡 [Broad Channel] Event:", eventType);
        console.log("   ▶️ oldDp:", oldDp, "→ newDp:", newDp);

        // ❌ Unassignment
        if (eventType === "DELETE" || (oldDp === dpId && newDp !== dpId)) {
          console.log("❌ Order unassigned or deleted:", deletedOrder?.order_id);
          setOrders((prev) => prev.filter((o) => o.order_id !== deletedOrder.order_id));
          return;
        }

        // 🆕 Assignment to this DP
        if (newDp === dpId) {
          console.log("🆕 Order assigned to this DP:", updatedOrder.order_id);
          const { data: fullOrder, success } = await fetchOrderById(updatedOrder.order_id);
          if (!success || !fullOrder) return;
          setOrders((prev) => upsertOrder(prev, fullOrder));
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
