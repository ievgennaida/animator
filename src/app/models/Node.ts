import { default as timeline, AnimationTimelineOptions, Timeline, AnimationTimelineLane } from 'animation-timeline-js';
import { baseLayer } from './Lottie/layers/baseLayer';
import { NodeType } from './NodeType';
import { Properties } from './Properties/Properties';

/**
 * Application node. 
 */
export class Node {
    constructor(){
        this.lane = { } as AnimationTimelineLane;
    }
    
    private _name: string = '';
    
    get name(): string {
        return this._name;
    }

    set name(value: string) {
        this._name = value;
        console.log('set'+ value);
    }

    get expandable(): boolean {
        return !!this.children && this.children.length > 0;
    }

    icon =  'folder';
    properties: Properties;
    children?: Node[];
    tag: any;
    type: NodeType;
    data: any;
    lane: AnimationTimelineLane;
    layer?: baseLayer;
    level: number;
}
