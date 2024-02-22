attribute vec3 aVertexPosition; 

uniform mat4    uMVMatrix;
uniform mat4    uPMatrix; 
uniform mat4    uProjection;

void main(){

    gl_Position = uProjection * uPMatrix * uMVMatrix *vec4(aVertexPosition,1.0);
}