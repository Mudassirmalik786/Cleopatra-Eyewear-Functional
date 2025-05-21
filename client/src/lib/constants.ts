// Format price from cents to dollars with appropriate formatting
export const formatPrice = (price: number): string => {
  const dollars = price / 100;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(dollars);
};

// Status color mappings
export const statusColors = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  confirmed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  completed: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
};

// Booking time slots
export const timeSlots = [
  "09:00", "10:00", "11:00", "12:00", "13:00", 
  "14:00", "15:00", "16:00", "17:00"
];

// Company information
export const companyInfo = {
  name: "Cleopatra Eyewear Collection",
  address: "123 Eyewear Ave, Fashion District, NY 10001",
  phone: "+1 (555) 123-4567",
  email: "contact@cleopatraeyewear.com",
  hours: "Mon-Fri: 9AM-6PM, Sat: 10AM-4PM",
  social: {
    facebook: "https://facebook.com/cleopatraeyewear",
    instagram: "https://instagram.com/cleopatraeyewear",
    twitter: "https://twitter.com/cleopatraeyewear",
    pinterest: "https://pinterest.com/cleopatraeyewear"
  }
};

// Product categories used for organizing products
export const productCategories = [
  { id: 1, name: "Sunglasses", description: "Stylish sunglasses for all occasions" },
  { id: 2, name: "Optical Frames", description: "Prescription eyeglasses with various frame styles" },
  { id: 3, name: "Blue Light Glasses", description: "Protective eyewear to filter blue light from digital screens" }
];

// Validation schema defaults
export const validationDefaults = {
  nameMinLength: 2,
  nameMaxLength: 50,
  passwordMinLength: 6,
  maxAttendees: 50
};
