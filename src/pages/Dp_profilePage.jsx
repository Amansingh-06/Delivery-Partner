import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '../utils/Supabase';
import toast from 'react-hot-toast';
import { useAuth } from '../Context/authContext';
import Header from './Header';
import BottomNav from '../components/Footer';
import { cityStateInputClean, cityStateKeyDown, cityStateValidation, InputCleanup, nameKeyDownHandler, nameValidation, pincodeInputClean, pincodeKeyDown, pincodeValidation, streetInputClean, streetKeyDown, streetValidation } from '../utils/Validation';
import Loader from '../components/Loader';
import { useNavigate } from 'react-router-dom';

export default function DpProfile() {
    const [loading, setLoading] = useState(false);
    const [initialState, setInitialState] = useState(null);
    const [photoUrl, setPhotoUrl] = useState('');
    const [idUrl, setIdUrl] = useState('');
    const [photoFile, setPhotoFile] = useState(null);
    const [idFile, setIdFile] = useState(null);

    const { session, dpProfile } = useAuth(); // ✅ session from context
    console.log("🔥 Session:", session);
    console.log("🔥 dpProfile:", dpProfile);

    const photoInputRef = useRef(null);
    const idInputRef = useRef(null);

    const {
        register,
        handleSubmit,
        reset,
        watch,
        setValue,
        formState: { errors }
    } = useForm({ mode: 'onChange' });
    const navigate = useNavigate();
    const fields = watch();
    console.log("👀 Form Fields:", fields);

    const isChanged = useMemo(() => {
        if (!initialState) return false;

        const result = (
            fields.name !== initialState.name ||
            fields.dob !== initialState.dob ||
            fields.street !== initialState.street ||
            fields.state !== initialState.state ||
            fields.city !== initialState.city ||
            fields.pincode !== initialState.pincode ||
            photoUrl !== initialState.photo_url ||
            idUrl !== initialState.id_url
        );
        console.log("🔁 isChanged:", result);
        return result;
    }, [fields, photoUrl, idUrl, initialState]);

    const handleFileChange = (e, setUrl, setFile) => {
        const file = e.target.files[0];
        console.log("📂 Selected File:", file);
        if (!file) return;
        setUrl(URL.createObjectURL(file));
        setFile(file);
    };

    const uploadFile = async (file, bucket) => {
        if (!file) return null;
        const ext = file.name.split('.').pop();
        const filePath = `${Date.now()}.${ext}`;
        console.log(`📤 Uploading ${file.name} to bucket '${bucket}' as '${filePath}'`);

        const { data, error } = await supabase.storage
            .from(bucket)
            .upload(filePath, file, { cacheControl: '3600', upsert: true });

        if (error) {
            console.error("❌ Upload Error:", error);
            toast.error('Upload failed');
            throw new Error(error.message);
        }

        const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(filePath);
        console.log("✅ Uploaded File URL:", urlData.publicUrl);
        return urlData.publicUrl;
    };

    useEffect(() => {
        async function fetchData() {
            if (!session?.user?.id) return;
            console.log("📡 Fetching delivery_partner data for u_id:", session.user.id);
            setLoading(true);

            const { data, error } = await supabase
                .from('delivery_partner')
                .select('*')
                .eq('u_id', session.user.id)
                .single();

            if (data) {
                console.log("✅ Fetched Data:", data);
                reset({
                    name: data.name || '',
                    dob: data.dob || '',
                    street: data.street || '',
                    pincode: data.pincode || '',
                    city: data.city || '',
                    state: data.state || '',
                });
                setPhotoUrl(data.photo_url || '');
                setIdUrl(data.id_url || '');

                setInitialState({
                    name: data.name || '',
                    dob: data.dob || '',
                    street: data.street || '',
                    pincode: data.pincode || '',
                    city: data.city || '',
                    state: data.state || '',
                    photo_url: data.photo_url || '',
                    id_url: data.id_url || ''
                });
            }

            if (error) console.error('❌ Fetch error:', error.message);
            setLoading(false);
        }

        fetchData();
    }, [session?.user?.id, reset]);

    const onSubmit = async (formData) => {
        console.log("🚀 Form submitted with data:", formData);
        setLoading(true);
        try {
            const uploadedPhoto = photoFile ? await uploadFile(photoFile, 'dp-photo') : photoUrl;
            const uploadedId = idFile ? await uploadFile(idFile, 'dp-id') : idUrl;
            console.log("📸 Final Uploaded Photo URL:", uploadedPhoto);
            console.log("🆔 Final Uploaded ID URL:", uploadedId);

            const payload = {
                u_id: session?.user?.id,
                dp_id: dpProfile?.dp_id,
                name: formData.name,
                dob: formData.dob,
                street: formData.street,
                pincode: formData.pincode,
                city: formData.city,
                state: formData.state,
                photo_url: uploadedPhoto,
                id_url: uploadedId
            };
            console.log("📦 Final Payload for upsert:", payload);

            const { error } = await supabase
                .from('delivery_partner')
                .upsert(payload, { onConflict: 'u_id' });

            if (error) {
                toast.error('Update failed');
                console.log("❌ Supabase Error:", error);
                console.log("📋 Error Details:", error.details);
                console.log("📋 Error Message:", error.message);
            } else {
                toast.success('Profile updated');
                console.log("✅ Profile updated successfully");
                navigate('/home');
            }
        } catch (err) {
            console.error("❌ Upload failed:", err.message);
            toast.error('Upload failed');
        }
        setLoading(false);
    };


    return (
        <div className='max-w-2xl mx-auto mb-10 p'>
            <Header title='Profile'/>
            <div className="max-w-2xl mx-auto mt-10 bg-white p-6 mb-10 rounded-2xl shadow-xl border border-gray-200">
{loading && <Loader/>}
                {/* <h2 className="text-3xl font-semibold mb-6 text-indigo-700 border-b pb-2">Delivery Partner Profile</h2> */}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mb-10">

                    {/* Full Name */}
                    <div>
                        <label className="block text-gray-700 font-medium mb-1">Full Name</label>
                        <input
                            {...register('name', nameValidation)}
                            onKeyDown={nameKeyDownHandler}
                            onInput={InputCleanup}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring focus:ring-indigo-200 outline-none"
                            placeholder="Enter your full name"
                        />
                        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
                    </div>

                    {/* Date of Birth */}
                    <div>
                        <label className="block text-gray-700 font-medium mb-1">Date of Birth</label>
                        <input
                            type="date"
                            {...register('dob', { required: 'Date of birth is required' })}
                            onFocus={(e) => e.target.showPicker?.()} // opens calendar on every click
                            max={new Date().toISOString().split('T')[0]} // disables future dates
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring focus:ring-indigo-200 outline-none"
                        />

                        {errors.dob && <p className="text-red-500 text-sm mt-1">{errors.dob.message}</p>}
                    </div>

                    {/* Street Address */}
                    <div>
                        <label className="block text-gray-700 font-medium mb-1">Street</label>
                        <input
                            {...register('street', streetValidation)}
                            onKeyDown={streetKeyDown}
                            onInput={streetInputClean}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring focus:ring-indigo-200 outline-none"
                            placeholder="Street address"
                        />
                        {errors.street && <p className="text-red-500 text-sm mt-1">{errors.street.message}</p>}
                    </div>

                    {/* City */}
                    <div>
                        <label className="block text-gray-700 font-medium mb-1">City</label>
                        <input
                            {...register('city', cityStateValidation)}
                            onKeyDown={cityStateKeyDown}
                            onInput={cityStateInputClean}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring focus:ring-indigo-200 outline-none"
                            placeholder="City"
                        />
                        {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>}
                    </div>

                    {/* State */}
                    <div>
                        <label className="block text-gray-700 font-medium mb-1">State</label>
                        <input
                            {...register('state', cityStateValidation)}
                            onKeyDown={cityStateKeyDown}
                            onInput={cityStateInputClean}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring focus:ring-indigo-200 outline-none"
                            placeholder="State"

                        />
                        {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state.message}</p>}
                    </div>

                    {/* Pincode */}
                    <div>
                        <label className="block text-gray-700 font-medium mb-1">Pincode</label>
                        <input
                            {...register('pincode', pincodeValidation)}
                            onInput={pincodeInputClean}
                            onKeyDown={pincodeKeyDown}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring focus:ring-indigo-200 outline-none"
                            placeholder="6-digit PIN"
                        />
                        {errors.pincode && <p className="text-red-500 text-sm mt-1">{errors.pincode.message}</p>}
                    </div>

                    {/* Upload Photo */}
                    <div>
                        <label className="block text-gray-700 font-medium mb-1">Upload Photo</label>
                        {photoUrl && (
                            <img
                                src={photoUrl}
                                alt="Photo"
                                className="w-28 h-28 object-cover rounded-full mb-2 border shadow-sm"
                            />
                        )}
                        <button
                            type="button"
                            onClick={() => photoInputRef.current.click()}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-md transition"
                        >
                            Select Photo
                        </button>
                        <input
                            type="file"
                            hidden
                            ref={photoInputRef}
                            onChange={(e) => handleFileChange(e, setPhotoUrl, setPhotoFile)}
                        />
                    </div>

                    {/* Upload ID Proof */}
                    <div>
                        <label className="block text-gray-700 font-medium mb-1">Upload ID Proof</label>

                        {idUrl && (
                            idUrl.endsWith('.pdf') ? (
                                <div className="p-4 border border-gray-300 rounded-md bg-gray-50 shadow-sm mb-2">
                                    <p className="text-sm text-gray-600 mb-1 font-medium">PDF Uploaded</p>
                                    <a
                                        href={idUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-indigo-600 underline hover:text-indigo-800 text-sm"
                                    >
                                        🔗 View PDF
                                    </a>
                                </div>
                            ) : (
                                <img
                                    src={idUrl}
                                    alt="ID Proof"
                                    className="w-28 h-28 object-cover rounded-md mb-2 border shadow"
                                />
                            )
                        )}

                        <button
                            type="button"
                            onClick={() => idInputRef.current.click()}
                            className="bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 rounded-md transition"
                        >
                            Select ID Proof
                        </button>
                        <input
                            type="file"
                            hidden
                            ref={idInputRef}
                            onChange={(e) => handleFileChange(e, setIdUrl, setIdFile)}
                        />
                    </div>

                    {/* Save Button */}
                    <button
                        type="submit"
                        disabled={loading || !isChanged}
                        className={`w-full py-3 rounded-md font-semibold transition ${loading || !isChanged
                            ? 'bg-gray-400 text-white cursor-not-allowed'
                            : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                            }`}
                    >
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                </form>
            </div>
            <BottomNav/>
        </div>
       
      
      
    );
}
