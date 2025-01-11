export default 
`#version 300 es
precision highp float;

uniform mat4 u_model;
uniform mat4 u_view;
uniform mat4 u_projection;
uniform vec3 u_scale; // Change u_scale to a vec3 for per-axis scaling

in vec4 position;
in vec4 color;
in vec4 normal;

out vec4 fPosition;
out vec4 fColor;
out vec4 fNormal;

void main() {
  mat4 modelView = u_view * u_model;
  
  // Scale the position using the u_scale uniform
  vec4 scaledPosition = vec4(position.xyz * u_scale, position.w);

  // Final vertex position
  gl_Position = u_projection * modelView * scaledPosition;
  gl_Position /= gl_Position.w;

  fPosition = position;
  fColor = color;
  fNormal = normal;
}
`