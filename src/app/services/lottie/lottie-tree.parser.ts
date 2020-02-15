import { TreeNode } from "../../models/tree-node";
import { LottieModel } from "../../models/Lottie/LottieModel";
import { solid } from "../../models/Lottie/layers/solid";
import { baseEffect } from "../../models/Lottie/effects/baseEffect";
import { baseLayer } from "../../models/Lottie/layers/baseLayer";
import { layerType } from "../../models/Lottie/layers/layerType";
import { image } from "../../models/Lottie/layers/image";
import { nullLayer } from "../../models/Lottie/layers/nullLayer";
import { preComp } from "../../models/Lottie/layers/preComp";
import { shape } from "../../models/Lottie/layers/shape";
import { text } from "../../models/Lottie/layers/text";
import { baseShape } from "../../models/Lottie/shapes/baseShape";
import { NodeType } from "../../models/Lottie/NodeType";
import { shapeType, anyShape } from "../../models/Lottie/shapes/shapeType";
import { group } from "../../models/Lottie/shapes/group";
import { Properties } from "../../models/Properties/Properties";
import { AnimationItem } from "lottie-web";
import { LottiePropertiesParser } from "./lottie-properties.parser";
import { InputDocument } from "src/app/models/input-document";
import { PlayerService } from "../player.service";
import { LottiePlayer } from "./lottie-player";
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: "root"
})
export class LottieTreeParser {
  constructor(private playerService: PlayerService) {}
  propertiesService = new LottiePropertiesParser();
  parse(document: InputDocument) {
    return this.onDataParsed(document.parsedData);
  }

  public onDataParsed(data: any) {
    const model: LottieModel = data as LottieModel;

    const flatLayerNodes: TreeNode[] = [];
    const nodes = [];
    if (model) {
      let node = new TreeNode();
      node.model = model;
      node.type = NodeType.File;
      // root:
      node.data = model;

      node.icon = "assignment";
      node.name = model.nm || "file.json";
      node.properties = this.propertiesService.getProperties(node);
      this.setKeyframes(node);
      nodes.push(node);

      // Render assets:
      if (model.assets && model.assets.length > 0) {
        node = new TreeNode();
        node.model = model;
        node.type = NodeType.Assets;
        node.data = model;
        node.name = "assets";
        node.properties = this.propertiesService.getProperties(node);
        this.setKeyframes(node);
        node.children = [];
        nodes.push(node);

        model.assets.forEach((p: any) => {
          // this.addLayer(node.children, p, model);
        });
      }

      // shapePropertyFactory
      // matrix
      // let factory = player.__getFactory('propertyFactory');
      const player = this.playerService.player as LottiePlayer;
      if (player !== null) {
        const animationElement = player.getElement();
        const renderer = animationElement.renderer;

        // Add layers:
        if (renderer.elements) {
          renderer.elements.forEach((p: any) => {
            this.addLayer(flatLayerNodes, p, model);
          });
        }
      } else {
        //log
      }
    }

    // Remap and convert the the flat level nodes to be tree structured.
    const onlyLayerNodes = flatLayerNodes.filter(
      p => p.type === NodeType.Layer
    );
    onlyLayerNodes.forEach(node => {
      let parentFound = false;
      const layer = node.data as baseLayer;

      if (layer.parent !== undefined) {
        const parentNode = onlyLayerNodes.find(
          p => p.data.ind === layer.parent
        );
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

    return nodes;
  }

  addLayer(flatLayerNodes: TreeNode[], layer: any, model: LottieModel) {
    const layerData = layer.data;

    const node = new TreeNode();
    node.model = model;
    node.type = NodeType.Layer;
    node.data = layerData;
    node.tag = layer;
    node.name = (layerData.nm || layerType[layerData.ty] || "layer").toString();

    // TODO:
    if (layerData.ty === layerType.Image) {
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

    node.properties = this.propertiesService.getProperties(node);
    this.getTransformNode(node, model);
    this.setKeyframes(node);
    flatLayerNodes.push(node);
  }

  getTransformNode(parentNode: TreeNode, model: LottieModel) {
    if (!parentNode.properties || !parentNode.properties.items) {
      return;
    }

    // Render list of properties marked as allowed to be a part of the outline tree.
    const filtered = parentNode.properties.items.filter(p => p.renderAsOutline);
    if (filtered && filtered.length > 0) {
      if (!parentNode.children) {
        parentNode.children = [];
      }

      let folder = parentNode;
      if (parentNode.type !== NodeType.Shape) {
        folder = new TreeNode();
        folder.model = model;
        folder.type = NodeType.Folder;
        folder.name = "Transform";
        folder.icon = "transform";
        folder.properties = this.propertiesService.getProperties(folder);
        this.setKeyframes(folder);
        parentNode.children.splice(0, 0, folder);
      }

      folder.children = folder.children || [];
      filtered.forEach(p => {
        const node = new TreeNode();
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
    parentNode: TreeNode,
    model: LottieModel
  ): TreeNode[] {
    if (!shape) {
      return;
    }

    const nodes: TreeNode[] = [];
    if (Array.isArray(shape)) {
      shape.forEach(p => {
        this.getShapesNodes(p, parentNode, model);
      });
    } else {
      const node = new TreeNode();
      node.model = model;
      node.type = NodeType.Shape;
      node.data = shape;
      node.name = shape.nm;

      if (!parentNode.children) {
        parentNode.children = [];
      }

      if (shape.ty === shapeType.group) {
        const groupShape = shape as group;
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

      node.properties = this.propertiesService.getProperties(node);
      this.getTransformNode(node, model);
      this.setKeyframes(node);
      parentNode.children.push(node);
    }

    return nodes;
  }

  setKeyframes(node: TreeNode) {
    if (!node.properties || !node.properties.items || !node.lane) {
      return;
    }

    // Render list of properties marked as allowed for the outline.
    const filtered = node.properties.items;

    if (filtered && filtered.length > 0) {
      filtered.forEach(p => {
        const keyframes = p.getKeyframes();
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
