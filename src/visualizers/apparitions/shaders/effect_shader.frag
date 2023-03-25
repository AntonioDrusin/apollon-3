uniform sampler2D tex;
varying vec2 vUv;

void main() {
    // Purpose of this is to set the alpha to zero. i.e. remove the ink value from the original textures.
    vec4 s = texture(tex, vUv);
    gl_FragColor = vec4(s.r, s.g, s.b, 0.0);
}