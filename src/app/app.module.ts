import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";

import { AppComponent } from "./app.component";
import { OutlineComponent } from "./components/outline/outline/outline.component";
import { PropertiesComponent } from "./components/properties/properties/properties.component";
import { TimelineComponent } from "./components/timeline/timeline.component";
import { ToolboxComponent } from "./components/toolbox/toolbox.component";
import { PlayerComponent } from "./components/player/player.component";
import { NumbericComponent } from "./components/properties/numberic/numberic.component";
import { DnumbericComponent } from "./components/properties/dnumberic/dnumberic.component";

import { MatIconModule } from "@angular/material/icon";
import { MatTreeModule } from "@angular/material/tree";
import { MatButtonModule } from "@angular/material/button";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import { MatListModule } from "@angular/material/list";

import { ResizableModule } from "angular-resizable-element";
import { MatMenuModule } from "@angular/material/menu";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatSidenavModule } from "@angular/material/sidenav";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { ControlsComponent } from './components/timeline/controls/controls.component';

@NgModule({
  declarations: [
    AppComponent,
    OutlineComponent,
    PropertiesComponent,
    TimelineComponent,
    ToolboxComponent,
    PlayerComponent,
    NumbericComponent,
    DnumbericComponent,
    ControlsComponent
  ],
  imports: [
    ResizableModule,
    MatTreeModule,
    MatToolbarModule,
    MatIconModule,
    MatListModule,
    MatMenuModule,
    MatInputModule,
    MatSidenavModule,
    MatFormFieldModule,
    NoopAnimationsModule,
    MatButtonModule,
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
