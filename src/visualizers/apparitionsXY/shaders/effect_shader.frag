uniform sampler2D paintTexture;
uniform sampler2D dataTexture;
uniform sampler2D backgroundTexture;
uniform vec3 backgroundColor;
uniform float backgroundColorAlpha; // When 1 don't look at the texture!
uniform float inkAlpha;

varying vec2 vUv;

void main() {
    // Purpose of this is to set the alpha to zero. i.e. remove the ink value from the original textures.
    vec4 s = texture(paintTexture, vUv);
    vec4 d = texture(dataTexture, vUv);


    if ( backgroundColorAlpha == 1.0 ) {
        vec3 color = mix(s.rgb, backgroundColor.rgb, (1.0-(d.g*inkAlpha)));
        gl_FragColor = vec4(color, 0.0);
    }
    else {
        vec4 t = texture(backgroundTexture, vUv);

        vec3 bg = mix(t.rgb, backgroundColor.rgb, backgroundColorAlpha);
        vec3 color = mix(s.rgb, bg, (1.0-(d.g*inkAlpha)));
        gl_FragColor = vec4(color, 0.0);
    }

}