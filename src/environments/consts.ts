import { MenuPanel } from "src/app/services/menu-service";
import { ViewMode } from "../app/models/view-mode";

export const consts = {
  recentItemsCount: 7,
  /**
   * Digits after coma for a path data.
   */
  pathDataAccuracy: 2,
  addNewPointAccuracy: 10,
  timelineHeaderHeight: 30,
  timelineScrollSpeed: 20,
  pathPointSize: 5,
  pathPointSelectedSize: 6,
  pathPointFill: "white",
  pathPointStroke: "#3399FF",
  pathMouseOverPointStroke: "red",
  pathMouseOverPointFill: "white",
  pathSelectedPointStroke: "red",
  pathSelectedPointFill: "red",
  // handle (control point)
  pathHandleSize: 3,
  pathHandleStroke: "#3399FF",
  pathHandleFill: "RGBA(255,255,255,0.7)",
  // path handle mouse over and selected (control point)
  pathHandleSelectedSize: 3,
  pathHandleSelectedStroke: "#3399FF",
  pathHandleSelectedFill: "red",
  pathHandleLineStroke: "#3399FF",
  selector: {
    fill: "RGBA(51,153,255,0.11)",
    stroke: "#3399FF",
    strokeThickness: 1,
  },
  breadcrumbVisible: false,
  appearance: {
    defaultMode: ViewMode.Editor,
    menuOpened: false,
    menuPanelSize: 250,
  },
  fitToSelectedExtraBounds: 0.2,
  defaultWorkArea: {
    width: 640,
    height: 480,
    offset: 0,
  },
  rulerSize: 20,
  /**
   * Automatically pan when drag by mouse.
   * 0 - 1 Percents from the current width
   */
  autoPanSpeed: 0.006,
  clickThreshold: 8,
  doubleClickToleranceMs: 500,
  wheelPanSpeed: 15,
  zoom: {
    sensitivityWheel: 0.04,
    sensitivityMouse: 0.1,
    /**
     * Min zoom absolute size where 1 is 100%.
     */
    min: 0.1,
    /**
     * Max absolute size where 1 is 100%.
     */
    max: 1000,
  },
  ruler: {
    /**
     * approximate big ruler step in px for 1 tick
     */
    tickPx: 120,
    /**
     * approximate small ruler step in px for 1 tick
     */
    smallTickPx: 80,
    smallTickColor: "#D5D5D5",
    color: "#D5D5D5",
    tickColor: "#D5D5D5",
    font: "11px sans-serif",
  },
  // Adorners:
  mouseOverBoundsColor: "#3399FF",
  mainSelectionStroke: "#3399FF",
  altSelectionStroke: "RGBA(51,153,255,0.9)",
  mouseOverBorderThickness: 1,
  mainSelectionThickness: 2,
  altSelectionThickness: 1,
  handleFillColor: "#3399FF",
  handleSelectedFillColor: "red",
  handleStrokeSize: 0,
  handleStrokeColor: "",
  handleSize: 6,
  /**
   * Max selected bounds to be rendered.
   * Render global bounds if more nodes are selected.
   */
  maxBoundsToRender: 25,
  // Path data
  showPathOutline: true,
  outlineStrokeColor: "#3399FF",
  outlineThickness: 1,
  outlineSelectedStrokeColor: "red",
  outlineSelectedThickness: 2,
  // grid lines
  showGridLines: true,
  showRuler: true,
  changeContainerKey: "Control",

  gridLineMainColor: "rgba(160, 160, 160, 0.4)",
  gridLineAltColor: "rgba(160, 160, 160, 0.2)",
  showTransformedBBoxes: true,
  // Can be a bit slow until tree is about to be virtualized.
  outlineAutoScrollToSelected: true,
  translateHandleEnabled: true,
  /**
   * Additional offset for the translate handler
   */
  translateHandleOffsetX: 25,
  translateHandleOffsetY: 25,
  translateHandleSize: 12,
  translateHandleThickness: 1,
  translateHandleColor: '#3399FF',
  translateHandleMouseOverColor: '#3399FF',
  translateHandleMouseOverFillColor: '#FFFFFF'
};

export const enum PanelsIds {
  History = "history",
  Properties = "properties",
  Outline = "outline",
}
export const panelsConfig = [
  {
    id: PanelsIds.History,
    expanded: true,
    visible: false,
    title: "History",
    height: 100,
    allowClose: true,
  },
  {
    id: PanelsIds.Properties,
    expanded: true,
    visible: true,
    title: "Properties",
    height: 100,
  },
  {
    id: PanelsIds.Outline,
    expanded: true,
    visible: true,
    title: "Outline",
    height: 100,
  },
] as MenuPanel[];
