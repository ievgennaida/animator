import { multiDimensional } from '../properties/multiDimensional';
import { multiDimensionalKeyframed } from '../properties/multiDimensionalKeyframed';
import { baseShape } from './baseShape';

export class ellipse extends baseShape {
  /**
  * After Effect's Direction. Direction how the shape is drawn. Used for trim path for example.
   */
  d: number = 1;

  /**
     * Position. Ellipse's position
     */
  p: multiDimensional | multiDimensionalKeyframed;
  /**
   * Size. Ellipse's size
   */
  s: multiDimensional | multiDimensionalKeyframed;
}

