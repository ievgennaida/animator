import { PathData } from "./path-data";
import "path-data-polyfill/path-data-polyfill";
const xmlns = "http://www.w3.org/2000/svg";
describe("PathData", () => {
  it("path converted", () => {
    const el: any = document.createElementNS(xmlns, "path");
    el.setAttribute("d", "M 1 2 l 2 3 3 4");
    const data = PathData.wrap(el.getPathData());
    expect(data.commands.length).toEqual(3);
    let a = data.commands[0].getAbsolute().point;
    expect(a.x).toEqual(1);
    expect(a.y).toEqual(2);
    a = data.commands[1].getAbsolute().point;
    expect(a.x).toEqual(3);
    expect(a.y).toEqual(5);
    a = data.commands[2].getAbsolute().point;
    expect(a.x).toEqual(6);
    expect(a.y).toEqual(9);
  });
});
