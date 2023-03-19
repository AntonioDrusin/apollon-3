uniform sampler2D tex;
uniform float opacity;
uniform vec2 iResolution;
uniform vec2 texelSize;
varying vec2 vUv;
uniform float iTime;

float random (vec2 st) {
    return fract(sin(dot(st.xy,
    vec2(12.9898,78.233)))*
    43758.5453123);
}

void main() {
//    vec4 texel1 = texture2D(tex, vUv);
//    vec4 texel2 = texture2D(tex, vUv + texelSize * opacity);
//
//    //texel.r = opacity;
//
//    vec4 texel = mix(texel1, texel2, 0.5);
//    texel.r += 0.01;
//    if ( texel.r > 1.0 )  texel.r = 0.0;
//    gl_FragColor = vec4(texel.rgb, texel.a);

    /*
    Again, we need to access the texture using coordinates in the range [0, 1]
*/
    vec2 uv = vUv.xy;// / iResolution.xy;
    vec3 color = vec3(0.0);
    float neighbors = 0.0;
    for(float i = -1.0; i <= 1.0; i += 1.0)
    {
        for( float j = -1.0; j <= 1.0; j += 1.0)
        {
            vec2 offset = vec2(i, j) / iResolution.xy;		 // Scale the offset down
            vec4 lookup = texture(tex, uv + offset); // Apply offset and sample
            neighbors += lookup.x;							 // Accumulate the result
        }
    }
    float cell = texture(tex, uv).x;
    if(cell > 0.0) {
        if(neighbors >= 3.0 && neighbors <= 4.0) {
            color = vec3(1.0);
        }
    } else if(neighbors > 2.0 && neighbors < 4.0) {
        color = vec3(1.0);
    }

    if(iTime < 1.0) { // can also use iFrame == 0, but seems less reliable.
        //color = vec3(texture(tex, vUv.xy / iResolution.xx).x);
        color = vec3(random(vUv),random(vUv),random(vUv));
    }
    else {
//        vec4 pixel = texture(tex,uv);
//        color = vec3(pixel.r, pixel.g, pixel.b);
        //color = vec3(random(vUv),random(vUv),random(uv));

    }


    gl_FragColor = vec4(color, 1.0);
}