precision mediump float;

uniform vec3 uLightDirection;
uniform vec3 uCameraPosition;
uniform sampler2D uTexture;


varying vec2 vTexcoords;
varying vec3 vWorldNormal;
varying vec3 vWorldPosition;

void main(void) {
    // todo - diffuse contribution
    // 1. normalize the light direction and store in a separate variable
      vec3 light = normalize(uLightDirection);
    // 2. normalize the world normal and store in a separate variable
     vec3 world = normalize(vWorldNormal);      
    // 3. calculate the lambert term
    float cosine_angle = dot(world, light);
    float maximum_angle = max(cosine_angle,0.0);
    
 
    // todo - specular contribution
    // 1. in world space, calculate the direction from the surface point to the eye (normalized)
      //vec3 sub = uCameraPosition - vWorldPosition;
     vec3 eye = normalize(uCameraPosition - vWorldPosition);
    // 2. in world space, calculate the reflection vector (normalized)
      vec3 reflection = normalize(-uLightDirection + dot(uLightDirection,world)*world*2.0);
    // 3. calculate the phong term
     //float dotphong = dot(reflection,sub);
     //float phongmax = max(dotphong,0.0);
    // float phongpower = pow(phongmax,64.0);
     
     float phongTerm = pow(max(dot(reflection, eye), 0.0),64.0);

    // todo - combine
    // 1. apply light and material interaction for diffuse value by using the texture color as the material
      //vec3 light_color = (1.0,1.0,1.0);
      vec3 diffuseContribution = vec3(1.0,1.0,1.0)* texture2D(uTexture,vTexcoords).rgb *maximum_angle;
    // 2. apply light and material interaction for phong, assume phong material color is (0.3, 0.3, 0.3)
    //vec3 r_g_b = (0.3,0.3,0.3);
    //vec3 new_phong = phongpower*r_g_b;
      vec3 specularContribution =vec3(1.0,1.0,1.0)* vec3(0.3,0.3,0.3)*phongTerm;
    vec3 albedo = texture2D(uTexture, vTexcoords).rgb;

    vec3 ambient = albedo * 0.1;
    // vec3 diffuseColor = todo
    // vec3 specularColor = todo

    // add "diffuseColor" and "specularColor" when ready
    vec3 finalColor = ambient+diffuseContribution+specularContribution; // + diffuseColor + specularColor;

    //gl_FragColor = vec4(vec3(albedo)*maximum_angle, 1.0);
     gl_FragColor = vec4(finalColor, 1.0);
   
}
