import { Injectable, Injector, Type } from "@angular/core";

/**
 * Resolve action dependencies and create new instance on each call!
 */
@Injectable({
  providedIn: "root",
})
export class ActionsFactory {
  constructor(private injector: Injector) {}
  get<T>(value: Type<T>): T {
    // Each injectable type already has a token assigned (angular v8)
    const result = this.injector.get<T>(value as any);
    (this.injector as any)?.records?.delete(value);
    return result;
  }
}
