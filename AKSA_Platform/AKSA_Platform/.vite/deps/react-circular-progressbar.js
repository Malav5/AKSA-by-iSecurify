import {
  require_react
} from "./chunk-6GAV2S6I.js";
import {
  __toESM
} from "./chunk-DC5AMYBS.js";

// node_modules/react-circular-progressbar/dist/index.esm.js
var import_react = __toESM(require_react());
var extendStatics = function(d, b) {
  extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d2, b2) {
    d2.__proto__ = b2;
  } || function(d2, b2) {
    for (var p in b2) if (b2.hasOwnProperty(p)) d2[p] = b2[p];
  };
  return extendStatics(d, b);
};
function __extends(d, b) {
  extendStatics(d, b);
  function __() {
    this.constructor = d;
  }
  d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}
var __assign = function() {
  __assign = Object.assign || function __assign2(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
      s = arguments[i];
      for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
    }
    return t;
  };
  return __assign.apply(this, arguments);
};
function __rest(s, e) {
  var t = {};
  for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
    t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function") {
    for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)
      t[p[i]] = s[p[i]];
  }
  return t;
}
var VIEWBOX_WIDTH = 100;
var VIEWBOX_HEIGHT = 100;
var VIEWBOX_HEIGHT_HALF = 50;
var VIEWBOX_CENTER_X = 50;
var VIEWBOX_CENTER_Y = 50;
function Path(_a) {
  var className = _a.className, counterClockwise = _a.counterClockwise, dashRatio = _a.dashRatio, pathRadius = _a.pathRadius, strokeWidth = _a.strokeWidth, style = _a.style;
  return (0, import_react.createElement)("path", { className, style: Object.assign({}, style, getDashStyle({ pathRadius, dashRatio, counterClockwise })), d: getPathDescription({
    pathRadius,
    counterClockwise
  }), strokeWidth, fillOpacity: 0 });
}
function getPathDescription(_a) {
  var pathRadius = _a.pathRadius, counterClockwise = _a.counterClockwise;
  var radius = pathRadius;
  var rotation = counterClockwise ? 1 : 0;
  return "\n      M " + VIEWBOX_CENTER_X + "," + VIEWBOX_CENTER_Y + "\n      m 0,-" + radius + "\n      a " + radius + "," + radius + " " + rotation + " 1 1 0," + 2 * radius + "\n      a " + radius + "," + radius + " " + rotation + " 1 1 0,-" + 2 * radius + "\n    ";
}
function getDashStyle(_a) {
  var counterClockwise = _a.counterClockwise, dashRatio = _a.dashRatio, pathRadius = _a.pathRadius;
  var diameter = Math.PI * 2 * pathRadius;
  var gapLength = (1 - dashRatio) * diameter;
  return {
    strokeDasharray: diameter + "px " + diameter + "px",
    strokeDashoffset: (counterClockwise ? -gapLength : gapLength) + "px"
  };
}
var CircularProgressbar = function(_super) {
  __extends(CircularProgressbar2, _super);
  function CircularProgressbar2() {
    return _super !== null && _super.apply(this, arguments) || this;
  }
  CircularProgressbar2.prototype.getBackgroundPadding = function() {
    if (!this.props.background) {
      return 0;
    }
    return this.props.backgroundPadding;
  };
  CircularProgressbar2.prototype.getPathRadius = function() {
    return VIEWBOX_HEIGHT_HALF - this.props.strokeWidth / 2 - this.getBackgroundPadding();
  };
  CircularProgressbar2.prototype.getPathRatio = function() {
    var _a = this.props, value = _a.value, minValue = _a.minValue, maxValue = _a.maxValue;
    var boundedValue = Math.min(Math.max(value, minValue), maxValue);
    return (boundedValue - minValue) / (maxValue - minValue);
  };
  CircularProgressbar2.prototype.render = function() {
    var _a = this.props, circleRatio = _a.circleRatio, className = _a.className, classes = _a.classes, counterClockwise = _a.counterClockwise, styles = _a.styles, strokeWidth = _a.strokeWidth, text = _a.text;
    var pathRadius = this.getPathRadius();
    var pathRatio = this.getPathRatio();
    return (0, import_react.createElement)(
      "svg",
      { className: classes.root + " " + className, style: styles.root, viewBox: "0 0 " + VIEWBOX_WIDTH + " " + VIEWBOX_HEIGHT, "data-test-id": "CircularProgressbar" },
      this.props.background ? (0, import_react.createElement)("circle", { className: classes.background, style: styles.background, cx: VIEWBOX_CENTER_X, cy: VIEWBOX_CENTER_Y, r: VIEWBOX_HEIGHT_HALF }) : null,
      (0, import_react.createElement)(Path, { className: classes.trail, counterClockwise, dashRatio: circleRatio, pathRadius, strokeWidth, style: styles.trail }),
      (0, import_react.createElement)(Path, { className: classes.path, counterClockwise, dashRatio: pathRatio * circleRatio, pathRadius, strokeWidth, style: styles.path }),
      text ? (0, import_react.createElement)("text", { className: classes.text, style: styles.text, x: VIEWBOX_CENTER_X, y: VIEWBOX_CENTER_Y }, text) : null
    );
  };
  CircularProgressbar2.defaultProps = {
    background: false,
    backgroundPadding: 0,
    circleRatio: 1,
    classes: {
      root: "CircularProgressbar",
      trail: "CircularProgressbar-trail",
      path: "CircularProgressbar-path",
      text: "CircularProgressbar-text",
      background: "CircularProgressbar-background"
    },
    counterClockwise: false,
    className: "",
    maxValue: 100,
    minValue: 0,
    strokeWidth: 8,
    styles: {
      root: {},
      trail: {},
      path: {},
      text: {},
      background: {}
    },
    text: ""
  };
  return CircularProgressbar2;
}(import_react.Component);
function CircularProgressbarWithChildren(props) {
  var children = props.children, circularProgressbarProps = __rest(props, ["children"]);
  return (0, import_react.createElement)(
    "div",
    { "data-test-id": "CircularProgressbarWithChildren" },
    (0, import_react.createElement)(
      "div",
      { style: { position: "relative", width: "100%", height: "100%" } },
      (0, import_react.createElement)(CircularProgressbar, __assign({}, circularProgressbarProps)),
      props.children ? (0, import_react.createElement)("div", { "data-test-id": "CircularProgressbarWithChildren__children", style: {
        position: "absolute",
        width: "100%",
        height: "100%",
        marginTop: "-100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center"
      } }, props.children) : null
    )
  );
}
function buildStyles(_a) {
  var rotation = _a.rotation, strokeLinecap = _a.strokeLinecap, textColor = _a.textColor, textSize = _a.textSize, pathColor = _a.pathColor, pathTransition = _a.pathTransition, pathTransitionDuration = _a.pathTransitionDuration, trailColor = _a.trailColor, backgroundColor = _a.backgroundColor;
  var rotationTransform = rotation == null ? void 0 : "rotate(" + rotation + "turn)";
  var rotationTransformOrigin = rotation == null ? void 0 : "center center";
  return {
    root: {},
    path: removeUndefinedValues({
      stroke: pathColor,
      strokeLinecap,
      transform: rotationTransform,
      transformOrigin: rotationTransformOrigin,
      transition: pathTransition,
      transitionDuration: pathTransitionDuration == null ? void 0 : pathTransitionDuration + "s"
    }),
    trail: removeUndefinedValues({
      stroke: trailColor,
      strokeLinecap,
      transform: rotationTransform,
      transformOrigin: rotationTransformOrigin
    }),
    text: removeUndefinedValues({
      fill: textColor,
      fontSize: textSize
    }),
    background: removeUndefinedValues({
      fill: backgroundColor
    })
  };
}
function removeUndefinedValues(obj) {
  Object.keys(obj).forEach(function(key) {
    if (obj[key] == null) {
      delete obj[key];
    }
  });
  return obj;
}
export {
  CircularProgressbar,
  CircularProgressbarWithChildren,
  buildStyles
};
/*! Bundled license information:

react-circular-progressbar/dist/index.esm.js:
  (*! *****************************************************************************
  Copyright (c) Microsoft Corporation. All rights reserved.
  Licensed under the Apache License, Version 2.0 (the "License"); you may not use
  this file except in compliance with the License. You may obtain a copy of the
  License at http://www.apache.org/licenses/LICENSE-2.0
  
  THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
  KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
  WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
  MERCHANTABLITY OR NON-INFRINGEMENT.
  
  See the Apache Version 2.0 License for specific language governing permissions
  and limitations under the License.
  ***************************************************************************** *)
*/
//# sourceMappingURL=react-circular-progressbar.js.map
