
import { Keyframe } from './keyframes/Keyframe';
import { TreeNode } from './tree-node';

export class ChangedArgs {
    public nodes: Array<TreeNode> = [];
    public changed: Array<TreeNode> = [];
    public keyframes: Array<Keyframe> = [];
}