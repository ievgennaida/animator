import { shape } from "../properties/shape";
import { shapeKeyframed } from "../properties/shapeKeyframed";
import { maskMode } from "./maskMode";

export class mask {
  // Inverted
  inv: boolean = false;
  // Mask name. Used for expressions and effects
  nm: string;
  //Mask vertices
  pt: shape | shapeKeyframed;
  //Mask opacity
  //o: const || constKeyframed = { a: 0, k: 100 };
  mode: maskMode;
}
