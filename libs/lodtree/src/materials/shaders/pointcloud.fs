
out vec4 fragColor;
in vec3 vColor;
void main() {
    vec3 actualColor = vColor;
    vec3 color = actualColor;
    #if defined color_type_point_index
        fragColor = vec4(color, pcIndex / 255.0);
    #else
        fragColor = vec4(color, vOpacity);
    #endif
}
