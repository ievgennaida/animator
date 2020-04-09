export const consts = {
  recentItemsCount: 7,
  timelineHeaderHeight: 30,
  timelineScrollSpeed: 20,
  selector: {
    fill: "RGBA(51,153,255,0.11)",
    stroke: "#3399FF",
    strokeThinkness: 1,
  },
  appearance: {
    menuOpened: false,
    menuPanelSize: "250px",
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
     * approximate smal ruler step in px for 1 tick
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
  mouseOverBorderThikness: 1,
  mainSelectionThikness: 2,
  altSelectionThikness: 1,
  handleFillColor: "#3399FF",
  handleStrokeSize: 0,
  handleStrokeColor: "",
  handleSize: 6,
  // grid lines
  showGridLines: true,
  gridLineMainColor: "rgba(160, 160, 160, 0.4)",
  gridLineAltColor: "rgba(160, 160, 160, 0.2)",
};
