'use strict'

var gl;

var appInput = new Input();
var time = new Time();
var camera = new OrbitCamera(appInput);

var earthGeometry = null; // this will be created after loading from a file
var pointLightGeometry = null;
var groundGeometry = null;
var backWallGeometry  = null;
var rightwall = null; 
var leftWallGeometry = null;
var frontWallGeometry = null; 
var  lastwall = null; 
var sun = null;
var moon =null;
var jupiter = null; 
var mars = null; 
var neptune = null; 
var mercury = null; 
var saturn = null; 
var uranus = null; 
var emissivelight = null; 

var projectionMatrix = new Matrix4();
var lightPosition = new Vector3();

// the shader that will be used by each piece of geometry (they could each use their own shader but in this case it will be the same)
var phongShaderProgram;
var basicColorProgram;
var emissiveShaderProgram; 

// auto start the app when the html page is ready
window.onload = window['initializeAndStartRendering'];

// we need to asynchronously fetch files from the "server" (your local hard drive)
var loadedAssets = {
    phongTextVS: null, phongTextFS: null,
    vertexColorVS: null, vertexColorFS: null,
    emissiveTextVS: null, emissiveTextFS:null,
    sphereJSON: null,
    earthImage: null,
    starImage: null,
    marsImage: null, 
    mercuryImage: null, 
    moonImage: null, 
    uranusImage: null,
    saturnImage: null,
    sunImage: null, 
    venusImage: null,
    neptuneImage: null,
    marsImage: null,
    jupiterImage: null 

   
};

// -------------------------------------------------------------------------
function initializeAndStartRendering() {
    initGL();
    loadAssets(function() {
        createShaders(loadedAssets);
        createScene();

        updateAndRender();
    });
}

// -------------------------------------------------------------------------
function initGL(canvas) {
    var canvas = document.getElementById("webgl-canvas");

    try {
        gl = canvas.getContext("webgl");
        gl.canvasWidth = canvas.width;
        gl.canvasHeight = canvas.height;

        gl.enable(gl.DEPTH_TEST);
    } catch (e) {}

    if (!gl) {
        alert("Could not initialise WebGL, sorry :-(");
    }
}

// -------------------------------------------------------------------------
function loadAssets(onLoadedCB) {
    var filePromises = [
        fetch('./shaders/phong.vs.glsl').then((response) => { return response.text(); }),
        fetch('./shaders/phong.pointlit.fs.glsl').then((response) => { return response.text(); }),
        fetch('./shaders/flat.color.vs.glsl').then((response) => { return response.text(); }),
        fetch('./shaders/flat.color.fs.glsl').then((response) => { return response.text(); }),
        fetch('./shaders/emissive.shader.vs.glsl').then((response)=> {return response.text();}),
        fetch('./shaders/emissive.shader.fs.glsl').then((response)=> { return response.text();}),
        fetch('./data/sphere.json').then((response) => { return response.json(); }),
        loadImage('./data/2k_earth_daymap.jpg'),
        loadImage('./data/2k_stars_milky_way.jpg'),
        loadImage('./data/2k_jupiter.jpg'),
        loadImage('./data/2k_mars.jpg'),
        loadImage('./data/2k_mercury.jpg'),
        loadImage('./data/2k_moon.jpg'),
        loadImage('./data/2k_neptune.jpg'),
        loadImage('./data/2k_saturn.jpg'),
        loadImage('./data/2k_sun.jpg'),
        loadImage('./data/2k_uranus.jpg')
       
    ];

    Promise.all(filePromises).then(function(values) {
        // Assign loaded data to our named variables
        loadedAssets.phongTextVS = values[0];
        loadedAssets.phongTextFS = values[1];
        loadedAssets.vertexColorVS = values[2];
        loadedAssets.vertexColorFS = values[3];
        loadedAssets.emissiveTextVS = values[4];
        loadedAssets.emissiveTextFS = values[5];
        loadedAssets.sphereJSON = values[6];
        loadedAssets.earthImage = values[7];
        loadedAssets.starImage = values[8];
        loadedAssets.jupiterImage = values[9];
        loadedAssets.marsImage = values[10];
        loadedAssets.mercuryImage = values[11];
        loadedAssets.moonImage = values[12];
        loadedAssets.neptuneImage = values[13];
        loadedAssets.saturnImage = values[14];
        loadedAssets.sunImage = values[15];
        loadedAssets.uranusImage = values[16];
        
    }).catch(function(error) {
        console.error(error.message);
    }).finally(function() {
        onLoadedCB();
    });
}

