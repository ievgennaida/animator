import { Injectable } from "@angular/core";
import { Subject, Observable, BehaviorSubject } from "rxjs";
import { Node } from "../models/Node";
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
import { PropertiesService } from "./properties.service";
import { Property } from "../models/Properties/Property";
import { Properties } from "../models/Properties/Properties";
import { AnimationTimelineKeyframe } from "animation-timeline-js";
import { PlayerService } from "./player.service";
import { AnimationItem } from "lottie-web";
import { SelectedData } from "../models/SelectedData";
import { Keyframe } from "../models/keyframes/Keyframe";

@Injectable({
  providedIn: "root"
})
export class StateService {
  constructor(
    private propertesService: PropertiesService,
    private playerService: PlayerService
  ) {}

  dataSubject = new Subject();
  nodesSubject = new BehaviorSubject<Node[]>([]);
  selectedSubject = new BehaviorSubject<SelectedData>(new SelectedData());
  treeConrol = new FlatTreeControl<Node>(
    node => node.level,
    node => node.expandable
  );

  flatDataSource = new MatTreeFlatDataSource<Node, Node>(
    this.treeConrol,
    new MatTreeFlattener<Node, Node>(
      (node: Node, level: number) => {
        node.level = level;
        return node;
      },
      node => node.level,
      node => node.expandable,
      node => node.children
    )
  );

  deleteElement(array, element) {
    const index: number = array.indexOf(element);
    if (index !== -1) {
      return array.splice(index, 1);
    }
    return array;
  }

  // Allow to select tree node, but list of avaliable might be extended.
  setSelectedNode(node: Node, isAdd: boolean = false) {
    let currentSelected = this.selectedSubject.getValue();
    if (isAdd) {
      if (currentSelected.nodes.includes(node)) {
        node.selected = false;
        this.deleteElement(currentSelected.nodes, node);
      } else {
        node.selected = true;
      }
    } else {
      node.selected = true;
      currentSelected.nodes.forEach(p => (p.selected = false));
      currentSelected.nodes.length = 0;
    }
    
    if (node.selected) {
      currentSelected.nodes.push(node);
    }
    this.selectedSubject.next(currentSelected);
  }

  setSelectedKeyframes(keyframe: Keyframe) {
    //this.selectedSubject.value.keyframe = keyframe;
    //this.selectedSubject.next(this.selectedSubject.value);
  }

  public get selected(): Observable<SelectedData> {
    return this.selectedSubject.asObservable();
  }
  public get nodes(): Observable<Node[]> {
    return this.nodesSubject.asObservable();
  }

  public get data(): Observable<any> {
    return this.dataSubject.asObservable();
  }

  public setData(data, title: string) {
    this.dataSubject.next(data);
  }

  public deselectAll() {
    const currentSelection = this.selectedSubject.value;
    if (!currentSelection) {
      currentSelection.nodes.length = 0;
      currentSelection.keyframes.length = 0;
    }

    this.selectedSubject.next(currentSelection);
  }
  public onDataParsed(player: AnimationItem | any, data: any) {
    if (!data || !data.layers) {
      this.nodesSubject.next(this.nodesSubject.value);
      return;
    }

    this.deselectAll();
    const model: LottieModel = data as LottieModel;

    const nodes = this.nodesSubject.value;
    nodes.length = 0;

    const flatLayerNodes: Node[] = [];

    if (model) {
      let node = new Node();
      node.model = model;
      node.type = NodeType.File;
      // root:
      node.data = model;

      node.icon = "assignment";
      node.name = model.nm || "file.json";
      node.properties = this.propertesService.getProperties(node);
      this.setKeyframes(node);
      nodes.push(node);

      // Render assets:
      if (model.assets && model.assets.length > 0) {
        node = new Node();
        node.model = model;
        node.type = NodeType.Assets;
        node.data = model;
        node.name = "assets";
        node.properties = this.propertesService.getProperties(node);
        this.setKeyframes(node);
        node.children = [];
        nodes.push(node);

        model.assets.forEach((p: any) => {
          // this.addLayer(node.children, p, model);
        });
      }

      // shapePropertyFactory
      //matrix
      //let factory = player.__getFactory('propertyFactory');
      let renderer = player.renderer;

      // Add layers:
      if (renderer.elements) {
        renderer.elements.forEach((p: any) => {
          this.addLayer(flatLayerNodes, p, model);
        });
      }
    }

    // Remap and convert the the flat level nodes to be tree structured.
    let onlyLayerNodes = flatLayerNodes.filter(p => p.type == NodeType.Layer);
    onlyLayerNodes.forEach(node => {
      let parentFound = false;
      let layer = node.data as baseLayer;

      if (layer.parent !== undefined) {
        let parentNode = onlyLayerNodes.find(p => p.data.ind === layer.parent);
        if (parentNode) {
          if (!parentNode.children) {
            parentNode.children = [];
          }

          parentNode.children.push(node);
          parentFound = true;
        }
      }

      if (!parentFound) {
        nodes.push(node);
      }
    });

    this.flatDataSource.data = nodes;
  }

