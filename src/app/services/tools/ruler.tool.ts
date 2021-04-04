import { Injectable } from "@angular/core";
import { BaseTool } from "./base.tool";

@Injectable({
  providedIn: "root",
})
export class RulerTool extends BaseTool {
  icon = "straighten";
}
