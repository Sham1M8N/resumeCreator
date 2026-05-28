const TAILORING_KEY = 'resume_tailoring_uses';
const FREE_MAX = 3;
const PRO_MAX = 20;

export function getTailoringUses() {
  return parseInt(localStorage.getItem(TAILORING_KEY) || '0', 10);
}

export function getTailoringRemaining(isPaid) {
  const max = isPaid ? PRO_MAX : FREE_MAX;
  return Math.max(0, max - getTailoringUses());
}

export function incrementTailoringUses() {
  const current = getTailoringUses();
  localStorage.setItem(TAILORING_KEY, String(current + 1));
}

export function canTailor(isPaid) {
  return getTailoringRemaining(isPaid) > 0;
}