// -------------------------------------------------------------------------
function createShaders(loadedAssets) {
    phongShaderProgram = createCompiledAndLinkedShaderProgram(loadedAssets.phongTextVS, loadedAssets.phongTextFS);

    phongShaderProgram.attributes = {
        vertexPositionAttribute: gl.getAttribLocation(phongShaderProgram, "aVertexPosition"),
        vertexNormalsAttribute: gl.getAttribLocation(phongShaderProgram, "aNormal"),
        vertexTexcoordsAttribute: gl.getAttribLocation(phongShaderProgram, "aTexcoords")
    };

    phongShaderProgram.uniforms = {
        worldMatrixUniform: gl.getUniformLocation(phongShaderProgram, "uWorldMatrix"),
        viewMatrixUniform: gl.getUniformLocation(phongShaderProgram, "uViewMatrix"),
        projectionMatrixUniform: gl.getUniformLocation(phongShaderProgram, "uProjectionMatrix"),
        lightPositionUniform: gl.getUniformLocation(phongShaderProgram, "uLightPosition"),
        cameraPositionUniform: gl.getUniformLocation(phongShaderProgram, "uCameraPosition"),
        textureUniform: gl.getUniformLocation(phongShaderProgram, "uTexture"),
    };

    basicColorProgram = createCompiledAndLinkedShaderProgram(loadedAssets.vertexColorVS, loadedAssets.vertexColorFS);
    gl.useProgram(basicColorProgram);

    basicColorProgram.attributes = {
        vertexPositionAttribute: gl.getAttribLocation(basicColorProgram, "aVertexPosition"),
        vertexColorsAttribute: gl.getAttribLocation(basicColorProgram, "aVertexColor"),
    };

    basicColorProgram.uniforms = {
        worldMatrixUniform: gl.getUniformLocation(basicColorProgram, "uWorldMatrix"),
        viewMatrixUniform: gl.getUniformLocation(basicColorProgram, "uViewMatrix"),
        projectionMatrixUniform: gl.getUniformLocation(basicColorProgram, "uProjectionMatrix"),
        colorUniform: gl.getUniformLocation(basicColorProgram, "uColor")
    };

    emissiveShaderProgram = createCompiledAndLinkedShaderProgram(loadedAssets.emissiveTextVS, loadedAssets.emissiveTextFS);
    gl.useProgram(emissiveShaderProgram);

    emissiveShaderProgram.attributes = {
        vertexPositionAttribute: gl.getAttribLocation(emissiveShaderProgram, "aVertexPosition"),
        vertexNormalsAttribute: gl.getAttribLocation(emissiveShaderProgram, "aNormal"),
        vertexTexcoordsAttribute: gl.getAttribLocation(emissiveShaderProgram,"aTexcoords")
    };

    emissiveShaderProgram.uniforms = {
        worldMatrixUniform: gl.getUniformLocation(emissiveShaderProgram, "uWorldMatrix"),
        viewMatrixUniform: gl.getUniformLocation(emissiveShaderProgram,"uViewMatrix"),
        lightPositionUniform: gl.getUniformLocation(emissiveShaderProgram,"uLightPosition"),
        cameraPositionUniform: gl.getUniformLocation(emissiveShaderProgram,"uCameraPosition"),
        textureUniform: gl.getUniformLocation(emissiveShaderProgram,"uTexture"),
    };

}

