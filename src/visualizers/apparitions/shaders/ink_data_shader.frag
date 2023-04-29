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
    float totalInk = finalColor.a;
    float inkDisperse = 4.0;

    if ( totalInk > inkDisperse ) totalInk -= inkDisperse;

    vec4 colorUp = texture(imageTexture, vec2(vUv.x, vUv.y + step.y));
    if ( colorUp.a > inkDisperse ) {
        finalColor.rgb = (finalColor.rgb + colorUp.rgb);
        totalInk += 1.0;
        mixers += 1.0;
    }

    vec4 colorDown = texture(imageTexture, vec2(vUv.x, vUv.y - step.y));
    if ( colorDown.a > inkDisperse ) {
        finalColor.rgb = (finalColor.rgb + colorDown.rgb);
        totalInk += 1.0;
        mixers += 1.0;
    }

    vec4 colorRight = texture(imageTexture, vec2(vUv.x + step.x, vUv.y));
    if ( colorRight.a > inkDisperse ) {
        finalColor.rgb = (finalColor.rgb + colorRight.rgb);
        totalInk += 1.0;
        mixers += 1.0;
    }

    vec4 colorLeft = texture(imageTexture, vec2(vUv.x - step.x, vUv.y));
    if ( colorLeft.a > inkDisperse ) {
        finalColor.rgb = (finalColor.rgb + colorLeft.rgb);
        totalInk += 1.0;
        mixers += 1.0;
    }

    if ( totalInk > dryRate ) totalInk -= dryRate;
    finalColor.rgb = finalColor.rgb / mixers;
    finalColor.a = totalInk;

    gl_FragColor = finalColor;
}