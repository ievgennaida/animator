export interface ICTMProvider {
  getCTM(): DOMMatrix;
  getScreenCTM(): DOMMatrix;
}
