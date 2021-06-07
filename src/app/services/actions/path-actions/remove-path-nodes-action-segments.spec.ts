import { TestBed } from "@angular/core/testing";
import { PathDataCommand } from "src/app/models/path/path-data-command";
import {
  getTestPathData,
  pathDataToString,
} from "src/app/models/path/path-data.spec";
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
  removePathNodesAction.removeSegment(command);
  if (pathData) {
    const output = pathDataToString(pathData);
    expect(output).toEqual(outputPathData);
  }
};
describe("Remove Path Data Segments Tests", () => {
  beforeEach(() => TestBed.configureTestingModule({}));
  it("Should remove move node", () =>
    assertRemovePathNode(
      "M 0 0 L 1 1 L 2 2 M 3 3 L 4 4 L 5 5",
      "M 1 1 L 2 2 M 3 3 L 4 4 L 5 5",
      0
    ));
  it("Should remove segment closed", () =>
    assertRemovePathNode(
      "M 0 0 L 1 1 L 2 2 L 3 3 Z",
      "M 2 2 L 3 3 L 0 0 L 1 1",
      2
    ));
  it("Should remove segment unclosed", () =>
    assertRemovePathNode(
      "M 0 0 L 1 1 L 2 2 L 3 3",
      "M 0 0 L 1 1 M 2 2 L 3 3",
      2
    ));
  it("Should remove last segment", () =>
    assertRemovePathNode("M 0 0 L 1 1 L 2 2 L 3 3", "M 0 0 L 1 1 L 2 2", 3));
  it("Should remove last segment next closed", () =>
    assertRemovePathNode(
      "M 0 0 L 1 1 L 2 2 L 3 3 M 5 5 L 6 6 Z",
      "M 0 0 L 1 1 L 2 2 M 5 5 L 6 6 Z",
      3
    ));
  it("Should remove last segment of a second segment", () =>
    assertRemovePathNode(
      "M 0 0 L 1 1 L 2 2 L 3 3 Z M 5 5 L 6 6",
      "M 0 0 L 1 1 L 2 2 L 3 3 Z",
      6
    ));
  it("Should remove and unclose first segment", () =>
    assertRemovePathNode(
      "M 0 0 L 1 1 L 2 2 L 3 3 Z M 0 0 L 1 1 L 2 2 L 3 3 Z",
      "M 2 2 L 3 3 L 0 0 L 1 1 M 0 0 L 1 1 L 2 2 L 3 3 Z",
      2
    ));
  it("Should remove and unclose second segment", () =>
    assertRemovePathNode(
      "M 0 0 L 1 1 L 2 2 L 3 3 Z M 5 5 L 6 6 L 7 7 L 8 8 Z",
      "M 0 0 L 1 1 L 2 2 L 3 3 Z M 6 6 L 7 7 L 8 8 L 5 5",
      6
    ));
  it("Should replace m closed", () =>
    assertRemovePathNode("M 0 0 L 1 1 Z", "M 1 1 L 0 0", 0));
  it("Should replace z with line closed", () =>
    assertRemovePathNode("M 0 0 L 1 1 Z", "M 1 1 L 0 0", 1));
  it("Should replace m", () => assertRemovePathNode("M 0 0 L 1 1", "", 0));
  it("Should be removed", () => assertRemovePathNode("M 0 0 L 1 1", "", 1));
});
