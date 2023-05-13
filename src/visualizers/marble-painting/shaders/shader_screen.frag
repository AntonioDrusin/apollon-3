
void main()
{
    float h = Paper(vUv*iResolution.xy);
    vec4 Q =
        1.5 * texture(iTextureD,vUv)
        +.8 * texture(iTextureC,vUv) * texture(iTextureA,vUv).w;
    Q = .8+h-Q;

    gl_FragColor = Q;
}