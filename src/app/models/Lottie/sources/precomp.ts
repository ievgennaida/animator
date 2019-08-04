import { solid } from "../layers/solid";
import { shape } from "../layers/shape";
import { image } from "../layers/image";
import { text } from "../layers/text";

export interface precomp {
  /**
   * Precomp ID
   */
  id: string;
  /**
   * List of Precomp Layers
   */
  layers: (shape | solid | precomp | image | null | text)[];
}
