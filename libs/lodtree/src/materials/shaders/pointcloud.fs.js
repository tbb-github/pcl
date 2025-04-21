export default `
precision highp float;
precision highp int;
out vec4 fragColor;
#ifdef new_format
	in vec4 vColor;
#else
	in vec3 vColor;
#endif
in float vOpacity;
void main() {
    #ifdef new_format
		// set actualColor vec3 from vec4 vColor
		vec3 actualColor = vColor.xyz;
	#else
		// set actualColor RGB from the XYZ of vColor
		vec3 actualColor = vColor;
	#endif
    vec3 color = actualColor;
    fragColor = vec4(color, vOpacity);
}
`