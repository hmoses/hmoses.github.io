"use strict";
// Shared floating tutor on the lab and documentation pages.
(() => {
  const root=document.createElement("aside");
  root.className="lab-site-assistant";root.setAttribute("aria-label","LanceDB contextual tutor");
  const launch=document.createElement("button");launch.type="button";launch.className="lab-site-assistant-launch";
  launch.textContent="✦  Ask the tutor";launch.setAttribute("aria-expanded","false");
  const panel=document.createElement("div");panel.className="lab-site-assistant-panel";panel.hidden=true;
  const header=document.createElement("div");header.className="lab-site-assistant-header";
  const label=document.createElement("span");label.textContent="LanceDB learning assistant";
  const minimize=document.createElement("button");minimize.type="button";minimize.textContent="−";minimize.setAttribute("aria-label","Minimize tutor");
  header.append(label,minimize);
  const frame=document.createElement("iframe");
  frame.src=location.pathname.includes("/docs/")?"../voice-tour/?chat=1":"./voice-tour/?chat=1";
  frame.title="LanceDB contextual tutor";frame.loading="lazy";frame.setAttribute("allow","microphone");
  panel.append(header,frame);root.append(launch,panel);
  const css=document.createElement("style");
  css.textContent=[
    ".lab-site-assistant{position:fixed;right:max(12px,env(safe-area-inset-right));bottom:max(14px,env(safe-area-inset-bottom));z-index:1100}",
    ".lab-site-assistant-launch{padding:15px 19px;border:1px solid #d6a6e4;background:linear-gradient(110deg,#cbb4ff,#f1b9dd);color:#251729;border-radius:45px;font:750 14px system-ui,sans-serif;cursor:pointer;box-shadow:0 13px 35px #0009}",
    ".lab-site-assistant-panel{width:min(420px,calc(100vw - 24px));height:min(670px,calc(100dvh - 33px));display:flex;flex-direction:column;background:#1b1422;border:1px solid #9979a8;border-radius:17px;box-shadow:0 22px 65px #000c;overflow:hidden}",
    ".lab-site-assistant-panel[hidden]{display:none}",
    ".lab-site-assistant-header{min-height:43px;padding:5px 12px;display:flex;justify-content:space-between;align-items:center;color:#f6e9f8;background:#2b1d34;font:650 13px system-ui,sans-serif}",
    ".lab-site-assistant-header button{min-width:34px;min-height:32px;border:1px solid #806b8a;color:#fff;background:#47334f;border-radius:8px;cursor:pointer}",
    ".lab-site-assistant-panel iframe{width:100%;min-height:0;flex:1;border:0;background:#18121f}"
  ].join("\n");
  document.head.append(css);document.body.append(root);
  let selected=null,loaded=false,pendingOpen=false;
  const sendContext=open=>{
    if(!loaded||!selected)return;
    try{frame.contentWindow.postMessage({type:"lab-selection",text:selected.text,nearby:selected.nearby,source:document.title||"LanceDB lab",open},location.origin);}catch(e){}
  };
  const openPanel=open=>{
    panel.hidden=!open;launch.hidden=open;launch.setAttribute("aria-expanded",String(open));
    if(open&&loaded)sendContext(false);
  };
  launch.addEventListener("click",()=>{pendingOpen=Boolean(selected);openPanel(true);if(loaded&&selected){sendContext(true);pendingOpen=false;}});
  minimize.addEventListener("click",()=>openPanel(false));
  frame.addEventListener("load",()=>{loaded=true;sendContext(pendingOpen);pendingOpen=false;});
  document.addEventListener("keydown",event=>{if(event.key==="Escape"&&!panel.hidden&&document.activeElement!==frame)openPanel(false)});
  const captureSelection=()=>{
    const sel=window.getSelection();const text=sel?.toString().trim();
    if(!text)return;
    const near=sel.anchorNode?.parentElement?.closest("pre,li,p,article,section")?.textContent?.replace(/\s+/g," ").trim().slice(0,1200)||text;
    selected={text:text.slice(0,450),nearby:near};
    launch.textContent="✦  Ask about selection";sendContext(false);
  };
  document.addEventListener("mouseup",captureSelection);
  document.addEventListener("keyup",e=>{if(e.shiftKey)captureSelection()});
})();
