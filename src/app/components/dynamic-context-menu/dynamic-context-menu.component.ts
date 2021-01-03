import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  ViewChild,
} from "@angular/core";
import { MatMenu } from "@angular/material/menu";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import {
  BaseCommand,
  executeCommand,
} from "src/app/services/commands/base-command";
import { BaseComponent } from "../base-component";

@Component({
  selector: "app-dynamic-context-menu",
  templateUrl: "./dynamic-context-menu.component.html",
  styleUrls: ["./dynamic-context-menu.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DynamicContextMenuComponent
  extends BaseComponent
  implements OnInit {
  protected commandChanged$ = new Subject<BaseCommand>();
  constructor(private cdRef: ChangeDetectorRef) {
    super();
  }
  @ViewChild("menu") public matMenu: MatMenu;

  public commands: BaseCommand[] | null = [];
  @Input("commands") set setCommand(commands: BaseCommand[]) {
    this.subscribeCommands(commands);
  }

  render() {
    this.cdRef.markForCheck();
  }
  subscribeCommands(commands: Array<BaseCommand>) {
    // Notify to unsubscribe current subscribed list if any:
    this.commandChanged$.next();

    this.commands = commands;
    if (this.commands) {
      this.commands.forEach((p) => {
        if (p && p.changed) {
          p.changed
            .asObservable()
            // destroy on commands list changed or when component is unloaded:
            .pipe(takeUntil(this.commandChanged$), takeUntil(this.destroyed$))
            .subscribe(() => {
              // Render commands again
              this.render();
            });
        }
      });
    }

    this.render();
  }

  ngOnInit(): void {}

  onActionClicked(event: MouseEvent, command: BaseCommand) {
    // Run in a next tick, allow for menu to be responsive.
    setTimeout(() => {
      if (command && !command.commands) {
        executeCommand(command);
        this.render();
      }
    }, 10);
    this.render();
  }
}
