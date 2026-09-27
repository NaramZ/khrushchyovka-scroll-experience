
// ───────────────────────── THE MICRORAYON ─────────────────────────
const district=group('district'),blocks=group('blocks'),props=group('props');
{const g=new THREE.PlaneGeometry(900,900,1,1);g.rotateX(-Math.PI/2);mesh(district,g,mat.ground,0,0,0)}
const roads=[[-450,450,20.5,27.5],[30.5,37.5,-450,20.5],[-30,30.5,-17.5,-13],[5,24,11,17],[18,24,17,20.5]];
for(const[x0,x1,z0,z1]of roads)bx(district,x0,x1,-.05,.04,z0,z1,mat.asphalt);mat.asphalt.userData.snowK=.6;mat.paving.userData.snowK=.85;
const walks=[[-14.2,14.2,6,8.8],[-1.2,1.2,8.8,18.8],[-450,450,18.8,20.5],[-450,450,27.5,29.2],[28.8,30.5,-450,18.8],[37.5,39.2,-450,18.8]];
for(const[x0,x1,z0,z1]of walks)bx(district,x0,x1,-.05,.08,z0,z1,mat.paving);
for(const[x0,x1,z0,z1]of[[-450,450,20.4,20.6],[-450,450,27.4,27.6]])bx(district,x0,x1,-.05,.17,z0,z1,mat.curb);
{const line=M({color:'#d9d8cf'});line.userData.snowK=.6;for(let x=-120;x<120;x+=6)bx(district,x,x+3,.04,.05,23.9,24.1,line)}
// the neighbours: slabs and point towers built from the same panels
const farBlocks=[];
function panelBlock(cx,cz,len,depth,floors,rot=0){const q=new THREE.Group();blocks.add(q);q.position.set(cx,0,cz);q.rotation.y=rot;const h=floors*2.8+.8;
 bx(q,-len/2,len/2,0,h,-depth/2,depth/2,mat.block);bx(q,-len/2-.05,len/2+.05,0,.9,-depth/2-.05,depth/2+.05,mat.plinth);bx(q,-len/2,len/2,h,h+.5,-depth/2,depth/2,mat.roof);bx(q,-len/2-.05,len/2+.05,h+.5,h+.58,-depth/2-.05,depth/2+.05,mat.steel);
 for(let i=0;i<Math.max(1,Math.round(len/26));i++){const x=-len/2+(i+.5)*len/Math.max(1,Math.round(len/26));bx(q,x-1.6,x+1.6,h+.5,h+2.8,-2,2,mat.facade)}
 // balcony slabs give the long facades their relief
 for(const side of[-1,1])for(let f=1;f<floors;f++)for(let i=0;i<Math.floor(len/6);i++){if((i+f)%3===0)continue;const x=-len/2+3+i*6;if(Math.abs(x)>len/2-2)continue;bx(q,x-1.35,x+1.35,f*2.8-.14,f*2.8,side*depth/2,side*(depth/2+1.1),mat.plinth);bx(q,x-1.35,x+1.35,f*2.8,f*2.8+1,side*(depth/2+1.05),side*(depth/2+1.12),rnd()>.5?mat.facade:mat.frame)}
 return q}
