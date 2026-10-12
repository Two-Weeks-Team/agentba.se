// Browser regression checks; import with an ego-browser Page. Launches no browser.
import assert from 'node:assert/strict';
export async function checkWalkthroughStates(page, onState) {
 await page.cdp('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
 await page.waitForFunction(()=>{
  const hosts=[...document.querySelectorAll('[data-autoplay]')];
  return hosts.length===6 && hosts.every(e=>e.dataset.autoplay==='reduced');
 });
 await page.evaluate(async()=>{await document.fonts.ready;await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));});
 const results=[];
 // Exercise every state through its actual control. Timing and hover checks
 // below separately use pointer input and focus; state enumeration stays fast.
 async function click(selector) {
  await page.evaluate(async selector => {
   const control=document.querySelector(selector);
   control.scrollIntoView({block:'center',inline:'center',behavior:'instant'});
   control.click();
   await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
  },selector);
 }

 async function record(id,key) {
  const r=await page.evaluate(({id,key})=>{
   const host=document.getElementById(id), rect=host.getBoundingClientRect();
   const visibleText=[...host.querySelectorAll('h3,h4,pre,p,dd')].filter(e=>getComputedStyle(e).visibility==='visible'&&!e.closest('[hidden]')).map(e=>e.textContent.trim()).filter(Boolean);
   return {id,key,height:Math.round(rect.height),width:Math.round(rect.width),overflow:document.documentElement.scrollWidth>innerWidth,visibleText:visibleText.length,scrollY:Math.round(scrollY)};
  },{id,key});
  assert.equal(r.overflow,false,`${id}/${key} overflows the page`);
  assert.ok(r.visibleText>0,`${id}/${key} missing visible content`);
  if (onState) await onState(page, id, key);
  results.push(r);
 }
 const personas=await page.evaluate(()=>[...document.querySelectorAll('button[data-ss-persona]')].map(e=>e.dataset.ssPersona));
 for(const persona of personas){
  await click(`button[data-ss-persona="${persona}"]`);
  for(let step=0;step<3;step++){
   await click(`button[data-ss-step="${step}"]`);
   assert.equal(await page.evaluate(()=>document.querySelector('.social-demo').dataset.ssPersona),persona);
   await record('social-demo',`${persona}/${step}`);
  }
 }
 for(let i=0;i<3;i++){await click(`[data-kb-select="${i}"]`); await record('commerce-demo',String(i));}
 for(let i=0;i<3;i++){
  await click(`[data-memory-step="${i}"]`);
  const visible=await page.evaluate(()=>[...document.querySelectorAll('.mm-frame')].filter(e=>getComputedStyle(e).visibility==='visible').length);
  assert.equal(visible,1,'Memex must show one frame');
  await record('memory-demo',String(i));
 }
 const glass=await page.evaluate(()=>[...document.querySelectorAll('#judgment-demo .gh-node')].map(e=>e.getAttribute('aria-label')));
 for(const label of glass){await click(`#judgment-demo button[aria-label="${label}"]`);await record('judgment-demo',label);}
 const forge=await page.evaluate(()=>[...document.querySelectorAll('#delivery-demo .pf-direction')].map(e=>e.id));
 for(const id of forge){await click(`#${id}`);await record('delivery-demo',id);}
 for(const id of ['task','role','department','company']){await click(`#tab-${id}`);await record('stage-panel',id);}
 assert.equal(results.length,43,'All 43 states must be covered');
 const range=[...new Set(results.map(x=>x.id))].map(id=>{const heights=results.filter(r=>r.id===id).map(r=>r.height);return{id,min:Math.min(...heights),max:Math.max(...heights),difference:Math.max(...heights)-Math.min(...heights),states:heights.length};});
 for (const item of range) assert.ok(item.difference <= 1, `${item.id}: walkthrough shifts by ${item.difference}px`);
 const controls = await page.evaluate(() => [...document.querySelectorAll('[data-tour-for]')].map(bar => {
  const host = document.getElementById(bar.dataset.tourFor);
  return {id:host.id,above:bar.getBoundingClientRect().bottom <= host.getBoundingClientRect().top + 1,hasProgress:!!bar.querySelector('.demo-tour-progress'),disabled:bar.querySelector('button').disabled};
 }));
 assert.equal(controls.length,6,'Every walkthrough needs top playback controls');
 for (const bar of controls) {
  assert.ok(bar.above,`${bar.id}: playback controls must precede content`);
  assert.ok(bar.hasProgress,`${bar.id}: progress indicator missing`);
  assert.ok(bar.disabled,`${bar.id}: reduced-motion must use manual selection`);
 }
 return {states:results.length,range,controls};
}

