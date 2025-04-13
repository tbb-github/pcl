
import {RawShaderMaterial} from '../../library/three.module.js';

import {RawShaderMaterial} from './enums.js';
const VertShader = require('./shaders/pointcloud.vs').default;
const FragShader = require('./shaders/pointcloud.fs').default;
const SIZE_TYPE_DEFS = {
	[PointSizeType.FIXED]: 'fixed_point_size',
	[PointSizeType.ATTENUATED]: 'attenuated_point_size',
	[PointSizeType.ADAPTIVE]: 'adaptive_point_size'
};

export class PointsMaterial extends RawShaderMaterial
{
    constructor() {
        super()
        this.updateShaderSource();
    }
    updateShaderSource(){
        this.glslVersion = '300 es';
        this.vertexShader = this.applyDefines(VertShader);
        this.fragmentShader =this.applyDefines(FragShader);
        this.needsUpdate = true;
    }
    applyDefines(shaderSrc) {
        const parts = [];
        function define(value) {
            if (value) {
                parts.push(`#define ${value}`);
            }
        }
        define(SIZE_TYPE_DEFS[this.pointSizeType]);
        define(SHAPE_DEFS[this.shape]);
        define(COLOR_DEFS[this.pointColorType]);
        define(CLIP_MODE_DEFS[this.clipMode]);
        define(OPACITY_DEFS[this.pointOpacityType]);
        define(OUTPUT_COLOR_ENCODING[this.outputColorEncoding]);
        define(INPUT_COLOR_ENCODING[this.inputColorEncoding]);
        parts.push(shaderSrc);
        return parts.join('\n');
    }
}