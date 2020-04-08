import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";

import { AppComponent } from "./app.component";
import { OutlineComponent } from "./components/outline/outline/outline.component";
import { PropertiesComponent } from "./components/properties/properties/properties.component";
import { TimelineComponent } from "./components/timeline/timeline.component";
import { ToolboxComponent } from "./components/toolbox/toolbox.component";
import { PlayerComponent } from "./components/player/player.component";
import { NumericComponent } from "./components/properties/numeric/numeric.component";
import { DnumericComponent } from "./components/properties/dnumeric/dnumeric.component";

import { MatIconModule } from "@angular/material/icon";
import { MatTreeModule } from "@angular/material/tree";
import { MatButtonModule } from "@angular/material/button";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import { MatListModule } from "@angular/material/list";

import { ResizableModule } from "angular-resizable-element";
import { MatMenuModule } from "@angular/material/menu";
import { MatToolbarModule } from "@angular/material/toolbar";

import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { ControlsComponent } from './components/timeline/controls/controls.component';
import { TextComponent } from './components/properties/text/text.component';
import { BoolComponent } from './components/properties/bool/bool.component';
import { ComboComponent } from './components/properties/combo/combo.component';
import { ColorComponent } from './components/properties/color/color.component';
import { OutlineNodeComponent } from './components/outline/outline-node/outline-node.component';
import { MainToolbarComponent } from './components/main-toolbar/main-toolbar.component';
import { PlayerToolbarComponent } from './components/player/player-toolbar/player-toolbar.component';
import { PlayerAdornersComponent } from './components/player/player-adorners/player-adorners.component';
import { PlayerAdornerComponent } from './components/player/player-adorners/player-adorner/player-adorner.component';
import { BreadcrumbComponent } from './components/player/breadcrumb/breadcrumb.component';
import { NotificationComponent } from './components/player/notification/notification.component';
import { ContextMenuComponent } from './components/context-menu/context-menu.component';
import { OutputComponent } from './components/output/output.component';

@NgModule({
  declarations: [
    AppComponent,
    OutlineComponent,
    PropertiesComponent,
    TimelineComponent,
    ToolboxComponent,
    PlayerComponent,
    NumericComponent,
    DnumericComponent,
    ControlsComponent,
    TextComponent,
    BoolComponent,
    ComboComponent,
    ColorComponent,
    OutlineNodeComponent,
    MainToolbarComponent,
    PlayerToolbarComponent,
    PlayerAdornersComponent,
    PlayerAdornerComponent,
    BreadcrumbComponent,
    NotificationComponent,
    ContextMenuComponent,
    OutputComponent
  ],
  imports: [
    ResizableModule,
    MatTreeModule,
    MatToolbarModule,
    MatIconModule,
    MatListModule,
    MatMenuModule,
    MatButtonToggleModule,
    NoopAnimationsModule,
    MatButtonModule,
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
