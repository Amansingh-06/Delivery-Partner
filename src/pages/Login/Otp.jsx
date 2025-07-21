import { FaArrowRight } from "react-icons/fa";
import { useForm } from "react-hook-form";
import {
    Link,
    useLocation,
    useNavigate,
    useNavigationType,
} from "react-router-dom";
import LoginBGimage from "./LoginBGimage.jpg";
import toast from "react-hot-toast";
import OTPInput from "react-otp-input";
import { useEffect, useState } from "react";
import { FaIceCream } from "react-icons/fa";
import { MdOutlineFastfood } from "react-icons/md";
import { PiBowlFood } from "react-icons/pi";
import { GiFullPizza, GiFrenchFries, GiChickenOven } from "react-icons/gi";
import { BiPencil } from "react-icons/bi";
import { FiArrowLeft } from "react-icons/fi";
// import { toast } from "react-toastify";
import { supabase } from "../../utils/Supabase";
// import { handleSignup } from "../../services/handleSignup";
import { useAuth } from "../../Context/authContext";
import {
    validateName,
    validateOtp,
    verifyOtp,
    handleLogin,
    handleSignupFlow,
    handleAuthError,
    logout,
} from "../../utils/auth";
import ResendButton from "../../components/ResendButton";
import Loader from "../../components/Loader";

