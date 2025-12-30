/**
 * Payment method configuration based on country and business type
 * Implements regulatory compliance for different regions
 */

// Countries with restrictions on international payments
const PAYMENT_RESTRICTIONS = {
  IN: {
    // India: Only registered businesses can accept international payments
    individual: {
      allowInternational: false,
      localMethods: ["upi", "netbanking", "card"],
      displayName: "India (Local Methods Only)",
      message: "As per Indian regulations, individuals can only accept domestic payments. Please upgrade your business type to accept international payments."
    },
    sole_proprietor: {
      allowInternational: true,
      localMethods: ["upi", "netbanking", "card"],
      internationalMethods: ["card", "bank_transfer"],
      displayName: "India (Registered Business)"
    },
    llp: {
      allowInternational: true,
      localMethods: ["upi", "netbanking", "card"],
      internationalMethods: ["card", "bank_transfer"],
      displayName: "India (LLP)"
    },
    company: {
      allowInternational: true,
      localMethods: ["upi", "netbanking", "card"],
      internationalMethods: ["card", "bank_transfer"],
      displayName: "India (Company)"
    }
  },
  MY: {
    // Malaysia: FPX for local, Stripe for international
    individual: {
      allowInternational: true,
      localMethods: ["fpx", "card"],
      internationalMethods: ["card"],
      displayName: "Malaysia (Individual)",
      message: "Malaysian individuals can accept payments via FPX (local) or card (international)."
    },
    sole_proprietor: {
      allowInternational: true,
      localMethods: ["fpx", "card"],
      internationalMethods: ["card", "bank_transfer"],
      displayName: "Malaysia (Sole Proprietor)"
    },
    llp: {
      allowInternational: true,
      localMethods: ["fpx", "card"],
      internationalMethods: ["card", "bank_transfer"],
      displayName: "Malaysia (LLP)"
    },
    company: {
      allowInternational: true,
      localMethods: ["fpx", "card"],
      internationalMethods: ["card", "bank_transfer"],
      displayName: "Malaysia (Company)"
    }
  }
};

const PAYMENT_METHOD_DETAILS = {
  upi: {
    name: "UPI",
    description: "Unified Payments Interface",
    icon: "💳",
    region: "IN"
  },
  fpx: {
    name: "FPX",
    description: "Faster Payments Transfer",
    icon: "🏦",
    region: "MY"
  },
  netbanking: {
    name: "Net Banking",
    description: "Direct bank transfer",
    icon: "🏧",
    region: "IN"
  },
  card: {
    name: "Debit/Credit Card",
    description: "Visa, Mastercard, etc.",
    icon: "💳",
    region: "GLOBAL"
  },
  bank_transfer: {
    name: "Bank Transfer",
    description: "Direct bank account transfer",
    icon: "🏦",
    region: "GLOBAL"
  }
};

export const getAvailablePaymentMethods = (sellerCountry, sellerBusinessType, buyerCountry) => {
  const countryCode = sellerCountry?.toUpperCase();
  const businessType = sellerBusinessType || "individual";
  
  // Check if country has restrictions
  if (PAYMENT_RESTRICTIONS[countryCode]) {
    const restrictions = PAYMENT_RESTRICTIONS[countryCode][businessType];
    
    if (!restrictions) {
      // Default to unrestricted payment methods
      return {
        methods: ["card"],
        allowInternational: true,
        message: null
      };
    }

    const isInternational = buyerCountry && buyerCountry !== sellerCountry;
    
    let availableMethods = [...restrictions.localMethods];
    
    if (isInternational && restrictions.allowInternational && restrictions.internationalMethods) {
      availableMethods = [...new Set([...availableMethods, ...restrictions.internationalMethods])];
    }

    return {
      methods: availableMethods,
      allowInternational: restrictions.allowInternational,
      displayName: restrictions.displayName,
      message: restrictions.message,
      localMethods: restrictions.localMethods,
      internationalMethods: restrictions.internationalMethods
    };
  }

  // Default: no restrictions
  return {
    methods: ["card"],
    allowInternational: true,
    message: null
  };
};

export const getPaymentMethodDetails = (methodCode) => {
  return PAYMENT_METHOD_DETAILS[methodCode] || null;
};

export const shouldShowPaymentWarning = (sellerCountry, sellerBusinessType, buyerCountry) => {
  const countryCode = sellerCountry?.toUpperCase();
  
  if (!PAYMENT_RESTRICTIONS[countryCode]) return null;
  
  const restrictions = PAYMENT_RESTRICTIONS[countryCode][sellerBusinessType];
  
  if (!restrictions) return null;
  
  const isInternational = buyerCountry && buyerCountry !== sellerCountry;
  
  if (isInternational && !restrictions.allowInternational) {
    return {
      warning: true,
      message: restrictions.message,
      title: `Payment Restriction: ${restrictions.displayName}`
    };
  }

  return null;
};

export const isPaymentMethodAvailable = (method, sellerCountry, sellerBusinessType, buyerCountry) => {
  const { methods } = getAvailablePaymentMethods(sellerCountry, sellerBusinessType, buyerCountry);
  return methods.includes(method);
};