export const targets = [
  ['social-demo', 'button[data-ss-persona="outreach-writer"]'],
  ['commerce-demo', '[data-kb-select="0"]'],
  ['memory-demo', '[data-memory-step="0"]'],
  ['judgment-demo', '.gh-evidence'],
  ['delivery-demo', '.pf-direction:first-child'],
  ['stage-panel', '#tab-task'],
];

// The prior layout passed existence/overflow checks but reduced the main scene
// to a thumbnail. Check its visual prominence, not just that a canvas exists.
export async function checkMemoryPresentation(page) {
  const result = await page.evaluate(() => {
    const host = document.getElementById('memory-demo');
    const rect = selector => {
      const r = host.querySelector(selector).getBoundingClientRect();
      return {x:r.x,y:r.y,width:r.width,height:r.height};
    };
    return {hostWidth:host.clientWidth,scene:rect('.mm-spatial'),terminal:rect('.mm-terminal'),
      imageVisible:host.querySelector('.mm-replay-image').getClientRects().length>0,
      renderer:host.querySelector('.mm-spatial').dataset.renderer};
  });
  const desktop = result.hostWidth > 760;
  assert.ok(result.scene.height >= (desktop ? 340 : 260), 'Memex scene has become a miniature');
  assert.ok(result.scene.width >= result.hostWidth * (desktop ? .42 : .8), 'Memex scene is too narrow');
  if (desktop) {
    assert.ok(result.scene.x < result.terminal.x, 'Read from the past session to the current result');
    assert.ok(Math.abs(result.scene.y-result.terminal.y) < 60, 'Scene and result must share a visual row');
    assert.ok(result.scene.height/result.terminal.height >= .75, 'The result overwhelms the memory scene');
  } else {
    assert.ok(result.scene.y+result.scene.height <= result.terminal.y, 'Mobile scene must precede the result');
  }
  assert.equal(result.imageVisible, false, 'A miniature product screenshot must not compete with the main scene');
  assert.ok(['webgl','fallback'].includes(result.renderer), 'Memory scene is missing');
  return result;
}

