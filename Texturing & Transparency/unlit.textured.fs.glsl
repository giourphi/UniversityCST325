precision mediump float;

uniform sampler2D uTexture;
uniform float uAlpha;
uniform float uscroll;

// todo #3 - receive texture coordinates and verify correctness by 
// using them to set the pixel color 
varying vec2 vtexture;

void main(void) {
    // todo #5
    gl_FragColor = texture2D(uTexture,vtexture+(uscroll/2.0));
    gl_FragColor.w =uAlpha;
    //gl_FragColor = vec4(mycolor.rgb,uAlpha);

    // todo #3
   //gl_FragColor = vec4( vtexture, 0.0, uAlpha);
}