const nearBlocks=[[-18,-46,64,12,9,0],[38,-42,24,12,16,0],[64,6,72,12,12,Math.PI/2],[-58,6,60,12,5,Math.PI/2],[-72,-34,40,12,9,0],[-6,-96,24,12,16,0],[42,-104,24,12,16,.1],[-62,-92,60,12,12,0],[-14,62,84,12,9,0],[64,96,24,12,16,.3],[-72,66,24,12,16,0],[88,-52,24,12,16,0],[-104,-8,24,12,14,0]];
for(const b of nearBlocks)panelBlock(...b);
// the far ring is not modelled: it is sampled into soft gaussian splats (see atmosphere)
for(let i=0;i<46;i++){const a=rand(0,Math.PI*2),r=rand(135,300),cx=Math.cos(a)*r,cz=Math.sin(a)*r;farBlocks.push({cx,cz,len:pick([24,24,36,60,80]),depth:12,h:pick([5,9,9,12,14,16,16,22])*2.8,rot:pick([0,Math.PI/2,a])})}
// a low kindergarten with a pitched glass entry
{const q=new THREE.Group();props.add(q);q.position.set(-32,0,-8);bx(q,-14,14,0,6.4,-6,6,mat.block);bx(q,-14.2,14.2,6.4,6.8,-6.2,6.2,mat.roof)}
// garages
for(let i=0;i<9;i++){const x=40+i*2.6;bx(props,x,x+2.5,0,2.3,-24,-19,pick([mat.rust,mat.metalPaint,mat.rust,mat.brownPaint]));bx(props,x+.15,x+2.35,.05,2.1,-19,-18.96,pick([mat.rust,mat.metalPaint,mat.blue]));bx(props,x-.02,x+2.52,2.3,2.38,-24.1,-18.8,mat.steel)}
// cars
const carColors=['#d9d4c3','#7e9aa6','#a33a2c','#3e5a4c','#c9b37a','#e4e1d6','#5a6a7a','#8a8d86'];
function car(x,z,ry,color){const q=new THREE.Group();props.add(q);q.position.set(x,0,z);q.rotation.y=ry;const m=mat.carpaint(color);
 rbox(q,0,.56,0,1.62,.5,4.1,.08,m);rbox(q,0,.99,-.18,1.44,.4,2.05,.06,mat.glassFake);rbox(q,0,1.2,-.22,1.36,.07,1.78,.03,m);for(const s of[-1,1]){bx(q,-.72,.72,.84,1.17,-.18+s*.7-.03,-.18+s*.7+.03,m)}
 for(const sx of[-1,1])for(const sz of[-1.28,1.3]){cyl(q,sx*.74,.3,sz,.3,.3,.2,mat.black,18,0,Math.PI/2);cyl(q,sx*.85,.3,sz,.17,.17,.02,mat.steel,14,0,Math.PI/2)}
 for(const s of[-1,1]){bx(q,-.83,.83,.36,.46,s*2.03,s*2.1,mat.chrome);for(const sx of[-1,1])bx(q,sx*.62-.14,sx*.62+.14,.6,.72,s*2.04,s*2.06,s>0?mat.cream:mat.red)}return q}
