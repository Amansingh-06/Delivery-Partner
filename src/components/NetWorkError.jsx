import React from "react";

const NetworkError = () => {
    return (
        <div className="w-screen h-screen flex items-center justify-center">
            <div className="text-center">
                <p className="text-lg font-medium text-red-600">
                    Network error occurred.
                </p>
                <p className="text-gray-500">
                    Please check your internet connection and try again.
                </p>
            </div>
        </div>
    );
};

export default NetworkError;