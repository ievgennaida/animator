import { shape } from "../properties/shape";

export interface chars {
  /**
   * Character Value
   */
  ch?: string;
  /**
   * Character Font Family
   */
  fFamily?: string;
  /**
   * Character Font Size
   */
  size?: string;
  /**
   * Character Font Style
   */
  style?: string;
  /**
   * Character Width
   */
  w?: number;
  /**
   * Character Data
   */
  data?: CharsCollection;
}

/**
 * Character Data
 */
export interface CharsCollection {
  /**
   * Character Composing Shapes
   */
  items?: charitem[];
}

/**
 * Character Item
 */
export interface charitem {
  keys?: shape;
}
