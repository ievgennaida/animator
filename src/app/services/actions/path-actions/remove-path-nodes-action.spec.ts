import { ComponentFixture, TestBed } from "@angular/core/testing";
import { assert } from "console";
import { PathData } from "src/app/models/path/path-data";
import { PathDataCommand } from "src/app/models/path/path-data-command";
import {
  getTestPathData,
  pathDataToString,
} from "src/app/models/path/path-data.spec";
import { consts } from "src/environments/consts";
import { ActionsFactory } from "../actions-factory";
import { RemovePathNodesAction } from "./remove-path-nodes-action";

const assertRemovePathNode = (
  inputPathData: string,
  outputPathData: string,
  removeIndex: number
) => {
  const actionsFactory = TestBed.inject<ActionsFactory>(ActionsFactory);
  const removePathNodesAction = actionsFactory.get<RemovePathNodesAction>(
    RemovePathNodesAction
  );
  expect(removeIndex).toBeGreaterThanOrEqual(
    0,
    "Index cannot be less than 0, invalid test arguments"
  );
  expect(removePathNodesAction).toBeTruthy();
  const pathData = getTestPathData(inputPathData);
  const command = pathData?.commands[removeIndex] as PathDataCommand;
  expect(removeIndex).toBeLessThan(pathData?.commands.length || 0);
  expect(command).toBeTruthy();
  expect(pathData).toBeTruthy();
  removePathNodesAction.removeNode(command);
  if (pathData) {
    const output = pathDataToString(pathData);
    expect(output).toEqual(outputPathData);
  }
};
describe("Remove Path Data Actions Tests", () => {
  beforeEach(() => TestBed.configureTestingModule({}));
  it("Should remove move node", () =>
    assertRemovePathNode(
      "M 0 0 L 1 1 L 2 2 M 3 3 L 4 4 L 5 5",
      "M 1 1 L 2 2 M 3 3 L 4 4 L 5 5",
      0
    ));
  it("Should remove line node", () =>
    assertRemovePathNode(
      "M 0 0 L 1 1 L 2 2 M 3 3 L 4 4 L 5 5",
      "M 0 0 L 1 1 M 3 3 L 4 4 L 5 5",
      2
    ));
  it("Should remove move node, second segment", () =>
    assertRemovePathNode(
      "M 0 0 L 1 1 L 2 2 M 3 3 L 4 4 L 5 5",
      "M 0 0 L 1 1 L 2 2 M 4 4 L 5 5",
      3
    ));
  it("Should remove last node", () =>
    assertRemovePathNode(
      "M 0 0 L 1 1 L 2 2 M 3 3 L 4 4 L 5 5",
      "M 0 0 L 1 1 L 2 2 M 3 3 L 4 4",
      5
    ));
  it("Should remove closed last bezier node", () =>
    assertRemovePathNode(
      "M 0 0 L 1 1 L 2 2 M 3 3 L 4 4 L 5 5 Z",
      "M 0 0 L 1 1 L 2 2 M 3 3 L 4 4 L 5 5",
      6
    ));
  it("Should remove move node when closed", () =>
    assertRemovePathNode(
      "M 0 0 L 1 1 L 2 2 Z M 3 3 L 4 4 L 5 5 Z",
      "M 1 1 L 2 2 Z M 3 3 L 4 4 L 5 5 Z",
      0
    ));
  it("Should remove closed bezier nodes", () =>
    assertRemovePathNode(
      "M 0 0 L 1 1 L 2 2 Z M 3 3 L 4 4 L 5 5 Z",
      "M 0 0 L 1 1 L 2 2 M 3 3 L 4 4 L 5 5 Z",
      3
    ));
  /**
   * Remaining segment makes no sense. Whole segment
   */
  it("Should remove bezier M node and related segment", () =>
    assertRemovePathNode(
      "M 0 0 L 1 1 M 2 2 L 3 3 L 4 4",
      "M 2 2 L 3 3 L 4 4",
      0
    ));
  it("Should remove second M node segment", () =>
    assertRemovePathNode(
      "M 0 0 L 1 1 M 2 2 L 3 3",
      "M 0 0 L 1 1",
      2 // M 3 3
    ));
  it("Should remove second M node segment closed", () =>
    assertRemovePathNode(
      "M 0 0 L 1 1 M 2 2 L 3 3 Z",
      "M 0 0 L 1 1",
      2 // M 2 2
    ));
  it("Should remove second L node segment closed", () =>
    assertRemovePathNode(
      "M 0 0 L 1 1 M 2 2 L 3 3 Z",
      "M 0 0 L 1 1",
      3 // L 3 3
    ));
  it("Should remove just close Z node", () =>
    assertRemovePathNode(
      "M 0 0 L 1 1 Z M 2 2 L 3 3 Z",
      "M 0 0 L 1 1 M 2 2 L 3 3 Z",
      2 // Z
    ));
  it("Should remove second L node segment opened", () =>
    assertRemovePathNode(
      "M 0 0 L 1 1 M 2 2 L 3 3",
      "M 0 0 L 1 1",
      3 // L 3 3
    ));
  it("Should remove L bezier node and related segment", () =>
    assertRemovePathNode(
      "M 0 0 L 1 1 M 2 2 L 3 3 L 4 4",
      "M 2 2 L 3 3 L 4 4",
      1 // L 1 1
    ));
  it("Should remove M bezier node and related closed segment", () =>
    assertRemovePathNode(
      "M 0 0 L 1 1 Z M 3 3 L 4 4 L 5 5",
      "M 3 3 L 4 4 L 5 5",
      1 // L 2 2
    ));
  it("Should remove bezier M node from the second segment", () =>
    assertRemovePathNode(
      "M 0 0 L 1 1 Z M 3 3 L 4 4 L 5 5",
      "M 0 0 L 1 1 Z M 4 4 L 5 5",
      3
    ));
  it("Should remove segment by M removal", () =>
    assertRemovePathNode("M 0 0 L 1 1 Z", "", 0));
  it("Should remove segment by L removal", () =>
    assertRemovePathNode("M 0 0 L 1 1 Z", "", 1));
  it("Should keep segment by L removal", () =>
    assertRemovePathNode("M 0 0 L 1 1 L 2 2", "M 0 0 L 2 2", 1));
  it("Should keep segment by L removal", () =>
    assertRemovePathNode("M 0 0 L 1 1 L 2 2", "M 1 1 L 2 2", 0));
  it("Should keep bezier by Z removal", () =>
    assertRemovePathNode("M 0 0 L 1 1 Z", "M 0 0 L 1 1", 2));
});
