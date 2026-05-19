export function pressOpacity(
  disabled: boolean,
  pressed: boolean,
  enabledOpacity = 1,
  pressedOpacity = 0.65,
  disabledOpacity = 0.4
): number {
  if (disabled) return disabledOpacity;
  if (pressed) return pressedOpacity;
  return enabledOpacity;
}
