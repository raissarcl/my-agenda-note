export function navigateMonth(
  setY: (y: number) => void,
  setM: (m: number) => void,
  y: number,
  m: number,
  delta: number
): void {
  const next = new Date(y, m + delta, 1);
  setY(next.getFullYear());
  setM(next.getMonth());
}
