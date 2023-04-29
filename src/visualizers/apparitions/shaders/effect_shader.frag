uniform sampler2D paintTexture;
uniform sampler2D dataTexture;
uniform sampler2D backgroundTexture;
uniform vec3 backgroundColor;
uniform float backgroundColorAlpha; // When 1 don't look at the texture!

varying vec2 vUv;

void main() {
    // Purpose of this is to set the alpha to zero. i.e. remove the ink value from the original textures.
    vec4 s = texture(paintTexture, vUv);
    gl_FragColor = vec4(s.r, s.g, s.b, 0.0);
}