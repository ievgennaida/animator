export const consts = {
  recentItemsCount: 7,
  timelineHeaderHeight: 30,
  timelineScrollSpeed: 20,
  showGridLines: true,
  defaultWorkArea: {
    width: 640,
    height: 480,
    offset: 0
  },
  rulerSize: 20,
  /**
   * Automatically pan when drag by mouse.
   * 0 - 1 Percents from the current width
   */
  autoPanSpeed: 0.006,
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
    max: 1000
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
    font: "11px sans-serif"
  },
  adorners: {
    mouseOverBoundsColor: "#3399FF"
  },
  gridLines: {
    color: "rgba(160, 160, 160, 0.4)",
    smallColor: "rgba(160, 160, 160, 0.2)"
  }
};
