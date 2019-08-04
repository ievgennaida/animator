import { effectType } from './effectType';
import { index } from '.';

export class baseEffect {
    /**
     * Effect Index. Used for expressions. NOT USED. EQUALS SLIDER.
     */
    ix?: number;
    /**
     * After Effect's Match Name. Used for expressions.
     */
    mn?: string;
    /**
     * After Effect's Name. Used for expressions.
     */
    nm?: string;
    /**
     * Effect type.
     */
    ty?: effectType;
    /**
    * Effects type.Effect List of properties point| dropDown color dropDown slider  slider slider
    */
    ef?: index[];
}

