import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import {
  isWithinInterval,
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
} from "date-fns";
import Header from "./Header";
import BottomNav from "../components/Footer";

// Dummy orders (you can add more)
const dummyOrders = [
  {
    id: 1,
    status: "delivered",
    created_ts: "2025-06-26T10:00:00Z",
    transaction: { amount: 120 },
  },
  {
    id: 2,
    status: "rejected",
    created_ts: "2025-06-24T09:00:00Z",
    transaction: { amount: 60 },
  },
  {
    id: 3,
    status: "delivered",
    created_ts: "2025-06-20T08:00:00Z",
    transaction: { amount: 200 },
  },
  {
    id: 4,
    status: "delivered",
    created_ts: "2025-06-02T12:30:00Z",
    transaction: { amount: 300 },
  },
];

// Dummy reviews
const dummyRatings = Array.from({ length: 12 }, (_, i) => ({
  r_id: i + 1,
  rating_number: Math.floor(Math.random() * 5) + 1,
  user: {
    name: `User ${i + 1}`,
    dp_url: "https://via.placeholder.com/40",
  },
  order: {
    total_amount: Math.floor(Math.random() * 300) + 50,
    order_item: [
      { items: { item_name: "Item A" } },
      { items: { item_name: "Item B" } },
    ],
  },
}));

export default function Earnings() {
  const [ratings, setRatings] = useState([]);
  const [page, setPage] = useState(1);
  const LIMIT = 5;
  const [hasMore, setHasMore] = useState(true);

  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weekEnd = today;
  const monthStart = startOfMonth(today);
  const monthEnd = today;

  const [todayStats, setTodayStats] = useState({ total_orders: 0, total_amount: 0 });
  const [thisWeek, setThisWeek] = useState({ total_orders: 0, total_amount: 0 });
  const [thisMonth, setThisMonth] = useState({ total_orders: 0, total_amount: 0 });
  const [dateRange, setDateRange] = useState([new Date("2025-06-01"), new Date()]);
  const [selectedStats, setSelectedStats] = useState({ earnings: 0, orders: 0, rejected: { count: 0, amount: 0 } });
  const [showCalendar, setShowCalendar] = useState(false);

  // Simulate pagination
  useEffect(() => {
    const start = (page - 1) * LIMIT;
    const newRatings = dummyRatings.slice(start, start + LIMIT);
    setRatings((prev) => [...prev, ...newRatings]);
    if (newRatings.length < LIMIT) setHasMore(false);
  }, [page]);

  // Infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore) {
        setPage((prev) => prev + 1);
      }
    });
    const sentinel = document.getElementById("load-more-ratings-sentinel");
    if (sentinel) observer.observe(sentinel);
    return () => sentinel && observer.disconnect();
  }, [hasMore]);

  // Today / Week / Month stats
  useEffect(() => {
    let tOrders = 0, tAmount = 0, wOrders = 0, wAmount = 0, mOrders = 0, mAmount = 0;

    dummyOrders.forEach((order) => {
      const date = new Date(order.created_ts);
      const amount = order.transaction.amount;
      if (order.status === "delivered") {
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
      }
    });

    setTodayStats({ total_orders: tOrders, total_amount: tAmount });
    setThisWeek({ total_orders: wOrders, total_amount: wAmount });
    setThisMonth({ total_orders: mOrders, total_amount: mAmount });
  }, []);

  // Date range insights
  useEffect(() => {
    const [start, end] = dateRange;
    let earnings = 0, orders = 0, rejectedCount = 0, rejectedAmount = 0;

    dummyOrders.forEach((order) => {
      const date = new Date(order.created_ts);
      const amount = order.transaction.amount;
      if (date >= start && date <= end) {
        if (order.status === "delivered") {
          orders++;
          earnings += amount;
        } else if (order.status === "rejected") {
          rejectedCount++;
          rejectedAmount += amount;
        }
      }
    });

    setSelectedStats({
      earnings,
      orders,
      rejected: { count: rejectedCount, amount: rejectedAmount },
    });
  }, [dateRange]);

  return (
    <div className="min-h-screen bg-gray-100  max-w-2xl mx-auto space-y-6">
      {/* <h1 className="text-2xl font-bold text-center">Earnings</h1>
       */}
          {/* <Header title="Earning"/> */}
          <div className="p-4 flex flex-col gap-8 pt-25">
              
      {/* Delivered Orders */}
      <section className="bg-white p-6  rounded-xl shadow-lg">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Delivered Orders</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard label="Today" amount={todayStats.total_amount} count={todayStats.total_orders} dateText={format(today, "dd MMM yyyy")} />
          <StatCard label="This Week" amount={thisWeek.total_amount} count={thisWeek.total_orders} dateText={`${format(weekStart, "dd MMM")} - ${format(weekEnd, "dd MMM")}`} />
          <StatCard label="This Month" amount={thisMonth.total_amount} count={thisMonth.total_orders} dateText={`${format(monthStart, "dd MMM")} - ${format(monthEnd, "dd MMM")}`} />
        </div>
      </section>

      {/* Insights */}
      <section className="bg-white p-6  rounded-xl shadow-lg relative">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-700">Insights</h2>
          <div className="flex items-center gap-2">
            <p className="text-sm text-gray-500">
              {dateRange.map((d) => format(d, "dd MMM yyyy")).join(" - ")}
            </p>
            <button onClick={() => setShowCalendar(!showCalendar)}>📅</button>
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
          <InsightCard label="Rejected" value={`₹${selectedStats.rejected.amount} (${selectedStats.rejected.count} orders)`} />
        </div>
      </section>

      {/* Ratings */}
      <section className="bg-white p-6 rounded-xl shadow-lg mb-15">
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
              </section>
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
    <div className="text-center border rounded p-4 bg-gray-50">
      <p className="text-gray-600">{label}</p>
      <p className="text-xl font-bold">{value}</p>
    </div>
  );
}
