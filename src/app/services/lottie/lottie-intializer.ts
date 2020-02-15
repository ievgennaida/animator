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
import { IInitializer, InitResults } from "../interfaces/intializer";
import { LottiePlayer } from "./lottie-player";

export class LottieInitializer implements IInitializer {
  constructor(

  ) {}

  initOnRefresh(){
      return true;
  }

  intialize(document: InputDocument, host: SVGElement): InitResults {
    const data = document.parsedData as LottieModel;
    if (data == null) {
      return null;
    }

    const animParams = {
      container: host,
      renderer: "svg",
      loop: true,
      prerender: true,
      autoplay: false,
      animationData: data
    } as AnimationConfigWithData;
    host.innerHTML = "";
    const player = lottie.loadAnimation(animParams);
    const results = new InitResults();
    results.player=  new LottiePlayer(player);
    results.size = new DOMRect(0, 0, data.w, data.h);
    return results;
  }
}
