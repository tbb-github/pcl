export default `
precision highp float;
precision highp int;
in vec3 position;
#ifdef new_format
	in vec4 rgba;
	out vec4 vColor;
#else
	in vec3 color;
	out vec3 vColor;
#endif
out float vOpacity;
uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;
uniform float size;
uniform float opacity;
#ifndef new_format
vec3 getRGB() {
    return color;
}
#endif
#ifdef new_format
	vec4 fromLinear(vec4 linearRGB) {
		bvec4 cutoff = lessThan(linearRGB, vec4(0.0031308));
		vec4 higher = vec4(1.055)*pow(linearRGB, vec4(1.0/2.4)) - vec4(0.055);
		vec4 lower = linearRGB * vec4(12.92);
		return mix(higher, lower, cutoff);
	} 
	vec4 toLinear(vec4 sRGB) {
		bvec4 cutoff = lessThan(sRGB, vec4(0.04045));
		vec4 higher = pow((sRGB + vec4(0.055))/vec4(1.055), vec4(2.4));
		vec4 lower = sRGB/vec4(12.92);
		return mix(higher, lower, cutoff);
	}
#else
	vec3 fromLinear(vec3 linearRGB) {
		bvec3 cutoff = lessThan(linearRGB, vec3(0.0031308));
		vec3 higher = vec3(1.055)*pow(linearRGB, vec3(1.0/2.4)) - vec3(0.055);
		vec3 lower = linearRGB * vec3(12.92);
		return mix(higher, lower, cutoff);
	}
	vec3 toLinear(vec3 sRGB) {
		bvec3 cutoff = lessThan(sRGB, vec3(0.04045));
		vec3 higher = pow((sRGB + vec3(0.055))/vec3(1.055), vec3(2.4));
		vec3 lower = sRGB/vec3(12.92);
		return mix(higher, lower, cutoff);
	}
#endif
void main() {
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    // ---------------------
	// OPACITY
	// ---------------------
    vOpacity = opacity;
    // ---------------------
	// POINT COLOR
	// ---------------------
    #ifdef new_format
		vColor = rgba;
	#elif defined color_type_rgb
		vColor = getRGB();
    #endif
    #if defined(output_color_encoding_sRGB) && defined(input_color_encoding_linear)
		vColor = toLinear(vColor);
	#endif

	#if defined(output_color_encoding_linear) && defined(input_color_encoding_sRGB)
		vColor = fromLinear(vColor);
	#endif
	// ---------------------
	// POINT SIZE
	// ---------------------
    float pointSize = 1.0;
    #ifdef fixed_point_size
        pointSize = size;
	#endif
    gl_PointSize = pointSize;
}
`
