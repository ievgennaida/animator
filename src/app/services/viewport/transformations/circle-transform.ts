import { RectTransform } from './rect-transform';

export class CircleTransform extends RectTransform {
    // override
    transformPropertyX = 'cx';
    // override
    transformPropertyY = 'cy';
}
