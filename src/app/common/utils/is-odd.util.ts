export function isOdd(N: number): boolean {
  if (isNaN(N)) {
    return false;
  }

  return N % 2 === 1;
}
