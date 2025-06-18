import React, { useState } from 'react';
import { useForm,Controller } from 'react-hook-form';
import { X } from 'lucide-react';
import InputField from '../components/InputField';
import Header from './Header';
import Loader from '../components/Loader';
import {toast} from 'react-hot-toast';
import { supabase } from '../utils/Supabase';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '../Context/authContext';
import { useNavigate } from 'react-router-dom';
import { GrStreetView } from "react-icons/gr";
import { PiCityLight } from "react-icons/pi";
import { PiMapPinAreaLight } from "react-icons/pi";
import { TbMapPinCode } from "react-icons/tb";
import { FaRegUser } from "react-icons/fa";
import { BsCalendar2Date } from "react-icons/bs";


import {
    nameValidation,
    nameKeyDownHandler,
    shopNameValidation,
    shopNameKeyDownHandler,
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
        formState: { errors,isValid },
        trigger
    } = useForm({ mode: 'onChange' });;

    const [photoPreview, setPhotoPreview] = useState(null);
    const [idFileName, setIdFileName] = useState('');
    const [idFile,setIdFile]=useState(null)
    const [loading, setLoading] = useState(false)
    const [photoSelected, setPhotoSelected] = useState(false);
    
    console.log(idFileName)
    const { session } = useAuth(); 
    const formattedPhone = session.user.phone.startsWith('+')
        ? session.user.phone
        : `+${session.user.phone}`;