const Otp = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [otpValue, setotpValue] = useState("");
    const {
        cameFromUserDetailsPage,
        setCameFromUserDetailsPage,
        setSession,
        proceedToUserDetails,
        setProceedToUserDetails,
        setVendorData } = useAuth();
    const {
        register,
        trigger,
        handleSubmit,
        watch,
        setValue,
        formState: { errors, isValid },
    } = useForm({
        mode: "onChange",
    });
    const otp = watch("otp") || "";

    const [isResending, setIsResending] = useState(false);

    //Auto submit
    useEffect(() => {
        const handleAutoSubmit = async () => {

            if (otpValue?.length === 6 && isLogin && !isResending) {
                await handleSubmit(onSubmit)();
            }
        };
        handleAutoSubmit();

    }, [otpValue]);


    // Prevent user from going back to OTP page when he has already entered the userDetails page
    useEffect(() => {
        const handleBackFromUserDetails = async () => {
            if (cameFromUserDetailsPage) {
                // Reset the flag
                setCameFromUserDetailsPage(false);

                // Logout the user (destroy session)
                await logout(setSession);

                // Redirect to login
                navigate("/", { replace: true });
            }
        };
        handleBackFromUserDetails();
    }, [cameFromUserDetailsPage, navigate, setCameFromUserDetailsPage]);

    // business logic

    const [phone, setPhone] = useState("");
    const [isLogin, setIsLogin] = useState(location?.state?.isLogin ?? false);
    const [countryCode, setCountryCode] = useState("");
    // const [userName, setUserName] = useState("");

    const navType = useNavigationType();
    useEffect(() => {
        // on a hard reload or when user clicks Back/Forward, navType === "POP"
        // and in both cases location.state will be undefined
        // console.log("navType",navType);
        if (navType === "POP" || !location?.state) {
            navigate("/", { replace: true });
        } else {
            setPhone(location?.state?.phone);
            setIsLogin(location?.state?.isLogin);
            setCountryCode(location?.state?.countryCode);
        }
        console.log(isLogin, "isLogin");

    }, [navType, location?.state, navigate]);
    useEffect(() => {
        console.log("✅ isLogin value set to:", isLogin);
    }, [isLogin]);

    const [authenticating, setAuthenticating] = useState(false);

    /********************    verify otp ********************/
    const [loading, setLoading] = useState(false)
    const [otpError,setOtpError]=useState('')

    const onSubmit = async (data, event) => {
        setLoading(true)
        try {
            if (authenticating) return;
            setAuthenticating(true);

            const isValid = await trigger();
            if (!isValid) return;

            // if (!isLogin) {
            //     const trimmedName = validateName(data?.name);
            //     if (!trimmedName) return;
            //     data.name = trimmedName;
            // }

            if (!validateOtp(otpValue)) return;


            const otpData = await verifyOtp(phone, otpValue);

            if (isLogin) {
                await handleLogin(phone, navigate);
            } else {
                setProceedToUserDetails(true);
                await handleSignupFlow(
                    data,
                    event?.nativeEvent?.submitter?.name,
                    phone,
                    navigate,
                    setSession,
                    setVendorData
                );
            }
        } catch (error) {
            handleAuthError(error);
        } finally {
            setAuthenticating(false);
            setLoading(false)
        }
    };


    // Otp auto detection 
    const attemptOtpAutofill = async () => {
        if ('OTPCredential' in window) {
            try {
                
                // Listen the SMS and get the OTP 
                const abortController = new AbortController()
                const timeout = setTimeout(() => abortController.abort(), 60000)

                const content = await navigator?.credentials.get({
                    otp: {
                        transport: ['sms']
                    },

                    signal: abortController?.signal,
                });
                clearTimeout(timeout);

                if (content && content.code) {
                    console.log("OTP detected:", content?.code);
                    setValue("otp", content?.code);

                    setTimeout(() => {
                        const submitButton = document.querySelector('#otp-form button[type="submit"]');
                        if (submitButton) {
                        
                            submitButton.focus();
                        } else {
                            console.warn("Submit button not found");
                        }
                    }, 100);
                    toast.success("OTP Filled Automatically");
                }
            } catch (error) {
                if (error.name !== 'AbortError') {
                    console.error('OTP Autofill Error: ', error)
                }
            }
        } else {
            toast.error("OTP Autofill not supported in this browser.");
        }
    }

    // Runs the OTP autofill function when OTP is sent
      useEffect(() => {
        if (phone) {
            const timer = setTimeout(() => {
                attemptOtpAutofill();
            }, 500);
            return () => clearTimeout(timer); // Cleanup the timer
       }
    }, [phone]);

    return (
        <div className="flex flex-col lg:flex-row min-h-screen h-full bg-white">
            {/* Image */}
            <div className="relative w-full lg:w-[68%] overflow-hidden">
                <img
                    src={LoginBGimage}
                    alt="Login Visual"
                    className="object-cover w-full h-[52vh] lg:h-screen"
                />
                <Link to="/" className="absolute text-orange bg-white rounded-full p-3 text-3xl lg:text-3xl font-bold top-4 lg:top-5 left-1 lg:left-4 z-20"><FiArrowLeft /></Link>
            </div>

            {/* Form */}
            <form
                onSubmit={handleSubmit(onSubmit)}
                autoComplete="off"
                id="otp-form"
                className="relative p-4 lg:p-10 w-full lg:w-[34%] rounded-t-3xl lg:rounded-none flex flex-col items-start justify-center ml-0 lg:-ml-5 bg-white overflow-y-auto max-h-[66vh]  lg:max-h-none lg:min-h-[66vh] -mt-5 lg:mt-0"
            >
                <div className="flex items-center justify-center mb-3 lg:mb-4 text-sm lg:text-lg font-medium text-gray ">
                    {phone && (
                        <>
                            OTP sent to&nbsp;{phone}
                            <Link
                                to="/"
                                state={{
                                    phone: phone,
                                    countryCode: countryCode
                                }}
                                className="text-orange hover:underline border-2 border-orange p-1 rounded-full ml-2"
                            >

                                <BiPencil className="rounded-full" />
                            </Link>
                        </>
                    )}
                </div>
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
                <h1 className="text-3xl text-gray md:text-2xl lg:text-4xl font-extrabold mb-4 ">
                    {/* {isLogin ? `Welcome, ${userName}` : "Registration"} */}
                </h1>

                {/* Name Input */}
                {/* {!isLogin && (
                    <div className={`space-y-1 text-gray flex flex-col w-full`}>
                        <label className="text-base font-medium ">Enter your Name</label>
                        <input
                            type="text"
                            placeholder="Full Name"
                            autoFocus
                            {...register("name", {
                                required: "Name is required",
                                minLength: {
                                    value: 3,
                                    message: "Name must be at least 3 characters",
                                },
                                maxLength: {
                                    value: 50,
                                    message: "Name must be less than 50 characters",
                                },
                                // pattern: {
                                //   value: /^[A-Za-z]+(?: [A-Za-z]+)*$/,
                                //   message: "Name must contain only alphabets and single spaces",
                                // },
                                validate: (value) => {
                                    const trimmed = value.trim();
                                    const regex = /^[A-Za-z]+(?: [A-Za-z]+)*$/;
                                    if (trimmed === "")
                                        return "Name cannot be empty or spaces only";
                                    if (!regex?.test(trimmed))
                                        return "Name must contain only alphabets and single spaces";
                                    return true;
                                },
                            })}
                            className={`w-full border ${errors.name
                                    ? "border-red-500 focus:border-orange focus:ring-orange"
                                    : `border-gray-300   ${isValid
                                        ? " focus:border-green border-green focus:ring-green"
                                        : " focus:border-orange focus:ring-orange"
                                    }`
                                } rounded-lg p-3 outline-none bg-white w-full  focus:outline-none focus:ring-2  transition duration-300 `}
                        />
                        {errors?.name && (
                            <p className="text-red-500 text-sm">{errors?.name?.message}</p>
                        )}
                    </div>
                )} */}

                {/* OTP Input */}
                <div className="space-y-2 text-gray mt-4">
                    <label className="text-base font-medium ">Enter OTP</label>
                    <OTPInput
                        value={otp}
                        onChange={(value) => {
                            setValue('otp', value);
                            setotpValue(value);
                            setOtpError('');
                        }}
                        shouldAutoFocus={isLogin}
                        numInputs={6}
                        isInputNum
                        inputType="number"
                        containerStyle={{
                            display: "flex",
                            justifyContent: "start",
                            gap: "12px",
                        }}
                        inputStyle={{
                            width: "14%",
                            height: "60px",
                            textAlign: "center",
                            borderBottom: `1px solid ${otp.length === 6 ? "green" : "#334155"
                            }`,
                            outline: "none",
                            backgroundColor: "#ffffff",
                            color: "#374151",
                            fontSize: "1.125rem",
                        }}
                        renderInput={(props) => (
                            <input
                                {...props}
                                className={`focus:outline-none focus:ring-2 ${otp.length === 6
                                    ? "focus:ring-green"
                                    : "focus:ring-orange"
                                    } transition duration-300`}
                            />
                        )}
                        inputProps={{
                            inputMode: "numeric",
                            autoComplete: "one-time-code",
                        }}
                    />
                      {otpError && (
            <p className="text-red-500 text-sm mt-1 ml-1">{otpError}</p>
          )}
                </div>
                <ResendButton fullPhone={phone} setIsResending={setIsResending} />

                <div className="flex w-full items-center justify-end mt-6">
                    {/* Submit Button */}

                    {/* {
                        <button
                            type="submit"
                            className={` ${isLogin
                                    ? "opacity-0 pointer-events-none "
                                    : `${!(isValid && otpValue?.length === 6)
                                        ? "bg-orange/50 cursor-not-allowed opacity-70"
                                        : "bg-orange hover:bg-orange/90 cursor-pointer hover:scale-95 transition duration-300"
                                    } `
                                }  flex items-center justify-center gap-2 md:gap-3 w-full lg:w-[200px] text-white py-3   rounded-xl  font-semibold transition duration-300 shadow-lg`}
                            disabled={authenticating}
                            name="getReward"
                        >
                            SignUp & Get ₹50
                            <FaArrowRight className="text-white text-lg md:text-xl" />
                        </button>
                    } */}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        name="defaultSignup"
                        className={`flex items-center  justify-center gap-2 md:gap-3 w-full lg:w-[120px] text-white py-3 rounded-xl font-semibold transition duration-300 shadow-lg z-50
                            ${
                              isValid && otp?.length === 6
                                ? "bg-orange text-white hover:bg-orange/90 hover:scale-95 cursor-pointer"
                                : "bg-orange/50 text-white cursor-not-allowed opacity-70"
                            }`}
                          
                        disabled={authenticating}
                    >
                        {isLogin ? "Login" : "Sign Up"}
                        <FaArrowRight className="text-lg md:text-xl" />
                    </button>
                </div>
            </form>
{loading && <Loader/> }
        </div>
    );
};

export default Otp;