// -------------------------------------------------------------------------
function createScene() {
    groundGeometry = new WebGLGeometryQuad(gl, phongShaderProgram);
    groundGeometry.create(loadedAssets.starImage);

   backWallGeometry = new WebGLGeometryQuad(gl,basicColorProgram);
    backWallGeometry.create(loadedAssets.starImage);

    frontWallGeometry= new WebGLGeometryQuad(gl,phongShaderProgram);
    frontWallGeometry.create(loadedAssets.starImage);

    rightwall= new WebGLGeometryQuad(gl,phongShaderProgram);
    rightwall.create(loadedAssets.starImage);

    lastwall = new WebGLGeometryQuad(gl,phongShaderProgram);
    lastwall.create(loadedAssets.starImage);

    var scale = new Matrix4().makeScale(500.0, 500.0, 500.0);

    // compensate for the model being flipped on its side
    var rotation = new Matrix4().makeRotationX(-90);
    var rotationbackwall  = new Matrix4().makeRotationY(-180);
    var rotationfrontwall = new Matrix4().makeRotationZ(90).makeRotationY(90);
    var rotationRightWall = new Matrix4().makeRotationY(-90).makeRotationZ(90);
    var rotationlastwall = new Matrix4().makeRotationY(-90);

    //ar backwallscale  = new Matrix4().makeScale(10.0,10.0,10.0);
    groundGeometry.worldMatrix.makeIdentity();
    groundGeometry.worldMatrix.multiply(rotation).multiply(scale);

    backWallGeometry.worldMatrix.makeIdentity();
    backWallGeometry.worldMatrix.makeTranslation(0,500,-500).multiply(scale).multiply(rotationbackwall);
    

    frontWallGeometry.worldMatrix.makeIdentity();
    frontWallGeometry.worldMatrix.makeTranslation(500,500,0).multiply(scale).multiply(rotationfrontwall);
    

    rightwall.worldMatrix.makeIdentity();
    rightwall.worldMatrix.makeTranslation(0,500,500).multiply(scale).multiply(rotationRightWall);

    lastwall.worldMatrix.makeIdentity();
    lastwall.worldMatrix.makeTranslation(-500,500,0).multiply(scale).multiply(rotationlastwall);


    earthGeometry = new WebGLGeometryJSON(gl, phongShaderProgram);
    earthGeometry.create(loadedAssets.sphereJSON, loadedAssets.earthImage);
    sun = new WebGLGeometryJSON(gl, phongShaderProgram);
    sun.create(loadedAssets.sphereJSON, loadedAssets.sunImage);
    moon = new WebGLGeometryJSON(gl, phongShaderProgram);
    moon.create(loadedAssets.sphereJSON, loadedAssets.moonImage);
    mars = new WebGLGeometryJSON(gl, phongShaderProgram);
    mars.create(loadedAssets.sphereJSON, loadedAssets.marsImage);
    mercury = new WebGLGeometryJSON(gl, phongShaderProgram);
    mercury.create(loadedAssets.sphereJSON, loadedAssets.mercuryImage)
    saturn = new WebGLGeometryJSON(gl, phongShaderProgram);
    saturn.create(loadedAssets.sphereJSON, loadedAssets.saturnImage);
    jupiter = new WebGLGeometryJSON(gl, phongShaderProgram);
    jupiter.create(loadedAssets.sphereJSON, loadedAssets.jupiterImage);
    neptune = new WebGLGeometryJSON(gl, phongShaderProgram);
    neptune.create(loadedAssets.sphereJSON, loadedAssets.neptuneImage);
    uranus = new WebGLGeometryJSON(gl, phongShaderProgram);
    uranus.create(loadedAssets.sphereJSON, loadedAssets.uranusImage);
    // Scaled it down so that the diameter is 3
    var scaleearth = new Matrix4().makeScale(0.03, 0.03, 0.03);
    var sunscale = new Matrix4().makeScale(0.06,0.06,0.06);
    var moonscale = new Matrix4().makeScale(.01,.01,.01);
    var marsscale = new Matrix4().makeScale(.035,.035,.035);
    var mercuryscale = new Matrix4().makeScale(.045,.045,.045);
    var saturnscale = new Matrix4().makeScale(.055,.055,.055);

    // raise it by the radius to make it sit on the ground
    var translation = new Matrix4().makeTranslation(0, 5, 0);
   var earthTranslation  = new Matrix4().makeTranslation(0,5,10);
    var moontranslation = new Matrix4().makeTranslation(0,5,12);
    var marstranslation = new Matrix4().makeTranslation(0,5,-16);
    var mercurytranslation = new Matrix4().makeTranslation(0,5,-26);
    var saturntranslation = new Matrix4().makeTranslation(0,5,-35);
    //rotations for  certain objects that need it
    var rotationofearth = new Matrix4().makeRotationY(-20);
    var rotationofmoon = new Matrix4().makeRotationY(-20);

    // earthGeometry.worldMatrix.makeIdentity();
    earthGeometry.worldMatrix.multiply(earthTranslation).multiply(scaleearth).multiply(rotationofearth);

    sun.worldMatrix.makeIdentity();
    sun.worldMatrix.multiply(translation).multiply(sunscale);

    //moon.worldMatrix.makeIdentity();
    moon.worldMatrix.multiply(moontranslation).multiply(moonscale).multiply(rotationofmoon);

    mars.worldMatrix.makeIdentity();
    mars.worldMatrix.multiply(marstranslation).multiply(marsscale);

    mercury.worldMatrix.makeIdentity();
    mercury.worldMatrix.multiply(mercurytranslation).multiply(mercuryscale);

    saturn.worldMatrix.makeIdentity();
    saturn.worldMatrix.multiply(saturntranslation).multiply(saturnscale);

    emissivelight = new WebGLGeometryJSON(gl, phongShaderProgram);
    emissivelight.create(loadedAssets.sphereJSON);

    // // make the sphere representing the light smallish
    var emissivelightscale = new Matrix4().makeScale(0.055, 0.055, 0.055);
    var emissivelighttranslation = new Matrix4().makeTranslation(0,5,0);
    emissivelight.worldMatrix.makeIdentity();
    emissivelight.worldMatrix.multiply(emissivelighttranslation).multiply(emissivelightscale)
    //diffuse lighting for the planets orbiting around the sun 
    // planetlighting = new WebGLGeometryJSON(gl,planetshaderProgram);
    // planetlighting.create(loadedAssets.sphereJSON);

    // var planetlightingscale = new Matrix4().makeScale(.045,.045,.045);
    // var planetlightingtranslation = new Matrix4().makeTranslation(0,5,0);

    // planetlighting.worldMatrix.makeIdentity();
    // planetlighting.worldMatrix.multiply(planetlightingtranslation).multiply(planetlightingscale);


   
}

