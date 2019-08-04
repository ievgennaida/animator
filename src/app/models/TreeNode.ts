import { default as timeline, AnimationTimelineOptions, Timeline, AnimationTimelineLane } from 'animation-timeline-js';
import { baseLayer } from './Lottie/layers/baseLayer';
import { NodeType } from './NodeType';

export class TreeNode {
    constructor(){
        this.lane = { } as AnimationTimelineLane;
    }
    
    private _name: string = '';
    
    get name(): string {
        return this._name;
    }

    set name(value: string) {
        this._name = value;
    }

    get expandable(): boolean {
        return !!this.children && this.children.length > 0;
    }

    children?: TreeNode[];
    tag: any;
    type: NodeType;
    data: any;
    lane: AnimationTimelineLane;
    layer?: baseLayer;
    level: number;
}
