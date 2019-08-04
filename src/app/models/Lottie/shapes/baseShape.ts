import { shapeType } from './shapeType';

export class baseShape {
    /**
     * After Effect's Match Name. Used for expressions.
     */
    mn?: string;
    /**
     * After Effect's Name. Used for expressions.
     */
    nm?: string;
    /**
     * Shape content type.
     */
    ty?: shapeType|string;
}