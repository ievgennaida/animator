import { HttpClientModule } from "@angular/common/http";
import { NgModule } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatButtonToggleModule } from "@angular/material/button-toggle";
import { MatIconModule } from "@angular/material/icon";
import { MatListModule } from "@angular/material/list";
import { MatMenuModule } from "@angular/material/menu";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatTreeModule } from "@angular/material/tree";
import { BrowserModule } from "@angular/platform-browser";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import { ResizableModule } from "angular-resizable-element";
import { AppComponent } from "./app.component";
import { ContextMenuComponent } from "./components/context-menu/context-menu.component";
import { FooterToolbarComponent } from "./components/footer-toolbar/footer-toolbar.component";
import { MouseTrackerComponent } from "./components/footer-toolbar/mouse-tracker/mouse-tracker.component";
import { HistoryComponent } from "./components/menu/history/history.component";
import { MenuComponent } from "./components/menu/menu.component";
import { OutlineNodeComponent } from "./components/outline/outline-node/outline-node.component";
import { OutlineComponent } from "./components/outline/outline/outline.component";
import { OutputComponent } from "./components/output/output.component";
import { BreadcrumbItemComponent } from "./components/player/breadcrumb/breadcrumb-item/breadcrumb-item.component";
import { BreadcrumbComponent } from "./components/player/breadcrumb/breadcrumb.component";
import { NotificationComponent } from "./components/player/notification/notification.component";
import { PlayerAdornerComponent } from "./components/player/player-adorners/player-adorner/player-adorner.component";
import { PlayerAdornersComponent } from "./components/player/player-adorners/player-adorners.component";
import { PlayerToolbarComponent } from "./components/player/player-toolbar/player-toolbar.component";
import { PlayerComponent } from "./components/player/player.component";
import { BoolComponent } from "./components/properties/bool/bool.component";
import { ColorComponent } from "./components/properties/color/color.component";
import { ComboComponent } from "./components/properties/combo/combo.component";
import { DnumericComponent } from "./components/properties/dnumeric/dnumeric.component";
import { NumericComponent } from "./components/properties/numeric/numeric.component";
import { PropertiesComponent } from "./components/properties/properties.component";
import { TextComponent } from "./components/properties/text/text.component";
import { TimelineComponent } from "./components/timeline/timeline.component";
import { MainToolbarComponent } from "./components/toolbars/main-toolbar/main-toolbar.component";
import { ToolCommandsComponent } from "./components/toolbars/tool-commands/tool-commands.component";
import { ToolboxComponent } from "./components/toolbars/toolbox/toolbox.component";
import { ScrollingModule } from "@angular/cdk/scrolling";
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
    FooterToolbarComponent,
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
    OutputComponent,
    MenuComponent,
    MouseTrackerComponent,
    BreadcrumbItemComponent,
    ToolCommandsComponent,
    HistoryComponent,
  ],
  imports: [
    ResizableModule,
    MatTreeModule,
    MatToolbarModule,
    MatIconModule,
    HttpClientModule,
    MatListModule,
    MatMenuModule,
    MatTooltipModule,
    MatButtonToggleModule,
    NoopAnimationsModule,
    MatButtonModule,
    BrowserModule,
    ScrollingModule,
  ],
  providers: [{ provide: Window, useValue: window }],
  bootstrap: [AppComponent],
})
export class AppModule {}
