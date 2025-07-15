import { useEffect, useRef } from "react";
import { supabase } from "../utils/Supabase";

// ✅ Distance Calculation Function (Haversine Formula)
function getDistanceInMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000; // meters
  const toRad = (value) => (value * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const SmartDPScheduler = ({ dpId }) => {
  const intervalRef = useRef(null);

  const checkAndAssignDP = async () => {
    console.log("🕒 [Scheduler] Running at", new Date().toLocaleTimeString());

    if (!dpId) return console.log("⚠️ No DP ID provided.");

    const { data: dpData, error: dpError } = await supabase
      .from("delivery_partner")
      .select("available, current_location")
      .eq("dp_id", dpId)
      .single();

    if (dpError || !dpData?.available) {
      console.log("🚫 DP not available.");
      return;
    }

    const dpCoords = dpData.current_location?.coordinates;
    if (!dpCoords) {
      console.log("⚠️ DP coordinates missing");
      return;
    }

    const { count: activeOrders } = await supabase
      .from("orders")
      .select("order_id", { count: "exact", head: true })
      .eq("dp_id", dpId)
      .in("status", ["accepted", "preparing", "picked", "on the way"]);

    if (activeOrders > 0) {
      console.log("⛔ DP has active orders.");
      return;
    }

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

        console.log("✅ No undelivered orders. Proceeding...");
      } else {
        const { count: totalInGroup } = await supabase
          .from("orders")
          .select("order_id", { count: "exact", head: true })
          .eq("group_id", lastOrder.group_id);

        if (parseInt(lastOrder.group_seq_no) !== totalInGroup) return;
      }
    }

    let radius = 1500;
    let assigned = false;

    while (!assigned && radius <= 5000) {
      console.log(`📡 Trying RPC with radius: ${radius} meters...`);

      const { data: assignData, error: assignError } = await supabase.rpc(
        "assign_group_to_dp_function",
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
        const groupId = assignData[0]?.group_id;

        // 🟡 Fetch vendor location of that group
        const { data: vendorData } = await supabase
          .from("orders")
          .select("v_id")
          .eq("group_id", groupId)
          .limit(1)
          .maybeSingle();

        if (!vendorData?.v_id) {
          console.log("⚠️ Vendor not found for group");
          break;
        }

        const { data: vendor } = await supabase
          .from("vendor_request")
          .select("location")
          .eq("v_id", vendorData.v_id)
          .maybeSingle();

        const vendorCoords = vendor?.location?.coordinates;
        if (!vendorCoords) {
          console.log("⚠️ Vendor coordinates missing");
          break;
        }

        const distance = getDistanceInMeters(
          vendorCoords[1],
          vendorCoords[0],
          dpCoords[1],
          dpCoords[0]
        );

        console.log("📏 Distance to vendor:", distance, "meters");

        if (distance <= 5000) {
          console.log("🎉 Group assigned to DP:", groupId);
          assigned = true;
          return;
        } else {
          console.log("❌ Skipping group. Too far from DP.");
        }
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
