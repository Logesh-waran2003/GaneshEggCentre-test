import { SaleItem } from "../types";

export function calculateSaleTotal(items: SaleItem[]): number {
  return items.reduce((sum, item) => {
    const trayAmount = item.qtyTrays * item.rateApplied;
    const looseAmount = item.qtyLoose * item.rateApplied;
    return sum + trayAmount + looseAmount;
  }, 0);
}

export function calculateSaleItemAmount(quantity: number, rate: number): number {
  return quantity * rate;
}

export function calculateCreditAmount(totalAmount: number, paidAmount: number): number {
  return totalAmount - paidAmount;
}

export function calculateAdjustedRate(baseRate: number, adjustment: number): number {
  return baseRate + adjustment;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatQuantity(quantity: number, unit: string): string {
  return `${quantity} ${unit}`;
}
