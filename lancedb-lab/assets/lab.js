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
 const filter=selected==="all"?"":`    .where("category = '${selected}'")`;
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
function describePythonLine(line){
 const trimmed=line.trim();
 if(!trimmed)return "Visual separator between stages of the Python program.";
 if(trimmed.startsWith("#"))return "Comment: "+trimmed.slice(1).trim()+" This annotation explains the following operation; Python does not execute it.";
 if(trimmed==="import lancedb")return "Loads the LanceDB Python SDK so the program can create and query a local database.";
 if(trimmed==="from example import RECORDS")return "Imports the demonstration records from example.py; every record includes a vector and metadata.";
 if(trimmed.startsWith('db = lancedb.connect('))return "Opens or creates an embedded local LanceDB database at the supplied folder path.";
 if(trimmed==="data = RECORDS + []")return "Copies the built-in sample records without adding any user-defined documents.";
 if(trimmed.startsWith("data = RECORDS +"))return "Starts a combined dataset containing the built-in rows plus the documents you added in the browser.";
 if(trimmed.startsWith("table = db.create_table("))return "Creates the doc_chunks table from the combined dataset; overwrite replaces its previous contents.";
 if(trimmed.startsWith("query_vector ="))return "Stores the exact four numeric coordinates you entered. Query and document embeddings must have matching dimensions.";
 if(trimmed==="results = (")return "Begins a multi-line query expression. Its eventual list of matching rows is assigned to results.";
 if(trimmed==="table.search(query_vector)")return "Builds a nearest-neighbor search against the table using your query vector.";
 if(trimmed==='.distance_type("cosine")')return "Uses cosine distance to rank records. Lower _distance indicates a closer match; similarity is one minus distance.";
 if(trimmed.startsWith(".where("))return "Applies the selected metadata category as a filter, excluding other categories from the returned matches.";
 if(trimmed.startsWith(".limit("))return "Limits how many of the nearest matches can be returned.";
 if(trimmed===".to_list()")return "Executes the query and converts the retrieved rows into a Python list of dictionaries.";
 if(trimmed===")")return "Closes the multi-line query expression.";
 if(trimmed==="for item in results:")return "Starts a loop, processing each returned match once.";
 if(trimmed.startsWith("print("))return "Prints each matching record's ID, title, and computed cosine distance.";
 if(trimmed==="[")return "Opens the list of extra user-created records to add to the fixture.";
 if(trimmed==="]")return "Closes the list of extra records.";
 if(trimmed==="{")return "Begins a dictionary describing a custom record.";
 if(trimmed==="},"||trimmed==="}")return "Ends this custom record dictionary.";
 if(/^"(id|title|category|text|vector)"\s*:/.test(trimmed))return "Specifies a field in a custom record; its ID, title, category, text, and 4D vector are stored in LanceDB.";
 if(/^[-\d.,\s\[\]]+$/.test(trimmed))return "Contains numeric embedding coordinates for a custom record.";
 return "Part of the additional custom-record data generated from the documents you entered in the simulator.";
}
function renderLineWalkthrough(source){
 const target=document.getElementById("generated-line-notes");
 if(!target)return;
 const lines=source.split("\n");
 const fragment=document.createDocumentFragment();
 for(let i=0;i<lines.length;i++){
  // Walkthrough covers executable Python only; comments stay in the generated source.
  if(!lines[i].trim() || lines[i].trim().startsWith("#"))continue;
  const li=document.createElement("li");
  const snippet=document.createElement("span");
  snippet.className="line-code";
  const lineCode=document.createElement("code");
  lineCode.textContent=lines[i].trim()||"(blank line)";
  snippet.append(lineCode);
  const explanation=document.createElement("span");
  explanation.className="line-meaning";
  explanation.textContent=describePythonLine(lines[i]);
  li.append(snippet,explanation);
  fragment.append(li);
 }
 target.replaceChildren(fragment);
}
function renderInterviewWalkthrough(vector,categorySelected,limit,source){
 const stageRoot=document.getElementById("interview-stages");
 if(!stageRoot)return;
 const extras=custom.length;
 const total=records.length+extras;
 const filtered=categorySelected==="all"?total:records.filter(r=>r.category===categorySelected).length+custom.filter(r=>r.category===categorySelected).length;
 const categoryText=categorySelected==="all"?"all categories":'the "'+categorySelected+'" category';
 const stages=[
  {name:"1. Identify the dependencies and inputs",code:"import lancedb\nfrom example import RECORDS",purpose:"The program imports the installed LanceDB library and the predefined sample records from the local example module. At this point, no database operation has happened.",why:"An import tells you the name being loaded, not everything inside it. To verify RECORDS, open example.py; to understand lancedb.connect, consult the package API.",question:"What do you inspect if you have never seen RECORDS before?",answer:"Open example.py and examine the value assigned to RECORDS. In this lab it is a list of eight record dictionaries, each including a 4D vector."},
  {name:"2. Connect and prepare the table",code:'db = lancedb.connect("./sample.lance")\ndata = RECORDS + '+(extras? '[...'+extras+' custom record(s)]':"[]")+'\ntable = db.create_table("doc_chunks", data=data, mode="overwrite")',purpose:"Connect to local embedded storage, combine the eight fixture records"+(extras?" with "+extras+" additional explorer record(s)":" with no additional records")+", then create and populate a table named doc_chunks.",why:"connect identifies where data lives; create_table inserts it. The overwrite option deliberately resets the table so the example is reproducible—but would be dangerous on production data.",question:"What would happen if you ran the program twice?",answer:"The table is recreated from the same supplied rows because mode=overwrite replaces an existing doc_chunks table. It does not append indefinitely."},
  {name:"3. Define the question as a vector",code:"query_vector = ["+vector.join(", ")+"]",purpose:"The search input is a four-number vector. It represents the point that the example will compare against each stored document vector.",why:"The query vector and stored vectors must have the same number of dimensions. These example vectors are manually chosen numbers, not embeddings produced from natural-language text.",question:"What happens if the query has only three coordinates?",answer:"It would not match the four-coordinate stored vectors. A proper vector query requires compatible dimensions."},
  {name:"4. Construct and execute the search",code:'results = (\n  table.search(query_vector)\n  .distance_type("cosine")'+(categorySelected==="all"?"":"\n  .where(\"category = '" + categorySelected + "'\")")+'\n  .limit('+limit+')\n  .to_list()\n)',purpose:"Build a nearest-neighbor query, rank by cosine distance, "+(categorySelected==="all"?"consider all categories":"restrict to "+categoryText)+", request at most "+limit+" match(es), and materialize results as a Python list.",why:"Search, distance, optional metadata predicate and limit are combined into one query. Smaller cosine distance indicates greater directional similarity; this is not a confidence probability.",question:"What changes when you add a category filter?",answer:"Only records meeting the metadata predicate are eligible. A filter can reduce the returned number of matches below the requested limit."},
  {name:"5. Inspect the output",code:'for item in results:\n  print(item["id"], item["title"], item["_distance"])',purpose:"For each returned record, print an identifier, a readable title and its numeric cosine distance.",why:"These values let you inspect what was retrieved and how it was ranked. The webpage itself displays an independently calculated JavaScript similarity score, not the output of this Python run.",question:"Does this program prove the returned results are semantically correct?",answer:"No. It ranks provided four-dimensional vectors. Semantic relevance would require meaningful embeddings and evaluation with representative queries."}
 ];
 stageRoot.replaceChildren();
 const fragment=document.createDocumentFragment();
 for(const stage of stages){
   const article=document.createElement("article");article.className="interview-stage";
   const heading=document.createElement("h6");heading.textContent=stage.name;
   const codeBox=document.createElement("pre");codeBox.className="interview-stage-code";
   const codeEl=document.createElement("code");codeEl.textContent=stage.code;codeBox.append(codeEl);
   const purpose=document.createElement("p");purpose.textContent=stage.purpose;
   const detail=document.createElement("details");detail.className="interview-deep-dive";
   const summary=document.createElement("summary");summary.textContent="Why this matters + likely interview question";
   const why=document.createElement("p");why.textContent=stage.why;
   const quiz=document.createElement("p");const strong=document.createElement("strong");strong.textContent=stage.question;
   const answer=document.createElement("p");answer.textContent=stage.answer;
   quiz.append(strong);detail.append(summary,why,quiz,answer);
   article.append(heading,codeBox,purpose,detail);fragment.append(article);
 }
 stageRoot.append(fragment);
 const script="This example starts with "+total+" illustrative document record(s), including "+extras+" custom record(s). It connects to a local LanceDB database, creates a table from those records, and defines a four-dimensional query vector. It runs a nearest-neighbor search using cosine distance"+(categorySelected==="all"?"":", filters candidates to "+categoryText)+", and returns up to "+limit+" matching record(s). Finally it prints each result's ID, title and distance. The browser explorer separately simulates ranking in JavaScript, while this generated Python demonstrates how the LanceDB SDK would perform the workflow in a local environment.";
 document.getElementById("interview-script").textContent=script;
 document.getElementById("interview-purpose").textContent="Start with "+total+" sample record(s), connect to local LanceDB, create a table, query with four coordinates, "+(categorySelected==="all"?"search across all categories":"filter to "+categoryText)+", and print up to "+limit+" matching record(s).";
 const checks=document.getElementById("interview-checks");
 checks.replaceChildren();
 const prompts=[
  ["Where did the starting data come from?","The RECORDS list in example.py, plus any custom records entered in the browser."],
  ["When is the database actually created or changed?","lancedb.connect opens local storage, and create_table writes the rows. Overwrite resets the table."],
  ["What controls the returned ranking?","The query vector, cosine distance, optional category filter and limit."],
  ["What have you verified versus only demonstrated?","The browser uses a JavaScript similarity simulation. The Python example is generated, but the browser does not execute it."]
 ];
 prompts.forEach(([question,answer])=>{const details=document.createElement("details");const summary=document.createElement("summary");summary.textContent=question;const p=document.createElement("p");p.textContent=answer;details.append(summary,p);checks.append(details)});
}
const copyInterview=document.getElementById("copy-interview-script");
if(copyInterview)copyInterview.addEventListener("click",async()=>{
 const text=document.getElementById("interview-script")?.textContent||"";
 try{await navigator.clipboard.writeText(text);copyInterview.textContent="Copied ✓";}
 catch(e){copyInterview.textContent="Select the explanation to copy";}
 setTimeout(()=>copyInterview.textContent="Copy my explanation",1800);
});
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
  status.textContent="COMPLETE";error.textContent="";const generated=pythonCode(vector,cat,lim);code.textContent=generated;if(window.highlightLabCode)window.highlightLabCode(code,"python");renderLineWalkthrough(generated);renderInterviewWalkthrough(vector,cat,lim,generated);
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
