import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from "@angular/core";
import { MatMenuTrigger } from "@angular/material/menu";
import { takeUntil } from "rxjs/operators";
import { BaseCommand } from "src/app/services/commands/base-command";
import { ContextMenuCommandsService } from "src/app/services/commands/commands-services/context-menu-commands-service";
import { ContextMenuService } from "src/app/services/context-menu.service";
import { BaseComponent } from "../base-component";

@Component({
  selector: "app-context-menu",
  templateUrl: "./context-menu.component.html",
  styleUrls: ["./context-menu.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContextMenuComponent extends BaseComponent implements OnInit {
  commands: Array<BaseCommand> = [];
  trigger: MatMenuTrigger;
  @ViewChild("trigger")
  set setTrigger(value: MatMenuTrigger) {
    this.trigger = value;
    this.contextMenu.setTrigger(this.trigger);
  }

  contextMenuEl: ElementRef<HTMLElement>;
  @ViewChild("contextMenu", { read: ElementRef })
  set setMenuElement(value: ElementRef<HTMLElement>) {
    this.contextMenuEl = value;
    if (this.contextMenuEl) {
      this.contextMenu.setElement(this.contextMenuEl.nativeElement);
    }
  }

  element: ElementRef<HTMLElement>;
  @ViewChild("element", { read: ElementRef })
  set setElement(value: ElementRef<HTMLElement>) {
    this.element = value;
  }
  constructor(
    private contextMenu: ContextMenuService,
    private contextMenuCommandsService: ContextMenuCommandsService,
    private cdRef: ChangeDetectorRef
  ) {
    super();
  }
  ngOnInit(): void {
    this.commands = this.contextMenuCommandsService.getContextCommands();
    this.contextMenu.setTrigger(this.trigger);
    this.contextMenu.openSubject
      .pipe(takeUntil(this.destroyed$))
      .subscribe((args) => {
        if (!args || !args.event) {
          this.close();
        } else if (this.element && this.element.nativeElement) {
          const event = args.event;
          const el = this.element.nativeElement;
          el.style.left = event.clientX + 5 + "px";
          el.style.top = event.clientY + 5 + "px";
          if (this.trigger.menuOpen) {
            this.trigger.closeMenu();
            this.trigger.openMenu();
          } else {
            this.trigger.openMenu();
          }
          event.preventDefault();
          event.stopPropagation();
          this.cdRef.markForCheck();
        }
      });
  }
  close(): boolean {
    if (this.trigger && this.trigger.menuOpen) {
      this.trigger.closeMenu();
      return true;
    }
    return false;
  }

  globalMouseDown(event: MouseEvent): void {
    event.preventDefault();
  }
}
