uniform vec4 color;
varying vec2 vUv;


void main() {
    // vec4 current = texture(tex, vUv);

    gl_FragColor = color;
}