import { Injectable } from "@angular/core";
import { BaseCommand } from "../base-command";
import { SelectAllCommand } from "./select-all-command";
import { SelectAllGroupsCommand } from "./select-all-groups-command";
import { SelectInverseCommand } from "./select-inverse-command";
import { SelectNoneCommand } from "./select-none-command";
import { SelectSameCommand } from "./select-same-type-command";

/**
 * Sub menu with groups
 */
@Injectable({
  providedIn: "root",
})
export class SelectGroupCommand implements BaseCommand {
  constructor(
    private selectAllCommand: SelectAllCommand,
    private selectNoneCommand: SelectNoneCommand,
    private selectSameTypeCommand: SelectSameCommand,
    private selectInverseCommand: SelectInverseCommand,
    private selectAllGroupsCommand: SelectAllGroupsCommand
  ) {}
  title = "Select";
  commands: BaseCommand[] = [
    this.selectAllCommand,
    this.selectNoneCommand,
    this.selectSameTypeCommand,
    this.selectAllGroupsCommand,
    this.selectInverseCommand,
  ];
}
