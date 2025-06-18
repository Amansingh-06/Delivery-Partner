// validationRules.js

export const nameValidation = {
    required: "Name is required",
    validate: (value) => {
        if (!/^[A-Za-z]+(?: [A-Za-z]+)*$/.test(value.trim())) {
            return "Only characters and single spaces (not at start)";
        }
        if (value.replace(/\s/g, "").length < 3) {
            return "At least 3 letters required (excluding spaces)";
        }
        return true;
    },
};

export const nameKeyDownHandler = (e) => {
    const key = e.key;
    const isLetter = /^[a-zA-Z]$/.test(key);
    const allowedKeys = ['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete'];
    const isSpaceAllowed =
        key === ' ' && /^[a-zA-Z]$/.test(e.currentTarget.value.slice(-1));
    if (!(isLetter || allowedKeys.includes(key) || isSpaceAllowed)) {
        e.preventDefault();
    }
    if (key === ' ' && e.currentTarget.value.length === 0) {
        e.preventDefault();
    }
};

export const InputCleanup = (e) => {
    const value = e.currentTarget.value;
    e.currentTarget.value = value
        .replace(/[^a-zA-Z ]/g, "")
        .replace(/^\s+/, "")
        .replace(/\s{2,}/g, " ");
};

// Similarly for shop name:
export const shopNameValidation = {
    required: "Shop Name is required",
    validate: (value) => {
        if (/^\s/.test(value)) return "Cannot start with space";
        if (!/^[A-Za-z0-9 ]+$/.test(value.trim())) return "Only letters, numbers, and spaces allowed";
        return true;
    },
};

export const shopNameKeyDownHandler = (e) => {
    const allowedChars = /^[a-zA-Z0-9 ]$/;
    const controlKeys = ["Backspace", "ArrowLeft", "ArrowRight", "Tab", "Delete"];

    if (e.key === " " && e.currentTarget.selectionStart === 0) {
        e.preventDefault();
    }

    if (!allowedChars.test(e.key) && !controlKeys.includes(e.key)) {
        e.preventDefault();
    }
};

