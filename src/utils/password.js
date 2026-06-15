// Password generation utility

const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';
const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const NUMBERS = '0123456789';
const SYMBOLS = '!@#$%^&*()_+-=[]{}|;:,.<>?~';

const SIMILAR_LOWERCASE = 'il';
const SIMILAR_UPPERCASE = 'IO';
const SIMILAR_NUMBERS = '01';

export function generatePassword(options) {
  let chars = '';
  
  if (options.lowercase) chars += LOWERCASE;
  if (options.uppercase) chars += UPPERCASE;
  if (options.numbers) chars += NUMBERS;
  if (options.symbols) chars += SYMBOLS;

  if (chars === '') {
    chars = LOWERCASE + UPPERCASE + NUMBERS;
  }

  if (options.excludeSimilar) {
    let filtered = '';
    for (const c of chars) {
      const isSimilar =
        (LOWERCASE.includes(c) && SIMILAR_LOWERCASE.includes(c)) ||
        (UPPERCASE.includes(c) && SIMILAR_UPPERCASE.includes(c)) ||
        (NUMBERS.includes(c) && SIMILAR_NUMBERS.includes(c));
      if (!isSimilar) filtered += c;
    }
    chars = filtered;
  }

  const length = Math.min(Math.max(options.length, 4), 128);
  let password = '';

  // Ensure at least one char from each selected set
  if (options.lowercase) password += pickRandom(LOWERCASE, options.excludeSimilar ? SIMILAR_LOWERCASE : '');
  if (options.uppercase) password += pickRandom(UPPERCASE, options.excludeSimilar ? SIMILAR_UPPERCASE : '');
  if (options.numbers) password += pickRandom(NUMBERS, options.excludeSimilar ? SIMILAR_NUMBERS : '');
  if (options.symbols) password += SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];

  // Fill the rest randomly
  for (let i = password.length; i < length; i++) {
    password += chars[Math.floor(Math.random() * chars.length)];
  }

  // Shuffle using Fisher-Yates
  const arr = password.split('');
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }

  return arr.join('');
}

function pickRandom(charset, exclude) {
  let pool = charset;
  if (exclude) {
    pool = '';
    for (const c of charset) {
      if (!exclude.includes(c)) pool += c;
    }
  }
  return pool[Math.floor(Math.random() * pool.length)];
}

export function getPasswordStrength(password) {
  const length = password.length;
  let score = 0;

  // Length scoring
  if (length >= 8) score += 20;
  if (length >= 12) score += 15;
  if (length >= 16) score += 15;
  if (length >= 24) score += 10;

  // Character variety
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSymbol = /[^a-zA-Z0-9]/.test(password);

  const typesUsed = [hasLower, hasUpper, hasNumber, hasSymbol].filter(Boolean).length;
  score += typesUsed * 10;

  // Bonus for mixed types
  if (hasLower && hasUpper) score += 5;
  if (hasNumber && hasSymbol) score += 5;
  if (typesUsed >= 3) score += 5;
  if (typesUsed >= 4) score += 5;

  // Bonus for no consecutive same-type chars
  let hasMixedSequence = true;
  let prevType = '';
  for (const c of password) {
    let type = 'other';
    if (/[a-z]/.test(c)) type = 'lower';
    else if (/[A-Z]/.test(c)) type = 'upper';
    else if (/[0-9]/.test(c)) type = 'number';
    if (type === prevType) hasMixedSequence = false;
    prevType = type;
  }
  if (hasMixedSequence) score += 5;

  // Clamp to 0-100
  score = Math.max(0, Math.min(100, score));

  if (score < 30) return { label: 'Weak', color: '#ef4444', score };
  if (score < 55) return { label: 'Fair', color: '#f97316', score };
  if (score < 75) return { label: 'Good', color: '#eab308', score };
  if (score < 90) return { label: 'Strong', color: '#22c55e', score };
  return { label: 'Very Strong', color: '#16a34a', score };
}
