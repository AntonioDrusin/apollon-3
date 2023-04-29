uniform sampler2D imageTexture;
uniform sampler2D dataTexture;
uniform vec2 iResolution;
varying vec2 vUv;

// Algorithm parameters
uniform float dryRate;

void main() {
    vec2 step = 1.0/iResolution;
    float mixers = 1.0;

    vec4 finalColor = texture(imageTexture, vUv);

    float inkDisperse = 4.0;

    vec4 dataUp = texture(dataTexture, vec2(vUv.x, vUv.y + step.y));
    if ( dataUp.r > inkDisperse ) {
        vec4 colorUp = texture(imageTexture, vec2(vUv.x, vUv.y + step.y));
        finalColor.rgb = (finalColor.rgb + colorUp.rgb);
        mixers += 1.0;
    }

    vec4 dataDown = texture(dataTexture, vec2(vUv.x, vUv.y - step.y));
    if ( dataDown.r > inkDisperse ) {
        vec4 colorDown = texture(imageTexture, vec2(vUv.x, vUv.y - step.y));
        finalColor.rgb = (finalColor.rgb + colorDown.rgb);
        mixers += 1.0;
    }

    vec4 dataRight = texture(dataTexture, vec2(vUv.x + step.x, vUv.y));
    if ( dataRight.r > inkDisperse ) {
        vec4 colorRight = texture(imageTexture, vec2(vUv.x + step.x, vUv.y));
        finalColor.rgb = (finalColor.rgb + colorRight.rgb);
        mixers += 1.0;
    }

    vec4 dataLeft = texture(dataTexture, vec2(vUv.x - step.x, vUv.y));
    if ( dataLeft.r > inkDisperse ) {
        vec4 colorLeft = texture(imageTexture, vec2(vUv.x - step.x, vUv.y));
        finalColor.rgb = (finalColor.rgb + colorLeft.rgb);
        mixers += 1.0;
    }

    finalColor.rgb = finalColor.rgb / mixers;

    gl_FragColor = finalColor;
}