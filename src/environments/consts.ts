import { ViewMode } from "../app/models/view-mode";

export const consts = {
  recentItemsCount: 7,
  /**
   * Digits after coma for a path data.
   */
  pathDataAccuracy: 2,
  timelineHeaderHeight: 30,
  timelineScrollSpeed: 20,
  pathPointSize: 5,
  pathPointSelectedSize: 6,
  pathPointFill: "white",
  pathPointStroke: "#3399FF",
  pathMouseOverPointStroke: "red",
  pathMouseOverPointFill: "red",
  pathSelectedPointStroke: "#3399FF",
  pathSelectedPointFill: "#3399FF",
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
  gridLineMainColor: "rgba(160, 160, 160, 0.4)",
  gridLineAltColor: "rgba(160, 160, 160, 0.2)",
  showTransformedBBoxes: true,
};
