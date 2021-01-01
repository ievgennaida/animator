import { ComponentFixture, TestBed } from "@angular/core/testing";
import { MatMenuModule } from "@angular/material/menu";

import { DynamicContextMenuComponent } from "./dynamic-context-menu.component";

describe("DynamicContextMenuComponent", () => {
  let component: DynamicContextMenuComponent;
  let fixture: ComponentFixture<DynamicContextMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatMenuModule],
      declarations: [DynamicContextMenuComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DynamicContextMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
