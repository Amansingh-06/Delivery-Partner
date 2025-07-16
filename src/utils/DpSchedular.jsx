import { useEffect, useRef } from "react";
import { supabase } from "../utils/Supabase";

const SmartDPScheduler = ({ dpId }) => {
  const intervalRef = useRef(null);

  const checkAndAssignDP = async () => {
    console.log("🕒 [Scheduler] Running at", new Date().toLocaleTimeString());

    if (!dpId) return console.log("⚠️ No DP ID provided.");

    // ✅ Step 1: Check DP availability
    const { data: dpData, error: dpError } = await supabase
      .from("delivery_partner")
      .select("available, current_location")
      .eq("dp_id", dpId)
      .single();

    if (dpError || !dpData?.available) return console.log("🚫 DP not available.");
    if (!dpData?.current_location) return console.log("❌ No location");

    // ✅ Step 2: Check for active orders
    const { count: activeOrders } = await supabase
      .from("orders")
      .select("order_id", { count: "exact", head: true })
      .eq("dp_id", dpId)
      .in("status", ["accepted", "preparing", "picked", "on the way"]);

    if (activeOrders > 0) return console.log("⛔ DP has active orders");

    // ✅ Step 3: Check if DP previously assigned
    const { count: assignedCount } = await supabase
      .from("orders")
      .select("order_id", { count: "exact", head: true })
      .eq("dp_id", dpId);

    if (assignedCount > 0) {
      const { data: lastOrder } = await supabase
        .from("orders")
        .select("group_id, group_seq_no")
        .eq("dp_id", dpId)
        .eq("status", "delivered")
        .order("group_seq_no", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!lastOrder) {
        const { count: undeliveredCount } = await supabase
          .from("orders")
          .select("order_id", { count: "exact", head: true })
          .eq("dp_id", dpId)
          .not("status", "eq", "delivered");

        if (undeliveredCount > 0) return;
      } else {
        const { count: totalInGroup } = await supabase
          .from("orders")
          .select("order_id", { count: "exact", head: true })
          .eq("group_id", lastOrder.group_id);

        if (parseInt(lastOrder.group_seq_no) !== totalInGroup) return;
      }
    }

    // ✅ Step 4: Try assignment with increasing radius
    let radius = 1500;
    let assigned = false;

    while (!assigned && radius <= 5000) {
      console.log(`📡 Trying RPC with radius: ${radius} meters...`);

      const { data: assignData, error: assignError } = await supabase.rpc(
        "assign_group_to_dp",
        {
          p_dp_id: dpId,
          p_radius: radius,
        }
      );

      if (assignError) {
        console.error("❌ Assignment failed:", assignError.message);
        break;
      }

      if (assignData?.length > 0) {
        const groupId = assignData[0].group_id;
        console.log("🎉 Group assigned to DP:", groupId);
        assigned = true;

        // ✅ Step 5: Optional debug - Log updated orders
        const { data: assignedOrders, error: fetchError } = await supabase
          .from("orders")
          .select("order_id, dp_id, status")
          .eq("group_id", groupId);

        if (fetchError) {
          console.error("❌ Could not fetch assigned orders:", fetchError.message);
        } else {
          console.log("📦 Orders after assignment:", assignedOrders);
        }

        return;
      }

      radius += 1000;
    }

    if (!assigned) {
      console.log("🚫 No group assigned within 5km radius.");
    }
  };

  useEffect(() => {
    if (!dpId) return;

    console.log("🧠 [Scheduler] Started for DP:", dpId);
    checkAndAssignDP();

    intervalRef.current = setInterval(checkAndAssignDP, 30000);

    return () => {
      clearInterval(intervalRef.current);
      console.log("🧹 Scheduler stopped.");
    };
  }, [dpId]);

  return null;
};

export default SmartDPScheduler;
