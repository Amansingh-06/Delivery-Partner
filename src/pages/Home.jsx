import React, { useState, useEffect,useRef,useCallback } from 'react';
import { Switch } from "@headlessui/react";
import { FaDirections, FaBoxOpen, FaUser, FaCheckCircle } from "react-icons/fa";
import SmartDPScheduler from '../utils/DpSchedular';
import BottomNav from '../components/Footer';
import { MdLocationPin } from "react-icons/md";
import { FaPhone } from "react-icons/fa6";
import Header from './Header';
import { fetchOrdersByDP } from '../utils/fetchOrdersByDp';
import { subscribeToRealtimeOrders } from '../utils/subscribeToRealtimeOrders';
import { useAuth } from '../Context/authContext';
import { supabase } from '../utils/Supabase';
import { toast } from 'react-hot-toast';
import { updateOrderStatus } from '../utils/updateOrderStauts';
import { truncateLetters } from '../constant/constants';
import { MdOutlinePendingActions } from "react-icons/md";
import { FaStore } from "react-icons/fa6";
import { FaRegAddressCard } from "react-icons/fa";
import { BsCardList } from "react-icons/bs";
import { HiOutlineClipboardList } from "react-icons/hi";
import { FaClock } from 'react-icons/fa';

export default function DPHomePage() {
  const { dpProfile, session } = useAuth();
  // const dpId = "43c6aeba-34e0-4ad7-9caf-9eb661b2e043"; // fallback
  const LIMIT = 5;
  
  const [showOtpSubmit, setShowOtpSubmit] = useState(false);
  const [isOnline, setIsOnline] = useState(null);
  const [status, setStatus] = useState("Pick up");
  const [orders, setOrders] = useState([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [loadmore, setLoadMore] = useState(false);
  const [otp, setOtp] = useState('')
  const [submittingOtp, setSubmittingOtp] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null);
  const {selectedDpId} = useAuth()
  const DpId = dpProfile?.dp_id || selectedDpId; // ✅ fallback

  
    const observer = useRef();
  

  
    // ✅ Get availability status
    useEffect(() => {
      const fetchAvailability = async () => {
        if (!DpId || !session?.user?.id) return; // ✅ fix here
        const { data, error } = await supabase
          .from("delivery_partner")
          .select("available")
          .eq("dp_id", DpId)
          .single();
  
        if (error) {
          console.error("Error fetching availability:", error.message);
          toast.error("Unable to load availability");
          setIsOnline(false);
        } else {
          setIsOnline(data?.available ?? false);
        }
      };
  
      console.log("🔄 Fetching availability...");
      fetchAvailability();
    }, [DpId]);
  
    // ✅ Toggle Online/Offline
  const handleToggleOnline = async (value) => {

      setIsOnline(value);
      const { error } = await supabase
        .from("delivery_partner")
        .update({ available: value })
        .eq("dp_id", DpId);
  
      if (error) {
        toast.error("Could not update status");
        setIsOnline(!value);
      } else {
        toast.success(`You are now ${value ? "Online" : "Offline"}`);
      }
    };
  
    // ✅ Fetch Orders with Pagination
    const fetchOrders = useCallback(
      async (reset = false) => {
        if (!DpId || isLoading) {
          console.log("⏸ Skipping fetchOrders. dpId:", DpId, "isLoading:", isLoading);
          return;
        }
  
        const currentOffset = reset ? 0 : offset;
  
        if (reset) {
          setOrders([]);
          setOffset(0);
          setHasMore(true);
        }
  
        console.log(`📦 Fetching orders... Reset: ${reset} Offset: ${currentOffset}`);
        if (!reset) setLoadMore(true);
  
        setIsLoading(true);
        const result = await fetchOrdersByDP(DpId, status, LIMIT, currentOffset);
  
        if (result.success) {
          console.log("✅ Orders fetched:", result.data.length);
          if (reset) {
            setOrders(result.data);
            setOffset(LIMIT);
          } else {
            setOrders((prev) => [...prev, ...result.data]);
            setOffset((prev) => prev + LIMIT);
          }
          setHasMore(result.data.length === LIMIT);
        } else {
          toast.error("Failed to fetch orders");
          console.error("❌ Fetch failed:", result.error);
        }
  
        setIsLoading(false);
        setLoadMore(false);
      },
      [DpId, status, offset, isLoading]
    );
  
    // ✅ Fetch Orders on Status Change
    useEffect(() => {
      console.log("🧹 Resetting orders for status:", status);
      fetchOrders(true);
    }, [status, DpId]);

    // ✅ Infinite Scroll
    const lastOrderRef = useCallback(
      (node) => {
        if (loadmore || !hasMore) return;
        if (observer.current) observer.current.disconnect();
  
        observer.current = new IntersectionObserver((entries) => {
          if (entries[0].isIntersecting) {
            console.log("📌 Last order visible, fetching more...");
            fetchOrders(false);
          }
        });
  
        if (node) observer.current.observe(node);
      },
      [isLoading, hasMore, fetchOrders]
    );
  
    // ✅ Realtime Updates
 useEffect(() => {
  console.log("📡 Subscribing to realtime updates...");
  
  const subscription = subscribeToRealtimeOrders(DpId, () => status, setOrders);

  return () => {
    console.log("🧹 Unsubscribing from realtime...");
    subscription.unsubscribe(); // ✅ Now correctly unsubscribes both channels
  };
}, [DpId, status]);


    console.log("📋 Current Orders:", orders.length);


    const DEFAULT_PHOTO = "./defaultuserImage.jpg";

    return (
      <div className="mx-auto    text-gray-800 ">
        <SmartDPScheduler dpId={DpId} /> 
            <div className='max-w-2xl  mx-auto p-2  min-h-[85vh]   shadow-lg'>
                {/* <Header title='Order' /> */}
{dpProfile?.status === "blocked" ? (
  <div className="bg-red-50 border border-red-300 text-red-800 p-4 mt-10 rounded-md">
    <h2 className="font-semibold text-lg text-center mb-2">
      Account Blocked
    </h2>
    <p>Your account has been blocked. Please contact support for assistance.</p>
  </div>
) : dpProfile?.status !== 'verified' ? (
  <div className="bg-yellow-50 border border-yellow-300 text-yellow-800 p-4 rounded-md mt-12">
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
                <div className='max-w-2xl  mx-auto md:p-6   md:mt-5 py-10 min-h-[85vh]   '>
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-4 ">
                            <img src={dpProfile?.photo_url || DEFAULT_PHOTO} alt="Profile" className="w-14 h-14 rounded-full shadow-md" />
                            <div>
                                <h2 className="md:text-2xl text-lg text-gray-800 font-bold">Hi, {dpProfile?.name}</h2>
                                <p className="text-sm text-gray-600">
                                    {isOnline === null ? "Loading..." : isOnline ? "Online" : "Offline"}
                                </p>
                            </div>
                        </div>

                        <Switch
                            checked={!!isOnline}
                            onChange={handleToggleOnline}
                            className={`${isOnline ? 'bg-green-500' : 'bg-gray-300'
                                } relative inline-flex h-7 w-14 items-center rounded-full transition-colors`}
                        >
                            <span className="sr-only">Toggle Online</span>
                            <span
                                className={`${isOnline ? 'translate-x-8' : 'translate-x-1'
                                    } inline-block h-5 w-5 transform rounded-full bg-white shadow transition`}
                            />
                        </Switch>
                    </div>

                    {/* Status Tabs */}
                    <div className="flex justify-between mb-5 gap-2">
                        {['Pick up', 'With You', 'Delivered'].map((tab) => (
                            <button
                                key={tab}
                                className={`flex-1 md:px-4 px-2 md:py-2 py-1 rounded-full text-sm font-semibold border transition ${status === tab ? 'bg-blue-600 text-white border-blue-600' : 'text-gray-600 border-gray-300 hover:bg-gray-100'}`}
                                onClick={() => setStatus(tab)}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    {/* Order Cards */}
                    {orders.length === 0 && isLoading ? (
  <div className="flex flex-col justify-center items-center py-10">
    <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    <p className="text-gray-500 mt-4 text-sm">Loading orders...</p>
  </div>
) 

                      : orders?.length > 0 ? (
                        orders.map((order, index) => {
                            const isLast = index === orders.length - 1;
                          return (
                              <>
                              <div
                                key={order.order_id}
                                ref={isLast ? lastOrderRef : null}
                              className="bg-white w-full rounded-xl md:p-6 p-2 shadow-md border-gray-300 mb-5 border"
                            >
                              {/* OTP + Directions button (Only if not delivered) */}
                              {order?.status?.toLowerCase() !== "delivered" && (
                                <div className="flex flex-col">
                                  <div className="space-y-2">
                                    <p><span className="font-semibold flex items-center gap-1"> <BsCardList /> Order ID:<span className="text-gray-600 text-sm">{order?.user_order_id}</span> </span></p>
                                    <p><span className="font-medium flex items-center  gap-1"><MdOutlinePendingActions /> Status: <span className="text-blue-600 font-medium">{order?.status}</span></span> </p>
                                    <p><span className="font-medium flex items-center gap-1"><FaStore /> Vendor: <span className="text-gray-600 text-sm">{truncateLetters(order?.vendor?.shop_name, 20)}</span></span> </p>
                                    <p className="flex items-start gap-1">
                          <FaRegAddressCard className="mt-[3.5px] shrink-0" />
                          <span className="font-medium">
                            Vendor Add.: <span className="text-gray-600 text-sm">{order?.vendor?.street} {order?.vendor?.city}</span>
                          </span>
                        </p>
                                  </div>
                        
                                  <div className='flex justify-between items-center w-full mt-2'>
                                    {order?.status?.toLowerCase() !== "on the way" && (
                                      <p className="text-lg font-medium">
                                        OTP: <span className="text-blue-600 font-bold">{order?.dp_otp || "N/A"}</span>
                                      </p>
                                    )}
                        
                                    <button
                                      className="flex items-center text-white gap-1 font-medium bg-orange hover:bg-orange p-1 rounded-md transition"
                                      onClick={() => {
                                        const goingToCustomer = order?.status?.toLowerCase() === "on the way";
                                        const lat = goingToCustomer ? order?.user_lat : order?.vendor_lat;
                                        const long = goingToCustomer ? order?.user_long : order?.vendor_long;
                                        window.open(
                                          `https://www.google.com/maps/dir/?api=1&destination=${lat},${long}`,
                                          '_blank'
                                        );
                                      }}
                                    >
                                      <FaDirections />
                                      {order?.status?.toLowerCase() === "on the way" ? "Go to Customer" : "Go to Vendor"}
                                    </button>
                                  </div>
                                </div>
                              )}
                        
                              {/* Content Section */}
                              <div className="mt-3">
                                <div className='gap-2'>
                                  {order?.status?.toLowerCase() === "on the way" && order?.user && (
                                    <div className="mt-2">
                                      <h3 className="font-semibold text-gray-700 mb-1">Items</h3>
                                      <p className="text-sm text-gray-700">
                                        {order?.order_item?.map((item, index) => (
                                          <span key={item.order_item_id}>
                                            {item?.quantity} x {item?.items?.item_name}
                                            {index !== order?.order_item?.length - 1 && ', '}
                                          </span>
                                        ))}
                                      </p>
                        
                                      <h3 className="font-semibold text-gray-700 mb-1 mt-4">Customer Details</h3>
                                      <p className="flex items-center gap-2"><FaUser /> {order?.user?.name}</p>
                                      <p className="flex items-center gap-2"><MdLocationPin />{order?.address?.h_no}, {order?.address?.landmark}</p>
                                      <p className="flex items-center gap-2"><FaPhone /> {order?.user?.mobile_number}</p>
                                    </div>
                                  )}
                        
                                  {order?.status?.toLowerCase() === "delivered" && (
                                    <div className="space-y-2 text-gray-800 text-sm">
                                     <p className="flex items-start gap-1 flex-wrap">
                          {/* Icon and "Items:" text */}
                          <span className="flex items-center font-semibold shrink-0 text-gray-500">
                            <HiOutlineClipboardList className="mr-1" />
                            Items:
                          </span>
                        
                          {/* Items list */}
                          <span className="flex-1 text-gray-800">
                            {order?.order_item?.map((item, i) => (
                              <span key={item.order_item_id}>
                                {item?.quantity} x {item?.items?.item_name}
                                {i !== order?.order_item?.length - 1 && ', '}
                              </span>
                            ))}
                          </span>
                        </p>
                        
                                      <p><span className="font-semibold flex items-center gap-1 text-gray-500"> <FaUser/> Customer: <span className='font-normal'>{order?.user?.name}</span></span> </p>
                                      <p><span className="font-semibold flex items-center gap-1 text-gray-500"> <FaStore/> Vendor: <span className='font-normal'>{truncateLetters(order?.vendor?.shop_name, 20)}</span></span> </p>
                                      <p><span className="font-semibold flex items-center gap-1 text-gray-500"> <FaClock/> Delivered At: <span className='font-normal'>{new Date(order?.delivered_ts).toLocaleString()}</span></span> </p>
                                      <p>
                                        <span className="font-semibold">Payment:</span>
                                        <span className={`ml-2 px-3 py-1 text-white rounded-full text-sm ${order.payment_mode === 'COD' ? 'bg-red-500' : 'bg-green-500'}`}>
                                          {order?.payment_mode}
                                        </span>
                                      </p>
                                      <h1 className='w-full p-2 border-green border-1 font-medium text-center bg-green-100'>Delivered</h1>
                                    </div>
                                  )}
                                </div>
                              </div>
                        
                              {/* "Mark as Delivered" button if "on the way" */}
                              {order?.status?.toLowerCase() === "on the way" && (
                                <button
                                onClick={() => {
                                  setSelectedOrder(order);
                                  setShowOtpSubmit(true);
                                }}
                                
                                  className="mt-6 mb-5 w-full bg-gradient-to-br from-orange via-yellow cursor-pointer active:scale-95 to-orange text-white py-1 rounded-lg font-semibold shadow-sm transition"
                                >
                                  <FaCheckCircle className="inline mr-2" /> Mark as Delivered
                                </button>
                                )}




                              </div>
                              {isLast && loadmore && (
  <div className="flex justify-center mt-4">
    <p className="text-sm text-gray-500">Loading more...</p>
  </div>
)}

                              </>
                        )}
    
  )
) : (
  <div className="text-center text-gray-500 text-lg font-medium mt-10">
    📦 No active orders found
  </div>
)}



          </div>
              </>
            )}
                
             {/* OTP Submit Modal */}
      {showOtpSubmit && selectedOrder && (
        <div className="inset-0 z-50 backdrop-blur-sm bg-black/30 fixed flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[90%] max-w-sm space-y-4">
            <h3 className="text-lg font-bold text-gray-700">Enter OTP</h3>
            <input
              type="text"
              value={otp}
              maxLength={6}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              className={`w-full border ${otp.length > 0 && otp.length !== 6 ? 'border-red-500' : 'border-gray-300'} rounded px-3 py-2 outline-none`}
              placeholder="Enter 6-digit OTP"
            />
            {otp.length > 0 && otp.length !== 6 && (
              <p className="text-red-500 text-xs -mt-2">OTP must be 6 digits</p>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setShowOtpSubmit(false);
                  setOtp("");
                }}
                className="px-3 py-1 rounded bg-gray-300 text-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!otp || otp.length !== 6) return;
                  setSubmittingOtp(true);
                  if (parseInt(otp) !== parseInt(selectedOrder?.user_otp)) {
                    toast.error("Invalid OTP. Please try again.");
                    console.log(selectedOrder?.user_otp);
                    setSubmittingOtp(false);
                    return;
                  }
                  
                  const { success } = await updateOrderStatus(selectedOrder?.order_id, 'delivered');
                  if (success) {
                    setShowOtpSubmit(false);
                    setOtp("");
                    setStatus("Delivered");
                    onStatusUpdate?.(selectedOrder?.order_id);
                    toast.success("OTP verified. Delivered.");
                  } else {
                    toast.error("Something went wrong. Try again.");
                  }
                  setSubmittingOtp(false);
                }}
                className={`px-3 py-1 rounded text-white ${otp.length === 6 ? 'bg-green-600' : 'bg-gray-400 cursor-not-allowed'}`}
                disabled={otp.length !== 6}
                  >
                    {                    console.log(selectedOrder?.user_otp)
                    }
                {submittingOtp ? "Submitting..." : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
            </div>
            <BottomNav />
        </div>
    );
}
