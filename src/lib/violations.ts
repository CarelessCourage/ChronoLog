// Violation tracking system
const MAX_VIOLATIONS = 3;
const VIOLATION_STORAGE_KEY = 'chronolog_violations';

export function getViolationCount(): number {
  const stored = localStorage.getItem(VIOLATION_STORAGE_KEY);
  return stored ? parseInt(stored, 10) : 0;
}

export function addViolation(): number {
  const current = getViolationCount();
  const newCount = current + 1;
  localStorage.setItem(VIOLATION_STORAGE_KEY, newCount.toString());
  return newCount;
}

export function resetViolations(): void {
  localStorage.setItem(VIOLATION_STORAGE_KEY, '0');
}

export function isFired(): boolean {
  return getViolationCount() >= MAX_VIOLATIONS;
}

export function getRemainingViolations(): number {
  return Math.max(0, MAX_VIOLATIONS - getViolationCount());
}
