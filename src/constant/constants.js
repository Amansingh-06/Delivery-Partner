export const truncateLetters = (text, charLimit = 30) => {
    if (!text) return '';
    return text.length > charLimit ? text.slice(0, charLimit) + '...' : text;
};

export function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }