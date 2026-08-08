const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
  'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

export function twoDigits(n) {
  if (n < 20) return ones[n];
  return `${tens[Math.floor(n / 10)]}${n % 10 ? ' ' + ones[n % 10] : ''}`;
}

export function threeDigits(n) {
  const hundred = Math.floor(n / 100);
  const rest = n % 100;
  let out = '';
  if (hundred) out += `${ones[hundred]} Hundred`;
  if (hundred && rest) out += ' ';
  if (rest) out += twoDigits(rest);
  return out;
}

// Convert a number into Indian Number System words (e.g. 123456 -> One Lakh Twenty Three Thousand...)
export function numberToWords(num) {
  if (!num || num <= 0) return 'Zero';
  const value = Math.floor(Number(num));
  let out = '';
  const crore = Math.floor(value / 10000000);
  const lakh = Math.floor((value % 10000000) / 100000);
  const thousand = Math.floor((value % 100000) / 1000);
  const hundred = Math.floor((value % 1000) / 100);
  const lastTwo = value % 100;

  if (crore) out += `${threeDigits(crore)} Crore`;
  if (lakh) out += (out ? ' ' : '') + `${threeDigits(lakh)} Lakh`;
  if (thousand) out += (out ? ' ' : '') + `${threeDigits(thousand)} Thousand`;
  if (hundred) out += (out ? ' ' : '') + `${ones[hundred]} Hundred`;
  if (lastTwo) out += (out ? ' ' : '') + twoDigits(lastTwo);
  return out;
}

// Number in words with right-justified meaning (a bill-friendly helper)
export function amountInWords(amount) {
  const rupees = Math.floor(amount);
  const paise = Math.round((amount - rupees) * 100);
  let words = `Rupees ${numberToWords(rupees)} Only`;
  if (paise > 0) {
    words = `Rupees ${numberToWords(rupees)} and ${numberToWords(paise)} Paise Only`;
  }
  return words;
}

export function formatINR(n) {
  return Number(n || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}