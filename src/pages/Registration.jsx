import React, { useState,useEffect } from 'react';
import { useForm,Controller } from 'react-hook-form';
import { Watch, X } from 'lucide-react';
import InputField from '../components/InputField';
import Header from './Header';
import Loader from '../components/Loader';
import {toast} from 'react-hot-toast';
import { supabase } from '../utils/Supabase';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '../Context/authContext';
import { useNavigate,useNavigationType } from 'react-router-dom';
import { GrStreetView } from "react-icons/gr";
import { PiCityLight } from "react-icons/pi";
import { PiMapPinAreaLight } from "react-icons/pi";
import { TbMapPinCode } from "react-icons/tb";
import { FaRegUser } from "react-icons/fa";
import { BsCalendar2Date } from "react-icons/bs";


import {
    nameValidation,
    nameKeyDownHandler,
    InputCleanup,
    streetValidation,
    streetKeyDown,
    streetInputClean,
    cityStateValidation,
    cityStateKeyDown,
    cityStateInputClean,
    pincodeValidation,
    pincodeKeyDown,
    pincodeInputClean
} from '../utils/Validation';

const Registration = () => {
    const {
        register,
        setValue,
        handleSubmit,
        control,
        formState: { errors, isValid },
        trigger,
        watch
        
    } = useForm({ mode: 'onChange' });

    const { setCameFromUserDetailsPage } = useAuth();


    const navigate = useNavigate();

    const navType = useNavigationType(); // "PUSH" | "REPLACE" | "POP"

    useEffect(() => {
        // On POP (refresh, back/forward, direct URL), clear any state:
        // console.log("Nav Type", navType);
        if (navType === "POP") {
            navigate("/", { replace: true });
        }
    }, [navType, navigate]);

    const [photoPreview, setPhotoPreview] = useState(null);
    const [idFileName, setIdFileName] = useState('');
    const [idFile, setIdFile] = useState([]);
    const [loading, setLoading] = useState(false);
    const [photoSelected, setPhotoSelected] = useState(false);

    const {setSession, session,fetchDPProfile } = useAuth();

    const formattedPhone = session.user.phone.startsWith('+')
        ? session.user.phone
        : `+${session.user.phone}`;

    const uploadFile = async (file, bucketName) => {
        if (!file) return null;

        const fileExt = file?.name?.split('.')?.pop();
        const filePath = `${Date.now()}_${file.name}`;

        const { data, error } = await supabase.storage
            .from(bucketName)
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: true,
            });

        if (error) {
            console.error('Error uploading file:', error?.message);
            toast.error("Error uploading file");
            throw new Error(error?.message);
        }

        const { data: urlData, error: urlError } = supabase.storage
            .from(bucketName)
            .getPublicUrl(filePath);

        if (urlError) {
            console.error('Error getting public URL:', urlError?.message);
            throw new Error(urlError?.message);
        }

        return urlData?.publicUrl;
    };

    const watchfields = {
        name: watch('name'),
        dob: watch('dob'),
        city: watch('city'),
        street: watch('street'),
        state: watch('state'),
        pincode: watch('pincode'),
    };

    const onSubmit = async (data) => {
        setLoading(true);

        try {
            const photoFile = data?.photo;

            // ✅ Step 1: Upload photo
            const photoUrl = await uploadFile(photoFile, 'dp-photo');

            // ✅ Step 2: Upload all selected ID files
            const idUrls = [];

            for (const file of idFile) {
                const url = await uploadFile(file, 'dp-id');
                if (url) idUrls.push(url);
            }

            // ✅ Validation: At least 2 IDs required
            if (idUrls.length < 2) {
                toast.error("Please upload at least 2 ID documents");
                setLoading(false);
                return;
            }

            // ✅ Step 3: Insert into Supabase
            const { error: insertError } = await supabase
                .from('delivery_partner')
                .insert([{
                    name: data?.name.trim(),
                    dob: data?.dob.trim(),
                    city: data?.city.trim(),
                    street: data?.Street.trim(),
                    state: data?.state.trim(),
                    pincode: data?.pincode.trim(),
                    photo_url: photoUrl,
                    id_url: idUrls, // ✅ Pass array directly
                    created_ts: new Date().toISOString(),
                    mobile_no: formattedPhone,
                    u_id: session?.user?.id
                }]);

            if (insertError) {
                console.error('Error inserting data:', insertError);
                toast.error("Failed to register");
                setLoading(false);
                return;
            }

            toast.success("Registration successful!");

            // ✅ Step 4: Update User Metadata
            const { data: updatedUser, error: updateError } = await supabase.auth.updateUser({
                data: { isRegistered: true },
            });

            if (updateError) {
                toast.error("User metadata update failed");
                setLoading(false);
                return;
            }

            // ✅ Step 5: Refresh session & Navigate
            const { data: sessionData } = await supabase.auth.getSession();
            if (sessionData?.session?.user?.user_metadata?.isRegistered) {
                setSession(sessionData.session); // ✅ VERY IMPORTANT
                await fetchDPProfile(); // ✅ This will update UI immediately

                await new Promise(resolve => setTimeout(resolve, 100)); // small pause
                navigate("/home");
            } else {
                toast.error("User session not updated with registration info");
            }

            setLoading(false);
        } catch (error) {
            console.error("Registration failed:", error.message);
            toast.error("Something went wrong");
            setLoading(false);
        }
    };

    

    return (
        <div className="min-h-screen  flex items-center justify-center  ">
            {loading && <Loader/>}
            <div className="w-full max-w-2xl   space-y-4     bg-white ">
                <Header title='Registration'/>
                <div className='max-w-2xl  md:px-4 px-3 bg-gray-100 py-15 mt-7 shadow-lg'>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl  ">
                        <div className='flex-col flex gap-6 md:px-6 px-4 bg-white  py-6 rounded-lg shadow-lg '>
                            <h1 className='text-xl font-medium text-gray-500'>Basic Details</h1>
                            <InputField
                                id="name"
                                type='text'
                                icon={FaRegUser}
                                placeholder="Enter your name"
                                register={register}
                                validation={nameValidation }
                                error={errors.name}
                                onInput={InputCleanup}
                                onKeyDown={nameKeyDownHandler}
                                value={watchfields.name}
                            />

<InputField
                                icon={BsCalendar2Date}
                                id="dob"
                                type="date"
                                placeholder="Date of Birth"
                                name="dob"
                                value={watchfields.dob}
                                register={register}
                                validation={{
                                    required: 'Date of Birth is required',
                                    validate: (value) => {
                                        const dob = new Date(value);
                                        const today = new Date();
                                        const age = today.getFullYear() - dob.getFullYear();
                                        const isBeforeBirthday =
                                            today.getMonth() < dob.getMonth() ||
                                            (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate());
                                        const actualAge = isBeforeBirthday ? age - 1 : age;

                                        // ✅ Also check if dob is before 1900
                                        const minValidDate = new Date("1900-01-01");
                                        if (dob < minValidDate) return "Date cannot be before 1900";

                                        return actualAge >= 18 || "You must be at least 18 years old";
                                    }
                                }}
                                min="1900-01-01"  // 🔥 restricts calendar and manual input
                                max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                                onFocus={(e) => e.target.showPicker?.()} // calendar opens on click
                                error={errors.dob}
                            />



                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <InputField
                                    type='text'
                                    icon={GrStreetView}

                                    id="Street"
                                    placeholder="Street"
                                    register={register}
                                    validation={streetValidation}
                                    error={errors.Street}
                                    value={watchfields.street}
                                    onKeyDown={streetKeyDown}
                                    onInput={streetInputClean}
                                />
                                <InputField
                                    type='text'
                                    icon={PiCityLight}
                                    value={watchfields.city}

                                    id="city"
                                    placeholder="City"
                                    register={register}
                                    validation={cityStateValidation}
                                    onInput={cityStateInputClean}
                                    onKeyDown={cityStateKeyDown}
                                    error={errors.city}
                                />
                        
                                <InputField
                                    type='text'
                                    icon={PiMapPinAreaLight}
                                    value={watchfields.state}

                                    id="state"
                                    placeholder="State"
                                    register={register}
                                    validation={cityStateValidation}
                                    error={errors.state}
                                    onKeyDown={cityStateKeyDown}
                                    onInput={cityStateInputClean}

                                />
                                <InputField
                                    icon={TbMapPinCode}
                                    value={watchfields.pincode}

                                    type='text'
                                    id="pincode"
                                    placeholder="Pincode"
                                    register={register}
                                    validation={pincodeValidation}
                                    error={errors.pincode}
                                    onKeyDown={pincodeKeyDown}
                                    onInput={pincodeInputClean}
                                />
                            </div>
                        </div>
                        <div className='flex-col flex gap-6 bg-white px-6 py-4 rounded-lg shadow-lg  '>
                            <div className="flex flex-col md:flex-row gap-8 ">
                                {/* Upload Photo */}

                                <div className="flex flex-col gap-6 w-full">
                                    {/* === Upload Photo === */}
                                    <label className="block  font-semibold text-gray-500">Upload Photo</label>
                                    <div className="flex md:gap-8 gap-3 flex-col md:flex-row w-full h-40">

                                        {/* Photo Preview */}
                                        <div className="border-2 flex-1 border-dashed  border-gray-400 rounded bg-white flex items-center justify-center relative overflow-hidden">
                                            {photoPreview ? (
                                                <>
                                                    <img src={photoPreview} alt="Preview" className="object-cover w-28 h-32 rounded" />
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setPhotoPreview(null);
                                                            setPhotoSelected(false); // reset state
                                                            setValue('photo', null); // remove file from form
                                                            trigger('photo'); // revalidate if needed
                                                        }}
                                                        className="absolute top-2 right-2 bg-white rounded-full p-1 shadow hover:bg-gray-100"
                                                    >
                                                        <X className="h-5 w-5 text-gray-600" />
                                                    </button>
                                                </>
                                            ) : (
                                                <p className="text-gray-500 text-sm text-center px-2">No photo preview</p>
                                            )}
                                        </div>

                                        {/* Select Photo Button */}
                                        <label
                                            htmlFor="photo"
                                            className={`md:flex-1 bg-${photoSelected ? 'gray-500' : 'orange-300'} hover:bg-${photoSelected ? 'gray-600' : 'orange-400'} text-white rounded p-2 flex items-center justify-center cursor-pointer font-semibold text-base transition select-none`}
                                        >
                                            {photoSelected ? 'Photo Selected' : 'Select Photo'}
                                        </label>
                                        <Controller
                                            name="photo"
                                            control={control}
                                            rules={{ required: 'Photo is required' }}
                                            render={({ field }) => (
                                                <>
                                                    <input
                                                        id="photo"
                                                        type="file"
                                                        accept="image/*"
                                                        className="hidden"
                                                        onChange={(e) => {
                                                            const file = e.target.files[0];
                                                            if (file) {
                                                                const reader = new FileReader();
                                                                reader.onloadend = () => {
                                                                    setPhotoPreview(reader.result);
                                                                    setPhotoSelected(true);
                                                                };
                                                                reader.readAsDataURL(file);
                                                                field.onChange(file); // ✅ react-hook-form gets the value
                                                            } else {
                                                                setPhotoPreview(null);
                                                                setPhotoSelected(false);
                                                                field.onChange(null);
                                                            }
                                                        }}
                                                    />
                                                </>
                                            )}
                                        />





                                    </div>
                                    {errors.photo && !photoPreview && (
                                        <p className="text-red-500 text-sm -mt-4">{errors.photo.message}</p>
                                    )}

                                    {/* === Upload ID === */}
                                    <div>
                                        <label className="block mt-2 mb-4 text-base font-semibold text-gray-500">
                                            Add at least two IDs <span className='text-sm text-gray-400'>(e.g., Aadhaar Card, Driving License, PAN)</span>
                                        </label>
                                        <div className="flex items-center md:flex-row flex-col md:gap-8 gap-2 w-full">
                                            <div className="border border-gray-300 rounded px-5 py-2 bg-white w-full md:flex-1 overflow-hidden truncate">
                                                <span className="text-gray-700 text-sm truncate">
                                                    {idFileName || 'No ID Selected'}
                                                </span>
                                            </div>
                                            <Controller
                                                name="id"
                                                control={control}
                                                rules={{
                                                    validate: (files) => {
                                                        if (!files || files.length < 2) {
                                                            return 'Please upload at least 2 ID files';
                                                        }
                                                        return true;
                                                    },
                                                }}
                                                render={({ field }) => (
                                                    <>
                                                        <input
                                                            id="id"
                                                            type="file"
                                                            multiple
                                                            accept="image/*,.pdf"
                                                            className="hidden"
                                                            onChange={(e) => {
                                                                const newFiles = Array.from(e.target.files);

                                                                // ✅ Merge new files with old ones (avoid duplicates)
                                                                const updatedFiles = [...idFile, ...newFiles].filter(
                                                                    (file, index, self) =>
                                                                        index === self.findIndex(f => f.name === file.name && f.lastModified === file.lastModified)
                                                                );

                                                                setIdFile(updatedFiles);
                                                                setIdFileName(updatedFiles.map((file) => file.name).join(', '));
                                                                field.onChange(updatedFiles); // update RHF
                                                            }}
                                                        />
                                                    </>
                                                )}
                                            />



<button
    type="button"
                                                onClick={() => document.getElementById('id').click()}
                                                className={`md:flex-1 w-full ${idFile?.length > 0 ? 'bg-gray-500 hover:bg-gray-600' : 'bg-orange-300 hover:bg-orange-400'
                                                    } text-white font-semibold px-4 py-2 rounded transition select-none`}
                                            >
                                                {idFile?.length > 0 ? `${idFile.length} ID(s) Selected` : 'Select ID(s)'}
                                            </button>

                                        </div>
                                        {errors.id && <p className="text-red-500 text-sm mt-1">{errors.id.message}</p>}                                    </div>
                                </div>


                            </div>
                        </div>

                        <div className=" rounded-lg shadow-lg ">
                            <button
                                type="submit"
                                onClick={() => trigger()} // ✅ Show validation error on click
                                className={`w-full text-white font-semibold py-2 rounded-md transition-all
    ${isValid ? 'bg-orange hover:bg-orange-600 cursor-pointer' : 'bg-gray-400 cursor-not-allowed'}`}
                            >
                                Create Account
                            </button>

                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Registration;
