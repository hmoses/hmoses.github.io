"use strict";
// Educational fixed-fixture cosine similarity explorer. Not LanceDB running in the browser.
// Matching Python fixture lives in ../example.py.
const records = [
{id:"doc-01",title:"Connect to a local LanceDB database",category:"python",summary:"Use lancedb.connect() with a local path. No credentials or server are required.",vector:[0.85,0.12,0.14,0.18]},
{id:"doc-02",title:"Create and ingest a table",category:"python",summary:"Add typed records and fixed-dimension vector embeddings to a local table.",vector:[0.84,0.18,0.15,0.76]},
{id:"doc-03",title:"Run a nearest-neighbor query",category:"search",summary:"Call table.search(vector), choose a distance metric, and limit the results.",vector:[0.11,0.97,0.12,0.19]},
{id:"doc-04",title:"Filter rows before vector search",category:"search",summary:"Use .where() to restrict the candidate set by metadata category.",vector:[0.16,0.92,0.15,0.45]},
{id:"doc-05",title:"Build clear agent instructions",category:"agents",summary:"Provide exact commands, prerequisites, expected output, and error recovery.",vector:[0.2,0.26,0.96,0.18]},
{id:"doc-06",title:"Validate examples with pytest",category:"operations",summary:"Test end-to-end query behavior to detect SDK and documentation drift.",vector:[0.35,0.22,0.76,0.78]},
{id:"doc-07",title:"Document common query failures",category:"operations",summary:"Explain vector dimensions, filter predicates, and local data-path errors.",vector:[0.41,0.79,0.58,0.12]},
{id:"doc-08",title:"Version documentation against APIs",category:"agents",summary:"Make API assumptions explicit and link to authoritative reference pages.",vector:[0.11,0.37,0.94,0.47]}
];
const defaults={vector:[0.10,0.99,0.11,0.15],filter:[0.16,0.90,0.19,0.55],agent:[0.18,0.30,0.95,0.20],ingest:[0.89,0.18,0.15,0.72]};

