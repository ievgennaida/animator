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
});
