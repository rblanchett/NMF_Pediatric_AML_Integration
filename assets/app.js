/* Pediatric AML NMF Bridge Explorer | plain JS / SVG, no external dependencies.
   Data are group/direction summaries generated locally with scripts/export_public_data.R.
   Never parse or publish patient-level CSVs in this browser. */
(() => {
'use strict';
const DATA = window.NMF_BRIDGE_DATA || {meta:{mode:'unloaded'},nodes:[],edges:[],cpg:[],counts:[]};
const ORIGINAL = window.NMF_ORIGINAL_GROUP_DATA || {meta:{},groups:[]};
const ORIGINAL_BY_ID = Object.fromEntries((ORIGINAL.groups||[]).map(g=>[g.id,g]));
const IDs = Array.from({length:23},(_,i)=>`nmf${i+1}`);
const FAMILY_PALETTE = {
  Mutation:'#437bc7', Fusion:'#8d5ac7', Cytogenetics:'#e08e42',
  'Protocol 1031 risk':'#3a9b69', Phenotype:'#d25d95', Sex:'#27a0a4',
  Age:'#c9902d', Other:'#7688a3'
};
const SPECIAL_COLORS={male:'#2166ac',female:'#e65a9b',high:'#9b1838',low:'#174b91',unknown:'#8693a2'};
const FEATURE_COLORS=['#4179c8','#c65c78','#4d9b7e','#9976c6','#dd9151','#269eae','#b5a04d','#806da8','#c36e4d','#497f8f','#b35b9b','#7f9d56','#6d93c6'];
const NS='http://www.w3.org/2000/svg';
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const num=x=>Number.isFinite(Number(x)) && x!==null && x!==''? Number(x):null;
const pretty=x=>num(x)===null?'Not available':Number(x).toLocaleString('en-US');
const pct=x=>num(x)===null?'Not available':`${(100*Number(x)).toFixed(1)}%`;
const qfmt=x=>num(x)===null?'Not tested':Number(x)<0.001?'< 0.001':Number(x).toFixed(3);
const sign=x=>Number(x)>=0?'enriched':'depleted';
const familyMap={Sex:'Sex',Protocol_Risk:'Protocol 1031 risk',Age:'Age',AgeGroup:'Age',M6_AML:'Phenotype',M7_AML:'Phenotype',FLT3_ITD:'Mutation',WT1:'Mutation',NPM:'Mutation',CEBPA:'Mutation',t_8_21:'Cytogenetics',t_9_11:'Cytogenetics',inv_16:'Cytogenetics',del5q:'Cytogenetics',Trisomy21:'Cytogenetics',MLL:'Cytogenetics',Primary_Fusion:'Fusion',Primary_Cytogenetics:'Cytogenetics',Mutations_Category:'Mutation'};
const featureLabels={Sex:'Sex',Protocol_Risk:'Protocol 1031 risk',Age:'Age',AgeGroup:'Age group',M6_AML:'M6 AML',M7_AML:'M7 AML',FLT3_ITD:'FLT3-ITD',WT1:'WT1',NPM:'NPM',CEBPA:'CEBPA',t_8_21:'t(8;21)',t_9_11:'t(9;11)',inv_16:'inv(16)',del5q:'del(5q)',Trisomy21:'Trisomy 21',MLL:'MLL',Primary_Fusion:'Primary fusion',Primary_Cytogenetics:'Primary cytogenetics',Mutations_Category:'Mutation category'};
const els={svg:$('network'),vp:$('viewport'),structure:$('structureLayer'),survival:$('survivalLayer'),edges:$('edgeLayer'),nodes:$('nodeLayer'),body:$('inspectorBody'),empty:$('emptyState')};
const state={mode:'clinical',survivalPairs:[],layout:'circular',population:'All',family:'all',feature:'all',direction:'both',fdr:.05,minCount:5,maxPer:3,colorBy:'family',showStructural:true,focus:'',scale:1,tx:0,ty:0,pinned:null,visible:[],positions:{},drag:null,moveStart:null};
const allNodes=IDs.map(id=>{const base={id,primaryPatients:null,groupStats:[],...(DATA.nodes||[]).find(n=>n.id===id)};const addon=ORIGINAL_BY_ID[id];return addon?{...base,groupStats:addon.groupStats||[],survivalPairs:addon.survivalPairs||[],survivalCountTested:addon.survivalCountTested||0,survivalCountSignificant:addon.survivalCountSignificant||0}:base;});
// Deduplicate original-group survival comparisons because each pair appears
// in both of its node inspectors. The survival graph is UNDIRECTED.
const originalSurvivalPairs=(()=>{
 const seen=new Set(), out=[];
 for(const group of ORIGINAL.groups||[]){
  for(const test of group.survivalPairs||[]){
   if(test.status!=='tested'||num(test.q)===null||!IDs.includes(group.id)||!IDs.includes(test.other)||group.id===test.other)continue;
   const both=[group.id,test.other].sort((a,b)=>Number(a.slice(3))-Number(b.slice(3)));
   const key=both.join('|');if(seen.has(key))continue;seen.add(key);
   const flipped=group.id!==both[0];
   out.push({key,source:both[0],target:both[1],q:Number(test.q),p:num(test.p),chiSquare:num(test.chiSquare),
    nA:num(flipped?test.nOther:test.nGroup),nB:num(flipped?test.nGroup:test.nOther),
    eventsA:num(flipped?test.eventsOther:test.eventsGroup),eventsB:num(flipped?test.eventsGroup:test.eventsOther)});
  }
 }
 return out;
})();
const allEdges=(DATA.edges||[]).filter(e=>IDs.includes(e.source)&&IDs.includes(e.target)&&e.source!==e.target).map((e,i)=>({...e,_id:i,family:e.family||familyMap[e.feature]||'Other'}));
const counts=(DATA.counts||[]).filter(c=>IDs.includes(c.source)&&IDs.includes(c.target)&&c.source!==c.target); const cpg=Object.fromEntries((DATA.cpg||[]).map(c=>[c.pair||`${c.source}__to__${c.target}`,c]));
const tip=document.createElement('div'); tip.className='edge-tip';tip.style.display='none';document.body.appendChild(tip);
function featLabel(e){return `${featureLabels[e.feature]||e.feature}${e.level && e.level!=='Age'?' · '+e.level:''}`;}
function category(e){
 const level=String(e.level||'').trim().toLowerCase();
 if(e.feature==='Sex'){
  if(level==='male'||level==='m')return {name:'Sex · Male',color:SPECIAL_COLORS.male};
  if(level==='female'||level==='f')return {name:'Sex · Female',color:SPECIAL_COLORS.female};
  return {name:'Sex · '+String(e.level||'Unspecified'),color:FAMILY_PALETTE.Sex};
 }
 if(e.feature==='Protocol_Risk'){
  if(/high/.test(level))return {name:'1031 protocol · High risk',color:SPECIAL_COLORS.high};
  if(/low/.test(level))return {name:'1031 protocol · Low risk',color:SPECIAL_COLORS.low};
  if(/unknown|unclassified|missing/.test(level))return {name:'1031 protocol · Unknown',color:SPECIAL_COLORS.unknown};
  return {name:'1031 protocol · '+String(e.level||'Other'),color:FAMILY_PALETTE['Protocol 1031 risk']};
 }
 return null;
}
function col(e){const special=category(e);if(special)return special.color;
 if(state.colorBy==='family')return FAMILY_PALETTE[e.family]||FAMILY_PALETTE.Other;
 let n=0;for(const c of String(e.feature||''))n=(n*31+c.charCodeAt(0))>>>0;return FEATURE_COLORS[n%FEATURE_COLORS.length];} 
function svgEl(tag,attrs={},parent=null){const e=document.createElementNS(NS,tag);Object.entries(attrs).forEach(([k,v])=>e.setAttribute(k,String(v)));if(parent)parent.appendChild(e);return e;}
function initialPositions(){let p={};IDs.forEach((id,i)=>{const angle=-Math.PI/2+i*2*Math.PI/23;p[id]={x:480+294*Math.cos(angle),y:360+292*Math.sin(angle)};});return p;}
function forcePositions(){let p={};const ids=IDs, uniq=new Map();for(const e of allEdges){const key=[e.source,e.target].sort().join('|');uniq.set(key,[e.source,e.target]);}
 for(const c of counts.filter(x=>x.population==='All')){const key=[c.source,c.target].sort().join('|');uniq.set(key,[c.source,c.target]);}
 const local=initialPositions();for(let i=0;i<ids.length;i++){const id=ids[i];p[id]={x:480+(local[id].x-480)*.74+40*Math.sin(i*2.21),y:360+(local[id].y-360)*.8+30*Math.cos(i*1.76)};}
 const edges=[...uniq.values()];for(let iter=0;iter<360;iter++){
  const d=Object.fromEntries(ids.map(id=>[id,{x:0,y:0}]));
  for(let a=0;a<ids.length;a++)for(let b=a+1;b<ids.length;b++){
   const x=ids[a],y=ids[b],vx=p[x].x-p[y].x,vy=p[x].y-p[y].y,dist=Math.sqrt(vx*vx+vy*vy)+.01;
   const rep=13000/(dist*dist);d[x].x+=vx/dist*rep;d[x].y+=vy/dist*rep;d[y].x-=vx/dist*rep;d[y].y-=vy/dist*rep;
  }
  for(const [a,b] of edges){let vx=p[b].x-p[a].x,vy=p[b].y-p[a].y,dist=Math.sqrt(vx*vx+vy*vy)+.01,force=.015*(dist-215);d[a].x+=force*vx/dist;d[a].y+=force*vy/dist;d[b].x-=force*vx/dist;d[b].y-=force*vy/dist;}
  for(const id of ids){d[id].x+=(480-p[id].x)*.007;d[id].y+=(360-p[id].y)*.007;p[id].x+=Math.max(-9,Math.min(9,d[id].x))*.42;p[id].y+=Math.max(-9,Math.min(9,d[id].y))*.42;p[id].x=Math.max(72,Math.min(886,p[id].x));p[id].y=Math.max(75,Math.min(662,p[id].y));}
 }
 return p;
}
const positions={circular:initialPositions(),force:forcePositions()};state.positions={...positions.circular};
function filterEdges(){let es=allEdges.filter(e=>e.population===state.population&&e.status==='tested'&&num(e.q)!==null&&Number(e.q)<=state.fdr&&num(e.nBridge)!==null&&e.nBridge>=state.minCount&&num(e.effect)!==null);
 // Protocol-1031 risk: draw ONLY the positively enriched High/Low category.
 // Retain every result in the exported JS; this is visualization-only.
 // Negative/equal effects and Unknown/other risk levels are not risk arrows.
 // This prevents the same source->target bridge appearing twice as
 // high-risk enrichment AND complementary low-risk depletion.
 es=es.filter(e=>e.feature!=='Protocol_Risk'||(
   Number(e.effect)>0 &&
   /^(high|low)\s*risk$/i.test(String(e.level||'').trim())
 ));
 if(state.family!=='all')es=es.filter(e=>e.family===state.family);if(state.feature!=='all')es=es.filter(e=>e.feature===state.feature);
 if(state.direction!=='both')es=es.filter(e=>sign(e.effect)===state.direction);
 // Sex is a binary complement within the All-patient comparison. When both
 // levels are tested, avoid drawing two redundant opposite-color arrows for
 // the same pair by retaining the higher-in-incoming level in BOTH mode.
 // Choosing 'Lower in incoming' explicitly still shows the depleted level.
 if(state.direction==='both'){
  const enrichedSex=new Set(es.filter(e=>e.feature==='Sex'&&sign(e.effect)==='enriched')
   .map(e=>`${e.source}|${e.target}|${e.population}`));
  es=es.filter(e=>e.feature!=='Sex'||sign(e.effect)==='enriched'||
   !enrichedSex.has(`${e.source}|${e.target}|${e.population}`));
 }
 if(state.focus)es=es.filter(e=>e.source===state.focus||e.target===state.focus);
 es.sort((a,b)=>(Number(a.q)-Number(b.q))||Math.abs(Number(b.effect))-Math.abs(Number(a.effect))||a.source.localeCompare(b.source));
 const n=new Map();es=es.filter(e=>{const key=`${e.source}|${e.target}`;const cur=n.get(key)||0;if(cur>=state.maxPer)return false;n.set(key,cur+1);return true;});return es;
}
function dropdowns(){let fams=[...new Set(allEdges.map(e=>e.family))].sort();for(let f of fams){const o=document.createElement('option');o.value=f;o.textContent=f;$('family').appendChild(o);}populateFeatures();}
function populateFeatures(){const featureSelect=$('feature');const selected=state.feature;featureSelect.innerHTML='<option value="all">All covariates</option>';const options=new Map();allEdges.filter(e=>state.family==='all'||e.family===state.family).forEach(e=>options.set(e.feature,featureLabels[e.feature]||e.feature));for(const [key,label] of [...options].sort((a,b)=>a[1].localeCompare(b[1]))){const opt=document.createElement('option');opt.value=key;opt.textContent=label;featureSelect.appendChild(opt);}if(options.has(selected))featureSelect.value=selected;else{featureSelect.value='all';state.feature='all';}}
function legend(){
 if(state.mode==='survival'){
  $('legendMode').textContent='/ original-group pairwise survival';
  $('legendItems').innerHTML='<div class="legend-chip"><span class="swatch" style="background:#b87923"></span>BH-significant pairwise survival difference · pooled original groups · undirected</div>';
  return;
 }
 let c=new Map();for(const e of state.visible){const special=category(e);const name=special?special.name:(state.colorBy==='family'?e.family:(featureLabels[e.feature]||e.feature));c.set(name,col(e));}
 const names=[...c.keys()].sort();$('legendMode').textContent=state.colorBy==='family'?'/ family; sex/risk by category':'/ covariate; sex/risk by category';$('legendItems').innerHTML=names.length?names.map(n=>`<div class="legend-chip"><span class="swatch" style="background:${c.get(n)}"></span>${esc(n)}</div>`).join(''):'<span class="detail-secondary">No matching associations</span>';}
function pathFor(e,index=0,total=1){const a=state.positions[e.source],b=state.positions[e.target];if(!a||!b)return'';
 const vx=b.x-a.x,vy=b.y-a.y,d=Math.max(Math.hypot(vx,vy),.01),ux=vx/d,uy=vy/d,px=-uy,py=ux;
 const offset=15+(index-(total-1)/2)*18; const sX=a.x+ux*32,sY=a.y+uy*32,tX=b.x-ux*36,tY=b.y-uy*36;
 const curve=(state.layout==='circular' ? Math.max(8,Math.min(38,d*.058)) : Math.max(16,Math.min(65,d*.15)))+offset;
 let cx=(sX+tX)/2+px*curve,cy=(sY+tY)/2+py*curve;
 return`M ${sX.toFixed(2)} ${sY.toFixed(2)} Q ${cx.toFixed(2)} ${cy.toFixed(2)} ${tX.toFixed(2)} ${tY.toFixed(2)}`;
}
function markerFor(e){let ident='m'+col(e).replace('#','');if(!$(ident)){const defs=els.svg.querySelector('defs');const m=svgEl('marker',{id:ident,viewBox:'0 0 10 10',refX:'9',refY:'5',markerWidth:7,markerHeight:7,orient:'auto-start-reverse',markerUnits:'userSpaceOnUse'},defs);svgEl('path',{d:'M 0 0 L 10 5 L 0 10 z',fill:col(e)},m);}return `url(#${ident})`;}
function structuralPairs(){
 if(!state.showStructural)return [];
 const colored=new Set(state.visible.map(e=>`${e.source}|${e.target}`));
 return counts.filter(c=>c.population===state.population&&num(c.nBridge)!==null&&c.nBridge>=state.minCount&&
   !colored.has(`${c.source}|${c.target}`)&&(!state.focus||c.source===state.focus||c.target===state.focus));
}
function filterSurvivalPairs(){
 return originalSurvivalPairs.filter(x=>x.q<=state.fdr&&(!state.focus||x.source===state.focus||x.target===state.focus));
}
function updateModeControls(){
 const on=state.mode==='survival';
 document.querySelectorAll('.clinical-only').forEach(el=>{el.hidden=on;});
 document.querySelectorAll('.survival-legend').forEach(el=>{el.hidden=!on;});
 $('vizOverline').textContent=on?'ORIGINAL PRIMARY-GROUP SURVIVAL':'DIRECTIONAL MOLECULAR BRIDGES';
 $('relationshipHelp').textContent=on?'Gold undirected lines: pairwise survival comparisons from the original assigned NMF groups. These are NOT H bridges, and the test does not indicate which group survives better.':'Colored arrows: original primary source → additional H-neighborhood target. For 1031 risk, only enriched High/Low categories are drawn; the redundant depleted counterpart is hidden. Gray arrows: eligible H neighborhoods.';
 $('controlFoot').textContent=on?'Gold dashed lines: original-group pairwise survival differences, with the supplied BH FDR. No source→target direction, clinical covariate, or bridge membership is implied.':'Clinical arrows: original primary group → included H-neighborhood component. For protocol-1031 risk only, show the overrepresented High (deep red) or Low (deep blue) category; underrepresentation arrows are omitted to avoid duplicate descriptions. Other covariates retain higher/lower display.';
}
function render(){state.visible=state.mode==='clinical'?filterEdges():[];state.structural=state.mode==='clinical'?structuralPairs():[];state.survivalPairs=state.mode==='survival'?filterSurvivalPairs():[];els.structure.replaceChildren();els.survival.replaceChildren();els.edges.replaceChildren();els.nodes.replaceChildren();
 // Separate visualization of original-group pairwise survival results.
 // No arrowheads: comparisons are symmetric; q does not establish direction.
 for(const sp of state.survivalPairs){
  const g=svgEl('g',{class:'survival-edge',tabindex:'0',role:'button','aria-label':`${sp.source} vs ${sp.target}: original-group survival comparison, BH q ${qfmt(sp.q)}, undirected`},els.survival);
  g.dataset.key=sp.key;
  const path=pathFor(sp);
  svgEl('path',{d:path,class:'display',fill:'none',stroke:'#b87923','stroke-width':3.3,'stroke-dasharray':'8 6'},g);
  svgEl('path',{d:path,class:'hit'},g);
  const ref={type:'survival',key:sp.key};
  g.addEventListener('mouseenter',ev=>{hoverItem(ref,ev);g.classList.add('is-selected');});g.addEventListener('mousemove',moveTip);
  g.addEventListener('mouseleave',()=>{g.classList.remove('is-selected');endHover();});
  g.addEventListener('click',ev=>{ev.stopPropagation();pinItem(ref);});
  g.addEventListener('keydown',ev=>{if(ev.key==='Enter'||ev.key===' '){ev.preventDefault();pinItem(ref);}});
 }

 // Gray lines = tested/eligible H-neighborhood population sizes, NOT clinical significance.
 for(const c of state.structural){
  const g=svgEl('g',{class:'structural-edge',tabindex:'0',role:'button','aria-label':`${c.source} to ${c.target}, eligible H bridge, ${c.nBridge} incoming patients; no clinical association implied`},els.structure);
  g.dataset.key=`${c.source}|${c.target}`;
  const path=pathFor(c);svgEl('path',{d:path,class:'display',fill:'none',stroke:'#a4b4c5','stroke-width':Math.min(3.3,1.2+Math.sqrt(Number(c.nBridge))*.22),'marker-end':'url(#structuralArrow)'},g);
  svgEl('path',{d:path,class:'hit'},g);
  const ref={type:'structural',key:g.dataset.key};
  g.addEventListener('mouseenter',ev=>{hoverItem(ref,ev);g.classList.add('is-selected');});g.addEventListener('mousemove',moveTip);g.addEventListener('mouseleave',()=>{g.classList.remove('is-selected');endHover();});
  g.addEventListener('click',ev=>{ev.stopPropagation();pinItem(ref);});g.addEventListener('keydown',ev=>{if(ev.key==='Enter'||ev.key===' '){ev.preventDefault();pinItem(ref);}});
 }
const countByPair={};for(const e of state.visible){const k=`${e.source}|${e.target}`;countByPair[k]=(countByPair[k]||0)+1;}const posByPair={};
 for(const e of state.visible){const k=`${e.source}|${e.target}`,ix=posByPair[k]||0;posByPair[k]=ix+1;const g=svgEl('g',{class:'network-edge',tabindex:'0',role:'button','aria-label':`${e.source} to ${e.target}, ${featLabel(e)}, ${sign(e.effect)}, q ${qfmt(e.q)}`},els.edges);g.dataset.id=e._id;g.dataset.s=e.source;g.dataset.t=e.target;
  const path=pathFor(e,ix,countByPair[k]),color=col(e);const width=Math.max(1.8,Math.min(6.6,1.7+Math.sqrt(e.nBridge||0)*.56));const p=svgEl('path',{d:path,stroke:color,'stroke-width':width,'stroke-dasharray':sign(e.effect)==='depleted'?'10 7':'none','marker-end':markerFor(e),class:'display',fill:'none'},g);svgEl('path',{d:path,class:'hit'},g);
  g.addEventListener('mouseenter',ev=>{hoverItem({type:'edge',id:e._id},ev);g.classList.add('is-selected');});g.addEventListener('mousemove',moveTip);g.addEventListener('mouseleave',()=>{g.classList.remove('is-selected');endHover();});g.addEventListener('click',ev=>{ev.stopPropagation();pinItem({type:'edge',id:e._id});});g.addEventListener('keydown',ev=>{if(ev.key==='Enter'||ev.key===' '){ev.preventDefault();pinItem({type:'edge',id:e._id});}});
 }
 for(const n of allNodes){const p=state.positions[n.id];const g=svgEl('g',{class:'network-node',transform:`translate(${p.x},${p.y})`,tabindex:'0',role:'button','aria-label':`NMF group ${n.id}`},els.nodes);g.dataset.id=n.id;const touched=(state.mode==='survival'?state.survivalPairs:state.visible).some(e=>e.source===n.id||e.target===n.id);if(state.focus&&n.id!==state.focus&&!touched)g.classList.add('is-muted');const c=svgEl('circle',{cx:0,cy:0,r:27},g);svgEl('text',{'text-anchor':'middle','dominant-baseline':'middle',y:1},g).textContent=n.id;
  g.addEventListener('pointerdown',ev=>{ev.preventDefault();ev.stopPropagation();state.drag={id:n.id,x:ev.clientX,y:ev.clientY,origX:p.x,origY:p.y,hadMoved:false};g.setPointerCapture(ev.pointerId);});
  g.addEventListener('pointermove',ev=>{if(state.drag&&state.drag.id===n.id){const dx=(ev.clientX-state.drag.x)*960/els.svg.getBoundingClientRect().width/state.scale,dy=(ev.clientY-state.drag.y)*740/els.svg.getBoundingClientRect().height/state.scale;if(Math.abs(dx)+Math.abs(dy)>2)state.drag.hadMoved=true;state.positions[n.id]={x:state.drag.origX+dx,y:state.drag.origY+dy};refreshGeometry();}else hoverItem({type:'node',id:n.id},ev);});
  g.addEventListener('pointerenter',ev=>hoverItem({type:'node',id:n.id},ev));g.addEventListener('pointerleave',endHover);
  g.addEventListener('pointerup',ev=>{ev.stopPropagation();const moved=state.drag?.hadMoved;state.drag=null;if(!moved)pinItem({type:'node',id:n.id});});
  g.addEventListener('keydown',ev=>{if(ev.key==='Enter'||ev.key===' '){ev.preventDefault();pinItem({type:'node',id:n.id});}});
 }
 els.empty.hidden=state.visible.length+state.structural.length+state.survivalPairs.length>0;
 const uniq=new Set(state.visible.map(e=>e.source+'→'+e.target));
 $('edgeCount').textContent=state.mode==='survival'?`${state.survivalPairs.length} original-group survival comparisons at BH q ≤ ${state.fdr} · ${originalSurvivalPairs.length} estimable pairs total · 23 components`:`${state.visible.length.toLocaleString()} colored clinical arrows (${uniq.size} directions) · ${state.structural.length} gray H-only directions · 23 components`;
 $('cpgStatus').textContent=state.mode==='survival'?'Survival differences are not directional CpG bridges':Object.keys(cpg).length?`CpG summaries: ${Object.keys(cpg).length} directed pairs available`:'CpG summaries: not yet exported';
 $('viewSubtitle').textContent=state.mode==='survival'?`23 original NMF components · ${state.layout==='circular'?'circular':'force-directed network'} layout · pooled pairwise survival`: `23 NMF components · ${state.layout==='circular'?'circular':'force-directed network'} layout · ${state.population.toLowerCase()} subset`;
 legend();refreshGeometry();updateInspector(state.pinned);
}
function refreshGeometry(){const nodes=els.nodes.children;for(const g of nodes){const p=state.positions[g.dataset.id];if(p)g.setAttribute('transform',`translate(${p.x.toFixed(2)},${p.y.toFixed(2)})`);}
 for(const g of els.structure.children){const c=state.structural.find(z=>`${z.source}|${z.target}`===g.dataset.key);if(!c)continue;const path=pathFor(c);for(const q of g.querySelectorAll('path'))q.setAttribute('d',path);}
 for(const g of els.survival.children){const c=state.survivalPairs.find(z=>z.key===g.dataset.key);if(!c)continue;const path=pathFor(c);for(const q of g.querySelectorAll('path'))q.setAttribute('d',path);}
 const pairCounts={};for(const e of state.visible){const k=`${e.source}|${e.target}`;pairCounts[k]=(pairCounts[k]||0)+1;}const pairNext={};for(const g of els.edges.children){const e=allEdges.find(z=>z._id===Number(g.dataset.id));if(!e)continue;const k=`${e.source}|${e.target}`,ix=pairNext[k]||0;pairNext[k]=ix+1;const path=pathFor(e,ix,pairCounts[k]);for(const q of g.querySelectorAll('path'))q.setAttribute('d',path);}
}
function pairDetails(e){const key=`${e.source}__to__${e.target}`,info=cpg[key];if(!info)return`<div class="info-note">No 11D/13C CpG summary was supplied for this directed pair. This does not imply zero associated CpGs.</div>`;
 const sections=[['Unique directional CpGs','nUnique'],['Primary-only','nPrimaryOnly'],['Conserved-only','nConservedOnly'],['Both labels','nBoth']];let h='<div class="stat-grid">'+sections.map(([label,key])=>`<div class="stat-tile"><span>${label}</span><strong>${pretty(info[key])}</strong></div>`).join('')+'</div>';
 if(Array.isArray(info.genes)&&info.genes.length)h+=`<div class="detail-section"><h3>Nearest gene annotations (not clinical targets)</h3><ul class="feature-list">${info.genes.slice(0,8).map(g=>`<li>${esc(g.gene)} <span class="small">· ${pretty(g.n)} CpGs</span></li>`).join('')}</ul></div>`;
 if(Array.isArray(info.regions)&&info.regions.length)h+=`<div class="detail-section"><h3>Genomic context (available annotated CpGs)</h3><ul class="feature-list">${info.regions.map(x=>`<li>${esc(x.region)} — ${pretty(x.n)} CpGs</li>`).join('')}</ul></div>`;
 return h+'<div class="info-note">Directional 11D CpG catalogue, counted once per physical CpG per direction. These CpGs are <strong>not individually associated with the hovered clinical feature</strong>. CpG discovery is in-sample.</div>';
}
function inspectorEdge(e){const key=e.source+'|'+e.target;const matches=allEdges.filter(q=>q.source===e.source&&q.target===e.target&&q.population===state.population&&q.status==='tested'&&num(q.q)!==null&&num(q.q)<=state.fdr).sort((a,b)=>a.q-b.q);const higher=matches.filter(x=>Number(x.effect)>=0),lower=matches.filter(x=>Number(x.effect)<0);
 return `<div class="detail-kicker">DIRECTED H-NEIGHBORHOOD</div><h3 class="detail-heading">${esc(e.source)} <span style="color:#87a0bb">→</span> ${esc(e.target)}</h3><span class="pill ${sign(e.effect)==='enriched'?'signup':'sigdown'}">${sign(e.effect)==='enriched'?'↑ Higher':'↓ Lower'} in incoming</span><p class="detail-secondary">${esc(featLabel(e))} · ${esc(e.population)} patients</p><div class="stat-grid"><div class="stat-tile"><span>Incoming patients</span><strong>${pretty(e.nBridge)}</strong></div><div class="stat-tile"><span>Non-incoming patients</span><strong>${pretty(e.nNonBridge)}</strong></div><div class="stat-tile"><span>Bridge BH FDR</span><strong>${esc(qfmt(e.q))}</strong></div><div class="stat-tile"><span>Clinical effect</span><strong>${num(e.effect)!==null?(e.unit==='median_age_units'?`${Number(e.effect).toFixed(2)}`:`${(100*Number(e.effect)).toFixed(1)} pp`):'–'}</strong></div></div>
 <div class="detail-section"><h3>Hovered clinical association</h3><div class="row-entry"><span class="status-dot" style="background:${col(e)}"></span><div><strong>${esc(featLabel(e))}</strong><br/>${e.unit==='median_age_units'?`Incoming median ${esc(e.incomingMedian)} vs non-incoming median ${esc(e.nonIncomingMedian)}`:`Incoming ${esc(pct(e.pBridge))} vs non-incoming ${esc(pct(e.pNonBridge))}`}<br/><span class="dim">BH FDR ${esc(qfmt(e.q))} · ${esc(e.primaryTest||'')}; ${esc(e.population)} population</span></div></div></div>
 <div class="detail-section"><h3>Other clinical findings for ${esc(e.source)} → ${esc(e.target)} <span class="dim">(q ≤ ${esc(state.fdr)})</span></h3>${higher.length?`<p class="detail-secondary">Higher in incoming</p><ul class="feature-list">${higher.slice(0,12).map(x=>`<li>${esc(featLabel(x))} <span class="small">q=${esc(qfmt(x.q))}</span></li>`).join('')}</ul>`:''}${lower.length?`<p class="detail-secondary">Lower in incoming</p><ul class="feature-list">${lower.slice(0,12).map(x=>`<li>${esc(featLabel(x))} <span class="small">q=${esc(qfmt(x.q))}</span></li>`).join('')}</ul>`:''}${!matches.length?'<p class="detail-secondary">No additional findings at this cutoff.</p>':''}</div>
 <div class="detail-section"><h3>Associated molecular catalogue / same direction</h3>${pairDetails(e)}</div>`;
}
function groupAttrs(n){
 const rows=(Array.isArray(n.groupStats)?n.groupStats:[]).filter(x=>!x.population||x.population==='All');
 if(!rows.length)return '<div class="info-note">No BH-significant original-primary-group one-vs-all clinical variable was present in the reviewed source table for this group. This does not establish that the group lacks a distinctive phenotype.</div>';
 const shown=(direction,title)=>{
  const z=rows.filter(x=>x.direction===direction);
  if(!z.length)return `<div class="detail-section"><h3>${title}</h3><p class="detail-secondary">No reported category in this direction.</p></div>`;
  const entries=z.map(x=>{
    const sampled=(num(x.primaryPercent)!==null&&num(x.otherPercent)!==null)
      ?`<br/><span class="dim">Primary ${Number(x.primaryPercent).toFixed(1)}% (${pretty(x.primaryLevelN)}/${pretty(x.nPrimary)}) vs other primary groups ${Number(x.otherPercent).toFixed(1)}% (${pretty(x.otherLevelN)}/${pretty(x.nOther)}); ${Number(x.diffPP)>=0?'+':''}${Number(x.diffPP).toFixed(1)} pp</span>`:'';
    const missing=/^(unknown|missing|not known|not available|na)$/i.test(String(x.level||''));
    return `<li><strong>${esc(x.level)}</strong>${missing?' <span class="dim">(annotation/unknown category)</span>':''}<br/><span class="small">${esc(x.feature)}</span>${sampled}<br/><span class="dim">Overall variable BH q=${esc(qfmt(x.q))}</span></li>`;
  });
  const first=entries.slice(0,7).join(''),remaining=entries.slice(7).join('');
  return `<div class="detail-section"><h3>${title} (${z.length})</h3><ul class="feature-list">${first}</ul>${remaining?`<details class="group-results"><summary>Show ${z.length-7} more descriptive categories</summary><ul class="feature-list">${remaining}</ul></details>`:''}</div>`;
 };
 return `<div class="detail-section"><h3>Original primary-group clinical characteristics</h3><p class="detail-secondary">${rows.length} descriptive category contrasts from BH-significant <em>one-vs-all variable-level</em> tests. These were calculated across the original full cohort and remain pooled even when you filter clinical arrows to male or female patients. Category percentages show direction; the q-value belongs to the <strong>overall categorical test</strong>, not to an individual category. Some original fields measure treatment, response or outcomes and some categories are Unknown; do not interpret them all as baseline biology.</p></div>`+
 shown('enriched','Categories more common in original group')+shown('depleted','Categories less common in original group');
}
function inspectorSurvivalPair(p){
 return `<div class="detail-kicker">ORIGINAL PRIMARY-GROUP SURVIVAL</div><h3 class="detail-heading">${esc(p.source)} <span style="color:#b87923">vs</span> ${esc(p.target)}</h3><span class="pill">Undirected comparison · pooled original assignments</span>
 <p class="detail-secondary">This line represents a BH-significant original-group pairwise survival difference, NOT a source→target H bridge. The table does not give a hazard ratio or which group has better survival. The endpoint and exact test must be confirmed from the original analysis script.</p>
 <div class="stat-grid"><div class="stat-tile"><span>BH FDR</span><strong>${esc(qfmt(p.q))}</strong></div><div class="stat-tile"><span>Unadjusted P</span><strong>${esc(qfmt(p.p))}</strong></div><div class="stat-tile"><span>${esc(p.source)} primary patients / events</span><strong>${pretty(p.nA)} / ${pretty(p.eventsA)}</strong></div><div class="stat-tile"><span>${esc(p.target)} primary patients / events</span><strong>${pretty(p.nB)} / ${pretty(p.eventsB)}</strong></div></div>
 <p class="detail-secondary">χ²=${num(p.chiSquare)!==null?Number(p.chiSquare).toFixed(2):'Not provided'}. No sex-specific survival test is inferred from this pooled comparison.</p>`;
}
function pairwiseSurvivalDetails(n){
 const rows=Array.isArray(n.survivalPairs)?n.survivalPairs:[];
 const tested=rows.filter(x=>x.status==='tested'&&num(x.q)!==null);
 const sig=tested.filter(x=>Number(x.q)<.05);
 let h='<div class="detail-section"><h3>Original NMF pairwise survival comparisons</h3>';
 h+='<p class="detail-secondary">Pooled original-primary-group comparisons (not H-bridge subsets). The supplied table contains chi-square statistics, P values and BH-adjusted P values, <strong>not Cox hazard ratios</strong>. Neither a survival advantage nor the OS/EFS endpoint can be inferred from this summary table alone; the source model should be checked.</p>';
 if(!rows.length){return h+'<p class="detail-secondary">No pairwise original-group survival table has been added.</p></div>';}
 h+=`<div class="stat-grid"><div class="stat-tile"><span>Estimable pairwise tests</span><strong>${tested.length}</strong></div><div class="stat-tile"><span>BH-significant at 0.05</span><strong>${sig.length}</strong></div></div>`;
 if(!tested.length)return h+'<p class="detail-secondary">No estimable comparison for this component. It may have no original primary patients or too few events.</p></div>';
 const list=(x)=>`<li><strong>${esc(n.id)} vs ${esc(x.other)}</strong> · <span class="small">BH q=${esc(qfmt(x.q))}; P=${esc(qfmt(x.p))}</span><br/><span class="dim">Patients ${pretty(x.nGroup)} vs ${pretty(x.nOther)}; events ${pretty(x.eventsGroup)} vs ${pretty(x.eventsOther)}; χ²=${num(x.chiSquare)!==null?Number(x.chiSquare).toFixed(2):'–'}</span></li>`;
 if(sig.length) h+=`<h4>Significant pairs (${sig.length})</h4><ul class="feature-list">${sig.map(list).join('')}</ul>`;
 else h+='<p class="detail-secondary">No supplied pairwise comparison involving this component meets BH q &lt; 0.05.</p>';
 const remaining=tested.filter(x=>!(Number(x.q)<.05));
 if(remaining.length)h+=`<details class="group-results"><summary>Show ${remaining.length} other estimable pairwise comparisons</summary><ul class="feature-list">${remaining.map(list).join('')}</ul></details>`;
 const missing=rows.length-tested.length;
 if(missing)h+=`<p class="detail-secondary">${missing} additional pairs have no estimable test statistic in the supplied table.</p>`;
 h+='<p class="detail-secondary"><strong>Interpretation:</strong> a low q-value establishes evidence of a survival-curve difference under the original analysis, not which group has higher survival. The supplied table contains only the <em>All</em> cohort; sex-specific pairwise results are not inferred. These original-group comparisons are separate from directional 13B clinical bridges.</p></div>';
 return h;
}

function inspectorStructural(c){
 const matches=allEdges.filter(e=>e.source===c.source&&e.target===c.target&&e.population===state.population&&e.status==='tested'&&num(e.q)!==null);
 const significant=matches.filter(e=>Number(e.q)<=state.fdr);
 return `<div class="detail-kicker">H NEIGHBORHOOD / STRUCTURAL LINK</div><h3 class="detail-heading">${esc(c.source)} → ${esc(c.target)}</h3>
 <span class="pill">H neighborhood relationship · not a clinical finding</span>
 <div class="stat-grid"><div class="stat-tile"><span>Incoming patients</span><strong>${pretty(c.nBridge)}</strong></div><div class="stat-tile"><span>Non-incoming patients</span><strong>${pretty(c.nNonBridge)}</strong></div></div>
 <p class="detail-secondary">These ${esc(state.population)} source-primary patients have the target component in their H neighborhood. A gray arrow does not establish a significant clinical association. Source groups, target components, and patient counts come from Script 13B.</p>
 <div class="detail-section"><h3>Clinical tests on this direction</h3><p class="detail-secondary">${matches.length} public tested associations · ${significant.length} with q ≤ ${esc(state.fdr)} (may be hidden by another filter). These are tested 13B results; the selection filter and FDR cutoff determine visibility.</p></div>
 <div class="detail-section"><h3>Associated molecular catalogue / same direction</h3>${pairDetails(c)}</div>`;
}
function kmDetails(n){
 const km=DATA.km||{},overview=typeof km.overview==='string'?km.overview:'',groups=km.groups||{};
 const own=typeof groups[n.id]==='string'?groups[n.id]:'';
 if(!overview&&!own)return '';
 let h='<div class="detail-section"><h3>Original NMF survival / Kaplan–Meier</h3>';
 if(overview||own){h+='<div class="km-buttons">';
  if(overview)h+=`<a class="km-button" href="${esc(overview)}" target="_blank" rel="noopener">View overall original-group KM</a>`;
  if(own)h+=`<a class="km-button" href="${esc(own)}" target="_blank" rel="noopener">View ${esc(n.id)} KM</a>`;
  h+='</div>';
 }else h+='<p class="detail-secondary">KM images have not been added yet. You can link your original KM figures without rerunning the NMF or 13B analysis.</p>';
 h+='<p class="detail-secondary">KM curves describe survival by <strong>original NMF primary assignment</strong>, not the source→target H-bridge subset. A bridge-associated covariate is not proof of an EFS/OS association.</p></div>';
 return h;
}
function inspectorNode(n){const paired=counts.filter(x=>x.target===n.id&&x.population===state.population&&x.source!==n.id);const incoming=paired.length?paired.reduce((s,x)=>s+(num(x.nBridge)||0),0):null;const tied=(state.mode==='survival'?state.survivalPairs:state.visible).filter(e=>e.source===n.id||e.target===n.id).sort((a,b)=>a.q-b.q);
 return `<div class="detail-kicker">ORIGINAL NMF COMPONENT</div><h3 class="detail-heading">${esc(n.id)}</h3><span class="pill">Original model · k=23</span><div class="stat-grid"><div class="stat-tile"><span>Primary assigned patients</span><strong>${num(n.primaryPatients)!==null?pretty(n.primaryPatients):'–'}</strong></div><div class="stat-tile"><span>Incoming across other source groups</span><strong>${incoming===null?'–':pretty(incoming)}</strong></div></div><p class="detail-secondary">Incoming count sums distinct source primary groups; only the original 13B directions available in this ${esc(state.population)} subset are included. It is not a count of unique NMF patients across multiple neighborhoods.</p>${groupAttrs(n)}${pairwiseSurvivalDetails(n)}${kmDetails(n)}<div class="detail-section"><h3>${state.mode==='survival'?'Visible original-group survival comparisons':'Visible directed clinical connections'} (${tied.length})</h3>${tied.length?`<ul class="feature-list">${tied.slice(0,20).map(e=>state.mode==='survival'?`<li>${esc(e.source)} vs ${esc(e.target)} <span class="small">BH q=${esc(qfmt(e.q))}</span></li>`:`<li>${esc(e.source)} → ${esc(e.target)} · ${esc(featLabel(e))} <span class="small">q=${esc(qfmt(e.q))}</span></li>`).join('')}</ul>`:'<p class="detail-secondary">No connections pass the current filters.</p>'}</div>`;
}
function findItem(ref){if(!ref)return null;if(ref.type==='edge')return allEdges.find(e=>e._id===ref.id);if(ref.type==='structural')return counts.find(c=>`${c.source}|${c.target}`===ref.key&&c.population===state.population);if(ref.type==='survival')return originalSurvivalPairs.find(p=>p.key===ref.key);if(ref.type==='node')return allNodes.find(n=>n.id===ref.id);return null;}
function updateInspector(ref){const item=findItem(ref);if(!item){els.body.innerHTML='<div class="inspector-placeholder"><div class="placeholder-icon">↗</div><h3>Explore the bridges</h3><p>Hover or select an arrow to see directional clinical statistics and CpG summaries. Select a node for original-group information.</p></div>';return;}els.body.innerHTML=ref.type==='edge'?inspectorEdge(item):ref.type==='structural'?inspectorStructural(item):ref.type==='survival'?inspectorSurvivalPair(item):inspectorNode(item);}
function hoverItem(ref,ev){if(!state.pinned)updateInspector(ref);const v=findItem(ref);if(!v)return;tip.innerHTML=ref.type==='survival'?`<strong>${esc(v.source)} vs ${esc(v.target)}</strong><br/>Original-group survival comparison<br/>BH q: <strong>${esc(qfmt(v.q))}</strong><div class="tip-note">Undirected · click for patient/event counts</div>`:ref.type==='edge'?`<strong>${esc(v.source)} → ${esc(v.target)}</strong><br/>${esc(featLabel(v))}<br/>Incoming: <strong>${pretty(v.nBridge)}</strong> · q=${esc(qfmt(v.q))}<div class="tip-note">Click for detailed clinical and CpG summaries</div>`:ref.type==='structural'?`<strong>${esc(v.source)} → ${esc(v.target)}</strong><br/>H neighborhood: <strong>${pretty(v.nBridge)} incoming</strong><div class="tip-note">Gray arrow = structural link, not clinical significance. Click for CpG summary.</div>`:`<strong>${esc(v.id)}</strong><br/>Primary patients: ${num(v.primaryPatients)!==null?pretty(v.primaryPatients):'not supplied'}<div class="tip-note">${Array.isArray(v.groupStats)&&v.groupStats.length?`${v.groupStats.length} imported group-level significant characteristics · `:''}Click for original covariates, pairwise survival and KM links</div>`;tip.style.display='block';moveTip(ev);}
function moveTip(ev){if(tip.style.display==='none')return;const x=ev.clientX+15,y=ev.clientY+16;const w=tip.offsetWidth,h=tip.offsetHeight;tip.style.left=`${Math.min(x,window.innerWidth-w-10)}px`;tip.style.top=`${Math.min(y,window.innerHeight-h-10)}px`;}
function endHover(){tip.style.display='none';updateInspector(state.pinned);}
function pinItem(ref){state.pinned=ref;updateInspector(ref);tip.style.display='none';}
function applyViewTransform(){els.vp.setAttribute('transform',`translate(${state.tx.toFixed(2)},${state.ty.toFixed(2)}) scale(${state.scale.toFixed(4)})`);}
function zoom(f){const old=state.scale;state.scale=Math.max(.45,Math.min(3,old*f));const c={x:480,y:370};state.tx=c.x-(c.x-state.tx)*state.scale/old;state.ty=c.y-(c.y-state.ty)*state.scale/old;applyViewTransform();}
function animateLayout(target){state.layout=target;const from=Object.fromEntries(IDs.map(id=>[id,{...state.positions[id]}])),to=positions[target];$('layoutCircular').classList.toggle('selected',target==='circular');$('layoutForce').classList.toggle('selected',target==='force');$('layoutCircular').setAttribute('aria-pressed',target==='circular');$('layoutForce').setAttribute('aria-pressed',target==='force');const started=performance.now();function frame(now){let t=Math.min(1,(now-started)/560);t=t*t*(3-2*t);for(const id of IDs)state.positions[id]={x:from[id].x+(to[id].x-from[id].x)*t,y:from[id].y+(to[id].y-from[id].y)*t};refreshGeometry();if(t<1)requestAnimationFrame(frame);}requestAnimationFrame(frame);$('viewSubtitle').textContent=state.mode==='survival'?`23 original NMF groups · ${target==='circular'?'circular':'force-directed network'} layout · pooled survival`: `23 NMF components · ${target==='circular'?'circular':'force-directed network'} layout · ${state.population.toLowerCase()} subset`;}
function downloadSvg(){const clone=els.svg.cloneNode(true);clone.setAttribute('xmlns',NS);clone.setAttribute('width',1440);clone.setAttribute('height',1110);const sty=document.createElementNS(NS,'style');sty.textContent=`.network-node circle{fill:#eaf1f9;stroke:#b1c8df;stroke-width:2}.network-node text{fill:#264b75;font-size:18px;font-weight:800;paint-order:stroke;stroke:white;stroke-width:2.5px}.network-edge .hit,.structural-edge .hit,.survival-edge .hit{display:none}`;clone.insertBefore(sty,clone.firstChild);const bg=svgEl('rect',{x:0,y:0,width:960,height:740,fill:'white'});clone.insertBefore(bg,clone.firstChild);const bytes=new Blob([new XMLSerializer().serializeToString(clone)],{type:'image/svg+xml;charset=utf-8'});const url=URL.createObjectURL(bytes),a=document.createElement('a');a.href=url;a.download=`Pediatric_AML_Bridge_Explorer_${state.layout}_${state.population}.svg`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),500);}
function controls(){dropdowns();
 $('networkMode').addEventListener('change',ev=>{state.mode=ev.target.value==='survival'?'survival':'clinical';state.pinned=null;updateModeControls();render();});
 $('layoutCircular').addEventListener('click',()=>animateLayout('circular'));$('layoutForce').addEventListener('click',()=>animateLayout('force'));
 for(const [id,key,parse] of [['population','population',x=>x],['family','family',x=>x],['feature','feature',x=>x],['direction','direction',x=>x],['fdr','fdr',Number],['minCount','minCount',x=>Math.max(1,parseInt(x,10)||1)],['maxPer','maxPer',Number],['colorBy','colorBy',x=>x]])$(id).addEventListener('change',ev=>{state[key]=parse(ev.target.value);if(key==='family')populateFeatures();state.pinned=null;render();});
 $('showStructural').addEventListener('change',ev=>{state.showStructural=ev.target.checked;state.pinned=null;render();});
 $('searchGroup').addEventListener('input',e=>{const q=e.target.value.trim().toLowerCase();state.focus=IDs.includes(q)?q:'';if(q&&!state.focus)state.focus='';state.pinned=state.focus?{type:'node',id:state.focus}:null;render();});
 $('resetBtn').addEventListener('click',()=>{state.mode='clinical';$('networkMode').value='clinical';updateModeControls();state.population='All';state.family='all';state.feature='all';state.direction='both';state.fdr=.05;state.minCount=5;state.maxPer=3;state.colorBy='family';state.showStructural=true;state.focus='';state.pinned=null;['population','family','feature','direction','fdr','minCount','maxPer','colorBy'].forEach(id=>$(id).value=String(state[id]));$('searchGroup').value='';$('showStructural').checked=true;populateFeatures();state.scale=1;state.tx=0;state.ty=0;applyViewTransform();animateLayout('circular');render();});
 $('zoomIn').addEventListener('click',()=>zoom(1.2));$('zoomOut').addEventListener('click',()=>zoom(1/1.2));$('fitBtn').addEventListener('click',()=>{state.scale=1;state.tx=0;state.ty=0;applyViewTransform();});$('exportSvg').addEventListener('click',downloadSvg);
 els.svg.addEventListener('wheel',ev=>{ev.preventDefault();zoom(ev.deltaY>0?.91:1.09);},{passive:false});els.svg.addEventListener('pointerdown',ev=>{if(ev.target.closest?.('.network-node,.network-edge'))return;state.moveStart={x:ev.clientX,y:ev.clientY,oldX:state.tx,oldY:state.ty};els.svg.setPointerCapture(ev.pointerId);});els.svg.addEventListener('pointermove',ev=>{if(!state.moveStart)return;const r=els.svg.getBoundingClientRect();state.tx=state.moveStart.oldX+(ev.clientX-state.moveStart.x)*960/r.width;state.ty=state.moveStart.oldY+(ev.clientY-state.moveStart.y)*740/r.height;applyViewTransform();});els.svg.addEventListener('pointerup',()=>state.moveStart=null);els.svg.addEventListener('click',ev=>{if(ev.target===els.svg){state.pinned=null;updateInspector(null);}});
 const dialog=$('aboutDialog');$('aboutBtn').addEventListener('click',()=>dialog.showModal());$('footerAbout').addEventListener('click',e=>{e.preventDefault();dialog.showModal();});$('closeAbout').addEventListener('click',()=>dialog.close());dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close();});
}
function init(){updateModeControls();if(DATA.meta?.mode==='demo'){$('demoBanner').hidden=false;}if(DATA.meta?.mode!=='research'&&DATA.meta?.mode!=='demo'){$('demoBanner').hidden=false;$('demoBanner').textContent='DATA NOT EXPORTED YET — Run scripts/export_public_data.R to create the group-level dataset. No research associations are shown.';}controls();applyViewTransform();render();}
init();
})();