  addLayer(flatLayerNodes: Node[], layer: any, model: LottieModel) {
    const layerData = layer.data;

    let node = new Node();
    node.model = model;
    node.type = NodeType.Layer;
    node.data = layerData;
    node.lottieLayer = layer;
    node.name = (layerData.nm || layerType[layerData.ty] || "layer").toString();

    // TODO:
    if (layerData.ty == layerType.Image) {
      const currentLayer = layerData as image;
    } else if (layerData.ty === layerType.Null) {
      const currentLayer = layerData as nullLayer;
    } else if (layerData.ty === layerType.Precomp) {
      const currentLayer = layerData as preComp;
    } else if (layerData.ty === layerType.Shape) {
      const currentLayer = layerData as shape;
      this.getShapesNodes(currentLayer.shapes, node, model);
    } else if (layerData.ty === layerType.Solid) {
      const currentLayer = layerData as solid;
    } else if (layerData.ty === layerType.Text) {
      const currentLayer = layerData as text;
    }

    node.properties = this.propertesService.getProperties(node);
    this.getTransformNode(node, model);
    this.setKeyframes(node);
    flatLayerNodes.push(node);
  }

  getTransformNode(parentNode: Node, model: LottieModel) {
    if (!parentNode.properties || !parentNode.properties.items) {
      return;
    }

    // Render list of properties marked as allowed to be a part of the outline tree.
    let filtered = parentNode.properties.items.filter(p => p.renderAsOutline);
    if (filtered && filtered.length > 0) {
      if (!parentNode.children) {
        parentNode.children = [];
      }

      let folder = parentNode;
      if (parentNode.type !== NodeType.Shape) {
        folder = new Node();
        folder.model = model;
        folder.type = NodeType.Folder;
        folder.name = "Transform";
        folder.icon = "transform";
        folder.properties = this.propertesService.getProperties(folder);
        this.setKeyframes(folder);
        parentNode.children.splice(0, 0, folder);
      }

      folder.children = folder.children || [];
      filtered.forEach(p => {
        const node = new Node();
        node.model = model;
        node.type = NodeType.Property;
        node.name = p.name;
        node.data = p.data;
        node.icon = p.icon;
        node.lane.color = "#2D2D2D";
        node.properties = new Properties();
        node.properties.items.push(p);
        this.setKeyframes(node);
        folder.children.push(node);
      });
    }
  }

  getShapesNodes(
    shape: anyShape | anyShape[],
    parentNode: Node,
    model: LottieModel
  ): Node[] {
    if (!shape) {
      return;
    }

    let nodes: Node[] = [];
    if (Array.isArray(shape)) {
      shape.forEach(p => {
        this.getShapesNodes(p, parentNode, model);
      });
    } else {
      let node = new Node();
      node.model = model;
      node.type = NodeType.Shape;
      node.data = shape;
      node.name = shape.nm;

      if (!parentNode.children) {
        parentNode.children = [];
      }

      if (shape.ty === shapeType.group) {
        let groupShape = shape as group;
        node.icon = "folder_special";
        this.getShapesNodes(groupShape.it, node, model);
      } else if (shape.ty === shapeType.transform) {
        node.icon = "transform";
      } else if (shape.ty === shapeType.merge) {
        node.icon = "call_merge";
      } else if (shape.ty === shapeType.rect) {
        node.icon = "crop_square";
      } else if (shape.ty === shapeType.repeater) {
        node.icon = "repeat";
      } else if (shape.ty === shapeType.round) {
        node.icon = "rounded_corner";
      } else if (shape.ty === shapeType.star) {
        node.icon = "star_border";
      } else if (shape.ty === shapeType.stroke) {
        node.icon = "all_out";
      } else if (shape.ty === shapeType.trim) {
        node.icon = "folder_special";
      } else if (shape.ty === shapeType.ellipse) {
        node.icon = "fiber_manual_record";
      } else if (shape.ty === shapeType.fill) {
        node.icon = "format_color_fill";
      } else if (shape.ty === shapeType.gFill) {
        node.icon = "gradient";
      } else if (shape.ty === shapeType.gStroke) {
        node.icon = "folder_special";
      } else if (shape.ty === shapeType.shape) {
        node.icon = "format_shapes";
      }

      node.properties = this.propertesService.getProperties(node);
      this.getTransformNode(node, model);
      this.setKeyframes(node);
      parentNode.children.push(node);
    }

    return nodes;
  }

  setKeyframes(node: Node) {
    if (!node.properties || !node.properties.items || !node.lane) {
      return;
    }

    // Render list of properties marked as allowed for the outline.
    let filtered = node.properties.items;

    if (filtered && filtered.length > 0) {
      filtered.forEach(p => {
        let keyframes = p.getKeyframes();
        if (keyframes) {
          if (!node.lane.keyframes) {
            node.lane.keyframes = [];
          }

          keyframes.forEach(k => node.lane.keyframes.push(k));
        }
      });
    }
  }
}
