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
    const [idUrls, setIdUrls] = useState([]); // ✅ array of URLs
    const [photoFile, setPhotoFile] = useState(null);
    const [idFiles, setIdFiles] = useState([]); // ✅ array of files

    const { session, dpProfile, setdpProfile ,selectedDpId} = useAuth();
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

    const isChanged = useMemo(() => {
        if (!initialState) return false;
        return (
            fields.name !== initialState.name ||
            fields.dob !== initialState.dob ||
            fields.street !== initialState.street ||
            fields.state !== initialState.state ||
            fields.city !== initialState.city ||
            fields.pincode !== initialState.pincode ||
            photoUrl !== initialState.photo_url ||
            JSON.stringify(idUrls) !== JSON.stringify(initialState.id_url)
        );
    }, [fields, photoUrl, idUrls, initialState]);

    const handleFileChange = (e, setUrl, setFile, isMultiple = false, replace = false) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        const fileData = files.map(file => ({
            url: URL.createObjectURL(file),
            type: file.type, // like "application/pdf" or "image/png"
            name: file.name,
        }));

        if (isMultiple) {
            if (replace) {
                setUrl(fileData);
                setFile(files);
            } else {
                setUrl(prev => [...prev, ...fileData]);
                setFile(prev => [...prev, ...files]);
            }
        } else {
            const file = files[0];
            setUrl({
                url: URL.createObjectURL(file),
                type: file.type,
                name: file.name,
            });
            setFile(file);
        }
    };
    
    
    
    

    const uploadFile = async (file, bucket) => {
        const ext = file.name.split('.').pop();
        const filePath = `${Date.now()}-${file.name}`;

        const { data, error } = await supabase.storage
            .from(bucket)
            .upload(filePath, file, { cacheControl: '3600', upsert: true });

        if (error) throw new Error(error.message);

        const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(filePath);
        return urlData.publicUrl;
    };
    const DpId = dpProfile?.dp_id || selectedDpId; // ✅ fallback

    useEffect(() => {
        async function fetchData() {
            if (!session?.user?.id) return;
            setLoading(true);

            const { data, error } = await supabase
                .from('delivery_partner')
                .select('*')
                .eq('dp_id', DpId)
                .single();

            if (data) {
                console.log("dpData",data)
                reset({
                    name: data.name || '',
                    dob: data.dob || '',
                    street: data.street || '',
                    pincode: data.pincode || '',
                    city: data.city || '',
                    state: data.state || '',
                });
                setPhotoUrl(data.photo_url || '');
                setIdUrls(data.id_url || []);

                setInitialState({
                    name: data.name || '',
                    dob: data.dob || '',
                    street: data.street || '',
                    pincode: data.pincode || '',
                    city: data.city || '',
                    state: data.state || '',
                    photo_url: data.photo_url || '',
                    id_url: data.id_url || []
                });
            }
            if (error) console.error('❌ Fetch error:', error.message);
            setLoading(false);
        }
        fetchData();
    }, [session?.user?.id, reset]);

    const onSubmit = async (formData) => {
        setLoading(true);
        try {
            const uploadedPhoto = photoFile ? await uploadFile(photoFile, 'dp-photo') : photoUrl;

            const uploadedIdUrls = [...idUrls];
            if (idFiles.length > 0) {
                uploadedIdUrls.length = 0; // clear existing if uploading new
                for (const file of idFiles) {
                    const url = await uploadFile(file, 'dp-id');
                    uploadedIdUrls.push(url);
                }
            }

            const payload = {
                u_id: dpProfile?.u_id,
                dp_id: DpId,
                name: formData.name,
                dob: formData.dob,
                street: formData.street,
                pincode: formData.pincode,
                city: formData.city,
                state: formData.state,
                photo_url: uploadedPhoto,
                id_url: uploadedIdUrls
            };

            const { data, error } = await supabase
                .from('delivery_partner')
                .upsert(payload, { onConflict: 'dp_id' })
                .select()
                .single(); // ✅ ye updated data return karega
          

            if (error) {
                toast.error('Update failed');
                console.error("Supabase error:", error);
            } else {
                setdpProfile(data);
                toast.success('Profile updated');
                navigate('/home');
            }
        } catch (err) {
            toast.error('Upload failed');
            console.error("Upload error:", err.message);
        }
        setLoading(false);
    };

    return (
        <div className='max-w-2xl mx-auto   '>
            {/* <Header title='Profile'/> */}
            <div className="max-w-2xl mx-auto mt-10 border pt-12 bg-white p-6  min-h-[88vh]  shadow-xl  border-gray-200">
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
                            max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}  // 🔥 This is the key
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

                    {/* Upload Photo & ID Proof section */}
                    <div className="flex flex-col md:flex-row md:items-start md:gap-8">
                        {/* Upload Photo */}
                        <div className="mb-6 md:mb-0 md:w-1/3">
                            <label className="block text-gray-700 font-medium mb-2">Upload Photo</label>
                            {photoUrl && (
                                <img
                                    src={photoUrl?.url || photoUrl}
                                    alt="Photo"
                                    className="w-28 h-28 object-cover rounded-full mb-2 border shadow-sm"
                                />
                            )}
                            <button
                                type="button"
                                onClick={() => photoInputRef.current.click()}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 mt-2 rounded-md transition"
                            >
                                Select Photo
                            </button>
                            <input
                                type="file"
                                hidden
                                ref={photoInputRef}
                                onChange={(e) => handleFileChange(e, setPhotoUrl, setPhotoFile,false,true)}
                            />
                        </div>

                        {/* Upload ID Proof */}
                        <div className="md:w-2/3">
                            <label className="block text-gray-700 font-medium mb-2">Upload ID Proof</label>

                            {/* ID Previews */}
                            {Array.isArray(idUrls) && idUrls.length > 0 && (
                                <div className="flex flex-wrap gap-4 mb-4">
                                    {idUrls.map((file, index) => {
                                        // If it's object (from new uploads), use type; if string (from backend), check extension
                                        const fileUrl = typeof file === "string" ? file : file.url;
                                        const fileType = typeof file === "string"
                                            ? (file.endsWith(".pdf") ? "application/pdf" : "image")
                                            : file.type;

                                        const isPDF = fileType === "application/pdf";

                                        return isPDF ? (
                                            <div
                                                key={index}
                                                className="w-28 h-28 p-3 border border-gray-300 rounded-md bg-gray-50 shadow-sm"
                                            >
                                                <p className="text-sm text-gray-600 font-medium mb-2">PDF Uploaded</p>
                                                <a
                                                    href={fileUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-indigo-600 underline hover:text-indigo-800 text-sm"
                                                >
                                                    🔗 View PDF
                                                </a>
                                            </div>
                                        ) : (
                                            <img
                                                key={index}
                                                src={fileUrl}
                                                alt={`ID Proof ${index + 1}`}
                                                className="w-28 h-28 object-cover rounded-md border shadow"
                                            />
                                        );
                                    })}
                                </div>
                            )}


                            {/* Upload Button */}
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
                                multiple
                                ref={idInputRef}
                                onChange={(e) => handleFileChange(e, setIdUrls, setIdFiles, true, true)}
                            />
                        </div>
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
