import { PathData } from "./path-data";
import "path-data-polyfill/path-data-polyfill";
describe("PathData", () => {
  it("path converted", () => {
    const el: any = document.createElement("path");
    el.setAttribute("d", "M 10 10 l 10 10 10 10");
  });
});
