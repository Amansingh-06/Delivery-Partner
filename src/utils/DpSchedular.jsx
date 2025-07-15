import { useEffect, useRef } from "react";
import { supabase } from "../utils/Supabase";

const SmartDPScheduler = ({ dpId }) => {
  const intervalRef = useRef(null);

  const checkAndAssignDP = async () => {
    console.log("🕒 [Scheduler] Running at", new Date().toLocaleTimeString());

    if (!dpId) return console.log("⚠️ No DP ID provided.");

    // Step 1: DP Availability
    const { data: dpData, error: dpError } = await supabase
      .from("delivery_partner")
      .select("available")
      .eq("dp_id", dpId)
      .single();

    if (dpError || !dpData?.available) {
      console.log("🚫 DP not available.");
      return;
    }
    console.log("✅ DP is available");

    // Step 2: Active Order Check
    const { count: activeOrders } = await supabase
      .from("orders")
      .select("order_id", { count: "exact", head: true })
      .eq("dp_id", dpId)
      .in("status", ["accepted", "preparing", "picked", "on the way"]);

    if (activeOrders > 0) {
      console.log("⛔ DP has active orders.");
      return;
    }
    console.log("✅ No active orders");

    // Step 3: Check if DP was ever assigned
    const { count: assignedCount } = await supabase
      .from("orders")
      .select("order_id", { count: "exact", head: true })
      .eq("dp_id", dpId);

    if (assignedCount > 0) {
      // Step 3.a: Get last delivered order
      const { data: lastOrder } = await supabase
        .from("orders")
        .select("group_id, group_seq_no")
        .eq("dp_id", dpId)
        .eq("status", "delivered")
        .order("group_seq_no", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!lastOrder) {
        console.log("⛔ No delivered orders found for DP.");

        // Extra safety: check if any undelivered orders exist
        const { count: undeliveredCount } = await supabase
          .from("orders")
          .select("order_id", { count: "exact", head: true })
          .eq("dp_id", dpId)
          .not("status", "eq", "delivered");

        if (undeliveredCount > 0) {
          console.log("⚠️ DP has undelivered assigned orders.");
          return;
        }

        console.log("✅ No undelivered orders. Proceeding...");
      } else {
        // Step 4: Check if it's the last in its group
        const { count: totalInGroup } = await supabase
          .from("orders")
          .select("order_id", { count: "exact", head: true })
          .eq("group_id", lastOrder.group_id);

        if (parseInt(lastOrder.group_seq_no) !== totalInGroup) {
          console.log("⛔ Group not fully delivered.");
          return;
        }

        console.log("✅ Last order of group delivered.");
      }
    } else {
      console.log("🆕 DP never had an order. Proceeding...");
    }

    // Step 5: Check if there is any group that has dp_id IS NULL
    console.log("🔍 Looking for group where dp_id IS NULL...");

    const { data: groupData, error: groupErr } = await supabase
      .from("orders")
      .select("group_id")
      .is("dp_id", null)
      .neq("group_id", "NA")
      .limit(1)
      .maybeSingle();

    if (groupErr) {
      console.error("❌ Error while checking unassigned groups:", groupErr.message);
      return;
    }

    if (!groupData?.group_id) {
      console.log("ℹ️ No group found without DP.");
      return;
    }

    console.log("✅ Found group without DP:", groupData.group_id);

    // ✅ Step 6: Try increasing radius from 1500 → 5000
 let radius = 1500;
let assigned = false;

while (!assigned && radius <= 5000) {
  console.log(`📡 Trying RPC with radius: ${radius} meters...`);

  const { data: assignData, error: assignError } = await supabase.rpc("assign_group_to_dp_function", {
    p_dp_id: dpId,
    p_radius: radius,
  });

  if (assignError) {
    console.error("❌ Assignment failed:", assignError.message);
    break;
  }

  if (assignData?.length > 0) {
    console.log("🎉 Group assigned to DP:", assignData[0].group_id);
    assigned = true;

    // ✅ Just return from this function, don't stop the scheduler
    console.log("🛑 Group assigned. Skipping further assignment until delivery.");
    return; // ❗Sirf iss function se exit — scheduler chalega
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
