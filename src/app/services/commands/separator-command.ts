import { Injectable } from "@angular/core";
import { BaseCommand } from "./base-command";

/**
 * Fake command Used to render separator in the toolbars.
 */
@Injectable({
  providedIn: "root",
})
export class SeparatorCommand implements BaseCommand {
  separator = true;
  execute() {}
}