export async function checkMemoryReplay(page) {
  await page.cdp('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'no-preference'}]});
  await page.click('.mm-open-replay');
  await page.waitForFunction(()=>document.querySelector('.mm-replay-dialog').open && document.getElementById('memory-demo').dataset.autoplay==='expanded');
  const step=await page.evaluate(()=>document.getElementById('memory-demo').dataset.step);
  await new Promise(resolve=>setTimeout(resolve,2200));
  assert.equal(await page.evaluate(()=>document.getElementById('memory-demo').dataset.step),step,'Replay must pause the walkthrough');
  const result=await page.evaluate(()=>{
    const dialog=document.querySelector('.mm-replay-dialog'), image=dialog.querySelector('img');
    const rect=dialog.getBoundingClientRect(), scroll=dialog.querySelector('.mm-replay-scroll');
    return {loaded:image.complete&&image.naturalWidth===1920,imageWidth:dialog.querySelector('.mm-replay-image').clientWidth,
      withinViewport:rect.left>=0&&rect.right<=innerWidth&&rect.top>=0&&rect.bottom<=innerHeight,
      focusInside:dialog.contains(document.activeElement),horizontalPan:scroll.scrollWidth>scroll.clientWidth};
  });
  assert.ok(result.loaded, 'Original Replay asset must load');
  assert.ok(result.imageWidth>=1000, 'Original Replay must be large enough to inspect');
  assert.ok(result.withinViewport, 'Replay viewer must fit the viewport');
  assert.ok(result.focusInside, 'The modal must contain keyboard focus');
  await page.keyboard.press('Escape');
  assert.ok(await page.evaluate(()=>!document.querySelector('.mm-replay-dialog').open&&document.activeElement.matches('.mm-open-replay')),'Escape must close the viewer and return focus');
  return {...result,paused:true,escapeAndFocusReturn:true};
}

export async function rejectMiniatureMemory(page) {
  const previous=await page.evaluate(()=>{
    const scene=document.querySelector('.mm-spatial'), previous=scene.style.height;
    scene.style.height='180px';return previous;
  });
  try {
    await assert.rejects(checkMemoryPresentation(page), /scene has become a miniature/, 'The previous tiny scene must fail validation');
  } finally {
    await page.evaluate(height=>{document.querySelector('.mm-spatial').style.height=height;},previous);
  }
  return {rejectedMiniatureScene:true};
}

export async function checkTiming(page, [id, tab]) {
  await page.evaluate(id => {
    document.documentElement.style.scrollBehavior = 'auto';
    document.activeElement?.blur();
    document.getElementById(id).scrollIntoView({block:'center', behavior:'instant'});
  }, id);
  await page.evaluate(sel => document.querySelector(sel).scrollIntoView({block:'center',inline:'center',behavior:'instant'}),tab);
  await page.hover(tab);
  await page.waitForFunction(id => document.getElementById(id).dataset.autoplay === 'hover', id, {timeout:3000});
  await page.evaluate(id => {
    window.__qaWatch?.disconnect();
    const host = document.getElementById(id);
    const key = () => {
      if (id === 'social-demo') { const node=host.querySelector('[data-ss-persona][data-ss-step]'); return `${node.dataset.ssPersona}/${node.dataset.ssStep}`; }
      if (id === 'commerce-demo') return host.querySelector('[data-kb-view]').dataset.kbView;
      if (id === 'memory-demo') return host.dataset.step;
      if (id === 'judgment-demo') return host.querySelector('[data-step]').dataset.step + '/' + (host.querySelector('.gh-perspective[aria-pressed="true"]')?.textContent || '');
      if (id === 'delivery-demo') return host.querySelector('[data-direction]').dataset.direction;
      return document.querySelector('#stage-organization').dataset.sceneStage;
    };
    let current = key(), mode = host.dataset.autoplay;
    window.__qaKey = key;
    window.__qaLog = [];
    window.__qaWatch = new MutationObserver(() => {
      const nextMode=host.dataset.autoplay;
      if(nextMode === 'running' && mode !== 'running') window.__qaStarted=performance.now();
      mode=nextMode;
      const next=key();
      if (next !== current) { window.__qaLog.push({from:current,to:next,at:performance.now()}); current=next; }
    });
    window.__qaWatch.observe(host,{subtree:true,attributes:true,childList:true,characterData:true});
    window.__qaStarted = performance.now();
  }, id);
  await page.mouse.move(5,5);
  await page.waitForFunction(() => window.__qaLog.length >= 1, undefined, {timeout:3500});
  const first=await page.evaluate(() => ({event:window.__qaLog[0],elapsed:window.__qaLog[0].at-window.__qaStarted}));
  assert.ok(first.elapsed >= 1800 && first.elapsed < 2700, `${id}: unexpected interval ${first.elapsed}`);
  await page.evaluate(sel => document.querySelector(sel).scrollIntoView({block:'center',inline:'center',behavior:'instant'}),tab);
  await page.hover(tab);
  await page.waitForFunction(id => document.getElementById(id).dataset.autoplay === 'hover',id,{timeout:3000});
  const paused=await page.evaluate(() => window.__qaKey());
  await new Promise(resolve => setTimeout(resolve,2400));
  assert.equal(await page.evaluate(() => window.__qaKey()),paused,`${id}: advanced while hovered`);
  await page.click(tab);
  await page.evaluate(() => { window.__qaLog=[]; window.__qaStarted=performance.now(); });
  await page.mouse.move(5,5);
  await page.waitForFunction(() => window.__qaLog.length >= 1,undefined,{timeout:3500});
  const resumed=await page.evaluate(() => ({event:window.__qaLog[0],elapsed:window.__qaLog[0].at-window.__qaStarted}));
  assert.ok(resumed.elapsed >= 1800 && resumed.elapsed < 2700,`${id}: did not resume after click and hover leave`);
  await page.evaluate(() => window.__qaWatch.disconnect());
  return {id,first,resumed,hoverHeldMs:2400};
}

export async function checkContinuousFilm(page) {
  await page.cdp('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'no-preference'}]});
  await page.evaluate(() => {
    document.activeElement?.blur();
    document.querySelector('#commerce-demo .kb-frame').scrollIntoView({block:'center',behavior:'instant'});
  });
  await page.mouse.move(2,2);
  await page.waitForFunction(() => {
    const video=document.querySelector('#commerce-demo video');
    return !video.paused && video.readyState >= 2 && document.querySelector('#commerce-demo').dataset.autoplay === 'running';
  },undefined,{timeout:10000});
  const report=await page.evaluate(() => new Promise(resolve => {
    const host=document.querySelector('#commerce-demo');
    const video=host.querySelector('video');
    const states=new Set();
    let last=video.currentTime,loops=0,pauses=0,replacements=0;
    const trackPause=()=>pauses++;
    video.addEventListener('pause',trackPause);
    const timer=setInterval(()=>{
      states.add(host.querySelector('[data-kb-view]').dataset.kbView);
      if(video.currentTime < last-.5) loops++;
      if(host.querySelector('video')!==video) replacements++;
      last=video.currentTime;
    },100);
    setTimeout(()=>{
      clearInterval(timer);video.removeEventListener('pause',trackPause);
      resolve({duration:video.duration,states:[...states],loops,pauses,replacements,playing:!video.paused,visible:!video.hidden});
    },7600);
  }));
  assert.equal(report.states.length,3,'Every explanation must advance while the film plays');
  assert.ok(report.loops >= 1,'The full film must loop without tab resets');
  assert.equal(report.pauses,0,'Changing explanations must not pause the film');
  assert.equal(report.replacements,0,'The video must stay mounted');
  assert.ok(report.playing && report.visible,'The film must remain visible and playing');
  return report;
}

export async function checkPauseControls(page) {
  await page.cdp('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'no-preference'}]});
  const results=[];
  for (const [id] of targets) {
    const selector=`[data-tour-for="${id}"] button`;
    await page.evaluate(selector=>document.querySelector(selector).scrollIntoView({block:'center',behavior:'instant'}),selector);
    await page.click(selector);
    await page.waitForFunction(id=>document.getElementById(id).dataset.autoplay==='paused',id,{timeout:3000});
    const content=await page.evaluate(id=>document.getElementById(id).innerText,id);
    await new Promise(resolve=>setTimeout(resolve,2200));
    assert.equal(await page.evaluate(id=>document.getElementById(id).innerText,id),content,`${id}: explicit pause did not hold`);
    await page.click(selector);
    await page.mouse.move(2,2);
    await page.waitForFunction(id=>document.getElementById(id).dataset.autoplay==='running',id,{timeout:3000});
    await page.waitForFunction(({id,content})=>document.getElementById(id).innerText!==content,{id,content},{timeout:3000});
    results.push({id,paused:true,resumed:true});
  }
  return results;
}

export async function checkExpandedDetail(page) {
  const selector='#memory-demo .mm-detail summary';
  await page.evaluate(selector=>document.querySelector(selector).scrollIntoView({block:'center',behavior:'instant'}),selector);
  await page.click(selector);
  await page.mouse.move(2,2);
  await page.waitForFunction(()=>document.getElementById('memory-demo').dataset.autoplay==='expanded',undefined,{timeout:3000});
  const step=await page.evaluate(()=>document.getElementById('memory-demo').dataset.step);
  await new Promise(resolve=>setTimeout(resolve,2200));
  assert.equal(await page.evaluate(()=>document.getElementById('memory-demo').dataset.step),step,'Expanded session detail must stay readable');
  await page.click(selector);
  await page.mouse.move(2,2);
  await page.waitForFunction(step=>document.getElementById('memory-demo').dataset.step!==step,step,{timeout:3000});
  return {expandedDetailHeld:true,resumedOnClose:true};
}

export async function checkFilmControls(page) {
  await page.evaluate(()=>document.querySelector('#commerce-demo .kb-frame').scrollIntoView({block:'center',behavior:'instant'}));
  await page.mouse.move(2,2);
  await page.waitForFunction(()=>!document.querySelector('#commerce-demo video').paused,undefined,{timeout:5000});
  await page.click('[data-kb-film-toggle]');
  await page.mouse.move(2,2);
  await new Promise(resolve=>setTimeout(resolve,2200));
  assert.ok(await page.evaluate(()=>document.querySelector('#commerce-demo video').paused),'A manually paused film must stay paused across tab changes');
  await page.click('[data-kb-film-toggle]');
  await page.waitForFunction(()=>!document.querySelector('#commerce-demo video').paused,undefined,{timeout:3000});
  await page.cdp('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
  await page.waitForFunction(()=>document.querySelector('#commerce-demo video').paused,undefined,{timeout:3000});
  await page.click('[data-kb-film-toggle]');
  await page.waitForFunction(()=>!document.querySelector('#commerce-demo video').paused,undefined,{timeout:3000});
  await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
  await page.waitForFunction(()=>document.querySelector('#commerce-demo video').paused,undefined,{timeout:3000});
  await page.cdp('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'no-preference'}]});
  return {manualPauseHeld:true,manualResume:true,reducedMotionStops:true,reducedMotionManualPlay:true,offscreenStops:true};
}

// Prove that the timing check rejects the original one-second regression.
export async function rejectFastInterval(page) {
  await page.evaluate(() => {
    window.__qaNativeTimeout = window.setTimeout;
    window.setTimeout = (fn, delay, ...args) => window.__qaNativeTimeout(fn, delay === 2000 ? 1000 : delay, ...args);
  });
  try {
    await assert.rejects(checkTiming(page, targets[0]), /unexpected interval/, 'The checker must reject one-second playback');
  } finally {
    await page.evaluate(() => { window.setTimeout=window.__qaNativeTimeout; delete window.__qaNativeTimeout; });
    await page.reload();
  }
  return { rejectedOneSecondPlayback: true };
}
