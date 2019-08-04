/**
 * Mask mode.
 */
export enum maskMode {
  None = "n",
  Additive = "a",
  Subtract = "s",
  Intersect = "i",
  Lighten = "l",
  Darken = "d",
  Difference = "f"
}

export const defaultTextBased = maskMode.Additive;
