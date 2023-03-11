uniform sampler2D tex;
uniform float opacity;
varying vec2 vUv;

void main() {
    vec4 texel = texture2D(tex, vUv);
    texel.r = opacity;
    gl_FragColor = vec4(texel.rgb, texel.a);
}