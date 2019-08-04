import { value } from "../properties/value";
import { valueKeyframed } from "../properties/valueKeyframed";
import { multiDimensional } from "../properties/multiDimensional";
import { multiDimensionalKeyframed } from "../properties/multiDimensionalKeyframed";
import { baseShape } from './baseShape';
import { transform as transformHelper } from '../helpers/transform';

export interface transform extends transformHelper, baseShape  {

}