export const streetValidation = {
    required: "Street is required",
    validate: (value) => {
        if (!value.trim()) return "Street is required";
        if (/^\s/.test(value)) return "Street cannot start with space";
        if (!/^[A-Za-z0-9 ,.\-#\/']+$/.test(value)) return "Invalid characters in street";
        return true;
    },
};
export const streetKeyDown = (e) => {
    const allowed = ["Backspace", "ArrowLeft", "ArrowRight", "Tab", "Delete"];
    if (!allowed.includes(e.key) && !/^[a-zA-Z0-9 ,.\-#\/']$/.test(e.key)) e.preventDefault();
    if (e.key === " " && e.currentTarget.selectionStart === 0) e.preventDefault();
};
  
export const streetInputClean = (e) => {
    e.currentTarget.value = e.currentTarget.value
        .replace(/[^a-zA-Z0-9 ,.\-#\/']/g, "")
        .replace(/^\s+/, "")
        .replace(/\s{2,}/g, " ");
};
  
// 🌆 CITY & STATE (Only letters + spaces)
export const cityStateValidation = {
    required: "This field is required",
    validate: (value) => {
        if (!value.trim()) return "This field is required";
        if (/^\s/.test(value)) return "Cannot start with space";
        if (!/^[A-Za-z]+(\s[A-Za-z]+)*$/.test(value)) return "Only letters and single spaces allowed";
        return true;
    },
};
export const cityStateKeyDown = (e) => {
    const allowed = ["Backspace", "ArrowLeft", "ArrowRight", "Tab", "Delete"];
    if (!allowed.includes(e.key) && !/^[a-zA-Z ]$/.test(e.key)) e.preventDefault();
    if (e.key === " " && e.currentTarget.selectionStart === 0) e.preventDefault();
};
export const cityStateInputClean = (e) => {
    e.currentTarget.value = e.currentTarget.value
        .replace(/[^a-zA-Z ]/g, "")
        .replace(/^\s+/, "")
        .replace(/\s{2,}/g, " ");
};
  
// 🔢 PINCODE
export const pincodeValidation = {
    required: "Pincode is required",
    validate: (value) => {
        if (!/^\d{6}$/.test(value)) return "Pincode must be exactly 6 digits";
        return true;
    },
};
export const pincodeKeyDown = (e) => {
    const allowed = ["Backspace", "ArrowLeft", "ArrowRight", "Tab", "Delete"];
    if (!allowed.includes(e.key) && !/^[0-9]$/.test(e.key)) e.preventDefault();
};
export const pincodeInputClean = (e) => {
    e.currentTarget.value = e.currentTarget.value.replace(/\D/g, "").slice(0, 6);
};
  
//Preparation Time
export const preparationTimeValidation = {
    required: "Preparation time is required",
    validate: (value) => {
        if (!value.trim()) return "Preparation time is required";
        if (/^\s/.test(value)) return "Cannot start with space";
        if (!/^[0-9]+[a-zA-Z0-9]*(?: [a-zA-Z0-9]+)?$/.test(value)) {
            return "Start with number; only letters/numbers allowed; max one space";
        }
        return true;
    },
};

export const preparationTimeKeyDown = (e) => {
    const key = e.key;
    const isAllowedKey = ['Backspace', 'ArrowLeft', 'ArrowRight', 'Tab', 'Delete'];
    const isAlphaNumeric = /^[a-zA-Z0-9]$/.test(key);
    const isSpace = key === " ";

    // ❌ Prevent space at beginning
    if (isSpace && e.currentTarget.selectionStart === 0) {
        e.preventDefault();
        return;
    }

    // ❌ Prevent first character if it's not a number
    if (
        e.currentTarget.selectionStart === 0 &&
        !/^[0-9]$/.test(key) &&
        !isAllowedKey.includes(key)
    ) {
        e.preventDefault();
        return;
    }

    // ❌ Prevent more than one space
    if (
        isSpace &&
        (e.currentTarget.value.includes(" ") ||
            e.currentTarget.selectionStart !== e.currentTarget.selectionEnd)
    ) {
        e.preventDefault();
        return;
    }

    // ❌ Block anything not alphanumeric or allowed key
    if (!isAlphaNumeric && !isAllowedKey.includes(key) && !isSpace) {
        e.preventDefault();
    }
};
  

export const preparationTimeInputClean = (e) => {
    e.currentTarget.value = e.currentTarget.value
        .replace(/[^a-zA-Z0-9 ]/g, "")  // remove special characters
        .replace(/^\s+/, "")            // remove starting spaces
        .replace(/\s{2,}/g, " ");       // allow only single space
};
  
// Numeric input validation (only digits)
export const numberOnlyValidation = {
    required: "This field is required",
    validate: (value) => {
        if (!/^\d+$/.test(value)) return "Only digits allowed (no spaces or symbols)";
        return true;
    },
};

export const numberOnlyKeyDownHandler = (e) => {
    const allowedKeys = ['Backspace', 'ArrowLeft', 'ArrowRight', 'Tab', 'Delete'];
    if (!/^\d$/.test(e.key) && !allowedKeys.includes(e.key)) {
        e.preventDefault();
    }
};
export const numberOnlyInputClean = (e) => {
    e.currentTarget.value = e.currentTarget.value.replace(/\D/g, "");
};

//price validation
export const priceValidation = {
    required: "Price is required",
    validate: (value) => {
        if (!/^\d+(\.\d{1,2})?$/.test(value)) return "Only positive numbers allowed (max 2 decimal places)";
        return true;
    },
};

export const priceKeyDownHandler = (e) => {
    const allowedKeys = ['Backspace', 'ArrowLeft', 'ArrowRight', 'Tab', 'Delete'];
    const key = e.key;
    const value = e.currentTarget.value;

    // ✅ Allow digits
    if (/^\d$/.test(key)) return;

    // ✅ Allow one decimal point
    if (key === '.' && !value.includes('.')) return;

    // ✅ Allow control keys
    if (allowedKeys.includes(key)) return;

    // ❌ Prevent everything else
    e.preventDefault();
};
export const priceInputClean = (e) => {
    // Remove invalid characters but keep valid decimal format
    let value = e.currentTarget.value;
    value = value.replace(/[^\d.]/g, "");           // remove non-digits except .
    value = value.replace(/^0+(\d)/, "$1");          // remove leading 0s before a digit
    value = value.replace(/^(\d*\.\d{0,2}).*$/, "$1"); // allow only 2 decimal places
    const dotCount = (value.match(/\./g) || []).length;
    if (dotCount > 1) value = value.replace(/\.+$/, ""); // prevent multiple dots
    e.currentTarget.value = value;
};


  
  
  
  