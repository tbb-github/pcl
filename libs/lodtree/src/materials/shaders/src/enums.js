"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PointColorType = exports.PointOpacityType = exports.TreeType = exports.PointShape = exports.PointSizeType = void 0;
var PointSizeType;
(function (PointSizeType) {
    PointSizeType[PointSizeType["FIXED"] = 0] = "FIXED";
    PointSizeType[PointSizeType["ATTENUATED"] = 1] = "ATTENUATED";
    PointSizeType[PointSizeType["ADAPTIVE"] = 2] = "ADAPTIVE";
})(PointSizeType || (exports.PointSizeType = PointSizeType = {}));
var PointShape;
(function (PointShape) {
    PointShape[PointShape["SQUARE"] = 0] = "SQUARE";
    PointShape[PointShape["CIRCLE"] = 1] = "CIRCLE";
    PointShape[PointShape["PARABOLOID"] = 2] = "PARABOLOID";
})(PointShape || (exports.PointShape = PointShape = {}));
var TreeType;
(function (TreeType) {
    TreeType[TreeType["OCTREE"] = 0] = "OCTREE";
    TreeType[TreeType["KDTREE"] = 1] = "KDTREE";
})(TreeType || (exports.TreeType = TreeType = {}));
var PointOpacityType;
(function (PointOpacityType) {
    PointOpacityType[PointOpacityType["FIXED"] = 0] = "FIXED";
    PointOpacityType[PointOpacityType["ATTENUATED"] = 1] = "ATTENUATED";
})(PointOpacityType || (exports.PointOpacityType = PointOpacityType = {}));
var PointColorType;
(function (PointColorType) {
    PointColorType[PointColorType["RGB"] = 0] = "RGB";
    PointColorType[PointColorType["COLOR"] = 1] = "COLOR";
    PointColorType[PointColorType["DEPTH"] = 2] = "DEPTH";
    PointColorType[PointColorType["HEIGHT"] = 3] = "HEIGHT";
    PointColorType[PointColorType["ELEVATION"] = 3] = "ELEVATION";
    PointColorType[PointColorType["INTENSITY"] = 4] = "INTENSITY";
    PointColorType[PointColorType["INTENSITY_GRADIENT"] = 5] = "INTENSITY_GRADIENT";
    PointColorType[PointColorType["LOD"] = 6] = "LOD";
    PointColorType[PointColorType["LEVEL_OF_DETAIL"] = 6] = "LEVEL_OF_DETAIL";
    PointColorType[PointColorType["POINT_INDEX"] = 7] = "POINT_INDEX";
    PointColorType[PointColorType["CLASSIFICATION"] = 8] = "CLASSIFICATION";
    PointColorType[PointColorType["RETURN_NUMBER"] = 9] = "RETURN_NUMBER";
    PointColorType[PointColorType["SOURCE"] = 10] = "SOURCE";
    PointColorType[PointColorType["NORMAL"] = 11] = "NORMAL";
    PointColorType[PointColorType["PHONG"] = 12] = "PHONG";
    PointColorType[PointColorType["RGB_HEIGHT"] = 13] = "RGB_HEIGHT";
    PointColorType[PointColorType["COMPOSITE"] = 50] = "COMPOSITE";
})(PointColorType || (exports.PointColorType = PointColorType = {}));
