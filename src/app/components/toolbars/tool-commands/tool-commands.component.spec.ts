import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ToolCommandsComponent } from "./tool-commands.component";

describe("ToolCommandsComponent", () => {
  let component: ToolCommandsComponent;
  let fixture: ComponentFixture<ToolCommandsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ToolCommandsComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ToolCommandsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
