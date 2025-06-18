import React from 'react';

function InputField({
    id,
    placeholder,
    icon: Icon,
    register,
    validation,
    error,
    onKeyDown,
    onInput,
    onFocus,       // ✅ NEW
    max,           // ✅ NEW
    type = 'text'
}) {
    return (
        <div className="relative">
            {Icon && <Icon className="absolute left-3 top-4 text-black text-lg" />}
            <input
                type={type}
                id={id}
                placeholder={placeholder}
                {...register(id, validation)}
                onKeyDown={onKeyDown}
                onInput={onInput}
                onFocus={onFocus}         // ✅ NEW
                max={max}                 // ✅ NEW
                className="peer pl-10 pt-3 pb-3 w-full rounded border border-gray-300 focus:outline-none focus:border-orange transition-all placeholder-transparent"
            />
            <label
                htmlFor={id}
                className="absolute left-10 -top-2.5 text-sm bg-white text-black transition-all 
          peer-placeholder-shown:top-4 peer-placeholder-shown:text-gray-500 
          peer-focus:-top-2.5 peer-focus:text-sm peer-focus:font-semibold 
          peer-not-placeholder-shown:font-semibold"
            >
                {placeholder}
            </label>
            {error && <p className="text-red-500 text-sm mt-1">{error.message}</p>}
        </div>
    );
}

export default InputField;