for(let i=0;i<7;i++)if(i!==3)car(7+i*2.6,14,Math.PI+rand(-.04,.04),pick(carColors));
for(let i=0;i<6;i++)car(-60+i*18+rand(-2,2),21.6,Math.PI/2,pick(carColors));car(33,-6,0,pick(carColors));car(26,-15.3,Math.PI/2,pick(carColors));
// benches by the entrance, bins, lamp posts, carpet-beating frame, drying posts, low fences
for(const x of[-2.7,2.7]){for(let j=0;j<3;j++)bx(props,x-1,x+1,.42+j*.001,.45,7.35+j*.13,7.46+j*.13,mat.lightWood);for(let j=0;j<2;j++)bx(props,x-1,x+1,.62+j*.14,.72+j*.14,7.78,7.82,mat.lightWood);for(const k of[-.8,.8])bx(props,x+k-.06,x+k+.06,0,.42,7.3,7.8,mat.plinth)}
for(let i=0;i<3;i++){const x=-9+i*1.4;bx(props,x-.6,x+.6,0,1.1,9.3,10.3,mat.green);bx(props,x-.62,x+.62,1.1,1.16,9.25,10.35,mat.metalDark)}
function lamp(x,z,ry=0){rod(props,[x,0,z],[x,8,z],.09,mat.plinth,8);const a=[x+Math.sin(ry)*1.4,7.9,z+Math.cos(ry)*1.4];poly(props,[[x,7.6,z],[x,8.1,z],a],.04,mat.metalDark,6);rbox(props,a[0],a[1]-.08,a[2],.25,.12,.5,.04,mat.metalDark,ry)}
for(let x=-100;x<=100;x+=28)lamp(x,19.6,Math.PI);lamp(1.9,12,-Math.PI/2);
poly(props,[[-16,0,26.5],[-16,2.1,26.5],[-12,2.1,26.5],[-12,0,26.5]],.04,mat.metalPaint,8);
for(const[x0,x1,z]of[[-14.2,-1.6,9.1],[1.8,4.8,9.1],[-14.2,-1.6,18.5],[1.8,4.8,18.5]]){rod(props,[x0,.55,z],[x1,.55,z],.025,mat.metalPaint,6);for(let x=x0;x<=x1+.01;x+=2)rod(props,[x,0,z],[x,.55,z],.025,mat.metalPaint,6)}
// playground: swing, climbing globe, sandbox, a rocket slide
{const x=-19,z=14;poly(props,[[x-1.4,0,z-.8],[x-1.4,2.4,z],[x-1.4,0,z+.8]],.05,mat.red);poly(props,[[x+1.4,0,z-.8],[x+1.4,2.4,z],[x+1.4,0,z+.8]],.05,mat.red);rod(props,[x-1.4,2.4,z],[x+1.4,2.4,z],.05,mat.red);for(const s of[-.25,.25])rod(props,[x+s,2.4,z],[x+s,.5,z],.012,mat.metalDark,5);bx(props,x-.3,x+.3,.46,.5,z-.15,z+.15,mat.lightWood);
 for(let k=0;k<6;k++){const a=k*Math.PI/6;const pts=[];for(let t=0;t<=12;t++){const b=t/12*Math.PI;pts.push([x-6+Math.cos(a)*Math.sin(b)*1.5,Math.max(0,1.5-Math.cos(b)*1.5)*.98,z+3+Math.sin(a)*Math.sin(b)*1.5])}poly(props,pts,.025,mat.blue,6)}
 for(const r of[.6,1.1,1.4])cyl(props,x-6,.0+(1.5-Math.sqrt(1.5*1.5-r*r))*0+1.5-Math.sqrt(Math.max(0,1.5*1.5-r*r)),z+3,r,r,.04,mat.blue,32);
 bx(props,x+3.5,x+6,.0,.3,z+2,z+4.5,mat.lightWood);bx(props,x+3.7,x+5.8,.0,.25,z+2.2,z+4.3,M({color:'#c9b890',roughness:1}))}
// trees: timber and branches here; their canopies are gaussian splats (see atmosphere)
const trees=[],noTree=(x,z)=>(x>-66&&x<-4&&z>29&&z<60)||(x>-15&&x<26&&z>-8&&z<11.5)||(z>18.3&&z<29.5)||(x>28&&x<40)||(x>4&&x<25&&z>10&&z<20.6)||(Math.abs(x)<3&&z>6&&z<21)||(x>-26&&x<-10&&z>9&&z<22)||(x>38&&x<66&&z>-26&&z<-17)||(x>-47&&x<-17&&z>-15&&z<0)||(z>-19&&z<-11&&x>-31&&x<32);
function inBlock(x,z){for(const[cx,cz,len,d,,rot]of nearBlocks){const c=Math.cos(-rot),s=Math.sin(-rot),lx=(x-cx)*c-(z-cz)*s,lz=(x-cx)*s+(z-cz)*c;if(Math.abs(lx)<len/2+3&&Math.abs(lz)<d/2+4)return true}return false}
const camClear=[[15.5,20.5],[25,34],[7,14.5],[40,52]];let tries=0;while(trees.length<150&&tries<5000){tries++;const r=Math.sqrt(rnd())*95,a=rnd()*Math.PI*2,x=Math.cos(a)*r,z=Math.sin(a)*r-5;if(noTree(x,z)||inBlock(x,z)||camClear.some(([cx,cz])=>Math.hypot(cx-x,cz-z)<6.5))continue;if(trees.some(t=>Math.hypot(t.x-x,t.z-z)<4.2))continue;trees.push({x,z})}
for(const x of[-40,-30,-20,-10,10,48,58,70,82])trees.push({x:x+rand(-1,1),z:17.2+rand(-.5,.5)});for(const x of[-8,8,20,44,56])trees.push({x:x+rand(-1,1),z:30.8+rand(-.5,.5)});
for(let i=0,k=0;i<26&&k<2000;k++){const r=rand(18,90),a=rnd()*Math.PI*2,x=Math.cos(a)*r,z=Math.sin(a)*r-5;if(noTree(x,z)||inBlock(x,z)||trees.some(t=>Math.hypot(t.x-x,t.z-z)<4.5)||camClear.some(([cx,cz])=>Math.hypot(cx-x,cz-z)<6.5))continue;trees.push({x,z,type:'spruce'});i++}
for(const t of trees){if(t.type==='spruce'){t.h=rand(7,12);t.clusters=[];rod(props,[t.x,0,t.z],[t.x,t.h*.95,t.z],.13,mat.bark,7);continue}t.type=pick(['birch','birch','linden','maple','poplar','linden']);t.h=t.type==='poplar'?rand(13,17):rand(8,12.5);const trunkM=t.type==='birch'?mat.birch:mat.bark,g=props;
 rod(g,[t.x,0,t.z],[t.x+rand(-.2,.2),t.h*.62,t.z+rand(-.2,.2)],t.type==='poplar'?.2:.15,trunkM,8);cyl(g,t.x,.4,t.z,.17,.24,.8,trunkM,8);
 t.clusters=[];const n=t.type==='poplar'?5:Math.round(rand(4,7));for(let k=0;k<n;k++){const ang=k*2.4+rand(-.4,.4),rr=t.type==='poplar'?rand(.3,1.2):rand(.8,2.6),hy=t.type==='poplar'?t.h*rand(.4,.95):t.h*rand(.55,.92),c=[t.x+Math.cos(ang)*rr,hy,t.z+Math.sin(ang)*rr];poly(g,[[t.x,t.h*rand(.38,.55),t.z],[t.x+Math.cos(ang)*rr*.55,hy*.88,t.z+Math.sin(ang)*rr*.55],c],t.type==='poplar'?.07:.055,trunkM,6);t.clusters.push({c,r:t.type==='poplar'?rand(1.1,1.7):rand(1.6,2.6)})}}
