import { scenes } from './object-meshes.mjs';

const vertexSource = `
attribute vec3 point;
attribute vec3 normal;
attribute vec3 paint;
attribute float gloss;
uniform vec3 angles;
uniform vec2 scale;
varying vec3 faceNormal;
varying vec3 facePaint;
varying float shine;
vec3 rotate(vec3 v) {
  vec3 c=cos(angles), s=sin(angles);
  v=vec3(c.x*v.x+s.x*v.z,v.y,-s.x*v.x+c.x*v.z);
  v=vec3(v.x,c.y*v.y-s.y*v.z,s.y*v.y+c.y*v.z);
  return vec3(c.z*v.x-s.z*v.y,s.z*v.x+c.z*v.y,v.z);
}
void main() {
  vec3 p=rotate(point);
  gl_Position=vec4(p.xy*scale, -p.z*.22, 1.);
  faceNormal=rotate(normal);
  facePaint=paint;
  shine=gloss;
}
`;
const fragmentSource = `
precision mediump float;
varying vec3 faceNormal;
varying vec3 facePaint;
varying float shine;
void main() {
  vec3 n=normalize(faceNormal);
  if (n.z < 0.) n = -n;
  vec3 key=normalize(vec3(-.65,.85,.77));
  vec3 fill=normalize(vec3(.75,.44,-.24));
  vec3 halfLight=normalize(key+vec3(0.,0.,1.));
  float lit=.44+.58*max(dot(n,key),0.)+.16*max(dot(n,fill),0.);
  float spec=pow(max(dot(n,halfLight),0.),11.+shine*17.)*shine;
  float rim=pow(1.-abs(n.z),3.)*shine;
  gl_FragColor=vec4(facePaint*lit+vec3(1.,.91,.80)*spec*.63+rim*.09,1.);
}
`;

function shader(gl, type, source) {
  const handle = gl.createShader(type);
  gl.shaderSource(handle, source);
  gl.compileShader(handle);
  if (!gl.getShaderParameter(handle, gl.COMPILE_STATUS)) {
    gl.deleteShader(handle);
    return null;
  }
  return handle;
}

function renderer(canvas) {
  const gl = canvas.getContext('webgl', { alpha: true, antialias:true, powerPreference:'low-power' });
  if (!gl) return null;
  const vertex = shader(gl, gl.VERTEX_SHADER, vertexSource);
  const fragment = shader(gl, gl.FRAGMENT_SHADER, fragmentSource);
  if (!vertex || !fragment) return null;
  const program = gl.createProgram();
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null;
  gl.deleteShader(vertex);
  gl.deleteShader(fragment);
  gl.useProgram(program);
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  for (const [name, size, offset] of [['point',3,0],['normal',3,3],['paint',3,6],['gloss',1,9]]) {
    const loc = gl.getAttribLocation(program, name);
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc,size,gl.FLOAT,false,40,offset*4);
  }
  gl.enable(gl.DEPTH_TEST);
  gl.clearColor(0,0,0,0);
  const angles = gl.getUniformLocation(program,'angles'), scale = gl.getUniformLocation(program,'scale');
  let count = 0;
  return {
    update(vertices) {
      gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(vertices),gl.STATIC_DRAW);
      count=vertices.length/10;
    },
    draw(camera, extent) {
      const ratio=canvas.width/canvas.height;
      gl.viewport(0,0,canvas.width,canvas.height);
      gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
      gl.uniform3fv(angles,camera);
      gl.uniform2f(scale,1/(extent*Math.max(1,ratio)),1/(extent*Math.max(1,1/ratio)));
      gl.drawArrays(gl.TRIANGLES,0,count);
    }
  };
}

function mount(canvas) {
  const section = canvas.closest('.edition');
  const poster = section.querySelector('.object-poster');
  const orbit = section.querySelector('[data-orbit]');
  const shades = section.querySelector('[data-model-controls]');
  const scene = scenes[canvas.dataset.object];
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let angle = scene.camera[0], target = angle, pitch=scene.camera[1], drag=null;
  let visible=false, frame=0, manual=false, shade='coral', drawScene=null;

  function draw(t) {
    frame=0;
    if (!visible || !drawScene || document.hidden) return;
    const ratio = Math.min(1.75, devicePixelRatio || 1);
    const width = Math.max(1,Math.round(canvas.clientWidth*ratio));
    const height = Math.max(1,Math.round(canvas.clientHeight*ratio));
    if (canvas.width!==width || canvas.height!==height) {
      canvas.width=width;
      canvas.height=height;
    }
    angle = motion.matches ? target : angle+(target-angle)*.16;
    const idle = manual || motion.matches ? 0 : Math.sin(t/1600)*.2;
    drawScene.draw([angle+idle,pitch,scene.camera[2]],scene.extent);
    if ((!manual && !motion.matches) || Math.abs(target-angle)>.002) schedule();
  }

  function schedule() {
    if (visible && !frame) frame=requestAnimationFrame(draw);
  }

  function initialise() {
    if (drawScene) return;
    drawScene=renderer(canvas);
    if (!drawScene) return;
    drawScene.update(scene.build(shade));
    canvas.hidden=false;
    poster.hidden=true;
    orbit.hidden=false;
    if (shades) shades.hidden=false;
  }

  const viewport = new IntersectionObserver(([entry])=>{
    visible=entry.isIntersecting;
    if (visible) initialise();
    schedule();
  },{ rootMargin:'60px' });
  viewport.observe(canvas.parentElement);

  canvas.addEventListener('webglcontextlost',event=>{
    event.preventDefault();
    drawScene=null;
    canvas.hidden=true;
    poster.hidden=false;
    orbit.hidden=true;
    if (shades) shades.hidden=true;
  });
  canvas.addEventListener('webglcontextrestored',() => {
    if (!visible) return;
    initialise();
    schedule();
  });
  window.addEventListener('resize',schedule,{passive:true});
  document.addEventListener('visibilitychange',schedule);
  motion.addEventListener('change',schedule);

  orbit.addEventListener('click',()=>{
    manual=true;
    target+=Math.PI/4;
    schedule();
  });
  canvas.addEventListener('pointerdown',event=>{
    if (event.button!==0) return;
    drag={ id:event.pointerId, x:event.clientX, y:event.clientY };
    canvas.setPointerCapture(event.pointerId);
  });
  canvas.addEventListener('pointermove',event=>{
    if (drag?.id!==event.pointerId) return;
    manual=true;
    target+=(event.clientX-drag.x)*.014;
    if (event.pointerType==='mouse') pitch=Math.max(-.85,Math.min(1.24,pitch+(event.clientY-drag.y)*.010));
    drag={ id:event.pointerId,x:event.clientX,y:event.clientY };
    schedule();
  });
  for (const type of ['pointerup','pointercancel','lostpointercapture']) {
    canvas.addEventListener(type,event=>{
      if (drag?.id===event.pointerId) drag=null;
    });
  }
  shades?.addEventListener('click',event=>{
    const button=event.target.closest('[data-shade]');
    if (!button || !drawScene) return;
    shade=button.dataset.shade;
    drawScene.update(scene.build(shade));
    shades.querySelectorAll('button').forEach(option=>option.setAttribute('aria-pressed',String(option===button)));
    schedule();
  });
}

const canvas = document.querySelector('[data-object]');
if (canvas && 'IntersectionObserver' in window) mount(canvas);
