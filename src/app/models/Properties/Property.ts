export class Property {
  constructor(key, name, data, description) {
    this.key = key;
    this.name = name;
    this.data = data;
    this.description = description;
  }

  public readOnly = false;
  public key: string;
  public name: string;
  public description: string;
  // Container to set the data
  public data: any;
  public icon: string;
  // Render this property as outline node:
  public renderAsOutline = false;
}
