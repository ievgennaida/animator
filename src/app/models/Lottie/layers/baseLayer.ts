import { index } from "../effects";
import { transform } from "../shapes/transform";
import { layerType } from "./layerType";
import { mask } from '../helpers/mask';
import { blendMode } from '../helpers/blendMode';

export class baseLayer {
  /**
   * Auto-Orient along path AE property.
   */
  ao?: number;
  /**
   * Parsed layer name used as html class on SVG/HTML renderer
   */
  cl?: string;
  /**
   * 3d layer flag
   */
  ddd?: number;
  /**
   * Layer index in AE. Used for parenting and expressions.
   */
  ind?: number;
  /**
   * In Point of layer. Sets the initial frame of the layer.
   */
  ip: number;
  /**
   * Parsed layer name used as html id on SVG/HTML renderer
   */
  ln?: string;
  /**
   * After Effects Layer Name. Used for expressions.
   */
  nm: string|number;
  /**
   * Out Point of layer. Sets the final frame of the layer.
   */
  op: number;
  /**
   * Layer Parent. Uses ind of parent.
   */
  parent?: number;
  /**
   * Layer Time Stretching
   */
  sr?: number;
  /**
   * Start Time of layer. Sets the start time of the layer.
   */
  st?: number;
  /**
   * Type of layer
   */
  ty: layerType;
  /**
   * lend Mode
   */
  bm: blendMode;

  /**
   * Effects. List of effects.
   */
  ef?: index[];
  /**
   * Transform. Transform properties
   */
  ks?: transform | any;

  /**
   * Masks Properties.Boolean when layer has a mask. Will be deprecated in favor of checking masksProperties.
   */
  hasMasks?: mask[];

  /**
   * Masks Properties. List of Masks.
   */
  masksProperties?: mask[];
}
