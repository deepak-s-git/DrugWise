'use client';

import { useEffect, useRef } from 'react';

const VERTEX_SHADER = `
attribute vec2 a_position;
varying vec2 v_texCoord;
void main() {
  v_texCoord = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;

const FRAGMENT_SHADER = `
precision highp float;
uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;
varying vec2 v_texCoord;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

void main() {
  vec2 uv = v_texCoord;
  vec2 m = u_mouse / u_resolution;
  float t = u_time * 0.1;
  vec3 color = vec3(0.98, 0.98, 0.97);
  float n1 = noise(uv * 3.0 + t);
  float n2 = noise(uv * 6.0 - t * 0.5);
  float pattern = smoothstep(0.4, 0.6, n1 * 0.5 + n2 * 0.5);
  color = mix(color, vec3(0.96, 0.96, 0.95), pattern * 0.3);
  float dist = distance(uv, m);
  float mouseEffect = smoothstep(0.3, 0.0, dist);
  color = mix(color, vec3(0.94, 0.95, 0.97), mouseEffect * 0.2);
  gl_FragColor = vec4(color, 1.0);
}`;

function createShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

export function ShaderCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 640, y: 360 });
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl || !(gl instanceof WebGLRenderingContext)) return;

    const rectRef = { left: 0, top: 0, width: 1280, height: 720 };

    // Sync canvas size
    function syncSize() {
      if (!canvas) return;
      const w = canvas.clientWidth || 1280;
      const h = canvas.clientHeight || 720;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      const rect = canvas.getBoundingClientRect();
      rectRef.left = rect.left;
      rectRef.top = rect.top;
      rectRef.width = rect.width;
      rectRef.height = rect.height;
    }

    const observer = new ResizeObserver(syncSize);
    observer.observe(canvas);
    // Also observe window resize just in case
    window.addEventListener('resize', syncSize);
    syncSize();

    const vs = createShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
    const fs = createShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
    if (!vs || !fs) return;

    const prog = gl.createProgram();
    if (!prog) return;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

    const pos = gl.getAttribLocation(prog, 'a_position');
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(prog, 'u_time');
    const uRes = gl.getUniformLocation(prog, 'u_resolution');
    const uMouse = gl.getUniformLocation(prog, 'u_mouse');

    const handleMouseMove = (event: MouseEvent) => {
      if (rectRef.width && rectRef.height) {
        const nx = (event.clientX - rectRef.left) / rectRef.width;
        const ny = 1.0 - (event.clientY - rectRef.top) / rectRef.height;
        mouseRef.current.x = nx * canvas.width;
        mouseRef.current.y = ny * canvas.height;
      }
    };
    window.addEventListener('mousemove', handleMouseMove);

    function render(t: number) {
      if (!canvas || !gl) return;
      const glContext = gl as WebGLRenderingContext;
      glContext.viewport(0, 0, canvas.width, canvas.height);
      if (uTime) glContext.uniform1f(uTime, t * 0.001);
      if (uRes) glContext.uniform2f(uRes, canvas.width, canvas.height);
      if (uMouse) glContext.uniform2f(uMouse, mouseRef.current.x, mouseRef.current.y);
      glContext.drawArrays(glContext.TRIANGLE_STRIP, 0, 4);
      rafRef.current = requestAnimationFrame(render);
    }
    rafRef.current = requestAnimationFrame(render);

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (prefersReducedMotion.matches) {
      // Render one frame and stop
      render(0);
      cancelAnimationFrame(rafRef.current);
    }

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', syncSize);
      observer.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full opacity-30 pointer-events-none"
      style={{ display: 'block' }}
      aria-hidden="true"
    />
  );
}
