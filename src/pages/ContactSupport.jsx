import React, { useState } from "react";
import { connectSupport } from '../utils/support'
import BottomNav from "../components/Footer";

const Support = () => {
  const [loading, setLoading] = useState(false);

  const handleSupport = async () => {
    setLoading(true);
    const result = await connectSupport();
    setLoading(false);

    if (!result.success && result.message) {
      alert(result.message);
    }
  };

  return (
    <div className="p-4 pt-15 max-w-2xl mx-auto min-h-screen">
      <h1 className="text-lg lg:text-xl font-medium text-gray mb-2">
        NEED HELP?
      </h1>
      <p className="text-gray-500 mb-4 text-sm">
        Contact our support team on WhatsApp for instant assistance
      </p>
      <button
        onClick={handleSupport}
        disabled={loading}
        className={`${!loading? 'button-gradientBG':'bg-orange/30'} cursor-pointer text-white w-48 flex items-center justify-center py-2 rounded`}
      >
        {loading ? (
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        ) : (
          "Connect on WhatsApp"
        )}
          </button>
          <BottomNav/>
    </div>
  );
};

export default Support;