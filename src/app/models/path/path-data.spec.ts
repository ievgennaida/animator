import "path-data-polyfill/path-data-polyfill";
import { consts } from "src/environments/consts";
import { PathData } from "./path-data";
import { PathDataCommand } from "./path-data-command";
import { PathType } from "./path-type";
export const pathDataToString = (pathData: PathData): string => {
  const el = document.createElementNS(consts.xmlns, "path");
  PathData.setPathData(pathData, el);
  // Relative commands are preserved:
  return (el.getAttribute("d") || "") as string;
};
export const assertSubpathData = (
  data: PathData | null,
  expectedCommandsCount: number,
  indexToCheck = 0,
  checkClosed = true
) => {
  expect(data).toBeTruthy();
  if (!data) {
    return;
  }
  const command = data.commands[indexToCheck];
  const subCommands = data.getSegment(command);
  expect(subCommands.length).toEqual(expectedCommandsCount);
  if (expectedCommandsCount > 0) {
    expect(subCommands[0].isType(PathType.moveAbs)).toEqual(true);
    if (checkClosed) {
      const trailingCommand = subCommands[subCommands.length - 1];
      expect(trailingCommand.isType(PathType.closeAbs)).toEqual(true);
    }
  }
};
export const getTestPathData = (
  pathDataStr = "M1,1 h-10 M1,2 V20 H20 v-10 a150,150 0 1,0 150,150"
): PathData | null => {
  const el: any = document.createElementNS(consts.xmlns, "path");
  el.setAttribute("d", pathDataStr);
  const data = PathData.wrap(el.getPathData());
  expect(data).toBeTruthy();
  if (!data) {
    return null;
  }
  return data;
};
describe("PathData.getSegment", () => {
  it("Can get current segment of the path", () => {
    const data = getTestPathData("M 1 2 l 2 3 3 4");
    expect(data).toBeTruthy();
    data?.commands.forEach((_, index) =>
      assertSubpathData(data, data?.commands.length || 0, index, false)
    );
  });
  it("Can get current closed segment of the path", () => {
    const data = getTestPathData("M 1 2 l 2 3 3 4 Z");
    expect(data).toBeTruthy();
    data?.commands.forEach((_, index) =>
      assertSubpathData(data, data?.commands.length || 0, index, true)
    );
  });
  it("Can get closed sub segment of the path", () => {
    const data = getTestPathData("M 1 2 l 2 3 3 4 Z M 1 2 L 3 3");
    const expectedLen = [4, 4, 4, 4, 2, 2];
    const expectedClosed = [true, true, true, true, false, false];
    expect(data).toBeTruthy();
    expect(data).toBeTruthy();
    data?.commands.forEach((_, index) => {
      assertSubpathData(data, expectedLen[index], index, expectedClosed[index]);
    });
  });
  it("Can get closed sub segment of the closed path", () => {
    const data = getTestPathData("M 1 2 l 2 3 3 4 Z M 1 2 L 3 3 Z M 4 4");
    const expectedLen = [4, 4, 4, 4, 3, 3, 3, 1];
    const expectedClosed = [true, true, true, true, true, true, true, false];
    expect(data).toBeTruthy();
    expect(data).toBeTruthy();
    data?.commands.forEach((_, index) => {
      assertSubpathData(data, expectedLen[index], index, expectedClosed[index]);
    });
  });
});
describe("PathData", () => {
  it("path relative converted", () => {
    const data = getTestPathData("M 1 2 l 2 3 3 4");
    expect(data).toBeTruthy();
    if (!data) {
      return;
    }
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

    // Relative commands are preserved:
    expect(pathDataToString(data)).toEqual("M 1 2 l 2 3 l 3 4");
  });

  it("path relative converted", () => {
    const data = getTestPathData("M 1 2 l 2 3 3 4");
    expect(data).toBeTruthy();
    if (!data) {
      return;
    }
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

    // Relative commands are preserved:
    expect(pathDataToString(data)).toEqual("M 1 2 l 2 3 l 3 4");
  });
  it("arc relative converted", () => {
    const data = getTestPathData("M1,1 a150,150 0 1,0 150,150");
    expect(data).toBeTruthy();
    if (!data) {
      return;
    }
    expect(data.commands.length).toEqual(2);
    const a = data.commands[data.commands.length - 1].p;
    expect(a.x).toEqual(151);
    expect(a.y).toEqual(151);
  });
  it("arc h, v relative converted", () => {
    const data = getTestPathData(
      "M1,1 h-10 h20 v-10 v20 a150,150 0 1,0 150,150"
    );
    expect(data).toBeTruthy();
    if (!data) {
      return;
    }
    expect(data.commands.length).toEqual(6);
    const a = data.commands[data.commands.length - 1].p;
    expect(a.x).toEqual(161);
    expect(a.y).toEqual(161);
  });
  it("arc absolute converted", () => {
    const data = getTestPathData(
      "M1,1 h-10 H20 v-10 V20 a150,150 0 1,0 150,150"
    );
    if (!data) {
      return;
    }
    expect(data.commands.length).toEqual(6);
    const a = data.commands[data.commands.length - 1].p;
    expect(a.x).toEqual(170);
    expect(a.y).toEqual(170);
  });
  it("move multiple commands to start", () => {
    const data = getTestPathData(
      "M1,1 h-10 m1,1, v20 h-10 a150,150 0 1,0 150,150"
    );
    if (!data) {
      return;
    }
    // m1,1, v20 to start
    const moved = data.moveCommands(2, 0, 2);
    expect(moved).toEqual(true);

    expect(true).toEqual(data.commands[0].isType(PathType.move));
    expect(true).toEqual(data.commands[1].isType(PathType.vertical));
    expect(true).toEqual(data.commands[2].isType(PathType.move));
    expect(true).toEqual(data.commands[3].isType(PathType.horizontal));
  });

  it("move multiple commands to end", () => {
    const data = getTestPathData(
      "M1,1 h-10 m1,1, v20 h-10 a150,150 0 1,0 150,150"
    );
    if (!data) {
      return;
    }
    // M1,2 H20 to end
    data.moveCommands(2, data.commands.length - 1, 2);
    const len = data.commands.length;
    expect(true).toEqual(data.commands[len - 3].isType(PathType.arc));
    expect(true).toEqual(data.commands[len - 2].isType(PathType.move));
    expect(true).toEqual(data.commands[len - 1].isType(PathType.vertical));
  });

  it("delete all prev commands by type", () => {
    const data = getTestPathData(
      "M1,1 h-10 m1,1, m1,1, m1,1, v20 h-10 a150,150 0 1,0 150,150"
    );
    if (!data) {
      return;
    }
    const firstVertical = data.commands.find((p) =>
      p.isType(PathType.vertical)
    );
    data.removeCommandsChainByType(
      firstVertical as PathDataCommand,
      false,
      true,
      PathType.move
    );
    const len = data.commands.length;
    const filteredLen = data.commands.filter((p) => p.isType(PathType.move));
    expect(true).toEqual(data.commands[0].isType(PathType.move));
    // Only first move command left
    expect(filteredLen.length).toEqual(1);
  });
});
