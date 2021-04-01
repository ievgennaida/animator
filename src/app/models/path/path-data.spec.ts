import "path-data-polyfill/path-data-polyfill";
import { PathData } from "./path-data";
const xmlns = "http://www.w3.org/2000/svg";
describe("PathData", () => {
  it("path relative converted", () => {
    const el = document.createElementNS(xmlns, "path");
    el.setAttribute("d", "M 1 2 l 2 3 3 4");
    const data = PathData.wrap((el as any).getPathData());
    expect(data.commands.length).toEqual(3);
    let a = data.commands[0].p;
    expect(a.x).toEqual(1);
    expect(a.y).toEqual(2);
    a = data.commands[1].p;
    expect(a.x).toEqual(3);
    expect(a.y).toEqual(5);
    a = data.commands[2].p;
    expect(a.x).toEqual(6);
    expect(a.y).toEqual(9);
    PathData.setPathData(data, el);
    // Relative commands are preserved:
    expect(el.getAttribute("d")).toEqual("M 1 2 l 2 3 l 3 4");
  });
  it("arc relative converted", () => {
    const el: any = document.createElementNS(xmlns, "path");
    el.setAttribute("d", "M1,1 a150,150 0 1,0 150,150");
    const data = PathData.wrap(el.getPathData());
    expect(data.commands.length).toEqual(2);
    const a = data.commands[data.commands.length - 1].p;
    expect(a.x).toEqual(151);
    expect(a.y).toEqual(151);
  });
  it("arc h, v relative converted", () => {
    const el: any = document.createElementNS(xmlns, "path");
    el.setAttribute("d", "M1,1 h-10 h20 v-10 v20 a150,150 0 1,0 150,150");
    const data = PathData.wrap(el.getPathData());
    expect(data.commands.length).toEqual(6);
    const a = data.commands[data.commands.length - 1].p;
    expect(a.x).toEqual(161);
    expect(a.y).toEqual(161);
  });
  it("arc absolute converted", () => {
    const el: any = document.createElementNS(xmlns, "path");
    el.setAttribute("d", "M1,1 h-10 H20 v-10 V20 a150,150 0 1,0 150,150");
    const data = PathData.wrap(el.getPathData());
    expect(data.commands.length).toEqual(6);
    const a = data.commands[data.commands.length - 1].p;
    expect(a.x).toEqual(170);
    expect(a.y).toEqual(170);
  });
});
