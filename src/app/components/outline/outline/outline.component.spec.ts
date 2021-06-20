import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";
import { SelectionService } from "src/app/services/selection.service";

import { OutlineComponent } from "./outline.component";

describe("OutlineComponent", () => {
  let component: OutlineComponent;
  let fixture: ComponentFixture<OutlineComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [OutlineComponent],
        providers: [SelectionService],
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(OutlineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
