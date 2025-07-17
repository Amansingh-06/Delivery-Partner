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
import { fetchDpRatings } from "../utils/fetchDPrating";
import { fetchDpRatingStats } from "../utils/dpRatingStats";

export default function Earnings() {
  const [orders, setOrders] = useState([]);
  const [dateRange, setDateRange] = useState([new Date("2025-04-01"), new Date()]);
  const [todayStats, setTodayStats] = useState({ total_orders: 0, total_amount: 0 });
  const [thisWeek, setThisWeek] = useState({ total_orders: 0, total_amount: 0 });
  const [thisMonth, setThisMonth] = useState({ total_orders: 0, total_amount: 0 });
  const [selectedStats, setSelectedStats] = useState({ earnings: 0, orders: 0 });
  const [showCalendar, setShowCalendar] = useState(false);
  const { dpProfile } = useAuth(); // 👈 Get delivery partner profile from context
    const [ratings, setRatings] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [ratingStats, setRatingStats] = useState({
    averageRating: 0,
    totalCustomers: 0,
  });
  const LIMIT = 5;

  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weekEnd = today;
  const monthStart = startOfMonth(today);
  const monthEnd = today;

const dpId = dpProfile?.dp_id; // 👈 Replace with actual delivery partner ID

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


  //rating
console.log("dpId",dpId,dpProfile?.status)
    useEffect(() => {
    if (dpId && dpProfile?.status === "verified") {
      // Reset on vendor change
      setRatings([]);
      setPage(1);
      setHasMore(true);
    }
  }, [dpId, dpProfile?.status]);

  useEffect(() => {
    if (dpId && dpProfile?.status === "verified") {
      loadMoreRatings();
    }
  }, [page, dpId,dpProfile?.status]);

const loadMoreRatings = async () => {
  
  const { success, data } = await fetchDpRatings(dpId, page, LIMIT);
  console.log("🚀 fetchDpRatings response:", { success, data });

  if (success && Array.isArray(data)) {
    // ✅ Remove duplicate reviews using r_id
    setRatings((prev) => {
      const newIds = new Set(prev.map((r) => r.r_id));
      const filtered = data.filter((r) => !newIds.has(r.r_id));
      return [...prev, ...filtered];
    });

    if (data.length < LIMIT) {
      setHasMore(false);
    }
  }
};


  // console.log(ratings," ratings");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 1 }
    );

    const sentinel = document.getElementById("load-more-ratings-sentinel");
    if (sentinel) observer.observe(sentinel);

    return () => {
      if (sentinel) observer.disconnect();
    };
  }, [ratings, hasMore]);

   useEffect(() => {
    if (dpId && dpProfile?.status === "verified") {
      const getRatingStats = async () => {
        const { success, averageRating, totalCustomers } =
          await fetchDpRatingStats(dpId);
        if (success) {
          setRatingStats({ averageRating, totalCustomers });
        }
      };
  
      getRatingStats();
    }
  }, [dpId, dpProfile?.status]);

  console.log("rating", ratings);

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

                        {/* Ratings & Reviews */}
              <section className="bg-white rounded-lg shadow p-4 md:p-4  -mt-10 mb-10">
  <h2 className="text-md md:text-2xl lg:text-2xl font-medium text-gray uppercase mb-4">
    Ratings & Reviews
                    </h2>
                    <div className="my-4 p-4 bg-white rounded-lg shadow">
                    <p>
  Your store is rated ⭐ {ratingStats.averageRating} by {ratingStats.totalCustomers} customer
  {ratingStats.totalCustomers !== 1 ? "s" : ""}
                    </p>
                    {console.log("ratingStats",ratingStats)}

                    </div>

  {ratings.length === 0 ? (
    <p className="text-gray-500 text-sm">No ratings yet.</p>
  ) : (
    <div className="space-y-4">
      {ratings.map((rating) => (
        <div
          key={rating?.id}
          className="border-orange-200 shadow-all border-1 p-4 rounded-lg bg-gray-50 space-y-1"
        >
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <img
                src={
                  !rating.user?.dp_url || rating.user?.dp_url === "NA"
                    ? "/defaultuserImage.jpg"
                    : rating.user.dp_url
                }
                className="w-10 h-10 rounded-full"
                alt="User DP"
              />
              <div>
                <h3 className="font-semibold text-gray-800">
                  {console.log('rating', rating)}
                  {rating?.user?.name}
                </h3>


            </div>
            </div>
          </div>

       

          <div className="flex justify-between items-center text-sm mt-1">
          <div className="text-yellow-500 leading-tight flex items-center gap-1">
  {/* Filled stars */}
  {"⭐".repeat(rating?.rating).split("").map((star, i) => (
    <span key={`filled-${i}`} className="text-base">
      {star}
    </span>
  ))}

  {/* Unfilled stars with bigger size */}
  {"☆".repeat(5 - rating?.rating).split("").map((star, i) => (
    <span key={`unfilled-${i}`} className="text-xl text-yellow-400">
      {star}
    </span>
  ))}

  {/* Rating text */}
  <span className="ml-1 text-sm text-black">({rating?.rating}.0)</span>
</div>
            

            
          </div>
 











        </div>
      ))}

      {/* 👇 Infinite scroll sentinel 👇 */}
      {hasMore && (
        <div
          id="load-more-ratings-sentinel"
          className="h-10 w-full text-center text-gray-400"
        >
          Loading more...
        </div>
      )}
    </div>
  )}
</section>
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
