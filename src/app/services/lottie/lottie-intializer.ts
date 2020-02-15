import { ViewportService } from "../viewport/viewport.service";
import {
  InputDocument
} from "src/app/models/input-document";
import { Injectable } from "@angular/core";
import { LottieModel } from "../../models/Lottie/LottieModel";
import {
  default as lottie,
  AnimationItem,
  AnimationConfigWithData
} from "node_modules/lottie-web";
import { IInitializer } from "../interfaces/intializer";
import { IPlayer } from "../interfaces/player";
import { LottiePlayer } from "./lottie-player";

@Injectable({
  providedIn: "root"
})
export class LottieInitializer implements IInitializer {
  constructor(
    private viewportService: ViewportService
  ) {}

  initOnRefresh(){
      return true;
  }

  intialize(document: InputDocument, viewport: SVGElement): IPlayer {
    const data = document.parsedData as LottieModel;
    if (data == null) {
      return null;
    }

    this.viewportService.setViewportSize(new DOMRect(0, 0, data.w, data.h));
    const animParams = {
      container: viewport,
      renderer: "svg",
      loop: true,
      prerender: true,
      autoplay: false,
      animationData: data
    } as AnimationConfigWithData;

    const player = lottie.loadAnimation(animParams);
    return new LottiePlayer(player);
  }
}