const navigate = useNavigate()
    const uploadFile = async (file, bucketName) => {
        if (!file) return null;

        const fileExt = file?.name?.split('.')?.pop();
        const filePath = `${Date.now()}.${fileExt}`;


        const { data, error } = await supabase.storage
            .from(bucketName)
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: true,
            });

        if (error) {
            console.error('Error uploading file:', error?.message);
            toast.error("Error uploading file");
            throw new Error(error?.message); // Throw error to stop further processing
        }

        const { data: urlData, error: urlError } = supabase.storage
            .from(bucketName)
            .getPublicUrl(filePath);

        if (urlError) {
            console.error('Error getting public URL:', urlError?.message);
            throw new Error(urlError?.message); // Throw error to stop further processing
        }

        return urlData?.publicUrl;
    };

    console.log("session", session)
    console.log()
    const onSubmit = async (data) => {
        console.log(data)
        setLoading(true)
        try {
            // Step 1: Upload files
            const photoFile = data?.photo;
            console.log("photoFile", photoFile)
            console.log("IdFile",idFile)
            

            const photoUrl = await uploadFile(photoFile, 'dp-photo'); // replace with your actual bucket
            const idUrl = await uploadFile(idFile, 'dp-id');

            console.log("photoUrl",photoUrl)

            // Step 2: Insert into Supabase table
            const { error: insertError } = await supabase
                .from('delivery_partner')
                .insert([
                    {
                        
                        name: data.name,
                        dob: data.dob,
                        city: data.city,
                        street: data.Street,
                        state: data.state,
                        pincode: data.pincode,
                        photo_url: photoUrl,
                        id_url: idUrl,
                        created_ts: new Date().toISOString(),
                        mobile_no: formattedPhone,
                        u_id:session?.user?.id
                    
                    }
                ]);

            if (insertError) {
                setLoading(false)
                console.error('Error inserting data:', insertError);
                toast.error("Failed to register");
                return;
            }

            toast.success("Registration successful!");
            // 👇 Register the user
            const { data: updatedUser, error: updateError } = await supabase.auth.updateUser({
                data: { isRegistered: true },
            });

            if (updateError) {
                toast.error("User metadata update failed");
                return;
            }

            // 👇 Fetch fresh session
            const { data: sessionData } = await supabase.auth.getSession();
            if (sessionData?.session?.user?.user_metadata?.isRegistered) {
                console.log(sessionData)
                console.log("register", sessionData?.session?.user?.user_metadata?.isRegistered)
                // setSession(data.session); // context
                navigate("/home");
            } else {
                toast.error("User session not updated with registration info");
            }

            setLoading(false)
        } catch (error) {
            console.error("Registration failed:", error.message);
            toast.error("Something went wrong");
        }
    };
    

 

    const removePhotoPreview = () => {
        setPhotoPreview(null);
        setValue('photo', null); // this resets the actual input value
        trigger('photo'); // re-validate the field
    };
    

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center  ">
            {loading && <Loader/>}
            <div className="w-full max-w-2xl   space-y-4     bg-white ">
                <Header title='Registration'/>
                <div className='max-w-2xl  px-4 py-8 shadow-lg'>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl  ">
                        <div className='flex-col flex gap-8 px-6  py-8 rounded-2xl shadow-lg '>
                            <h1 className='text-2xl font-semibold text-gray-500'>Basic Details</h1>
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
                            />

                            <InputField
                                icon={BsCalendar2Date}
                                id="dob"
                                type='date'
                                placeholder="Date of Birth"
                                register={register}
                                onFocus={(e) => e.target.showPicker?.()} // opens calendar on every click
                                max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}  // 🔥 This is the key
                                validation={{ required: 'Date of Birth is required' }}
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
                                    onKeyDown={streetKeyDown}
                                    onInput={streetInputClean}
                                />
                                <InputField
                                    type='text'
                                    icon={PiCityLight}

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
                        <div className='flex-col flex gap-8 px-6 py-4 rounded-2xl shadow-lg  '>
                            <div className="flex flex-col md:flex-row gap-8 ">
                                {/* Upload Photo */}

                                <div className="flex flex-col gap-8 w-full">
                                    {/* === Upload Photo === */}
                                    <label className="block mb-2 mt-4 font-medium text-gray-700">Upload Photo</label>
                                    <div className="flex md:gap-8 gap-3 flex-col md:flex-row w-full h-40">

                                        {/* Photo Preview */}
                                        <div className="border-2 flex-1 border-dashed border-gray-400 rounded bg-white flex items-center justify-center relative overflow-hidden">
                                            {photoPreview ? (
                                                <>
                                                    <img src={photoPreview} alt="Preview" className="object-cover w-28 h-36 rounded" />
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setPhotoPreview(null);
                                                            setPhotoSelected(false); // reset state
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
                                            className={`md:flex-1 bg-${photoSelected ? 'gray-500' : 'green-600'} hover:bg-${photoSelected ? 'gray-600' : 'green-700'} text-white rounded p-2 flex items-center justify-center cursor-pointer font-semibold text-base transition select-none`}
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
                                        <label className="block mt-4 mb-2 font-medium text-gray-700">Select ID</label>
                                        <div className="flex items-center md:flex-row flex-col md:gap-8 gap-2 w-full">
                                            <div className="border border-gray-300 rounded px-5 py-2 bg-white w-full md:flex-1 overflow-hidden truncate">
                                                <span className="text-gray-700 text-sm truncate">
                                                    {idFileName || 'No ID Selected'}
                                                </span>
                                            </div>

                                            <Controller
                                                name="id"
                                                control={control}
                                                rules={{ required: 'ID is required' }}
                                                render={({ field }) => (
                                                    <>
                                                        <input
                                                            id="id"
                                                            type="file"
                                                            accept="image/*,.pdf"
                                                            className="hidden"
                                                            onChange={(e) => {
                                                                const file = e.target.files?.[0];
                                                                if (file) {
                                                                    setIdFileName(file.name);
                                                                    setIdFile(file);
                                                                    field.onChange(file); // ✅ Very Important: send to react-hook-form
                                                                } else {
                                                                    setIdFileName('');
                                                                    setIdFile(null);
                                                                    field.onChange(null); // ❌ Reset if canceled
                                                                }
                                                            }}
                                                        />
                                                    </>
                                                )}
                                            />


                                            <button
                                                type="button"
                                                onClick={() => document.getElementById('id').click()}
                                                className={`md:flex-1 w-full ${idFile ? 'bg-gray-500 hover:bg-gray-600' : 'bg-green-600 hover:bg-green-700'} text-white font-semibold px-4 py-2 rounded transition select-none`}
                                            >
                                                {idFile ? 'ID Selected' : 'Select ID'}
                                            </button>
                                        </div>
                                        {errors.id && <p className="text-red-500 text-sm mt-1">{errors.id.message}</p>}
                                    </div>
                                </div>


                            </div>
                        </div>

                        <div className="pt-2 py-3 rounded-2xl shadow-lg px-6">
                            <button
                                type="submit"
                                onClick={() => trigger()} // ✅ Show validation error on click
                                className={`w-full text-white font-semibold py-2 rounded-md transition-all
    ${isValid ? 'bg-primary hover:bg-orange-600 cursor-pointer' : 'bg-gray-400 cursor-not-allowed'}`}
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
