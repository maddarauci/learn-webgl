// to start to render content 
// DONT FORGET TO DOCUMENT THE CODE (add helpful comments)

function main() {
    const canvas = document.querySelector("#glCanvas");
    // initialize the GL context 
    const gl = canvas.getContext("webgl");

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

// Initialize a shader program, so WebGl knows how to draw the data 
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

const programInfo = {
    program: shaderProgram,
    attribLocations: {
        vertextPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
    },
    uniformLocation: {
        projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
        modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix')
    }
}


console.log("you lucky bitch!");

window.onload = main;