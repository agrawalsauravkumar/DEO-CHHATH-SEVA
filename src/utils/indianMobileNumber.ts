export const isValidIndianMobileNumber = (value: string): boolean =>
  /^[6-9]\d{9}$/.test(value.trim());
