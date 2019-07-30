import { default as timeline, AnimationTimelineOptions, Timeline, AnimationTimelineLane } from 'animation-timeline-js';

export class TreeNode {
    name: string;
    children?: TreeNode[];
    tag: any;
    lane?: AnimationTimelineLane;
}