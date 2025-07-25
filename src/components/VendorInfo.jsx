import { useState } from "react";
import { FaStore } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
// import { truncateLetters } from "../constant/constants";

export default function OrderVendorInfo({ order, truncateLetters }) {
  const [showPreview, setShowPreview] = useState(false);
  console.log(order);

  // Extract media URLs
  const imageUrl = order?.vendor?.banner_url;
  const videoUrl = order?.vendor?.video_url;

  // Validity checks
  const isValidImage = imageUrl && imageUrl !== "NA" && imageUrl !== "null" && imageUrl !== "";
  const isValidVideo = videoUrl && videoUrl !== "NA" && videoUrl !== "null" && videoUrl !== "";

  // Decide which to show: video has higher priority
  const showMedia = isValidVideo ? "video" : isValidImage ? "image" : null;

  return (
    <>
      <p>
        <span className="font-medium flex items-center gap-2">
          <FaStore />
          Vendor:
          <span className="text-gray-600 text-sm">
            {truncateLetters(order?.vendor?.shop_name, 20)}
          </span>

          {/* Thumbnail Preview */}
          {showMedia === "video" && (
            <video
              src={videoUrl}
              className="w-6 h-6 rounded-full object-fill cursor-pointer border"
              onClick={() => setShowPreview(true)}
              muted
              loop
              autoPlay
            />
          )}

          {showMedia === "image" && (
            <img
              src={imageUrl}
              alt="vendor"
              className="w-6 h-6 rounded-full object-fill cursor-pointer border"
              onClick={() => setShowPreview(true)}
            />
          )}
        </span>
      </p>

      {/* Fullscreen Modal Preview */}
      {showPreview && (
        <div className="inset-0 z-50 backdrop-blur-sm bg-black/30 fixed flex items-center justify-center">
          <div className="relative border-2 border-red-50 p-8">
            <button
              className="absolute z-50 top-2 right-2 text-red text-3xl"
              onClick={() => setShowPreview(false)}
            >
              <IoMdClose />
            </button>

            {showMedia === "video" && (
              <video
                src={videoUrl}
                controls
                autoPlay
                className="max-w-2xs max-h-2xs rounded shadow-lg"
              />
            )}

            {showMedia === "image" && (
              <img
                src={imageUrl}
                alt="Vendor Full"
                className="max-w-2xs max-h-2xs rounded shadow-lg"
              />
            )}
          </div>
        </div>
      )}
    </>
  );
}
