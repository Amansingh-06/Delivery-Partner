import { FaArrowRight } from "react-icons/fa";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import LoginBGimage from "./LoginBGimage.jpg";
import { useEffect, useState } from "react";
import { GiFullPizza, GiFrenchFries, GiChickenOven } from "react-icons/gi";
import { FaIceCream } from "react-icons/fa";
import { MdOutlineFastfood } from "react-icons/md";
import { PiBowlFood } from "react-icons/pi";
import {supabase} from '../../utils/Supabase'
import { toast } from "react-hot-toast";
import { handleAuthError, sendOtp } from "../../utils/auth";
import Terms from "../../components/Term";
const Login = () => {
    const navigate = useNavigate();
    const [showCountryDropdown, setShowCountryDropdown] = useState(false);
    const [selectedCountryCode, setSelectedCountryCode] = useState("+91"); // Default to India
    const location = useLocation();
    const defaultPhone = location.state?.phone || "";
    const defaultCountryCode = location.state?.countryCode || "+91";
    const {
        register,
        handleSubmit,
        formState: { errors, isValid },
        setValue,
        watch,
        trigger,
    } = useForm(
        {
            defaultValues: {
                phoneNumber: defaultPhone,
            },
        },
        {
            mode: "onChange",
        }
    );

    const phoneNumber = watch("phoneNumber") || "";

    useEffect(() => {
        if (defaultPhone) setValue("phoneNumber", defaultPhone);
        if (defaultCountryCode) setSelectedCountryCode(defaultCountryCode);
        window.history.replaceState({}, document.title);
    }, [defaultPhone, defaultCountryCode, setValue]);

    // Country codes list
    const countryCodes = [
        { code: "+1", country: "US/Canada" },
        { code: "+44", country: "UK" },
        { code: "+91", country: "India" },
        { code: "+61", country: "Australia" },
        { code: "+49", country: "Germany" },
        { code: "+33", country: "France" },
        { code: "+86", country: "China" },
        { code: "+81", country: "Japan" },
        { code: "+7", country: "Russia" },
        { code: "+55", country: "Brazil" },
        { code: "+27", country: "South Africa" },
        { code: "+971", country: "UAE" },
        { code: "+65", country: "Singapore" },
        { code: "+82", country: "South Korea" },
    ];

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                showCountryDropdown &&
                !event.target.closest(".country-dropdown-container")
            ) {
                setShowCountryDropdown(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showCountryDropdown]);

    // Bussiness logic
    const [sendingOtp, setSendingOtp] = useState(false);
    const [isLogin, setIsLogin] = useState(false);

    function isValidPhoneNumber(phone) {
        // Remove spaces, dashes, and parentheses
        if (!phone) return false;

        // Remove everything except + and digits
        const regex = /^\+[0-9]{10,15}$/;
        return regex.test(phone);
    }

    const onSubmit = async (data) => {
        // console.log("Phone Number:", selectedCountryCode + data.phoneNumber);
        // console.log('referral',referral);

        if (!data.phoneNumber) {
            toast.error("Please enter a phone number!");
            return;
        }

        const fullPhone = selectedCountryCode + data.phoneNumber;
        console.log("FullPhone",fullPhone);
        if (!isValidPhoneNumber(fullPhone)) {
            // console.log("yaha aaya ?");
            toast.error("Not a valid phone number format");
            return;
        }
        const toastId = toast.loading("Sending OTP");
        try {
            setSendingOtp(true);
            const { data: userData, error } = await supabase
                .from("delivery_partner")
                .select("mobile_no")
                .eq("mobile_no", fullPhone)
                .single();

            // console.log(userData);

            const isUserRegistered = userData && !error;

            if (isUserRegistered) {
                // toast.info("Number already registered! Please login instead.");
                setIsLogin(true);
            } else {
                console.log(error);
                setIsLogin(false);
            }

            const otpData = await sendOtp(fullPhone);

            // Navigate to OTP page
            toast.success("OTP sent successfully!");
            setSendingOtp(false);
            console.log("Is user registered (from vender_request):", isLogin);

            toast.dismiss(toastId);
            navigate("/otp", {
                state: {
                    phone: fullPhone,
                    countryCode: selectedCountryCode,
                    isLogin: isUserRegistered,
                    // userName: userData?.name || ""
                    // referral,
                },
            });
        } catch (error) {
            // console.error("Error during OTP submission:", error);
            // toast.error("An error occurred while sending the OTP. Please try again.");
            toast.dismiss(toastId);
            handleAuthError(error);
            setSendingOtp(false);
        }
    };

    return (
        <div className="flex flex-col lg:flex-row items-center min-h-screen h-full bg-white">
            {/* Image */}
            <div className="w-full lg:w-[68%] overflow-hidden">
                <img
                    src={LoginBGimage}
                    alt="Login Visual"
                    className="object-cover w-full h-[60vh] lg:h-screen"
                />
            </div>

            {/* Form */}
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="relative p-4 lg:p-10 w-full lg:w-[32%] rounded-t-3xl lg:rounded-t-[0px] flex flex-col items-start justify-center ml-0 lg:-ml-5 bg-white overflow-y-auto max-h-screen lg:h-screen -mt-5 lg:mt-0"
                style={{ minHeight: "42vh" }}
            >
                {/* Floating Food Icons */}
                <div>
                    <GiFullPizza className="absolute text-orange opacity-30 text-2xl lg:text-4xl top-6 right-8 animate-bounce-slow pointer-events-none" />
                    <GiFrenchFries className="absolute text-orange opacity-30 text-2xl lg:text-4xl bottom-10 left-8 animate-float pointer-events-none" />
                    <GiChickenOven className="absolute text-orange opacity-30 text-2xl lg:text-4xl top-1/3 right-2 animate-float pointer-events-none" />
                    <FaIceCream className="absolute text-pink opacity-15 text-2xl lg:text-4xl bottom-6 right-12 animate-bounce-slow pointer-events-none" />
                    <MdOutlineFastfood className="absolute text-pink opacity-30 text-2xl lg:text-4xl bottom-12 left-60 animate-bounce-slow pointer-events-none" />

                    <GiFullPizza className="absolute text-orange opacity-30 text-2xl lg:text-4xl top-20 left-10 animate-float pointer-events-none" />
                    <PiBowlFood className="absolute text-orange opacity-30 text-2xl lg:text-4xl top-32 right-16 animate-bounce-slow pointer-events-none" />
                    <GiChickenOven className="absolute text-orange opacity-30 text-2xl lg:text-4xl bottom-40 right-32 animate-float pointer-events-none" />
                    <FaIceCream className="absolute text-pink opacity-15 text-2xl lg:text-4xl top-10 left-1/2 animate-bounce-slow pointer-events-none" />
                    <GiFrenchFries className="absolute text-pink opacity-30 text-2xl lg:text-4xl top-40 left-1/4 animate-bounce-slow pointer-events-none" />
                    <MdOutlineFastfood className="absolute text-orange opacity-30 text-2xl lg:text-4xl bottom-40 left-1/3 animate-float pointer-events-none" />
                    <FaIceCream className="absolute text-pink opacity-15 text-2xl lg:text-4xl top-1/4 right-1/4 animate-bounce-slow pointer-events-none" />

                </div>

                <h2 className="text-2xl-300 text-3xl  md:text-2xl lg:text-4xl text-gray font-extrabold  mb-3 tracking-wide">
                    Enter your number
                </h2>
                <p className=" text-sm mb-3 text-gray">
                    To continue your order experience!
                </p>

                {/* Phone Input */}
                <div className="flex w-full">
                    <div className="relative  country-dropdown-container">
                        <button
                            type="button"
                            onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                            className={`flex items-center justify-center p-3.5 rounded-l-lg border text-gray-700 border-r-0
    ${isValid ? "border-green" : "border-gray"}
  `}
                        >
                            <span className="font-medium">{selectedCountryCode}</span>
                            <svg
                                className={`w-4 h-4 ml-1 transition-transform ${showCountryDropdown ? "rotate-180" : ""
                                    }`}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 9l-7 7-7-7"
                                />
                            </svg>
                        </button>

                        {/* Country code dropdown */}
                        {showCountryDropdown && (
                            <div
                                className={`absolute z-10 w-48 mt-1 overflow-scroll bg-white text-gray-700 rounded-md shadow-lg max-h-60 border border-gray-300`}
                            >
                                <ul className="py-1">
                                    {countryCodes.map((country) => (
                                        <li key={country.code}>
                                            <button
                                                type="button"
                                                className={`w-full text-left px-4 py-3 hover:bg-gray-100 ${selectedCountryCode === country.code
                                                    ? "bg-blue-100"
                                                    : ""
                                                    }`}
                                                onClick={() => {
                                                    setSelectedCountryCode(country.code);
                                                    setShowCountryDropdown(false);
                                                }}
                                            >
                                                <span className="font-medium">{country.code}</span>{" "}
                                                {country.country}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>

                    <input
                        type="text"
                        inputMode="numeric"
                        autoFocus
                        pattern="[0-9]*"
                        placeholder="Phone Number"
                        {...register("phoneNumber", {
                            required: "Phone number is required",
                            pattern: {
                                value: /^[0-9]{10}$/,
                                message: "Phone number should contain exactly 10 digits with no spaces or symbols.",
                            },
                            validate: (value) =>
                                value.trim() !== "" ||
                                "Phone number cannot be empty or spaces only",
                        })}
                        onInput={(e) => {
                            e.target.value = e.target.value.replace(/[^0-9]/g, "");
                        }}
                        className={`w-full rounded-r-lg p-3 border text-lg mb-2 placeholder-gray-400 focus:outline-none transition duration-300 focus:ring-2
    ${errors.phoneNumber
                                ? "border-red-500 focus:ring-red-500"
                                : isValid
                                    ? "border-green-500 focus:ring-green-500"
                                    : "border-gray focus:border-orange  focus:ring-orange-500"
                            }`}
                    />
                </div>
                {errors.phoneNumber && (
                    <p className="text-red-500 text-sm mb-3">
                        {errors.phoneNumber.message}
                    </p>
                )}

                {/* Submit Button */}
                <button
                    type="submit"
                    className="flex cursor-pointer items-center mt-3 justify-center gap-2 w-full bg-primary hover:bg-primary text-white py-3 rounded-xl text-lg font-semibold transition duration-300 shadow-md hover:shadow-lg  
  disabled:bg-primary/50 disabled:cursor-not-allowed disabled:opacity-70 disabled:text-white"
                    disabled={sendingOtp || !isValid}
                >
                    Next
                    <FaArrowRight className="text-xl" />
                </button>


                {/* Console log to debug */}
                {console.log("sendingOtp:", sendingOtp, "isValid:", isValid)}


                {/* Optional: Help Text */}

                <Terms />
            </form>
        </div>
    );
};

export default Login;