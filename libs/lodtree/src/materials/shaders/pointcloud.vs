in vec3 position;
in vec3 color;
out vec3 vColor;
uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;
uniform float size;
vec3 getRGB() {
    return color;
}
void main() {
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    // ---------------------
	// POINT COLOR
	// ---------------------
    #ifdef color_type_rgb
        vColor = getRGB();
	// ---------------------
	// POINT SIZE
	// ---------------------
    float pointSize = 1.0;
    #ifdef fixed_point_size
        pointSize = size;
    gl_PointSize = pointSize;
}

