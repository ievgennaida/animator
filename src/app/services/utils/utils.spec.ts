import { Utils } from "./utils";

describe("Test Utils", () => {
  it("getPointAlong", () => {
    let p = Utils.getPointAlong(new DOMPoint(0, 0), new DOMPoint(10, 10), 0.5);
    expect(p).toBeTruthy();
    expect(p.x).toEqual(5);
    expect(p.y).toEqual(5);

    p = Utils.getPointAlong(new DOMPoint(0, 0), new DOMPoint(-10, -10), 0.5);
    expect(p).toBeTruthy();
    expect(p.x).toEqual(-5);
    expect(p.y).toEqual(-5);
  });

  it("keep in bounds", () => {
    expect(Utils.keepInBounds(0.5, 0, 1)).toEqual(0.5);
    expect(Utils.keepInBounds(-1, 0, 1)).toEqual(0);
    expect(Utils.keepInBounds(2, 0, 1)).toEqual(1);
    expect(Utils.keepInBounds(-20, -10, 1)).toEqual(-10);
  });
});
