import { Injectable } from "@angular/core";
import { Subject, Observable, BehaviorSubject } from "rxjs";
import { TreeNode } from "../models/TreeNode";
import { LottieModel } from "../models/Lottie/LottieModel";

import { solid } from "../models/Lottie/layers/solid";
import { baseEffect } from "../models/Lottie/effects/baseEffect";
import { baseLayer } from "../models/Lottie/layers/baseLayer";
import { layerType } from "../models/Lottie/layers/layerType";
import { image } from "../models/Lottie/layers/image";
import { nullLayer } from "../models/Lottie/layers/nullLayer";
import { preComp } from "../models/Lottie/layers/preComp";
import { shape } from "../models/Lottie/layers/shape";
import { text } from "../models/Lottie/layers/text";
import { baseShape } from "../models/Lottie/shapes/baseShape";
import { NodeType } from "../models/NodeType";
import { shapeType, anyShape } from "../models/Lottie/shapes/shapeType";
import { group } from "../models/Lottie/shapes/group";
import {
  MatTreeFlatDataSource,
  MatTreeFlattener
} from "@angular/material/tree";
import { FlatTreeControl } from "@angular/cdk/tree";
import { TreeControl } from './TreeControl';

@Injectable({
  providedIn: "root"
})
export class StateService {
  resizeSubject = new Subject();
  dataSubject = new Subject();
  nodesSubject = new BehaviorSubject<TreeNode[]>([]);

  treeConrol = new FlatTreeControl<TreeNode>(
    node => node.level,
    node => node.expandable
  );

  flatDataSource = new MatTreeFlatDataSource<TreeNode, TreeNode>(
    this.treeConrol,
    new MatTreeFlattener<TreeNode, TreeNode>(
      (node: TreeNode, level: number) => {
        node.level = level;
        return node;
      },
      node => node.level,
      node => node.expandable,
      node => node.children
    )
  );

  constructor() {

  }

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

    let flatLayerNodes: TreeNode[] = [];

    if (animation) {
      const node = new TreeNode();

      node.type = NodeType.File,
      node.data = animation,
      node.name = animation.nm || 'file.json';

      treeNodes.push(node);

      if (animation.layers) {
        animation.layers.forEach((p: any) => {
          let layer = p;
          let converted = new TreeNode();
          converted.type = NodeType.Layer,
          converted.data = layer,
          converted.name = 
              layer.nm.toString() +
              "id" +
              layer.ind +
              ".par:" +
              layer.parent +
              "  " +
              layer.ty;

          if (p.ty == layerType.Image) {
            let currentLayer = layer as image;
          } else if (p.ty === layerType.Null) {
            let currentLayer = layer as nullLayer;
          } else if (p.ty === layerType.Precomp) {
            let currentLayer = layer as preComp;
          } else if (p.ty === layerType.Shape) {
            let currentLayer = layer as shape;
            this.getShapesNodes(currentLayer.shapes, converted);
          } else if (p.ty === layerType.Solid) {
            let currentLayer = layer as solid;
          } else if (p.ty === layerType.Text) {
            let currentLayer = layer as text;
          }

          flatLayerNodes.push(converted);
        });
      }
    }

    // Remap and convert the the flat level nodes to be tree structured.
    let onlyLayerNodes = flatLayerNodes.filter(p => p.type == NodeType.Layer);
    onlyLayerNodes.forEach(treeNode => {
      let parentFound = false;
      let layer = treeNode.data as baseLayer;

      if (layer.parent !== undefined) {
        let parentNode = onlyLayerNodes.find(p => p.data.ind === layer.parent);
        if (parentNode) {
          if (!parentNode.children) {
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

    this.flatDataSource.data = treeNodes;
  }

  getShapesNodes(
    shape: anyShape | anyShape[],
    parentNode: TreeNode
  ): TreeNode[] {
    if (!shape) {
      return;
    }

    let nodes: TreeNode[] = [];
    if (Array.isArray(shape)) {
      shape.forEach(p => {
        this.getShapesNodes(p, parentNode);
      });
    } else {
      let node = new TreeNode();
      node.type = NodeType.Shape;
      node.data =  shape;
      node.name = (shape.nm || "").toString() + " type: " + shape.ty;

      if (!parentNode.children) {
        parentNode.children = [];
      }

      if (shape.ty === shapeType.group) {
        let groupShape = shape as group;
        this.getShapesNodes(groupShape.it, node);
      }

      parentNode.children.push(node);
    }

    return nodes;
  }
}
