/**
 * Normalizes Certificate IDs to ensure consistent storage and lookup.
 * Removes whitespace and trailing hyphens.
 * 
 * @param {string} id - The ID to normalize
 * @returns {string|null} - The normalized ID or null if input is invalid
 */
const normalizeCertId = (id) => {
    if (!id) return null;
    return id
        .trim()
        .replace(/\s+/g, '')       // Remove all spaces
        .replace(/-+$/g, '');      // Remove trailing hyphens
};

module.exports = { normalizeCertId };
