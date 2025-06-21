import React, { useState, useEffect } from 'react';
import { Switch } from "@headlessui/react";
import { FaDirections, FaBoxOpen, FaUser, FaCheckCircle } from "react-icons/fa";
import BottomNav from '../components/Footer';
import { MdLocationPin } from "react-icons/md";
import { FaPhone } from "react-icons/fa6";
import Header from './Header';
import { fetchOrdersByDP } from '../utils/fetchOrdersByDp';
import { subscribeToRealtimeOrders } from '../utils/subscribeToRealtimeOrders';
import { useAuth } from '../Context/authContext';
import { supabase } from '../utils/Supabase';
import toast from 'react-hot-toast';
import { updateOrderStatus } from '../utils/updateOrderStauts';


export default function DPHomePage() {
    const [isOnline, setIsOnline] = useState(null);
    const [orders, setOrders] = useState([]);
    const [status, setStatus] = useState("Pick up");
    const [otpInput, setOtpInput] = useState("");
    const [submittingOtp, setSubmittingOtp] = useState(false);
    const [showOtpSubmit, setShowOtpSubmit] = useState(false);
    const [otp, setOtp] = useState("");

    const { dpProfile, session } = useAuth();
    const dpId = "43c6aeba-34e0-4ad7-9caf-9eb661b2e043"; // fallback-safe

    const handleDeliveredClick = () => {
        setShowOtpSubmit(true);
    };

    // ✅ Get online status on mount
    useEffect(() => {
        const fetchAvailability = async () => {
            if (!session?.user?.id) return;
            const { data, error } = await supabase
                .from("delivery_partner")
                .select("available")
                .eq("u_id", session.user.id)
                .single();

            if (error) {
                console.error("Error fetching availability:", error.message);
                toast.error("Unable to load availability");
                setIsOnline(false);
            } else {
                setIsOnline(data?.available ?? false);
            }
        };

        fetchAvailability();
    }, [session?.user?.id]);

    // ✅ Toggle online/offline status
    const handleToggleOnline = async (value) => {
        setIsOnline(value);
        const { error } = await supabase
            .from("delivery_partner")
            .update({ available: value })
            .eq("u_id", session.user.id);

        if (error) {
            toast.error("Could not update status");
            setIsOnline(!value); // revert if failed
        } else {
            toast.success(`You are now ${value ? "Online" : "Offline"}`);
        }
    };

    // ✅ Fetch orders on tab/status change
    useEffect(() => {
        const getOrders = async () => {
            const result = await fetchOrdersByDP(dpId, status);
            if (result.success) {
                setOrders(result.data);
            } else {
                console.error("Error fetching orders:", result.error);
            }
        };

        getOrders();
    }, [dpId, status]);

    // ✅ Realtime subscribe (only once)
    useEffect(() => {
        const channel = subscribeToRealtimeOrders(dpId, async () => {
            const result = await fetchOrdersByDP(dpId, status);
            if (result.success) {
                setOrders(result.data);
            }
        });

        return () => {
            channel.unsubscribe();
        };
    }, [dpId]);

    const DEFAULT_PHOTO = "./defaultuserImage.jpg";

    return (
        <div className="mx-auto bg-gradient-to-br from-white via-gray-50 to-gray-100 min-h-[85vh]  text-gray-800 ">
            <div className='max-w-2xl space-y-6 mx-auto  shadow-lg'>
                <Header title='Order' />

                <div className='max-w-2xl mx-auto md:p-6 p-3 md:mt-25 mt-13 py-15 shadow-lg rounded-2xl min-h-[80vh]'>
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-4">
                            <img src={dpProfile?.photo_url || DEFAULT_PHOTO} alt="Profile" className="w-14 h-14 rounded-full shadow-md" />
                            <div>
                                <h2 className="md:text-2xl text-lg font-bold">Hi, {dpProfile?.name}</h2>
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
                    {orders?.length > 0 ? (
                        orders.map((order) => (
                            <div
                                key={order.order_id}
                                className="bg-white w-full  rounded-xl md:p-6 p-3 shadow-md border border-gray-200 mb-10"
                            >

                                {/* Basic Details (Hide if delivered) */}
                                {/* {order?.status?.toLowerCase() !== "delivered" && (
                                    <div className="space-y-2">
                                        <p><span className="font-semibold">Order ID:</span> {order?.user_order_id}</p>
                                        <p><span className="font-semibold">Status:</span> <span className="text-blue-600 font-medium">{order?.status}</span></p>
                                        <p><span className="font-semibold">Vendor:</span> {order?.vendor?.shop_name}</p>
                                        <p><span className="font-semibold">Vendor Add.:</span> {order?.vendor?.street} {order?.vendor?.city}</p>
                                    </div>
                                )} */}

                                {/* OTP + Directions button (Only if not delivered) */}
                                {order?.status?.toLowerCase() !== "delivered" && (
                                    <div className="flex justify-between items-center mt-4">
                                        {/* OTP only if not on the way */}
                                        {order?.status?.toLowerCase() !== "on the way" && (
                                            <p className="text-lg font-medium">OTP: <span className="text-blue-600 font-bold">{order?.dp_otp || "N/A"}</span></p>
                                        )}

                                        <button
                                            className="flex items-center text-white gap-1 font-medium bg-blue-600 hover:bg-blue-700 p-1 rounded-md transition"
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
                                )}

                                {/* Content Section */}
                                <div className=" gap-6 mt-3">
                                    <div>

                                        {/* If "on the way", show items & customer */}
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

                                        {/* If delivered, show full summary */}
                                        {order?.status?.toLowerCase() === "delivered" && (
                                            <div className="mt-2 space-y-2 text-gray-800 text-sm">
                                                <p><span className="font-semibold">Items:</span> {order?.order_item?.map((item, i) => (
                                                    <span key={item.order_item_id}>
                                                        {item?.quantity} x {item?.items?.item_name}
                                                        {i !== order?.order_item?.length - 1 && ', '}
                                                    </span>
                                                ))}</p>
                                                <p><span className="font-semibold">Customer:</span> {order?.user?.name}</p>
                                                <p><span className="font-semibold">Vendor:</span> {order?.vendor?.shop_name}</p>
                                                <p><span className="font-semibold">Delivered At:</span> {new Date(order?.updated_ts).toLocaleString()}</p>
                                                <p>
                                                    <span className="font-semibold">Payment:</span>
                                                    <span className={`ml-2 px-3 py-1 text-white rounded-full text-sm ${order.payment_mode === 'COD' ? 'bg-red-500' : 'bg-green-500'}`}>
                                                        {order?.payment_mode}
                                                    </span>
                                                </p>
                                                <h1 className='w-full p-2 border-green border-1 text-center bg-green-100'>Delivered</h1>
                                            </div>
                                        )}


                                    </div>
                                </div>

                                {/* "Mark as Delivered" button if "on the way" */}
                                {order?.status?.toLowerCase() === "on the way" && (
                                    <button
                                        onClick={handleDeliveredClick}
                                        className="mt-6 mb-5 w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold shadow-sm transition"
                                    >
                                        <FaCheckCircle className="inline mr-2" /> Mark as Delivered
                                    </button>
                                )}

                                {/* OTP Submit Modal */}
                                {showOtpSubmit && (
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
                                                    onClick={() => setShowOtpSubmit(false)}
                                                    className="px-3 py-1 rounded bg-gray-300 text-gray-700"
                                                >
                                                    Cancel
                                                </button>

                                                <button
                                                    onClick={async () => {
                                                        if (!otp || otp.length !== 6) return;

                                                        setSubmittingOtp(true);

                                                        if (parseInt(otp) !== parseInt(order?.user_otp)) {
                                                            setSubmittingOtp(false);
                                                            toast.error("Invalid OTP. Please try again.");
                                                            return;
                                                        }

                                                        const { success } = await updateOrderStatus(order?.order_id, 'delivered');
                                                        if (success) {
                                                            setShowOtpSubmit(false);
                                                            setStatus("Delivered");
                                                            onStatusUpdate?.(order?.order_id);
                                                            toast.success("OTP verified. Delivery started.");
                                                        } else {
                                                            toast.error("Something went wrong. Try again.");
                                                        }

                                                        setSubmittingOtp(false);
                                                    }}
                                                    className={`px-3 py-1 rounded text-white ${otp.length === 6 ? 'bg-green-600' : 'bg-gray-400 cursor-not-allowed'}`}
                                                    disabled={otp.length !== 6 || submittingOtp}
                                                >
                                                    {submittingOtp ? "Submitting..." : "Submit"}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="text-center text-gray-500 text-lg font-medium mt-10">
                            📦 No active orders found
                        </div>
                    )}


                </div>
            </div>
            <BottomNav />
        </div>
    );
}
