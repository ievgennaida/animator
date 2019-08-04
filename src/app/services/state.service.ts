import { Injectable } from "@angular/core";
import { Subject, Observable, BehaviorSubject } from "rxjs";
import { TreeNode } from "../models/TreeNode";
import { LottieModel } from "../models/Lottie/LottieModel";

import { solid } from "../models/Lottie/layers/solid";
import { baseEffect } from "../models/Lottie/effects/baseEffect";
import { baseLayer } from "../models/Lottie/layers/baseLayer";
import { layerType } from '../models/Lottie/layers/layerType';
import { image } from '../models/Lottie/layers/image';
import { nullLayer } from '../models/Lottie/layers/nullLayer';
import { preComp } from '../models/Lottie/layers/preComp';
import { shape } from '../models/Lottie/layers/shape';
import { text } from '../models/Lottie/layers/text';
import { baseShape } from '../models/Lottie/shapes/baseShape';
import { NodeType } from '../models/NodeType';
import { shapeType, anyShape } from '../models/Lottie/shapes/shapeType';
import { group } from '../models/Lottie/shapes/group';

@Injectable({
  providedIn: "root"
})
export class StateService {
  resizeSubject = new Subject();
  dataSubject = new Subject();
  nodesSubject = new BehaviorSubject<TreeNode[]>([]);
  constructor() {}

  public get onResize(): Observable<any> {
    return this.resizeSubject.asObservable();
  }

  public setPanelResized() {
    this.resizeSubject.next();
  }

  public get nodes(): Observable<any> {
    return this.nodesSubject.asObservable();
  }
  public get data(): Observable<any> {
    return this.dataSubject.asObservable();
  }

  public setData(data) {
    this.dataSubject.next(data);
  }

  public onDataParsed(data: any) {
    if (!data || !data.layers) {
      this.nodesSubject.next(this.nodesSubject.value);
      return;
    }
    let animation: LottieModel = data as LottieModel;

    let treeNodes = this.nodesSubject.value;
    treeNodes.length = 0;

    let flatNodes: TreeNode[] = [];

    if (animation) {
      treeNodes.push({
        type: NodeType.File,
        data: animation,
        name: animation.nm
      } as TreeNode);

      if (animation.layers) {
        animation.layers.forEach((p: any) => {
          let layer = p;
          let converted = {
            type: NodeType.Layer,
            data: layer,
            name:
              layer.nm.toString() +
              "id" +
              layer.ind +
              ".par:" +
              layer.parent +
              "  " +
              layer.ty
          } as TreeNode;

          if(p.ty == layerType.Image){
            let currentLayer = layer as image;
          }else if(p.ty === layerType.Null){
            let currentLayer = layer as nullLayer;
          }else if(p.ty === layerType.Precomp){
            let currentLayer = layer as preComp;
          }else if(p.ty === layerType.Shape){
            let currentLayer = layer as shape;
            const treeNodes = this.getShapesNodes(layer.shapes, converted);

          }else if(p.ty === layerType.Solid){
            let currentLayer = layer as solid;
          }else if(p.ty === layerType.Text){
            let currentLayer = layer as text;
          }

          flatNodes.push(converted);
        });
      }
    }

    // Remap and convert the the flat level nodes to be tree structured.
    let onlyLayerNodes = flatNodes.filter(p => p.type == NodeType.Layer);
    onlyLayerNodes.forEach(treeNode => {
      let parentFound = false;
      let layer = treeNode.data as baseLayer;

      if (layer.parent !== undefined) {
        let parentNode = onlyLayerNodes.find(p => p.data.ind === layer.parent);
        if (parentNode) {
          if (!parentNode.children)
          {
            parentNode.children = [];
          } 

          parentNode.children.push(treeNode);
          parentFound = true;
        }
      }

      if (!parentFound) {
        treeNodes.push(treeNode);
      }
    });


    //let layers = data.layers;

    this.nodesSubject.next(treeNodes);
  }

  getShapesNodes(shape: anyShape | anyShape[], parentNode: TreeNode):TreeNode[]  {
    if(!shape){
      return;
    }

    let nodes: TreeNode[] = [];
    if(Array.isArray(shape)){
      shape.forEach(p=>{
        this.getShapesNodes(p, parentNode);
      });
    } else {
      let node = {
        type: NodeType.Shape,
        data: shape,
        name:
        (shape.nm || '').toString() +
          " type: " +
          shape.ty
      } as TreeNode;
      
      if(!parentNode.children){
        parentNode.children = [];
      }

      if(shape.ty === shapeType.group){
        let groupShape = shape as group;
        this.getShapesNodes(groupShape.it, node);
      }

      parentNode.children.push(node);
    }
    
    return nodes;
  }
}
