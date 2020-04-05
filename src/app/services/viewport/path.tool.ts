import { Injectable } from '@angular/core';
import { BaseTool } from './base.tool';
import { CursorService } from '../cursor.service';
import { LoggerService } from '../logger.service';
import { SelectionService } from '../selection.service';

@Injectable({
  providedIn: 'root'
})
/**
 * Direct selection
 */
export class PathTool  extends BaseTool {
  svgMatrix: DOMMatrix = null;
  mouseDownPos: DOMPoint = null;
  iconName = "navigation_outline";
  constructor(
    private selectionService: SelectionService,
    private logger: LoggerService,
    private cursor: CursorService
  ) {
    super();
  }
}
