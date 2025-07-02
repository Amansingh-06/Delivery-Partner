import React, { useState, useEffect } from "react";
import { BsCalendarDate } from "react-icons/bs";

import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { useAuth } from "../Context/authContext";
import {
  isWithinInterval,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  format
} from "date-fns";
import Header from "./Header";
import BottomNav from "../components/Footer";
import { supabase } from "../utils/Supabase"; // 👈 import your Supabase client
import { subscribeToRealtimeOrders } from "../utils/subscribeToRealtimeOrders"; // 👈 import your realtime util

export default function Earnings() {
  const [orders, setOrders] = useState([]);
  const [dateRange, setDateRange] = useState([new Date("2025-04-01"), new Date()]);
  const [todayStats, setTodayStats] = useState({ total_orders: 0, total_amount: 0 });
  const [thisWeek, setThisWeek] = useState({ total_orders: 0, total_amount: 0 });
  const [thisMonth, setThisMonth] = useState({ total_orders: 0, total_amount: 0 });
  const [selectedStats, setSelectedStats] = useState({ earnings: 0, orders: 0 });
  const [showCalendar, setShowCalendar] = useState(false);
  const { dpProfile } = useAuth(); // 👈 Get delivery partner profile from context

  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weekEnd = today;
  const monthStart = startOfMonth(today);
  const monthEnd = today;

const dpId = '43c6aeba-34e0-4ad7-9caf-9eb661b2e043'; // 👈 Replace with actual delivery partner ID

  // 🔄 Fetch orders on mount
  useEffect(() => {
    const fetchDeliveredOrders = async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("order_id, created_ts, delivery_fee, status, dp_id")
        .eq("status", "delivered")
        .eq("dp_id", dpId);

      if (error) {
        console.error("Error fetching orders:", error.message);
        return;
      }

      setOrders(data || []);
    };

    fetchDeliveredOrders();
  }, [dpId]);

  // 🔄 Subscribe to real-time changes
  useEffect(() => {
    const channel = subscribeToRealtimeOrders(dpId, "Delivered", setOrders);

    return () => {
      supabase.removeChannel(channel); // ✅ Clean up
    };
  }, [dpId]);

  // 📊 Today, Week, Month stats
  useEffect(() => {
    let tOrders = 0, tAmount = 0, wOrders = 0, wAmount = 0, mOrders = 0, mAmount = 0;

    orders.forEach((order) => {
      const date = new Date(order.created_ts);
      const amount = order?.delivery_fee || 0;
console.log("Order Date:", date, "Amount:", amount);
      if (date.toDateString() === today.toDateString()) {
        tOrders++;
        tAmount += amount;
      }
      if (isWithinInterval(date, { start: weekStart, end: weekEnd })) {
        wOrders++;
        wAmount += amount;
      }
      if (isWithinInterval(date, { start: monthStart, end: monthEnd })) {
        mOrders++;
        mAmount += amount;
      }
    });

    setTodayStats({ total_orders: tOrders, total_amount: tAmount });
    setThisWeek({ total_orders: wOrders, total_amount: wAmount });
    setThisMonth({ total_orders: mOrders, total_amount: mAmount });
  }, [orders]);

  // 📊 Stats for selected date range
  useEffect(() => {
    const [start, end] = dateRange;
    let earnings = 0, ordersCount = 0;

    orders.forEach((order) => {
      const date = new Date(order.created_ts);
      const amount = order.delivery_fee || 0;
      if (date >= start && date <= end) {
        earnings += amount;
        ordersCount++;
      }
    });

    setSelectedStats({ earnings, orders: ordersCount });
  }, [orders, dateRange]);

  return (
    <div className="min-h-[89.5vh]   max-w-2xl mx-auto space-y-6">
      {/* <h1 className="text-2xl font-bold text-center">Earnings</h1>
       */}
          {/* <Header title="Earning"/> */}
      <div className="p-2 bg-gray-100  flex min-h-[86vh] shadow-lg h-full flex-col gap-6 pt-17">
      {dpProfile?.status === "blocked" ? (
  <div className="bg-red-50 border border-red-300 text-red-800 p-4  rounded-md">
    <h2 className="font-semibold text-lg text-center mb-2">
      Account Blocked
    </h2>
    <p>Your account has been blocked. Please contact support for assistance.</p>
  </div>
) : dpProfile?.status !== 'verified' ? (
  <div className="bg-yellow-50 border border-yellow-300 text-yellow-800 p-4 rounded-md mt-20">
    <h2 className="font-semibold text-lg text-center mb-2">
      Account Status
    </h2>

    <p className="mb-2">
      <strong>Status:</strong>{" "}
      {dpProfile?.status === "not_verified"
        ? "Not Verified"
        : dpProfile?.status}
          </p>
          <p>Your account verification is under process. Please wait.</p>

  
          {/* {vendorProfile?.request_status === "NA" ? (
              ) : (
                <p>
                  <strong>Rejected:</strong> {vendorProfile?.request_status}
                </p>
              )} */}
        </div>) : (
          <>
                      
            {/* Delivered Orders */}
            <section className="bg-white p-4   rounded-xl shadow-lg">
              <h2 className="text-md md:text-2xl lg:text-2xl font-medium text-gray uppercase mb-4">Delivered Orders</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard label="Today" amount={todayStats.total_amount} count={todayStats.total_orders} dateText={format(today, "dd MMM yyyy")} />
                <StatCard label="This Week" amount={thisWeek.total_amount} count={thisWeek.total_orders} dateText={`${format(weekStart, "dd MMM")} - ${format(weekEnd, "dd MMM")}`} />
                <StatCard label="This Month" amount={thisMonth.total_amount} count={thisMonth.total_orders} dateText={`${format(monthStart, "dd MMM")} - ${format(monthEnd, "dd MMM")}`} />
              </div>
            </section>

            {/* Insights */}
            <section className="bg-white p-4 mb-10  rounded-xl shadow-lg relative">
              <div className="flex justify-between items-center mb-4">
                <div className="flex  flex-col md:flex-row md:justify-between  w-full">
                  <h2 className="text-md md:text-2xl lg:text-2xl font-medium text-gray uppercase">Insights</h2>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-gray-500">
                      {dateRange.map((d) => format(d, "dd MMM yyyy")).join(" - ")}
                    </p>
                    <button onClick={() => setShowCalendar(!showCalendar)}><BsCalendarDate/></button>
                  </div>
                </div>
              </div>
              {showCalendar && (
                <div className="absolute right-0 z-50 bg-white shadow-lg p-3 rounded">
                  <Calendar selectRange onChange={setDateRange} value={dateRange} />
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <InsightCard label="Earnings" value={`₹${selectedStats.earnings}`} />
                <InsightCard label="Orders" value={selectedStats.orders} />
                <InsightCard label="Rejected" value={`₹$0 (0 orders)`} />
              </div>
            </section>

            {/* Ratings */}
            {/* <section className="bg-white p-6 rounded-xl shadow-lg mb-15">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Ratings & Reviews</h2>
        {ratings.length === 0 ? (
          <p className="text-gray-500 text-sm">No ratings yet.</p>
        ) : (
          <>
            {ratings.map((rating) => (
              <div key={rating.r_id} className="p-4 border rounded bg-gray-50 mb-2">
                <div className="flex items-center gap-3">
                  <img src={rating.user.dp_url} className="w-10 h-10 rounded-full" />
                  <p className="font-semibold">{rating.user.name}</p>
                </div>
                <p className="text-sm text-gray-600 mt-2">Items: {rating.order.order_item.map((oi) => oi.items.item_name).join(", ")}</p>
                <div className="flex justify-between text-sm mt-2">
                  <span className="text-yellow-600">
                    {"⭐".repeat(rating.rating_number)}{"☆".repeat(5 - rating.rating_number)} ({rating.rating_number}.0)
                  </span>
                  <span className="text-green-600 font-semibold">₹{rating.order.total_amount}</span>
                </div>
              </div>
            ))}
            {hasMore && (
              <div id="load-more-ratings-sentinel" className="text-center text-gray-400 mt-4">
                Loading more...
              </div>
            )}
          </>
        )}
              </section> */}
          </>
        )
        }
      
              <BottomNav/>
</div>
    </div>
  );
}

function StatCard({ label, amount, count, dateText }) {
  return (
    <div className="bg-orange-50 p-4 border border-orange-200 rounded-lg">
      <p className="text-sm text-gray-500">{label}: {dateText}</p>
      <p className="text-xl font-bold text-orange-600">₹{amount}</p>
      <p className="text-sm text-gray-500">{count} orders</p>
    </div>
  );
}

function InsightCard({ label, value }) {
  return (
    <div className=" border-orange-200 border rounded-lg p-4 bg-orange-50">
      <p className="text-gray-600">{label}</p>
      <p className="text-xl text-orange-600 font-bold">{value}</p>
    </div>
  );
}
