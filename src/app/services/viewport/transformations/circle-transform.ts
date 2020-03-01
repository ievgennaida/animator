import { RectTransform } from './rect-transform';

export class CircleTransform extends RectTransform {
    // override
    tranformPropertyX = 'cx';
    // override
    tranformPropertyY = 'cy';
}