// the ground is repainted for every season: grass tone, leaf litter or dandelions, worn earth, soft darkness under crowns
function paintGround(S){const x=groundUnique.getContext('2d'),W=groundUnique.width,P=(wx,wz)=>[(wx+160)/320*W,(wz+160)/320*W],s=W/320;
 x.save();x.globalAlpha=1;x.globalCompositeOperation='source-over';x.fillStyle=S.grass;x.fillRect(0,0,W,W);fbm(x,W,W,1.2);noiseLayer(x,W,W,12,.35,'multiply',.8);
 for(const t of trees){const[cx,cy]=P(t.x,t.z),r=x.createRadialGradient(cx,cy,0,cx,cy,5*s);r.addColorStop(0,'rgba(28,34,24,.3)');r.addColorStop(1,'rgba(28,34,24,0)');x.fillStyle=r;x.beginPath();x.arc(cx,cy,5*s,0,7);x.fill();
  if(S.litter.length&&t.type!=='spruce')for(let i=0;i<S.litterN;i++){x.fillStyle=pick(S.litter);x.globalAlpha=rand(.25,.7);const rr=Math.sqrt(rnd())*7*s,a=rnd()*6.28;x.fillRect(cx+Math.cos(a)*rr,cy+Math.sin(a)*rr,rand(.5,1.6),rand(.5,1.6))}x.globalAlpha=1}
 if(S.flowers)for(let i=0;i<S.flowers;i++){x.fillStyle=pick(S.flowerCols);x.globalAlpha=rand(.4,.9);x.fillRect(rnd()*W,rnd()*W,rand(.8,1.6),rand(.8,1.6))}x.globalAlpha=.5;x.fillStyle=S.dirt;
 for(const[x0,x1,z0,z1]of[[-26,-10,9,22],[-7,7,9,12]]){const[a,b]=P(x0,z0),[c,d]=P(x1,z1);x.fillRect(a,b,c-a,d-b)}x.globalAlpha=1;
 x.strokeStyle=S.dirt;x.globalAlpha=.6;x.lineWidth=1.6*s;x.beginPath();let[p,q]=P(-14,9);x.moveTo(p,q);[p,q]=P(-30,24);x.quadraticCurveTo(...P(-24,12),p,q);x.stroke();x.globalAlpha=1;
 noiseLayer(x,W,W,40,.18);x.restore();mat.ground.map.needsUpdate=true}
