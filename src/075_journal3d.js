
// ───────────────────────── THE JOURNAL — a real notebook on a desk, in the same 3D world ─────────────────────────
// An old leather-bound notebook lies open under a desk lamp. Its pages are paper with thickness and a curve into the
// spine; turning a page lifts and bends the sheet over. The words are laid out as ordinary, accessible HTML (invisible,
// but read by screen readers and reachable by keyboard) and then written onto the paper word by word, so what you see
// and what assistive technology reads are the same text. A lighter pass of the gaussian paint sits over the scene.
const JOURNAL=(()=>{
 const dlg=notes,src=dlg.querySelector('.n-src'),blocks=[...src.children],press=dlg.querySelector('.pg-dom.press .page-in'),pressBox=dlg.querySelector('.pg-dom.press'),
  views=[...dlg.querySelectorAll('.pg-dom.view')],viewIns=views.map(v=>v.querySelector('.page-in')),where=dlg.querySelector('.bk-where'),prevB=dlg.querySelector('.bk-prev'),nextB=dlg.querySelector('.bk-next');
 const PW=540,PH=742,S=2,TOP=56,RULE=34,MARG=50;
 // ── 1 · lay the entry out on pages (invisible HTML, same size as a page)
 let pages=[],spread=0,side=0,single=false;const idPage=new Map();
 function paginate(){press.innerHTML='';pages=[];let cur=[];const flush=()=>{if(cur.length)pages.push(cur);cur=[];press.innerHTML=''};
  for(const b of blocks){if(b.dataset.break==='before')flush();press.appendChild(b);
   if(press.scrollHeight>press.clientHeight+2&&cur.length){press.removeChild(b);const carry=[];while(cur.length&&cur[cur.length-1].dataset.keep==='next')carry.unshift(cur.pop());flush();for(const c of carry){press.appendChild(c);cur.push(c)}press.appendChild(b)}
   cur.push(b);if(b.dataset.break==='after')flush()}
  flush();if(pages.length%2)pages.push([]);idPage.clear();pages.forEach((p,i)=>p.forEach(b=>{if(b.id)idPage.set(b.id,i);b.querySelectorAll('[id]').forEach(e=>idPage.set(e.id,i))}));
  blocks.flatMap(b=>[...b.querySelectorAll('.n-index a')]).forEach(l=>{const id=l.getAttribute('href').slice(1),n=idPage.has(id)?idPage.get(id)+1:'';l.querySelector('.ix-p').textContent=n;l.setAttribute('aria-label',l.querySelector('.ix-t').textContent+(n?', page '+n:''))});
  spread=clamp(spread,0,pages.length/2-1)}
 function showView(){for(let k=0;k<2;k++){viewIns[k].innerHTML='';for(const b of pages[spread*2+k]||[])viewIns[k].appendChild(b)}
  const a=spread*2+1,b=spread*2+2;where.textContent=single?`page ${spread*2+side+1} of ${pages.length}`:`pages ${a}–${b} of ${pages.length}`;prevB.disabled=spread===0&&(!single||side===0);nextB.disabled=spread>=pages.length/2-1&&(!single||side===1)}

 // ── 2 · write a page onto paper
 const fiber=(()=>{const c=document.createElement('canvas');c.width=c.height=512;const x=c.getContext('2d'),id=x.createImageData(512,512);for(let i=0;i<id.data.length;i+=4){const n=rnd();id.data[i]=96;id.data[i+1]=70;id.data[i+2]=38;id.data[i+3]=n*n*30}x.putImageData(id,0,0);
  for(let k=0;k<700;k++){const a=rnd()*6.28,px=rnd()*512,py=rnd()*512,l=3+rnd()*16;x.strokeStyle=`rgba(${rnd()<.5?'120,92,52':'250,240,215'},${.05+rnd()*.07})`;x.lineWidth=.3+rnd()*.7;x.beginPath();x.moveTo(px,py);x.quadraticCurveTo(px+Math.cos(a)*l*.5+rand(-2,2),py+Math.sin(a)*l*.5+rand(-2,2),px+Math.cos(a)*l,py+Math.sin(a)*l);x.stroke()}return c})();
 const rel=(el,o)=>{const r=el.getBoundingClientRect();return{x:r.left-o.left,y:r.top-o.top,w:r.width,h:r.height}};
 function paper(x,i){let s=(i+3)*7919;const r=()=>(s=(s*16807)%2147483647)/2147483647;
  x.fillStyle='#dcc79a';x.fillRect(0,0,PW,PH);x.fillStyle=x.createPattern(fiber,'repeat');x.fillRect(0,0,PW,PH);
  // age creeps in from the edges; the outer edge (away from the spine) is handled more
  const outer=i%2===0?0:PW;let g=x.createLinearGradient(outer,0,PW-outer,0);g.addColorStop(0,'rgba(110,70,25,.26)');g.addColorStop(.12,'rgba(110,70,25,.07)');g.addColorStop(1,'rgba(110,70,25,0)');x.fillStyle=g;x.fillRect(0,0,PW,PH);
  g=x.createLinearGradient(0,0,0,PH);g.addColorStop(0,'rgba(110,70,25,.18)');g.addColorStop(.07,'rgba(110,70,25,0)');g.addColorStop(.93,'rgba(110,70,25,0)');g.addColorStop(1,'rgba(110,70,25,.2)');x.fillStyle=g;x.fillRect(0,0,PW,PH);
  for(let k=0;k<22;k++){const px=r()*PW,py=r()*PH,rr=.5+r()*1.8;x.fillStyle=`rgba(125,80,38,${.08+r()*.14})`;x.beginPath();x.arc(px,py,rr,0,7);x.fill()}
  x.strokeStyle='rgba(86,104,132,.26)';x.lineWidth=1;for(let y=TOP+RULE;y<PH-40;y+=RULE){x.beginPath();x.moveTo(22,y+.5);for(let xx=22;xx<=PW-18;xx+=60)x.lineTo(xx,y+.5+(r()-.5)*.6);x.stroke()}
  x.strokeStyle='rgba(168,58,40,.3)';x.beginPath();x.moveTo(MARG,20);x.lineTo(MARG+1,PH-20);x.stroke()}
 const hand=w=>`${w} ${'var(--j-hand)'}`;
 function scribble(x,r){x.save();x.strokeStyle='rgba(44,30,18,.9)';x.lineWidth=2.4;x.lineCap='round';x.lineJoin='round';for(let k=0;k<3;k++){x.beginPath();const y0=r.y+r.h*(.35+k*.14);x.moveTo(r.x-4,y0);for(let xx=r.x-4;xx<=r.x+r.w+4;xx+=5)x.lineTo(xx,y0+Math.sin(xx*.9+k*2)*r.h*.16+(k-1)*2);x.stroke()}x.restore()}
 function coverImg(x,im,r){const ar=im.naturalWidth/im.naturalHeight,br=r.w/r.h;let sw=im.naturalWidth,sh=im.naturalHeight,sx=0,sy=0;if(ar>br){sw=sh*br;sx=(im.naturalWidth-sw)/2}else{sh=sw/br;sy=(im.naturalHeight-sh)/2}x.drawImage(im,sx,sy,sw,sh,r.x,r.y,r.w,r.h)}
 function drawPage(i,focusEl){const c=document.createElement('canvas');c.width=PW*S;c.height=PH*S;const x=c.getContext('2d');x.scale(S,S);paper(x,i);
  const fam=getComputedStyle(pressBox).getPropertyValue('--j-hand')||'Caveat';
  x.font=`600 19px ${fam}`;x.fillStyle='rgba(110,80,50,.8)';x.textAlign='center';x.fillText(i%2===0?'ДОМА':'Someone else’s home',PW/2,34);x.textAlign=i%2===0?'left':'right';x.font=`700 21px ${fam}`;x.fillText(String(i+1),i%2===0?26:PW-26,PH-18);x.textAlign='left';
  const blocksHere=pages[i]||[];if(!blocksHere.length)return c;
  // draw from the visible (accessible) page if it is showing, so keyboard focus is never disturbed; otherwise lay it out off to the side
  const vk=[spread*2,spread*2+1].indexOf(i),live=vk>=0&&viewIns[vk].firstChild===blocksHere[0],root=live?viewIns[vk]:press,box=live?views[vk]:pressBox;
  if(!live){press.innerHTML='';for(const b of blocksHere)press.appendChild(b)}const o=box.getBoundingClientRect(),O={left:o.left,top:o.top};
  const P=el=>{const r=el.getBoundingClientRect();return{x:r.left-O.left,y:r.top-O.top,w:r.width,h:r.height}};
  // photographs, taped in
  for(const f of root.querySelectorAll('figure.snap')){const r=P(f);x.save();x.shadowColor='rgba(40,25,10,.35)';x.shadowBlur=12;x.shadowOffsetY=5;x.fillStyle='#f6f0e0';x.fillRect(r.x,r.y,r.w,r.h);x.restore();const im=f.querySelector('img');if(im&&im.complete&&im.naturalWidth){x.save();x.filter='sepia(.35) saturate(.7) contrast(1.05)';coverImg(x,im,P(im));x.restore()}}
  // keyboard keys, table rules, index leaders
  for(const k of root.querySelectorAll('kbd')){const r=P(k);x.fillStyle='#f3ead4';x.strokeStyle='rgba(44,30,18,.55)';x.lineWidth=1;x.beginPath();x.roundRect(r.x,r.y,r.w,r.h,3);x.fill();x.stroke()}
  for(const t of root.querySelectorAll('table')){x.strokeStyle='rgba(44,30,18,.85)';x.lineWidth=2;const h=t.querySelector('thead tr');if(h){const r=P(h);x.beginPath();x.moveTo(r.x,r.y+r.h);x.lineTo(r.x+r.w,r.y+r.h+1);x.stroke()}x.setLineDash([5,4]);x.lineWidth=1;x.strokeStyle='rgba(44,30,18,.4)';for(const tr of t.querySelectorAll('tbody tr')){const r=P(tr);x.beginPath();x.moveTo(r.x,r.y+r.h);x.lineTo(r.x+r.w,r.y+r.h);x.stroke()}x.setLineDash([])}
  for(const d of root.querySelectorAll('.ix-d')){const r=P(d);x.fillStyle='rgba(44,30,18,.5)';for(let xx=r.x+2;xx<r.x+r.w-2;xx+=7){x.beginPath();x.arc(xx,r.y+r.h-9,1.2,0,7);x.fill()}}
  // the words themselves, each at the exact place the layout put it
  const rg=document.createRange(),tw=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let n;
  while(n=tw.nextNode()){const t=n.nodeValue;if(!t.trim())continue;const el=n.parentElement;if(el.closest('.sr'))continue;const cs=getComputedStyle(el);x.font=`${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;x.fillStyle=cs.color;
   const link=el.closest('.n-links a'),re=/\S+/g;let m;while(m=re.exec(t)){rg.setStart(n,m.index);rg.setEnd(n,m.index+m[0].length);const rs=rg.getClientRects();if(!rs.length)continue;const rc=rs[0],mt=x.measureText(m[0]),asc=mt.fontBoundingBoxAscent||parseFloat(cs.fontSize)*.8,dsc=mt.fontBoundingBoxDescent||parseFloat(cs.fontSize)*.25;
    const X=rc.left-O.left,Y=rc.top-O.top+(rc.height-asc-dsc)/2+asc;x.fillText(m[0],X,Y);if(link){x.fillRect(X,Y+4,rc.width+4,1.2)}}}
  // headings are underlined by hand; crossed-out words are scratched through; tape holds the photos
  for(const h of root.querySelectorAll('h3')){const tn=[...h.childNodes].reverse().find(c=>c.nodeType===3&&c.nodeValue.trim());if(!tn)continue;rg.selectNodeContents(tn);const rc=rg.getBoundingClientRect(),X=rc.left-O.left,Y=rc.bottom-O.top+3;x.strokeStyle='rgba(150,56,34,.75)';x.lineWidth=2.6;x.lineCap='round';x.beginPath();x.moveTo(X-4,Y);for(let xx=X-4;xx<=X+rc.width+10;xx+=8)x.lineTo(xx,Y+Math.sin(xx*.21)*1.3+(xx-X)*.01);x.stroke()}
  for(const s of root.querySelectorAll('s.scratch'))scribble(x,P(s));
  for(const f of root.querySelectorAll('figure.snap')){const r=P(f);x.save();x.translate(r.x+r.w/2,r.y+2);x.rotate(-.06+(r.x%7)*.02);x.fillStyle='rgba(222,206,160,.82)';x.fillRect(-36,-10,72,20);x.restore()}
  if(focusEl&&root.contains(focusEl)){const r=P(focusEl);x.strokeStyle='#9c3a22';x.lineWidth=3;x.beginPath();x.roundRect(r.x-6,r.y-3,r.w+12,r.h+6,6);x.stroke()}
  if(!live)press.innerHTML='';return c}
 const texCache=new Map();
 let focusTex=null;function tex(i,focusEl){const key=i+(focusEl?'f':'');if(!focusEl&&texCache.has(key))return texCache.get(key);if(focusEl&&focusTex){focusTex.dispose();focusTex=null}const t=new THREE.CanvasTexture(drawPage(i,focusEl));t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=maxAniso;
  if(!focusEl){texCache.set(key,t);if(texCache.size>8){const k0=texCache.keys().next().value;texCache.get(k0).dispose();texCache.delete(k0)}}else focusTex=t;return t}
 function clearTex(){for(const t of texCache.values())t.dispose();texCache.clear()}

 // ── 3 · the desk, the lamp, the book
 const scene=new THREE.Scene();scene.background=new THREE.Color('#120d09');scene.fog=new THREE.FogExp2('#120d09',.16);
 const cam=new THREE.PerspectiveCamera(30,1,.05,40);
 const lamp=new THREE.SpotLight('#ffd3a0',26,14,.66,.75,1.4);lamp.position.set(-1.9,3.4,-1.2);lamp.castShadow=true;lamp.shadow.mapSize.set(2048,2048);lamp.shadow.bias=-.0004;lamp.shadow.normalBias=.02;lamp.shadow.radius=4;scene.add(lamp,lamp.target);
 scene.add(new THREE.HemisphereLight('#5b6878','#20150e',.42));const rim=new THREE.DirectionalLight('#9fb4d0',.35);rim.position.set(3,2,-3);scene.add(rim);
 const deskC=woodC('#3b2416',22,30,1024);const desk=new THREE.Mesh(new THREE.PlaneGeometry(14,14),new THREE.MeshStandardMaterial({map:T(deskC,1.6),roughness:.55,metalness:0,color:'#b89880'}));desk.rotation.x=-Math.PI/2;desk.receiveShadow=true;scene.add(desk);
 // leather: oxblood, mottled, worn paler at the edges
 const leatherC=(()=>{const[c,x]=cnv(1024);x.fillStyle='#4a2019';x.fillRect(0,0,1024,1024);for(let k=0;k<5000;k++){x.fillStyle=`rgba(${rnd()<.5?'20,8,6':'120,60,40'},${rnd()*.08})`;x.beginPath();x.arc(rnd()*1024,rnd()*1024,rnd()*5,0,7);x.fill()}
  x.strokeStyle='rgba(180,120,90,.08)';for(let k=0;k<160;k++){x.lineWidth=rnd()*1.5;x.beginPath();const a=rnd()*6.28,px=rnd()*1024,py=rnd()*1024;x.moveTo(px,py);x.lineTo(px+Math.cos(a)*rand(10,60),py+Math.sin(a)*rand(10,60));x.stroke()}
  const g=x.createRadialGradient(512,512,300,512,512,720);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(150,95,60,.35)');x.fillStyle=g;x.fillRect(0,0,1024,1024);return c})();
 const leather=new THREE.MeshStandardMaterial({map:T(leatherC),bumpMap:T(leatherC,0,{srgb:false}),bumpScale:1.4,roughness:.5,metalness:.05});
 const W=1,H=W*PH/PW,COVER=.022,SEG=64,prof=d=>.085*(1-Math.exp(-d/.09))-.03*Math.pow(d/W,1.6)+.004;
 const book=new THREE.Group();book.rotation.y=-.07;scene.add(book);
 for(const s of[-1,1]){const cv=new THREE.Mesh(new RoundedBoxGeometry(W+.07,COVER,H+.08,3,.008),leather);cv.position.set(s*(W+.07)/2,COVER/2,0);cv.castShadow=cv.receiveShadow=true;book.add(cv)}
 const spine=new THREE.Mesh(new THREE.CylinderGeometry(.03,.03,H+.08,16,1,false,Math.PI/2,Math.PI),leather);spine.rotation.x=Math.PI/2;spine.rotation.z=Math.PI;spine.position.set(0,.012,0);book.add(spine);
 // the page block: the edges of all the other pages, visible along each side
 const edgeC=(()=>{const[c,x]=cnv(64,256);x.fillStyle='#d9c69c';x.fillRect(0,0,64,256);for(let y=0;y<256;y+=2){x.fillStyle=`rgba(${rnd()<.5?'120,90,50':'250,240,215'},${.15+rnd()*.25})`;x.fillRect(0,y,64,1)}return c})();
 const edgeMat=new THREE.MeshStandardMaterial({map:T(edgeC),roughness:.9,side:THREE.DoubleSide});
 function blockGeo(s){const shape=new THREE.Shape();shape.moveTo(0,COVER);for(let i=0;i<=SEG;i++){const d=i/SEG*W;shape.lineTo(s*d,COVER+prof(d)-.002)}shape.lineTo(s*W,COVER);shape.lineTo(0,COVER);return new THREE.ExtrudeGeometry(shape,{depth:H-.01,bevelEnabled:false,steps:1})}
 for(const s of[-1,1]){const g=blockGeo(s);g.translate(0,0,-(H-.01)/2);const m=new THREE.Mesh(g,edgeMat);m.castShadow=m.receiveShadow=true;book.add(m)}
 function pageGeo(s){const g=new THREE.PlaneGeometry(W,H,SEG,1);g.rotateX(-Math.PI/2);const p=g.attributes.position,uv=g.attributes.uv;for(let i=0;i<p.count;i++){const u=uv.getX(i),d=s>0?u*W:(1-u)*W;p.setX(i,s>0?d:-d);p.setY(i,COVER+prof(d)+Math.sin(d*7.3+s)*.0025*(d/W))}p.needsUpdate=true;g.computeVertexNormals();return g}
 const pageMat=()=>new THREE.MeshStandardMaterial({roughness:.93,metalness:0,color:'#ffffff'});
 const pageL=new THREE.Mesh(pageGeo(-1),pageMat()),pageR=new THREE.Mesh(pageGeo(1),pageMat());for(const m of[pageL,pageR]){m.receiveShadow=true;m.castShadow=true;book.add(m)}
 // the sheet that turns: a front and a back, bent a little as it goes over
 const sheetGeo=[pageGeo(1),pageGeo(1)];{const uv=sheetGeo[1].attributes.uv;for(let i=0;i<uv.count;i++)uv.setX(i,1-uv.getX(i));uv.needsUpdate=true}
 const sheetF=new THREE.Mesh(sheetGeo[0],new THREE.MeshStandardMaterial({roughness:.93,side:THREE.FrontSide})),sheetB=new THREE.Mesh(sheetGeo[1],new THREE.MeshStandardMaterial({roughness:.93,side:THREE.BackSide}));
 for(const m of[sheetF,sheetB]){m.castShadow=true;m.visible=false;book.add(m)}
 function bendSheet(t){const th=t*Math.PI,curl=.85*Math.sin(Math.PI*t);for(const g of sheetGeo){const p=g.attributes.position,uv=g.attributes.uv;for(let i=0;i<p.count;i++){const u=g===sheetGeo[1]?1-uv.getX(i):uv.getX(i),d=u*W,a=clamp(th-curl*(d/W)*(t<.5?1:-1)*.6,0,Math.PI),y0=COVER+prof(d)+.003;p.setX(i,d*Math.cos(a));p.setY(i,y0+d*Math.sin(a))}p.needsUpdate=true;g.computeVertexNormals()}}
 // the ribbon, lying out of the gutter and over the edge onto the desk
 {const pts=[new THREE.Vector3(.016,COVER+prof(.016)+.003,-H/2-.01),new THREE.Vector3(.018,COVER+prof(.018)+.003,-.1),new THREE.Vector3(.02,COVER+prof(.02)+.003,H/2-.03),new THREE.Vector3(.03,COVER*.5,H/2+.05),new THREE.Vector3(.07,.002,H/2+.2),new THREE.Vector3(.1,.002,H/2+.3)];const cv=new THREE.CatmullRomCurve3(pts);
  const g=new THREE.PlaneGeometry(.024,1,1,60);const p=g.attributes.position;for(let i=0;i<p.count;i++){const v=p.getY(i)+.5,pt=cv.getPoint(v),tn=cv.getTangent(v);const side=new THREE.Vector3(-tn.z,0,tn.x).normalize().multiplyScalar(p.getX(i));p.setXYZ(i,pt.x+side.x,pt.y+.001,pt.z+side.z)}p.needsUpdate=true;g.computeVertexNormals();
  const rb=new THREE.Mesh(g,new THREE.MeshStandardMaterial({color:'#7c1c16',roughness:.38,metalness:.1,side:THREE.DoubleSide}));rb.castShadow=true;book.add(rb)}
 // on the desk: a fountain pen, the key to the flat, and a photograph that slipped out
 {const pen=new THREE.Group();const body=new THREE.Mesh(new THREE.CylinderGeometry(.018,.02,.42,24),new THREE.MeshStandardMaterial({color:'#121212',roughness:.22,metalness:.35}));body.rotation.z=Math.PI/2;pen.add(body);
  const band=new THREE.Mesh(new THREE.CylinderGeometry(.021,.021,.02,24),new THREE.MeshStandardMaterial({color:'#b8903e',roughness:.3,metalness:1}));band.rotation.z=Math.PI/2;band.position.x=.09;pen.add(band);
  const nib=new THREE.Mesh(new THREE.ConeGeometry(.016,.07,24),new THREE.MeshStandardMaterial({color:'#c9a45a',roughness:.25,metalness:1}));nib.rotation.z=-Math.PI/2;nib.position.x=-.245;pen.add(nib);
  pen.position.set(1.28,.02,.35);pen.rotation.y=.55;pen.traverse(o=>{if(o.isMesh)o.castShadow=true});scene.add(pen);
  const brass=new THREE.MeshStandardMaterial({color:'#a8843e',roughness:.35,metalness:1});const key=new THREE.Group();const bow=new THREE.Mesh(new THREE.TorusGeometry(.03,.009,10,24),brass);bow.rotation.x=Math.PI/2;key.add(bow);const shaft=new THREE.Mesh(new THREE.BoxGeometry(.12,.008,.014),brass);shaft.position.x=.09;key.add(shaft);
  for(const[x0,h]of[[.13,.02],[.105,.014]]){const t=new THREE.Mesh(new THREE.BoxGeometry(.012,.008,h),brass);t.position.set(x0,0,.014);key.add(t)}const ring=new THREE.Mesh(new THREE.TorusGeometry(.045,.004,8,32),brass);ring.rotation.x=Math.PI/2;ring.position.x=-.055;key.add(ring);
  key.position.set(-1.22,.01,.55);key.rotation.y=-.8;key.traverse(o=>{if(o.isMesh)o.castShadow=true});scene.add(key);
  const im=dlg.querySelector('.n-src img');if(im){const tx=new THREE.Texture(im);tx.colorSpace=THREE.SRGBColorSpace;const setT=()=>{tx.needsUpdate=true};if(im.complete)setT();else im.addEventListener('load',setT);
   const ph=new THREE.Group();const card=new THREE.Mesh(new THREE.BoxGeometry(.5,.004,.4),new THREE.MeshStandardMaterial({color:'#efe6d0',roughness:.8}));ph.add(card);const pic=new THREE.Mesh(new THREE.PlaneGeometry(.44,.33),new THREE.MeshStandardMaterial({map:tx,roughness:.6,color:'#e8d8c0'}));pic.rotation.x=-Math.PI/2;pic.position.set(0,.0025,-.015);ph.add(pic);
   ph.position.set(-1.38,.003,-.5);ph.rotation.y=.35;ph.traverse(o=>{if(o.isMesh){o.receiveShadow=true;o.castShadow=true}});scene.add(ph)}}
 // dust turning in the lamp's light
 const dust=(()=>{const N=160,p=new Float32Array(N*3),sd=new Float32Array(N);for(let i=0;i<N;i++){p[i*3]=rand(-1.4,.6);p[i*3+1]=rand(.15,1.5);p[i*3+2]=rand(-.9,.5);sd[i]=rnd()}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(p,3));g.setAttribute('aSeed',new THREE.BufferAttribute(sd,1));
  const m=new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,uniforms:{uT:{value:0},uS:{value:600}},vertexShader:'attribute float aSeed;uniform float uT,uS;varying float vA;void main(){vec3 q=position;q.x+=sin(uT*.13+aSeed*40.)*.12;q.y+=mod(uT*.02*(.3+aSeed)+aSeed*2.,1.9)-.95+.95*0.;q.z+=cos(uT*.11+aSeed*30.)*.1;vec4 mv=modelViewMatrix*vec4(q,1.);gl_Position=projectionMatrix*mv;gl_PointSize=clamp(uS*(.004+.006*aSeed)/-mv.z,1.,5.);float lit=smoothstep(1.1,.2,length(q.xz-vec2(-.5,-.3)))*smoothstep(.1,.5,q.y);vA=(.08+.22*aSeed)*lit;}',
   fragmentShader:'varying float vA;void main(){float d=length(gl_PointCoord-.5);gl_FragColor=vec4(1.,.86,.62,vA*smoothstep(.5,0.,d));}'});const o=new THREE.Points(g,m);o.frustumCulled=false;scene.add(o);return o})();

 // ── 4 · the picture: a gentler gaussian paint than the walk, so the handwriting stays legible
 let jcomp=null,jpaint=null;
 function ensureComposer(){if(jcomp)return;jcomp=new EffectComposer(renderer);jcomp.addPass(new RenderPass(scene,cam));jpaint=new PaintPass({fixed:{level:.34,brush:.62,focus:.92,strokes:.38}});jcomp.addPass(jpaint);jcomp.addPass(new OutputPass());resize()}
 function resize(){if(!jcomp)return;const w=innerWidth,h=innerHeight;cam.aspect=w/h;cam.updateProjectionMatrix();jcomp.setPixelRatio(pixelRatio);jcomp.setSize(w,h);jpaint.setSize(w*pixelRatio,h*pixelRatio);const was=single;single=w/h<.95;if(was!==single)side=0;showView();frame(true)}
 // the camera leans over the desk; on a narrow screen it reads one page at a time
 const camT=new THREE.Vector3(),camP=new THREE.Vector3(),look=new THREE.Vector3(),want=new THREE.Vector3(),wantL=new THREE.Vector3();let mx=0,my=0;
 function framing(){const tan=Math.tan(THREE.MathUtils.degToRad(cam.fov/2));const fw=single?W*1.18:W*2.26,fh=H*1.28;const D=Math.max(fw/(2*tan*cam.aspect),fh/(2*tan));const tx=single?(side===0?-W/2:W/2):0;wantL.set(tx,.05,.06);want.set(tx+mx*.06+.06,0,0).addScaledVector(new THREE.Vector3(.08,1.35,.95).normalize(),D*.98);want.y+=my*.04}
 // ── 5 · turning
 let turn=null;const baseTex=[null,null];
 function setBase(){pageL.material.map=tex(spread*2);pageR.material.map=tex(spread*2+1);pageL.material.needsUpdate=pageR.material.needsUpdate=true}
 function go(dir){if(turn)return;if(single){if(dir>0&&side===0){side=1;showView();return}if(dir<0&&side===1){side=0;showView();return}}
  const n=spread+dir;if(n<0||n>pages.length/2-1)return;const cur=spread;spread=n;if(single)side=dir>0?0:1;
  const t0=performance.now(),dur=reduced?0:900;
  if(dir>0){sheetF.material.map=tex(cur*2+1);sheetB.material.map=tex(n*2);pageR.material.map=tex(n*2+1)}else{sheetF.material.map=tex(n*2+1);sheetB.material.map=tex(cur*2);pageL.material.map=tex(n*2)}
  sheetF.material.needsUpdate=sheetB.material.needsUpdate=pageL.material.needsUpdate=pageR.material.needsUpdate=true;showView();
  if(!dur){setBase();return}turn={t0,dur,dir};sheetF.visible=sheetB.visible=true;bendSheet(dir>0?0:1)}
 function toId(id){if(!idPage.has(id))return;const n=Math.floor(idPage.get(id)/2),s=idPage.get(id)%2;if(n===spread){side=s;showView()}else{const d=Math.sign(n-spread);spread=n-d;go(d)}if(single)side=s;const t=document.getElementById(id);if(t){t.setAttribute('tabindex','-1');t.focus({preventScroll:true})}}
 prevB.onclick=()=>go(-1);nextB.onclick=()=>go(1);
 addEventListener('keydown',e=>{if(!dlg.open||(e.target.closest&&e.target.closest('input,textarea,select')))return;const k=e.key;if(k==='ArrowRight'||k==='PageDown'){go(1);e.preventDefault()}else if(k==='ArrowLeft'||k==='PageUp'){go(-1);e.preventDefault()}});
 dlg.querySelector('.n-index-btn').onclick=()=>toId('h-index');
 // links on the page are clicked on the 3D paper: find the spot on the sheet, then the link at that spot
 const ray=new THREE.Raycaster(),ndc=new THREE.Vector2();
 function linkAt(e){ndc.set(e.clientX/innerWidth*2-1,-(e.clientY/innerHeight)*2+1);ray.setFromCamera(ndc,cam);const h=ray.intersectObjects([pageL,pageR],false)[0];if(!h||!h.uv)return null;const k=h.object===pageL?0:1,px=h.uv.x*PW,py=(1-h.uv.y)*PH,vb=views[k].getBoundingClientRect();
  for(const a of viewIns[k].querySelectorAll('a')){for(const r of a.getClientRects()){const x0=r.left-vb.left,y0=r.top-vb.top;if(px>=x0-4&&px<=x0+r.width+4&&py>=y0-4&&py<=y0+r.height+4)return a}}return null}
 dlg.addEventListener('pointermove',e=>{mx=e.clientX/innerWidth-.5;my=e.clientY/innerHeight-.5;dlg.style.cursor=e.target===dlg&&linkAt(e)?'pointer':''});
 dlg.addEventListener('click',e=>{if(e.target!==dlg)return;const a=linkAt(e);if(a)a.click()});
 dlg.addEventListener('click',e=>{const a=e.target.closest&&e.target.closest('a[href^="#"]');if(!a)return;e.preventDefault();toId(a.getAttribute('href').slice(1))});
 // keyboard focus on a link inside the invisible pages is drawn onto the paper
 dlg.addEventListener('focusin',e=>{const v=views.findIndex(v=>v.contains(e.target));if(v<0||e.target===views[v])return;if(single&&side!==v){side=v;showView()}const m=v?pageR:pageL;m.material.map=tex(spread*2+v,e.target);m.material.needsUpdate=true});
 dlg.addEventListener('focusout',e=>{const v=views.findIndex(v=>v.contains(e.target));if(v<0)return;if(turn)return;(v?pageR:pageL).material.map=tex(spread*2+v);(v?pageR:pageL).material.needsUpdate=true});
 function frame(snap){framing();if(snap){camP.copy(want);look.copy(wantL)}}
 let lastT=0;
 function draw(ms){ensureComposer();const dt=Math.min(.05,Math.max(0,(ms-lastT)/1000)||.016);lastT=ms;framing();const k=1-Math.exp(-dt*3.2);camP.lerp(want,k);look.lerp(wantL,k);cam.position.copy(camP);cam.position.y+=Math.sin(ms/2400)*.004;cam.lookAt(look);
  if(turn){let t=clamp((ms-turn.t0)/turn.dur,0,1);const e=t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;bendSheet(turn.dir>0?e:1-e);if(t>=1){turn=null;sheetF.visible=sheetB.visible=false;setBase()}}
  dust.material.uniforms.uT.value=ms/1000;dust.material.uniforms.uS.value=innerHeight*pixelRatio;lamp.target.position.set(-.2,0,.05);
  renderer.toneMappingExposure=1;renderer.shadowMap.needsUpdate=true;jcomp.render(dt)}
 function open(){document.body.classList.add('journal-open');paginate();clearTex();setBase();showView();ensureComposer();resize();frame(true);if(document.fonts)document.fonts.ready.then(()=>{if(dlg.open){paginate();clearTex();setBase();showView()}});requestAnimationFrame(()=>{if(dlg.open)dlg.querySelector('.bk-next').focus({preventScroll:true})})}
 function close(){document.body.classList.remove('journal-open');renderer.shadowMap.needsUpdate=true;turn=null}
 function repaginate(){paginate();clearTex();setBase();showView()}
 addEventListener('resize',()=>{if(dlg.open)resize()});
 return{open,close,frame:draw,repaginate,go}})();
