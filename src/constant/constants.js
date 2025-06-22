export const truncateLetters = (text, charLimit = 30) => {
    if (!text) return '';
    return text.length > charLimit ? text.slice(0, charLimit) + '...' : text;
};