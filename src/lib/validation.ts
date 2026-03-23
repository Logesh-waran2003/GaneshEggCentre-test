export function validatePhone(phone: string): boolean {
  return /^[0-9]{10}$/.test(phone);
}

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validatePositiveNumber(value: number): boolean {
  return value > 0;
}

export function validateNonNegativeNumber(value: number): boolean {
  return value >= 0;
}

export function validateRequired(value: string): boolean {
  return value.trim().length > 0;
}

export function validateQuantity(quantity: number): { valid: boolean; error?: string } {
  if (!Number.isFinite(quantity)) {
    return { valid: false, error: "Quantity must be a number" };
  }
  if (quantity <= 0) {
    return { valid: false, error: "Quantity must be greater than 0" };
  }
  return { valid: true };
}

export function validateAmount(amount: number): { valid: boolean; error?: string } {
  if (!Number.isFinite(amount)) {
    return { valid: false, error: "Amount must be a number" };
  }
  if (amount < 0) {
    return { valid: false, error: "Amount cannot be negative" };
  }
  return { valid: true };
}
