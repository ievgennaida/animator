import { default as timeline, AnimationTimelineOptions, Timeline, AnimationTimelineLane } from 'animation-timeline-js';
import { baseLayer } from './Lottie/layers/baseLayer';
import { NodeType } from './NodeType';

export class TreeNode {
    name: string;
    children?: TreeNode[];
    tag: any;
    type: NodeType;
    data: any;
    lane?: AnimationTimelineLane;
    layer?: baseLayer
}