// The one place to change currency. All amounts are stored as integer minor units (paise).
export const CURRENCY = "INR";
export const LOCALE = "en-IN";

// ponytail: assumes 2 minor digits (true for INR/USD/EUR); a currency like JPY would need this per-currency.
const MINOR_DIGITS = 2;

const formatter = new Intl.NumberFormat(LOCALE, { style: "currency", currency: CURRENCY });

export function formatMoney(minor: number): string {
  return formatter.format(minor / 10 ** MINOR_DIGITS);
}

/** "1234.5" -> 123450. Parses the string directly so there is no float rounding. */
export function toMinorUnits(input: string): number {
  const [whole, fraction = ""] = input.split(".");
  return Number(whole) * 10 ** MINOR_DIGITS + Number(fraction.padEnd(MINOR_DIGITS, "0"));
}

/** 123450 -> "1234.50", for form inputs and CSV. */
export function fromMinorUnits(minor: number): string {
  const whole = Math.floor(minor / 10 ** MINOR_DIGITS);
  const fraction = String(minor % 10 ** MINOR_DIGITS).padStart(MINOR_DIGITS, "0");
  return `${whole}.${fraction}`;
}
