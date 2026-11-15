const circle = Math.PI * 2;

const add = (a,b) => a.map((v,i) => v+b[i]);
const sub = (a,b) => a.map((v,i) => v-b[i]);
const mul = (a,k) => a.map(v => v*k);
const dot = (a,b) => a.reduce((sum,v,i) => sum+v*b[i],0);
const cross = (a,b) => [a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const unit = v => mul(v,1/(Math.hypot(...v)||1));
const mix = (a,b,t) => a.map((v,i) => v+(b[i]-v)*t);
const color = hex => [0,2,4].map(i => parseInt(hex.slice(i,i+2),16)/255);

function surface(mesh, rows, columns, sample, paint, gloss=.3) {
  const grid = [];
  for (let i=0; i<=rows; i++) {
    const u=i/rows;
    for (let j=0; j<=columns; j++) {
      const v=j/columns, d=.0005;
      const point=sample(u,v);
      const normal=unit(cross(sub(sample(u+d,v),sample(u-d,v)),sub(sample(u,v+d),sample(u,v-d))));
      grid.push([...point,...normal,...(typeof paint==='function'?paint(point,u,v):paint),gloss]);
    }
  }
  for (let i=0; i<rows; i++) for (let j=0; j<columns; j++) {
    const a=i*(columns+1)+j, b=a+columns+1;
    for (const index of [a,b,a+1,a+1,b,b+1]) mesh.push(...grid[index]);
  }
}

function tube(mesh, curve, radius, paint, gloss=.4, rows=64, sides=10) {
  surface(mesh,rows,sides,(t,s)=>{
    const point=curve(t), tangent=unit(sub(curve(t+.001),curve(t-.001)));
    const reference=Math.abs(tangent[2])>.85?[0,1,0]:[0,0,1];
    const side=unit(cross(tangent,reference)), up=cross(tangent,side);
    const r=typeof radius==='function'?radius(t):radius;
    return add(point,add(mul(side,r*Math.cos(s*circle)),mul(up,r*Math.sin(s*circle))));
  },paint,gloss);
}

function lathe(mesh, profile, center, paint, gloss, angle=0) {
  for (let i=0; i<profile.length-1; i++) {
    const [r0,y0]=profile[i], [r1,y1]=profile[i+1];
    surface(mesh,1,52,(u,v)=>{
      const r=r0+(r1-r0)*u, y=y0+(y1-y0)*u, a=v*circle;
      const x=r*Math.cos(a);
      return add(center,[x*Math.cos(angle)-y*Math.sin(angle),x*Math.sin(angle)+y*Math.cos(angle),r*Math.sin(a)]);
    },paint,gloss);
  }
}

function solid(mesh, outline, depth, paints, gloss) {
  const front=outline.map(([x,y,z])=>[x,y,z+depth]), back=outline.map(([x,y,z])=>[x,y,z-depth]);
  function tri(a,b,c,paint) {
    const n=unit(cross(sub(b,a),sub(c,a)));
    for (const p of [a,b,c]) mesh.push(...p,...n,...paint,gloss);
  }
  for (let i=1;i<outline.length-1;i++) {
    tri(front[0],front[i],front[i+1],paints[0]);
    tri(back[0],back[i+1],back[i],paints[1]);
  }
  for (let i=0;i<outline.length;i++) {
    const j=(i+1)%outline.length;
    tri(front[i],back[i],front[j],paints[1]);
    tri(front[j],back[i],back[j],paints[1]);
  }
}

function scissors() {
  const mesh=[], steel=color('c0c7bf'), dark=color('6e786f'), bright=color('d8dfd4');
  for (const sign of [-1,1]) {
    const z=sign*.068;
    const blade=[[.24,.08],[-.10,.14],[-.07,.54],[.60,1.72],[.78,1.99],[.81,1.87],[.57,1.19],[.36,.52]]
      .map(([x,y])=>[sign*x,y-.12,z]);
    solid(mesh,blade,.048,[steel,dark],.95);
    solid(mesh,[[.24,.12],[.33,.21],[.81,1.87],[.78,1.99],[.55,1.51]].map(([x,y])=>[sign*x,y-.12,z+.051]),.006,[bright,steel],1);
    tube(mesh,t=>[sign*(-.01-(.69*t)), -.1-.74*t, z+.02*Math.sin(Math.PI*t)],.093,steel,.86,22);
    tube(mesh,t=>[sign*(-.70+.34*Math.cos(circle*t)),-1.13+.37*Math.sin(circle*t),z],.108,steel,.92,56);
    tube(mesh,t=>[sign*(-.70+.245*Math.cos(circle*t)),-1.13+.276*Math.sin(circle*t),z+.019],.033,color('34362d'),.45,48);
  }
  lathe(mesh,[[0,-.13],[.182,-.13],[.205,-.08],[.205,.08],[.183,.13],[0,.13]],[0,-.09,.15],color('d5ff56'),.55);
  return mesh;
}

function lipstick(shade) {
  const mesh=[], caseColor=color('592238'), gold=color('d9a477');
  const tint=color(({coral:'bd4147',rose:'b95d7b',wine:'731d44'})[shade]||'bd4147');
  lathe(mesh,[[0,-1.43],[.42,-1.43],[.49,-1.37],[.51,-1.27],[.51,-.48],[.48,-.42]],[0,0,0],caseColor,.87);
  lathe(mesh,[[.49,-.48],[.519,-.45],[.519,-.34],[.47,-.3],[.426,-.3],[.426,.13],[.414,.21],[.35,.22]],[0,0,0],gold,1);
  surface(mesh,19,64,(u,v)=>{
    const a=v*circle, r=.351-(.018*u);
    const top=1.2+.35*Math.sin(a)+.16*Math.cos(a);
    return [r*Math.cos(a),.15+(top-.15)*u,r*Math.sin(a)];
  },tint,.58);
  surface(mesh,12,64,(u,v)=>{
    const a=v*circle, r=.333*u;
    return [r*Math.cos(a),1.2+(.35*Math.sin(a)+.16*Math.cos(a))*u+.075*(1-u*u),r*Math.sin(a)];
  },tint,.48);
  const cap=[.98,-.39,-.54];
  lathe(mesh,[[0,-.68],[.43,-.68],[.49,-.62],[.496,-.53],[.496,.57],[.45,.65],[0,.65]],cap,caseColor,.68,-.29);
  lathe(mesh,[[.496,-.6],[.508,-.56],[.508,-.51],[.496,-.49]],cap,gold,.95,-.29);
  return mesh;
}

function mountain() {
  const mesh=[];
  const peaks=[[-.71,.07,1.25,.72],[.31,-.45,1.58,.6],[.84,.36,1.03,.61],[-.49,.68,.54,.57]];
  function height(x,z) {
    const h=Math.max(...peaks.map(([cx,cz,tall,r])=>tall*(1-Math.hypot((x-cx)*.89,(z-cz)*1.07)/r)));
    const ridges=.087*Math.sin(14*x+3*z)*Math.cos(10*z-6*x)+.055*Math.sin(21*z+17*x);
    const rim=Math.min(1,(1.55-Math.abs(x))*3,(1.19-Math.abs(z))*3);
    return -.54+Math.max(0,(h+ridges+.11)*rim);
  }
  const top=(u,v)=>{
    const x=(u-.5)*3.08, z=(v-.5)*2.34;
    return [x,height(x,z),z];
  };
  const forest=color('497c68'), pale=color('dcddd0'), lava=color('a9ac86');
  surface(mesh,70,54,top,p=>{
    const tint=p[1]>.43?mix(lava,pale,Math.min(1,(p[1]-.43)/.38)):mix(forest,lava,Math.max(0,(p[1]+.54)/.97));
    const edge=Math.abs(((p[1]+.56)*9)%1-.5);
    return edge>.40?mul(tint,.78):tint;
  },.14);
  const border=t=> {
    const q=Math.min(3.99999,Math.max(0,t%1*4));
    if(q<1) return top(q,0);
    if(q<2) return top(1,q-1);
    if(q<3) return top(3-q,1);
    return top(0,4-q);
  };
  surface(mesh,80,1,(u,v)=> {
    const p=border(u);
    return [p[0],-.76+(p[1]+.76)*v,p[2]];
  },color('315347'),.2);
  return mesh;
}

function pasta() {
  const mesh=[], ceramic=color('e2b492');
  lathe(mesh,[[0,-.48],[.55,-.48],[.94,-.46],[1.27,-.37],[1.51,-.19],[1.56,-.12],[1.56,-.08],[1.52,-.03],[1.45,-.045],[1.29,-.15],[1.13,-.21],[.89,-.25],[0,-.255]],[0,0,0],ceramic,.83);
  lathe(mesh,[[1.523,-.043],[1.51,-.026],[1.48,-.027],[1.467,-.045]],[0,0,0],color('a46e52'),.76);
  const golden=[color('eac269'),color('f4bc58'),color('e4aa52'),color('f3cf82')];
  for (let i=0;i<17;i++) {
    const a=i*2.399, round=.55+.23*Math.sin(i*6), rise=i%5*.056;
    surface(mesh,50,5,(u,v)=>{
      const theta=a+(u-.5)*3.8;
      const r=round+.24*Math.cos(u*6+i*.43)+(v-.5)*.158;
      return [r*Math.cos(theta),-.13+rise+.12*Math.sin(u*6.6+i*.34)+.055*Math.sin(u*13+i)*(v-.5),r*Math.sin(theta)];
    },golden[i%4],.54);
  }
  for(const [cx,cz,a] of [[-.5,.29,.3],[.46,-.22,2.1],[.16,.64,1.17]]) {
    tube(mesh,t=>{
      const angle=a+t*2.5, r=.205-(.034*t);
      return [cx+r*Math.cos(angle),.04+.11*Math.sin(t*Math.PI),cz+r*Math.sin(angle)];
    },t=>.076*Math.sin(Math.PI*(.12+t*.88)),(p,u)=>Math.sin(u*32)>.57?color('b95b3c'):color('ee9870'),.49,32);
  }
  for (const [cx,cz,a] of [[-.48,-.44,.5],[.62,.25,-.7],[-.1,.37,2]]) {
    surface(mesh,21,8,(u,v)=>{
      const w=(v-.5)*.20*Math.sin(u*Math.PI), l=(u-.2)*.31;
      return [cx+l*Math.cos(a)+w*Math.sin(a),.20-.12*u+.10*Math.sin(u*Math.PI)-w*w,cz+l*Math.sin(a)-w*Math.cos(a)];
    },(p,u,v)=>v>.47&&v<.53?color('8c9d51'):color('547840'),.31);
  }
  return mesh;
}

export const scenes = {
  form: { build:scissors, camera:[.28,-.18,.45], extent:2.13 },
  muse: { build:lipstick, camera:[-.33,.19,-.22], extent:1.73 },
  travel: { build:mountain, camera:[-.49,.60,.02], extent:1.93 },
  atelier: { build:pasta, camera:[-.41,.97,-.09], extent:1.79 }
};
