// to start to render content 
// OK SO THE CODE DOESNT WORK..still
// i will figure this out tomorrow
function main() {
    const canvas = document.querySelector("#glCanvas");
    // initialize the GL context 
    let gl = canvas.getContext("webgl");

    // meehhhh if its not webgl is not working
    if (gl === null) {
        alert("Unable to initialize WebGl. your browser or machine does not support");
        return;   
    } 

    // set clear color to black, fully opaque 
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    // clear the color buffer with specified clear color 
    gl.clear(gl.COLOR_BUFFER_BIT);

}

// Vertex shader program 
const vsSource = `
    attribute vec4 aVertexPosition;

    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;

    void main() {
        gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
    }
`;

// the fragment shader 
const fsSource = `
    void main() {
        gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
    }
`;

// Initialize a shader program, this is where all the lighting for the 
// vertices and so forth is established
const shaderProgram = initShaderProgram(gl, vsSource, fsSource);

const programInfo = {
    program: shaderProgram,
    attribLocations: {
        vertexPosition: gl.getAttribLocations(shaderProgram, 'aVertexPosition'),
    },
    uniformLocations: {
        projectionMatrix: gl.getUniformLocations(shaderProgram, 'uProjectionMatrix'),
        modelViewMatrix: gl.getUniformLocations(shaderProgram, 'uModelViewMatrix'),
    },
};

// heres where we call the routine that builds all the objects we'll be drawing
const buffers initBuffers();

// draw the scene
drawScene(gl, programInfo, buffers);

function initShaderProgram(gl, vsSource, fsSource) {
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

    // create the shader program 
    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    // if it fails, alert the user 
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert('unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
        return null;
    }
    return shaderProgram;
}
// creates a shader of the given type, uploads the source and compiles it.
function loadShader(gl, type, source) {
    const shader = gl.createShader(type);
    // send the source to the shader object 
    gl.shaderSource(shader, source);
    // compile the shader program 
    gl.compileShader(shader);

    // checking if it compiled successfully 
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    // just want to show shader
    return shader 
}
// to use the above code call it -->
//const shaderProgram = initShaderProgram(gl, vsSource, fsSource);


// this buffer contains the vertex positions
function initBuffers(gl) {
    // create a buffer for the square's positions.
    const positionBuffer = gl.createBuffer();

    // select the positionBuffer as the one to apply the buffer 
    // operations to from here out.
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    // now create an array of positions for the square.
    const positions = [
        -1.0, 1.0,
        1.0, 1.0,
        -1.0, -1.0,
        1.0, -1.0,
    ];
    /*
    now pass the list of positions into webgl to build the 
    shape. we do this by creating a Float32Array from the js array, 
    then use it to fill the current buffer.
    */
    gl.bufferData(gl.ARRAY_BUFFER,
        new Float32Array(positions),
        gl.STATIC_DRAW);
    return {
        position: positionBuffer,
    };
}

// rendering the scene
function drawScene(gl, programInfo, buffers) 
{
    gl.clearColor(0.0, 0.0, 1.0);   // clear to black, fully opaque
    gl.clearDepth(1.0);     // clear everything 
    gl.enable(gl.DEPTH_TEST);   // enable depth testing 
    gl.depthFunc(gl.LEQUAL);    // near things obscure far things 

    // clear the canvas before we start drawing onto it.
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    /* create a perspective matrix, a special matrix that is used 
    to simulate the distortion of perspective in a camera.
    our field of view is 45 degrees, with width/height
    ratio that matches the display size of the canvas and we 
    only want to see objects between 0.1 units and 100 units
    away from the camera  
    */
    const fieldOfView = 45 * Math.PI / 180  // in radians
    const aspect = gl.canvas.clientWidth . gl.canvas.clientHeight;
    const zNear = 0.1;
    const zFar = 100.0;
    const projectionMatrix = mat4.create();

    //note: glmatrix.js always has the first argument
    // as the destination to recieve the result.
    mat4.perspective(projectionMatrix,
        fieldOfView,
        aspect,
        zNear,
        zFar,
        );
    /*
    set the drawing position to the "identity" point, which is 
    the center of the scene.
    */
    const modelViewMatrix = mat4.create();

    // now move the drawing position a bit to where we want to 
    // start drawing the square.
    mat4.translate(modelViewMatrix, // destination matrix
        modelViewMatrix,    // matriz to translate
        [-0.0, 0.0, -6.0]); // amount to translate
    // tell webgl how to pull out the positions from the position
    // buffer into vertexPosition attribute.
    {
        const numComponents = 2; // pull out 2 values per iteration.
        const type = gl.FLOAT; // the data in the buffer is 32bit floats
        const normalize = false; // dont normalize
        const stride = 0;   // how many bytes to get from one set of values to the next
        // 0 = use type and numComponents above.
        const offset = 0; // how many bytes inside the buffret to start from.
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
        gl.vertexAtrribPointer(
            programInfo.attribLocations.vertexPosition,
            numComponents,
            type,
            normalize,
            stride,
            offset);
        gl.enableVertexAttribArray(
            programInfo.attribLocations.vertexPosition);
    }
    // tell webgl to use our program when drawing 
    gl.useProgram(programInfo.program);

    // set the shader uniforms 
    gl.uniformMatrix4fv(
        programInfo.uniformLocations.projectionMatrix,
        false,
        projectionMatrix);
    gl.uniformMatrix4fv(
        programInfo.uniformLocations.modelViewMatrix,
        false,
        modelViewMatrix);
    {
        const offset = 0;
        const vertexCount = 4; 
        gl.drawArray(gl.TRIANLGE_STRIPE, offset, vertexCount);
    }
}

console.log("you lucky bitch!");

window.onload = main;
