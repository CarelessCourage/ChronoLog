// Violation tracking system
const MAX_VIOLATIONS = 3;
let violationCount = 0;

export function getViolationCount(): number {
  return violationCount;
}

export function addViolation(): number {
  violationCount += 1;
  return violationCount;
}

export function resetViolations(): void {
  violationCount = 0;
}

export function isFired(): boolean {
  return violationCount >= MAX_VIOLATIONS;
}

export function getRemainingViolations(): number {
  return Math.max(0, MAX_VIOLATIONS - violationCount);
}
