
import {RawShaderMaterial} from '../../library/three.module.js';

// const VertShader = require('./shaders/pointcloud.vs.js/index.js').default;
// const FragShader = require('./shaders/pointcloud.fs.js/index.js').default;
import VertShader from './shaders/pointcloud.vs.js';
import FragShader from './shaders/pointcloud.fs.js';
import {PointColorType, PointSizeType, ColorEncoding } from './shaders/enums.js';
const SIZE_TYPE_DEFS = {
	[PointSizeType.FIXED]: 'fixed_point_size',
	[PointSizeType.ATTENUATED]: 'attenuated_point_size',
	[PointSizeType.ADAPTIVE]: 'adaptive_point_size'
};
const INPUT_COLOR_ENCODING = {
	[ColorEncoding.LINEAR]: 'input_color_encoding_linear',
	[ColorEncoding.SRGB]: 'input_color_encoding_sRGB'
};

const OUTPUT_COLOR_ENCODING = {
	[ColorEncoding.LINEAR]: 'output_color_encoding_linear',
	[ColorEncoding.SRGB]: 'output_color_encoding_sRGB'
};

const COLOR_DEFS = {
	[PointColorType.RGB]: 'color_type_rgb',
	[PointColorType.COLOR]: 'color_type_color',
	[PointColorType.DEPTH]: 'color_type_depth',
	[PointColorType.HEIGHT]: 'color_type_height',
	[PointColorType.INTENSITY]: 'color_type_intensity',
	[PointColorType.INTENSITY_GRADIENT]: 'color_type_intensity_gradient',
	[PointColorType.LOD]: 'color_type_lod',
	[PointColorType.POINT_INDEX]: 'color_type_point_index',
	[PointColorType.CLASSIFICATION]: 'color_type_classification',
	[PointColorType.RETURN_NUMBER]: 'color_type_return_number',
	[PointColorType.SOURCE]: 'color_type_source',
	[PointColorType.NORMAL]: 'color_type_normal',
	[PointColorType.PHONG]: 'color_type_phong',
	[PointColorType.RGB_HEIGHT]: 'color_type_rgb_height',
	[PointColorType.COMPOSITE]: 'color_type_composite'
};
export class PointsMaterial extends RawShaderMaterial
{
    constructor(parameters= {}) {

        super()
        this._pointSizeType = PointSizeType.FIXED;
        this._pointColorType = PointColorType.RGB;
        this._inputColorEncoding = ColorEncoding.SRGB;
        this._outputColorEncoding = ColorEncoding.LINEAR
        this.uniforms = {
            size: makeUniform('f', 2.0),
            opacity: makeUniform('f', 1.0),
        };

        this.size = getValid(parameters?.size, 1.0);
        this.newFormat = Boolean(parameters.newFormat);
        this.attributes = {
            position: {type: 'fv', value: []},
            color: {type: 'fv', value: []},
            normal: {type: 'fv', value: []},
            intensity: {type: 'f', value: []},
            classification: {type: 'f', value: []},
            returnNumber: {type: 'f', value: []},
            numberOfReturns: {type: 'f', value: []},
            pointSourceID: {type: 'f', value: []},
            indices: {type: 'fv', value: []}
        };
        this.defaultAttributeValues.normal = [0, 0, 0];
        this.defaultAttributeValues.classification = [0, 0, 0];
        this.defaultAttributeValues.indices = [0, 0, 0, 0];
        this.vertexColors = true;
        this.updateShaderSource();
    }
    updateShaderSource(){
        this.glslVersion = '300 es';
        this.vertexShader = this.applyDefines(VertShader);
        this.fragmentShader =this.applyDefines(FragShader);
        this.needsUpdate = true;
    }
    get pointColorType(){
        return this._pointColorType;
    }

    set pointColorType(value) {
        this.setUpdateShaderSource(value, '_pointColorType');
    }
    get pointSizeType(){
        return this._pointSizeType;
    }
    set pointSizeType(value) {
        this.setUpdateShaderSource(value, '_pointSizeType');
    }
    get inputColorEncoding() {
        return this._inputColorEncoding;
    }
    set inputColorEncoding(value) {
        this.setUpdateShaderSource(value, '_outputColorEncoding');
    }
    get outputColorEncoding() {
        return this._outputColorEncoding;
    }
    set outputColorEncoding(value) {
        this.setUpdateShaderSource(value, '_outputColorEncoding');
    }
    setUpdateShaderSource(value, fieldName) {
        if (value !== this[fieldName]) 
        {
            this[fieldName] = value;
            this.updateShaderSource();
        }
    }
    get size() {
        return this.getUniform('size');
    }
    
    set size(value) {
        this.setUniformValue(value, 'size');
    }

    get opacit()  {
        return this.getUniform('opacit');
    }
    set opacit(value) {
        this.setUniformValue(value, 'opacit');
    }
    setUniformValue(value, uniformName) {
        if (value !== this.getUniform(uniformName)) 
        {
                this.setUniform(uniformName, value);
                this.updateShaderSource();
        }
    }
    applyDefines(shaderSrc) {
        const parts = [];
        function define(value) {
            if (value) {
                parts.push(`#define ${value}`);
            }
        }
        define(SIZE_TYPE_DEFS[this.pointSizeType]);
        define(COLOR_DEFS[this.pointColorType]);
        define(OUTPUT_COLOR_ENCODING[this.outputColorEncoding]);
        define(INPUT_COLOR_ENCODING[this.inputColorEncoding]);
        if (this.newFormat) 
        {
            define ('new_format');
        }
        parts.push(shaderSrc);
        return parts.join('\n');
    }
    getUniform(
        name,
    )
    {
        return this.uniforms === undefined ? undefined : this.uniforms[name].value;
    }
    setUniform(
        name,
        value,
    )
    {
        if (this.uniforms === undefined) 
        {
            return;
        }
  
        const uObj = this.uniforms[name];
  
        if (uObj.type === 'c') 
        {
            (uObj.value).copy(valu);
        }
        else if (value !== uObj.value) 
        {
            uObj.value = value;
        }
    }
}
function makeUniform(type, value)
{
	return {type: type, value: value};
}
function getValid(a, b)
{
	return a === undefined ? b : a;
}
