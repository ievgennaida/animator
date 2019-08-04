import { value } from '../properties/value';
import { valueKeyframed } from '../properties/valueKeyframed';
import { multiDimensional } from '../properties/multiDimensional';
import { multiDimensionalKeyframed } from '../properties/multiDimensionalKeyframed';
import { baseShape } from './baseShape';

export class fill extends baseShape {

  /**
  * Opacity. Fill Opacity
  */
  o: value | valueKeyframed;

  /**
  * Color. Fill Color
  */
  c: multiDimensional | multiDimensionalKeyframed;
}