// -------------------------------------------------------------------------
function updateAndRender() {
    requestAnimationFrame(updateAndRender);

    var aspectRatio = gl.canvasWidth / gl.canvasHeight;

    time.update();
    camera.update(time.deltaTime);

    var cosTime = Math.cos(time.secondsElapsedSinceStart);
    var sinTime = Math.sin(time.secondsElapsedSinceStart);


    //rotation around sun 
    var rotationright = new Matrix4();

    rotationright.makeRotationY(Math.sin(-20));
    //moon rotation- needs to be fixed/updated
    var rotationmoon = new Matrix4();
    rotationmoon.makeRotationY(Math.sin(2));

    // var rotationmoon = new Matrix4();
    // rotationmoon.makeRotationY(Math.sin(-30));
    //earth rotations around axis/orbit
    var rotationearth = new Matrix4(); 
    rotationearth.makeRotationY(1.5);
    //mars orbiting rotation
    var rotationmars = new Matrix4();
    rotationmars.makeRotationY(Math.sin(10));
    //mercury orbit rotation
    var rotationmecury = new Matrix4(); 
    rotationmecury.makeRotationY(Math.sin(15));
    //saturn's rotation
    var rotationsaturn = new Matrix4();
    rotationsaturn.makeRotationY(Math.sin(30));
    //combining all rotations to objects
    earthGeometry.worldMatrix= rotationearth.multiply(earthGeometry.worldMatrix);
    sun.worldMatrix = rotationright.multiply(sun.worldMatrix);
    moon.worldMatrix = rotationmoon.multiply(moon.worldMatrix);
    mars.worldMatrix = rotationmars.multiply(mars.worldMatrix);
    mercury.worldMatrix = rotationmecury.multiply(mercury.worldMatrix);
    saturn.worldMatrix = rotationsaturn.multiply(saturn.worldMatrix);

    // special case rotation where the vector is along the x-axis (4, 0)
    // var lightDistance = 4;
    // lightPosition.x = cosTime * lightDistance;
    // lightPosition.y = 1.5;
    // lightPosition.z = sinTime * lightDistance;

    // pointLightGeometry.worldMatrix.elements[3] = lightPosition.x;
    // pointLightGeometry.worldMatrix.elements[7] = lightPosition.y;
    // pointLightGeometry.worldMatrix.elements[11] = lightPosition.z;

    

    // specify what portion of the canvas we want to draw to (all of it, full width and height)
    gl.viewport(0, 0, gl.canvasWidth, gl.canvasHeight);

    // this is a new frame so let's clear out whatever happened last frame
    gl.clearColor(0.707, 0.707, 1, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.useProgram(phongShaderProgram);
    var uniforms = phongShaderProgram.uniforms;
    var cameraPosition = camera.getPosition();
    gl.uniform3f(uniforms.lightPositionUniform, lightPosition.x, lightPosition.y, lightPosition.z);
    gl.uniform3f(uniforms.cameraPositionUniform, cameraPosition.x, cameraPosition.y, cameraPosition.z);

    projectionMatrix.makePerspective(45, aspectRatio, 0.1, 1000);
    groundGeometry.render(camera, projectionMatrix, phongShaderProgram);
    backWallGeometry.render(camera,projectionMatrix,phongShaderProgram);
    frontWallGeometry.render(camera,projectionMatrix,phongShaderProgram);
    rightwall.render(camera,projectionMatrix,phongShaderProgram);
    lastwall.render(camera,projectionMatrix,phongShaderProgram);
    earthGeometry.render(camera, projectionMatrix, phongShaderProgram);
    sun.render(camera,projectionMatrix,phongShaderProgram);
    moon.render(camera,projectionMatrix,phongShaderProgram);
    mars.render(camera,projectionMatrix,phongShaderProgram);
    mercury.render(camera,projectionMatrix,phongShaderProgram);
    saturn.render(camera,projectionMatrix,phongShaderProgram);
    
    gl.useProgram(basicColorProgram);
    gl.uniform4f(basicColorProgram.uniforms.colorUniform, 1.0, 1.0, 1.0, 1.0);
    emissivelight.render(camera, projectionMatrix, basicColorProgram);

    // gl.useProgram(planetshaderProgram);
    // gl.uniform4f(planetshaderProgram.uniforms.textureUniform,1.0,1.0,1.0,1.0);
    // planetlighting.render(camera,projectionMatrix,planetshaderProgram);
}
