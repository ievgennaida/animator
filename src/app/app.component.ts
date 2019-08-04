import { OnInit, Component, HostListener, ElementRef, ViewChild } from "@angular/core";
import { ResizeEvent } from "angular-resizable-element";
import { StateService } from './services/state.service';
import { OutlineComponent } from './components/outline/outline/outline.component';
import { consts } from 'src/environments/consts';

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"]
})
export class AppComponent implements OnInit {
  title = "animation";
  // TODO bind specific value directly.
  outlineStyle = {};
  propertiesStyle = {};
  drawerContentStyle: any = {};
  recentItems = [];

  constructor(private stateService: StateService) {
  }


  @ViewChild("footer", { static: true, read: ElementRef  })
  footer: ElementRef;

  @ViewChild("outline", { static: false, read: ElementRef })
  outline: ElementRef;

  @ViewChild("properties", { static: true, read: ElementRef })
  properties: ElementRef;

  @ViewChild("main", { static: true, read: ElementRef  })
  main: ElementRef;

  @ViewChild("drawerContent", { static: true })
  drawerContent: ElementRef;

  onResizeOutline(event: ResizeEvent, isEnd: boolean): void {
    this.resize(event.rectangle.width, this.main.nativeElement.clientWidth, this.outlineStyle);
  }

  onResizeResizable(event: ResizeEvent, isEnd: boolean): void {
    let newSize = this.resize(event.rectangle.width, this.footer.nativeElement.clientWidth, this.propertiesStyle);
    this.drawerContentStyle.marginRight = newSize;
  }

  resize(w, maxWidth, style) {
    let minW = maxWidth * 0.10;
    let maxW = maxWidth * 0.90;
    if (w <= minW) {
      w = minW;
    }

    if (w >= maxW) {
      w = maxW;
    }

    let toSet = `${w}px`;;
    style.width = toSet
    this.stateService.setPanelResized();

    return toSet;
  }

  @HostListener("window:resize", ["$event"])
  onWindowResize() {
    if (!this.outline || !this.outline.nativeElement) {
      return;
    }
    
    // Set the scroll into the bounds:
    this.resize(
      this.outline.nativeElement.clientWidth,
      this.footer.nativeElement.clientWidth,
      this.outlineStyle
    );

    this.resize(
      this.properties.nativeElement.clientWidth,
      this.main.nativeElement.clientWidth,
      this.propertiesStyle
    );
  }

  ngOnInit() {
    this.setRecent(null);
  }

  loadData(item) {
    let data = JSON.parse(item.str);
    this.stateService.setData(data);
    this.setRecent(item);
  }

  setRecent(newRecentItem: any) {
    let stored = localStorage.getItem('recent')
    let parsed = null;

    if (stored) {
      parsed = JSON.parse(stored);
    }

    if (!Array.isArray(parsed)) {
      parsed = [];
    }

    this.recentItems = parsed;

    if (newRecentItem) {
      let index = this.recentItems.indexOf(this.recentItems.find(p => p.name == newRecentItem.name));
        
      if (index >= 0 || this.recentItems.length > consts.recentItemsCount) {
        if (index <= 0) {
          index = 0;
        }

        this.recentItems.splice(index, 1);
      }

      this.recentItems.push(newRecentItem);
      localStorage.setItem('recent', JSON.stringify(this.recentItems));
    }
  }

  fileSelected(event) {
    let files = event.target.files;
    if (!files || event.target.files.length === 0) {
      return
    }

    let file: File = files[0];
    this.title = file.name;
    let fileReader = new FileReader();
    fileReader.onload = () => {
      try {
        let str = fileReader.result.toString();
        let newData = {
          name: file.name,
          str: str
        };

        this.loadData(newData);
      } catch (err) {
        alert(`File ${file.name} cannot be parsed!`);
        console.log(err);
      }
    }

    fileReader.readAsText(file);

    // after here 'file' can be accessed and used for further process
  }
}