const form=document.getElementById("lab-form"), intent=document.getElementById("intent"),category=document.getElementById("category"),count=document.getElementById("count"),results=document.getElementById("results"),summary=document.getElementById("summary"),status=document.getElementById("run-status"),code=document.getElementById("generated-code"),queryInput=document.getElementById("query-vector"),customTitle=document.getElementById("custom-title"),customVector=document.getElementById("custom-vector"),datasetStatus=document.getElementById("dataset-status"),error=document.getElementById("vector-error");
let custom=[];
function parseVector(input){
 const parts=input.split(",").map(x=>x.trim());
 if(parts.length!==4 || parts.some(x=>x===""||!Number.isFinite(Number(x))))throw new Error("Enter exactly four finite numbers separated by commas.");
 const v=parts.map(Number);
 if(Math.hypot(...v)===0)throw new Error("The vector cannot be all zeros.");
 return v;
}
function cosine(a,b){const dot=a.reduce((sum,x,i)=>sum+x*b[i],0);return dot/(Math.hypot(...a)*Math.hypot(...b))}
function createResult(record,score,rank){
 const article=document.createElement("article");article.className="result";
 const header=document.createElement("div");header.className="resultrow";
 const info=document.createElement("div"),tag=document.createElement("span");tag.className="tag";tag.textContent=record.category.toUpperCase();
 const title=document.createElement("h3");title.textContent=rank+". "+record.title;info.append(tag,title);
 const number=document.createElement("span");number.className="score";number.textContent=(score*100).toFixed(1)+"%";
 number.setAttribute("aria-label","Cosine similarity "+(score*100).toFixed(1)+" percent");
 header.append(info,number);const p=document.createElement("p");p.textContent=record.summary;
 const bar=document.createElement("div");bar.className="bar";bar.setAttribute("aria-hidden","true");
 const fill=document.createElement("span");fill.style.width=(Math.max(0,score)*100).toFixed(2)+"%";bar.append(fill);
 article.append(header,p,bar);return article;
}
function pythonCode(vector,selected,limit){
 const extra=custom.length?custom.map(r=>({id:r.id,title:r.title,category:r.category,text:r.summary,vector:r.vector})):[];
 const rows=JSON.stringify(extra,null,2).replace(/\bnull\b/g,"None");
 const filter=selected==="all"?"":'    .where("category = \\''+selected+'\\'")';
 return [
 "import lancedb",
 "from example import RECORDS",
 "",
 '# Open a local embedded database (no API key needed).',
 'db = lancedb.connect("./sample.lance")',
 '# Copy fixture rows; append any documents you added in the explorer.',
 'data = RECORDS + '+(extra.length?rows:"[]"),
 '# Overwrite the table for repeatable learning; do not use overwrite on production data.',
 'table = db.create_table("doc_chunks", data=data, mode="overwrite")',
 '# Four numeric coordinates, matching each stored vector length.',
 'query_vector = '+JSON.stringify(vector),
 '# Cosine distance is 1 - cosine similarity; smaller means closer.',
 'results = (',
 '    table.search(query_vector)',
 '    .distance_type("cosine")',
 ...(filter?[filter]:[]),
 '    .limit('+limit+')',
 '    .to_list()',
 ')',
 '# Each result is a dictionary; _distance is the computed cosine distance.',
 'for item in results:',
 '    print(item["id"], item["title"], item["_distance"])'
 ].join("\n");
}
function run(){
 try{
  const vector=parseVector(queryInput.value),cat=category.value,lim=Number(count.value);
  const dataset=records.concat(custom);
  const ranked=dataset.filter(r=>cat==="all"||r.category===cat)
   .map(r=>({record:r,score:cosine(vector,r.vector)}))
   .sort((a,b)=>b.score-a.score||a.record.id.localeCompare(b.record.id)).slice(0,lim);
  results.replaceChildren(...ranked.map((r,i)=>createResult(r.record,r.score,i+1)));
  if(!ranked.length){const p=document.createElement("p");p.textContent="No records match this category. Try All categories or add a document.";results.append(p)}
  summary.textContent=ranked.length+" ranked of "+dataset.length+" records · "+(cat==="all"?"all categories":cat+" only")+" · calculated cosine similarity";
  status.textContent="COMPLETE";error.textContent="";code.textContent=pythonCode(vector,cat,lim);
  document.querySelectorAll("[data-scenario]").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.scenario===intent.value && queryInput.value===defaults[intent.value].join(", "))));
 }catch(e){status.textContent="INVALID INPUT";error.textContent=e.message;results.replaceChildren();summary.textContent="Fix the query embedding to calculate results."}
}
form.addEventListener("submit",event=>{event.preventDefault();run()});
document.querySelectorAll("[data-scenario]").forEach(btn=>btn.addEventListener("click",()=>{intent.value=btn.dataset.scenario;queryInput.value=defaults[intent.value].map(x=>x.toFixed(2)).join(", ");run()}));
intent.addEventListener("change",()=>{queryInput.value=defaults[intent.value].map(x=>x.toFixed(2)).join(", ");run()});
category.addEventListener("change",run);count.addEventListener("change",run);
queryInput.addEventListener("input",()=>{status.textContent="EDITED — RUN TO UPDATE";error.textContent=""});
document.getElementById("add-document").addEventListener("click",()=>{
 try{
  const title=customTitle.value.trim(),vector=parseVector(customVector.value);
  if(!title)throw new Error("Enter a document title before adding a document.");
  const id="custom-"+String(custom.length+1).padStart(2,"0");
  const cat=category.value==="all"?"python":category.value;
  custom.push({id,title,vector,category:cat,summary:"User-added record with a four-dimensional embedding."});
  datasetStatus.textContent=custom.length+" custom document(s) added; "+(records.length+custom.length)+" total.";
  customTitle.value="";customVector.value="";run();
 }catch(e){datasetStatus.textContent=e.message}
});
document.getElementById("reset-documents").addEventListener("click",()=>{custom=[];datasetStatus.textContent="8 sample records loaded.";run()});
document.getElementById("copy-code").addEventListener("click",async()=>{const btn=document.getElementById("copy-code");try{await navigator.clipboard.writeText(code.textContent);btn.textContent="Copied ✓"}catch{btn.textContent="Select and copy code"}setTimeout(()=>btn.textContent="Copy code",1700)});
run();
