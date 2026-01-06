import DOMPurify from "dompurify";

/**
 * Sanitize user input to prevent XSS attacks
 * @param {string} dirty - The untrusted HTML string
 * @returns {string} - The sanitized HTML string
 */
export const sanitizeHTML = (dirty) => {
  return DOMPurify.sanitize(dirty);
};

/**
 * Escape special characters in text to prevent XSS
 * @param {string} text - The text to escape
 * @returns {string} - The escaped text
 */
export const escapeText = (text) => {
  if (typeof text !== "string") return text;
  
  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  
  return text.replace(/[&<>"']/g, (char) => map[char]);
};

/**
 * Sanitize user input for display (remove HTML tags)
 * @param {string} input - The user input
 * @returns {string} - Clean text without HTML
 */
export const cleanText = (input) => {
  if (typeof input !== "string") return input;
  
  // Remove all HTML tags
  return input.replace(/<[^>]*>/g, "").trim();
};

/**
 * Validate and sanitize URLs
 * @param {string} url - The URL to validate
 * @returns {string|null} - Valid URL or null
 */
export const sanitizeURL = (url) => {
  if (!url || typeof url !== "string") return null;
  
  try {
    const parsed = new URL(url);
    // Only allow http and https protocols
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return null;
    }
    return parsed.toString();
  } catch {
    return null;
  }
};

/**
 * Validate email format
 * @param {string} email - The email to validate
 * @returns {boolean} - Whether email is valid
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 * @param {string} password - The password to validate
 * @returns {object} - Validation result with message
 */
export const validatePassword = (password) => {
  if (password.length < 6 || password.length > 8) {
    return {
      valid: false,
      message: "Password must be 6-8 characters",
    };
  }
  
  if (!/[A-Z]/.test(password)) {
    return {
      valid: false,
      message: "Password must contain at least one uppercase letter",
    };
  }
  
  if (!/[0-9]/.test(password)) {
    return {
      valid: false,
      message: "Password must contain at least one number",
    };
  }
  
  if (!/[!@#$%^&*]/.test(password)) {
    return {
      valid: false,
      message: "Password must contain at least one special character (!@#$%^&*)",
    };
  }
  
  if (/\s/.test(password)) {
    return {
      valid: false,
      message: "Password cannot contain spaces",
    };
  }
  
  return {
    valid: true,
    message: "Password is strong",
  };
};

export default {
  sanitizeHTML,
  escapeText,
  cleanText,
  sanitizeURL,
  validateEmail,
  validatePassword,
};
