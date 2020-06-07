import { EllipseTransform } from './ellipse-transform';

export class CircleTransform extends EllipseTransform {
    // override
    transformPropertyX = 'cx';
    // override
    transformPropertyY = 'cy';
    sizePropertyX = "r";
    sizePropertyY = "r";
}
