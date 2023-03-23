uniform sampler2D tex;
varying vec2 vUv;

void main() {
    vec4 s = texture(tex, vUv);
    gl_FragColor = vec4(s.r, s.g, s.b, 1.0); // Just sets transparency to 1
}