import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ActionsFactory } from "./actions-factory";
import { AddElementAction } from "./add-element-action";

describe("ActionsFactory", () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it("should create new instances of each action", () => {
    const service: ActionsFactory = TestBed.inject(ActionsFactory);
    const one = service.get<AddElementAction>(AddElementAction);
    const two = service.get<AddElementAction>(AddElementAction);

    expect(one === two).toBeFalse();
  });
});
