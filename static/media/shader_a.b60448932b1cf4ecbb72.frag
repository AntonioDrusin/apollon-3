void main()
{
    vec4 Q = texture(iTextureA, vUv);
    vec4 m = texture(iTextureC, vUv);
    float d = dot(m, vec4(-1, 1, -1, 1));
    for (int x=-1;x<=1;x++)for (int y=-1;y<=1;y++) {
        if (x!=0||y!=0)
        {
            vec2 u = vec2(x, y);
            vec4 a = texture(iTextureA, (vUv+u/iResolution.xy));
            vec4 c = texture(iTextureC, (vUv+u/iResolution.xy));
            float p = .1*Paper(vUv+u);
            float f = length(m-c)*d;
            Q.xy -= 0.1*a.w*(p+a.w-Q.w*f-1.)*u;
        }
    }

    Q.w *= 1.-1e-4;
    //Q.y -= 1e-4*Q.w;
    Q.xy *= iDisperse-exp(-iExpanse*Q.w);
    if (iPenDown>0.&&length(vUv*iResolution.xy-iPen)<iBrushSize)
    Q.w = 1.;
    if (length(Q.xy)>.5) Q.xy = .5*normalize(Q.xy);
    Q.w = clamp(Q.w, 0., 3.);
    if (iFrame < 1.)Q = vec4(0., 0., 0., .05);
    if (vUv.x *iResolution.x < 4.|| iResolution.x-vUv.x*iResolution.x<4.) Q.xy *= 0.;
    if (vUv.y*iResolution.y < 4.|| iResolution.y-vUv.y*iResolution.y<4.) Q.xy *= 0.;

    gl_FragColor = Q;
}