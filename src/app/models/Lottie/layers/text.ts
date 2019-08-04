import { valueKeyframed } from "../properties/valueKeyframed";
import { baseLayer } from "./baseLayer";

export class text extends baseLayer {
  t: textData | any;
}
export class textData {
  /*
    "title": "Animators",
    "description": "Text animators",
    "items": {
      "properties": [
        {
          "title": "Animated Properties",
          "description": "Text animator animated properties",
          "properties": [
            {
              "title": "Position",
              "description": "Text animator Position",
              "oneOf": [
                {
                  "$ref": "#/properties/multiDimensional"
                },
                {
                  "$ref": "#/properties/multiDimensionalKeyframed"
                }
              ],
              "type": "object"
            },
            {
              "title": "Anchor Point",
              "description": "Text animator Anchor Point",
              "oneOf": [
                {
                  "$ref": "#/properties/multiDimensional"
                },
                {
                  "$ref": "#/properties/multiDimensionalKeyframed"
                }
              ],
              "type": "object"
            },
            {
              "title": "Scale",
              "description": "Text animator Scale",
              "oneOf": [
                {
                  "$ref": "#/properties/multiDimensional"
                },
                {
                  "$ref": "#/properties/multiDimensionalKeyframed"
                }
              ],
              "type": "object"
            },
            {
              "title": "Skew",
              "description": "Text animator Skew",
              "oneOf": [
                {
                  "$ref": "#/properties/value"
                },
                {
                  "$ref": "#/properties/valueKeyframed"
                }
              ],
              "type": "object"
            },
            {
              "title": "Skew Axis",
              "description": "Text animator Skew Axis",
              "oneOf": [
                {
                  "$ref": "#/properties/value"
                },
                {
                  "$ref": "#/properties/valueKeyframed"
                }
              ],
              "type": "object"
            },
            {
              "title": "Rotation",
              "description": "Text animator Rotation",
              "oneOf": [
                {
                  "$ref": "#/properties/value"
                },
                {
                  "$ref": "#/properties/valueKeyframed"
                }
              ],
              "type": "object"
            },
            {
              "title": "Opacity",
              "description": "Text animator Opacity",
              "oneOf": [
                {
                  "$ref": "#/properties/value"
                },
                {
                  "$ref": "#/properties/valueKeyframed"
                }
              ],
              "type": "object"
            },
            {
              "title": "Stroke Width",
              "description": "Text animator Stroke Width",
              "oneOf": [
                {
                  "$ref": "#/properties/value"
                },
                {
                  "$ref": "#/properties/valueKeyframed"
                }
              ],
              "type": "object"
            },
            {
              "title": "Stroke Color",
              "description": "Text animator Stroke Color",
              "oneOf": [
                {
                  "$ref": "#/properties/multiDimensional"
                },
                {
                  "$ref": "#/properties/multiDimensionalKeyframed"
                }
              ],
              "type": "object"
            },
            {
              "title": "Fill Color",
              "description": "Text animator Fill Color",
              "oneOf": [
                {
                  "$ref": "#/properties/multiDimensional"
                },
                {
                  "$ref": "#/properties/multiDimensionalKeyframed"
                }
              ],
              "type": "object"
            },
            {
              "title": "Fill Hue",
              "description": "Text animator Fill Hue",
              "oneOf": [
                {
                  "$ref": "#/properties/value"
                },
                {
                  "$ref": "#/properties/valueKeyframed"
                }
              ],
              "type": "object"
            },
            {
              "title": "Fill Saturation",
              "description": "Text animator Fill Saturation",
              "oneOf": [
                {
                  "$ref": "#/properties/value"
                },
                {
                  "$ref": "#/properties/valueKeyframed"
                }
              ],
              "type": "object"
            },
            {
              "title": "Fill Brightness",
              "description": "Text animator Fill Brightness",
              "oneOf": [
                {
                  "$ref": "#/properties/value"
                },
                {
                  "$ref": "#/properties/valueKeyframed"
                }
              ],
              "type": "object"
            },
            {
              "title": "Tracking",
              "description": "Text animator Tracking",
              "oneOf": [
                {
                  "$ref": "#/properties/value"
                },
                {
                  "$ref": "#/properties/valueKeyframed"
                }
              ],
              "type": "object"
            }
          ],
          "type": "object"
        },
        {
          "title": "Range Selecton",
          "description": "Animators Range Selecton",
          "properties": [
            {
              "title": "Type",
              "description": "Selector Type. Expressible, or Normal.",
              "type": "number"
            },
            {
              "title": "Max Amount",
              "description": "Selector Max Amount",
              "oneOf": [
                {
                  "$ref": "#/properties/value"
                },
                {
                  "$ref": "#/properties/valueKeyframed"
                }
              ],
              "type": "number"
            },
            {
              "title": "Min Ease",
              "description": "Levels Min Ease",
              "oneOf": [
                {
                  "$ref": "#/properties/value"
                },
                {
                  "$ref": "#/properties/valueKeyframed"
                }
              ],
              "type": "number"
            },
            {
              "title": "Max Ease",
              "description": "Levels Max Ease",
              "oneOf": [
                {
                  "$ref": "#/properties/value"
                },
                {
                  "$ref": "#/properties/valueKeyframed"
                }
              ],
              "type": "number"
            },
            {
              "title": "Randomize",
              "description": "Selector Randomize Order boolean",
              "type": "number"
            },
            {
              "title": "Shape",
              "description": "Selector Shape",
              "oneOf": [
                {
                  "$ref": "#/helpers/textShape"
                }
              ],
              "type": "number"
            },
            {
              "title": "Based On",
              "description": "Selector Based On",
              "oneOf": [
                {
                  "$ref": "#/helpers/textBased"
                }
              ],
              "type": "number"
            },
            {
              "title": "Range Units",
              "description": "Selector Range Units. Percentage or Index.",
              "type": "number"
            },
            {
              "title": "Start",
              "description": "Selector Start",
              "oneOf": [
                {
                  "$ref": "#/properties/value"
                },
                {
                  "$ref": "#/properties/valueKeyframed"
                }
              ],
              "type": "number"
            },
            {
              "title": "End",
              "description": "Selector End",
              "oneOf": [
                {
                  "$ref": "#/properties/value"
                },
                {
                  "$ref": "#/properties/valueKeyframed"
                }
              ],
              "type": "number"
            },
            {
              "title": "Offset",
              "description": "Selector Offset",
              "oneOf": [
                {
                  "$ref": "#/properties/value"
                },
                {
                  "$ref": "#/properties/valueKeyframed"
                }
              ],
              "type": "number"
            }
          ],
          "type": "object"
        }
      ],
      "type": "object"
    },
    "type": "array"
  },
  {
    "title": "More Options",
    "description": "Text More Options",
    "properties": [
      {
        "title": "Anchor Point Grouping",
        "description": "Text Anchor Point Grouping",
        "oneOf": [
          {
            "$ref": "#/helpers/textGrouping"
          }
        ],
        "type": "number"
      },
      {
        "title": "Grouping Alignment",
        "description": "Text Grouping Alignment",
        "oneOf": [
          {
            "$ref": "#/properties/multiDimensional"
          },
          {
            "$ref": "#/properties/multiDimensionalKeyframed"
          }
        ],
        "type": "number"
      }
    ],
    "type": "object"
  },
  {
    "title": "Text Path",
    "description": "Text Path",
    "type": "number"
  },
  {
    "title": "Document",
    "description": "Text Document Data",
    "properties": [
      {
        "title": "Keyframes",
        "description": "Text Document Data Keyframes",
        "items": {
          "oneOf": [
            {
              "properties": [
                {
                  "title": "Time",
                  "description": "Keyframe Time",
                  "type": "number"
                },
                {
                  "title": "Text Properties",
                  "description": "Text Properties",
                  "type": "object",
                  "properties": [
                    {
                      "title": "Font",
                      "description": "Text Font",
                      "type": "string"
                    },
                    {
                      "title": "Font Color",
                      "description": "Text Font Color",
                      "type": "array"
                    },
                    {
                      "title": "Justificaiton",
                      "description": "Text Justification",
                      "type": "string"
                    },
                    {
                      "title": "Line Height",
                      "description": "Text Line Height",
                      "type": "number"
                    },
                    {
                      "title": "Size",
                      "description": "Text Font Size",
                      "type": "number"
                    },
                    {
                      "title": "Text",
                      "description": "Text String Value",
                      "type": "string"
                    },
                    {
                      "title": "Tracking",
                      "description": "Text Tracking",
                      "type": "number"
                    }
                  ]
                }
              ]
            }
          ],
          "type": "object"
        },
        "type": "array"
      }
    ],
    "type": "object"
  }
*/
}
