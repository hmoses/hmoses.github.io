"use strict";

/*
 * LanceDB Guided Voice Tutorial
 * All narration is human-readable text. Playback uses the visitor's system
 * Web Speech Synthesis voices (no remote API, audio upload, or analytics).
 * An independent educational portfolio, not a LanceDB product.
 */

const chapters = [
  {
    id:"overview", title:"What did I build?", time:"1–2 min",
    subtitle:"Start with the why, not the code.",
    paragraphs:[
      "Okay, here’s the big picture. Imagine you have hundreds of help articles, code examples, and troubleshooting guides. A developer asks a question, but they don't know the exact words used in your documentation. Ordinary keyword search might miss the answer.",
      "Vector search is one way to bridge that gap. It represents information as lists of numbers, called vectors. In a real application, an embedding model turns text or images into those vectors. LanceDB stores and searches the vectors alongside useful fields, like the document title or category.",
      "Your project has two parts. The website is an interactive teaching tool that simulates vector similarity. Separately, the Python file uses the actual LanceDB library to create a local database and run queries. That distinction matters, and it's a strength to explain it clearly.",
      "The point of the project isn't that you invented vector search. It's that you made a technical workflow understandable, reproducible, and connected to documentation."
    ],
    action:{url:"../",label:"Open the interactive lab",hint:"Look at the heading, then the example Python terminal panel. Don't worry about the syntax yet."},
    takeaway:"LanceDB is used to store and search vectorized data alongside metadata. This lab teaches the query workflow and provides real, separate Python source.",
    question:"In one sentence, what problem is vector search trying to solve?",
    answer:"Finding relevant information by similarity, even when a user's wording isn't an exact keyword match."
  },
  {
    id:"vectors", title:"Try your first vector search", time:"1–2 min",
    subtitle:"A vector is a numerical representation, not magic.",
    paragraphs:[
      "Open the lab's Result Explorer. Leave Search intent on Vector search fundamentals, Metadata category on All categories, and Maximum results on Top 3. Press Run simulation.",
      "You should see three ranked sample documents. The first is usually Run a nearest-neighbor query. Why? Because its four-number vector points in a similar direction to the four-number query vector.",
      "Here's an important distinction. The percentages in the browser are cosine similarity scores multiplied by one hundred. They are not confidence levels, accuracy percentages, or a guarantee that the answer is correct.",
      "In this teaching example, there are eight records and the vectors are hand-written. They weren't produced by an embedding model. For a production system, you would normally create embeddings from real content, store the relevant metadata, and evaluate how well the retrieved results answer actual questions.",
      "So when you explain this step, say: I built a small, deterministic example so developers can see why one result appears above another."
    ],
    action:{url:"../#explorer",label:"Run the example",hint:"Select Vector search fundamentals, All categories, Top 3. Compare the result titles and scores."},
    takeaway:"Vector similarity ranks records; a high similarity number isn't proof of a correct answer.",
    question:"Are those browser similarity percentages an AI model's confidence?",
    answer:"No. They are cosine similarity calculations on fixed sample vectors, displayed as percentages for readability."
  },
  {
    id:"filters", title:"Add metadata filtering", time:"1–2 min",
    subtitle:"Similarity finds candidates; metadata narrows the field.",
    paragraphs:[
      "Now choose AI-agent-ready docs as the search intent, then choose Agents as the metadata category. You should get only two documents, both labeled Agents.",
      "Think of this like searching a library. Vector search says, show me the books closest to this topic. Metadata filtering says, and only show books in the technical reference section.",
      "In the Python example, the filter is expressed with a where clause. For example: where category equals agents. It restricts the records eligible for the query. You can then limit the results to the top two or top three.",
      "This matters for real developer products. Filtering can separate one customer's data from another, limit results by document type, or narrow searches to a product version. In a production system, access control must also be enforced securely; a simple demo filter is not an authorization mechanism.",
      "If Anna asks what metadata filtering adds, say it makes similarity search more useful by adding structured rules."
    ],
    action:{url:"../#explorer",label:"Filter the search to Agents",hint:"Choose AI-agent-ready docs and Agents; confirm only two matching records remain."},
    takeaway:"Filtering restricts which records qualify. It complements vector similarity, and it is not a substitute for security authorization.",
    question:"Why not just retrieve the nearest vectors and stop there?",
    answer:"Because the nearest item may belong to the wrong category, product version, tenant, or other required context."
  },
  {
    id:"real-vs-simulated", title:"What is actually running?", time:"1 min",
    subtitle:"Be precise about the web demo versus the database.",
    paragraphs:[
      "Here's a detail that will make you sound credible in a technical interview. The live GitHub Pages website does not run the LanceDB engine. It runs JavaScript in the browser and demonstrates the ranking math using a tiny fixed dataset.",
      "The real database-backed workflow is in example dot py, in your GitHub source. That Python example connects to LanceDB Embedded, creates a local table, inserts eight sample records, runs cosine vector search, and optionally filters by category.",
      "GitHub Pages can host the interactive interface and documentation because they're static files. But it isn't executing Python on a server. To run the actual Python example, a developer clones or downloads the project, installs the requirements, and runs the command locally.",
      "This separation is deliberate: the browser makes the concept easy to explore, while the Python code shows the real API calls. You're demonstrating both learning design and technical implementation."
    ],
    action:{url:"https://github.com/hmoses/hmoses.github.io/blob/main/lancedb-lab/example.py",label:"Inspect the real Python file",hint:"Find create_table and search_docs. Those functions are the database-backed implementation."},
    takeaway:"Browser: simulation. Python: actual LanceDB Embedded. GitHub Pages hosts the interface, not a Python backend.",
    question:"If the interviewer asks, does the website itself query LanceDB, what do you say?",
    answer:"No. The web explorer is a browser-side teaching simulation. The repo contains a separate Python example that really queries a local LanceDB database."
  },
  {
    id:"python", title:"Read the Python like an engineer", time:"1–2 min",
    subtitle:"Connect, create, search, filter, limit.",
    paragraphs:[
      "Let's translate the core Python into everyday English. First, import LanceDB. That makes the library available. Next, call lancedb dot connect with a local path. Think of that as opening the database.",
      "Then create a table called doc chunks. The sample records have an ID, a title, a text description, a category, and a four-number vector. The sample is small enough that you can inspect every record.",
      "Then comes table dot search. You pass it a query vector. Distance type cosine tells LanceDB how to compare vectors. A where clause restricts the category, and limit chooses how many results to return. Finally, to list converts the query results into Python objects you can print or inspect.",
      "The sample uses overwrite mode to reset disposable test data. That's fine for a repeatable lab, but you'd be careful not to overwrite production tables.",
      "If you remember just one sequence, remember this: connect, create, search, filter, limit, inspect. And don't confuse these synthetic vectors with a real embedding pipeline."
    ],
    action:{url:"../docs/#quickstart",label:"Follow the Python quickstart",hint:"Read the short code example and the commands beneath it. Say out loud what each line does."},
    takeaway:"The core pipeline is connect → create table → search vector → apply metadata filter → limit → inspect results.",
    question:"What does .distance_type('cosine') do?",
    answer:"It selects cosine distance as the metric LanceDB uses to compare the query vector with stored vectors."
  },
  {
    id:"docs", title:"Why the documentation matters", time:"1–2 min",
    subtitle:"The differentiator is the complete developer experience.",
    paragraphs:[
      "Now open the documentation page you built. A good developer tutorial doesn't just say what a product can do. It helps someone get to a working result and explains how to tell whether that result is right.",
      "That's why your docs include prerequisites, install commands, a copyable Python quickstart, expected behavior, filtering examples, testing commands, and troubleshooting.",
      "You also created an architecture guide. It makes one critical boundary explicit: the browser simulation teaches the idea, while the Python sample demonstrates the actual LanceDB API. That prevents readers from misunderstanding what the page is running.",
      "The next step is quality. The repository includes pytest tests intended to check ingestion, ranking, filtering, and invalid options. It also includes a GitHub Actions workflow. However, the workflow hasn't been demonstrated as passing, so don't present the automated checks as verified until they succeed.",
      "Your value as a documentation engineer is that you turn an API into something developers can understand, run, and validate—and build systems to keep that guidance accurate when the product changes."
    ],
    action:{url:"../docs/",label:"Tour the developer documentation",hint:"Find Requirements, Quickstart, Query with filters, Automated validation, and Troubleshooting."},
    takeaway:"Docs engineering links runnable examples to prerequisites, expected behavior, tests, and clear limitations.",
    question:"Why are tests valuable in a documentation repository?",
    answer:"They can catch documentation drift when an SDK or API changes, before developers copy broken examples."
  },
  {
    id:"agents", title:"Explain AI-agent-ready documentation", time:"1–2 min",
    subtitle:"It's about executable instructions, not just feeding text to AI.",
    paragraphs:[
      "Next, open the AI-agent-ready documentation page. This isn't claiming that LanceDB's AI model is trained on your website. It's a playbook for giving a coding assistant an unambiguous task.",
      "The example task tells an agent exactly where to work, what source files to use, which libraries and inputs are allowed, how to search for the top two Agents-category records, and which commands prove the result.",
      "Think of it as giving the agent the same helpful information you'd give a human engineer—just more explicit. Define the goal, declare the environment, identify the source of truth, state the constraints, and provide a verification command.",
      "Then evaluate the result. Did the agent find the right file? Did it call the right API? Did the tests pass? Did it need human intervention? The page provides a proposed way to measure those outcomes; it doesn't claim a successful agent evaluation has already taken place.",
      "This is especially relevant to LanceDB because documentation increasingly serves human developers and coding agents working together."
    ],
    action:{url:"../docs/agent-readiness.html",label:"Open the AI-agent playbook",hint:"Read GOAL, SOURCES OF TRUTH, REQUIREMENTS, VERIFY, and DELIVER."},
    takeaway:"Agent-ready documentation specifies the task, constraints, authoritative files, success criteria, and verification steps.",
    question:"Does writing an agent prompt prove the agent completed the task?",
    answer:"No. You have to run an evaluation, collect the output, check tests, and report what actually succeeded."
  },
  {
    id:"interview", title:"Tell the story in the interview", time:"1–2 min",
    subtitle:"Practice a short, grounded explanation.",
    paragraphs:[
      "Now let's put it all together. Don't start your answer by listing every tool you used. Start with the reason you built it and the problem you wanted to solve.",
      "Here's a version you can say naturally: I wanted to understand LanceDB the same way a developer would, so I built a small lab around vector search and metadata filtering. The website lets someone experiment with the concepts, and the repo includes a separate Python example using the actual LanceDB library.",
      "Then say: I connected that to developer documentation that explains setup, expected behavior, troubleshooting, and testing. I also wrote an AI-agent task guide to make the workflow easier for coding assistants to follow and verify.",
      "And finish with: What interests me is not just writing about the API. It's making sure a developer can get something running, understand why it works, and have an example they can trust.",
      "If a technical interviewer asks what you would improve next, say you'd add a genuine text-embedding pipeline, real-world retrieval evaluation, and a clean CI run. That's a thoughtful next step, not a weakness you need to hide.",
      "All right. Pause the audio here. Try giving that answer in your own words, without reading. If you can explain the difference between simulation, real Python, and tested documentation, you're on solid ground."
    ],
    action:{url:"../",label:"Return to the lab",hint:"Try a sixty-second explanation while the interactive page is open."},
    takeaway:"Lead with the developer problem, show the actual implementation, connect it to documentation quality, and state limitations precisely.",
    question:"What is the strongest one-sentence pitch for your project?",
    answer:"I built a hands-on LanceDB learning lab that connects interactive retrieval concepts to real Python examples and developer- and agent-ready documentation."
  }
];

const $=id=>document.getElementById(id);
const chapterList=$("chapter-list");
const chapterTitle=$("chapter-title");
const chapterSubtitle=$("chapter-subtitle");
const transcript=$("transcript");
const chapterNumber=$("chapter-number");
const promptQuestion=$("prompt-question");
const promptAnswer=$("prompt-answer");
const takeaway=$("takeaway");
const tryLink=$("try-link");
const tryHint=$("try-hint");
const progressBar=$("progress-bar");
const progressLabel=$("progress-label");
const currentStatus=$("playback-status");
const playButton=$("play-button");
const pauseButton=$("pause-button");
const restartButton=$("restart-button");
const prevButton=$("previous-button");
const nextButton=$("next-button");
const revealButton=$("reveal-button");
const voiceSelect=$("voice-select");
const speedSelect=$("speed-select");
const autoNext=$("auto-next");
const fullTour=$("full-tour");
const supportNote=$("voice-support-note");

let index=0, paragraphIndex=0, token=0, speaking=false, paused=false, completed=new Set(), voiceItems=[];
const canSpeak=typeof window!=="undefined" && "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
const synth=canSpeak?window.speechSynthesis:null;

function setStatus(value){currentStatus.textContent=value;}
function resetAudio(){token++;if(synth)synth.cancel();speaking=false;paused=false;}
function lineHighlight(){
  transcript.querySelectorAll(".spoken").forEach((p,i)=>{
    const active=(speaking||paused)&&i===paragraphIndex;
    p.classList.toggle("reading",active);
    if(active)p.setAttribute("aria-current","true");else p.removeAttribute("aria-current");
  });
}
function controls(){
  playButton.disabled=!canSpeak||speaking;
  pauseButton.disabled=!canSpeak||!speaking;
  restartButton.disabled=!canSpeak;
  prevButton.disabled=index===0;
  nextButton.disabled=index===chapters.length-1;
  progressBar.style.width=((completed.size/chapters.length)*100)+"%";
  progressLabel.textContent=completed.size+" of "+chapters.length+" chapters completed";
  chapterList.querySelectorAll("button[data-index]").forEach(b=>{
    const n=Number(b.dataset.index);b.setAttribute("aria-current",n===index?"step":"false");
    b.querySelector(".done").textContent=completed.has(n)?"✓":"";
  });
  lineHighlight();
}
function drawChapter(next, autoplay=false){
  if(next<0||next>=chapters.length)return;
  resetAudio();index=next;paragraphIndex=0;
  const c=chapters[next];
  chapterTitle.textContent=c.title;
  chapterSubtitle.textContent=c.subtitle;
  chapterNumber.textContent="CHAPTER "+String(next+1).padStart(2,"0")+" / "+chapters.length;
  transcript.replaceChildren(...c.paragraphs.map(text=>{
    const p=document.createElement("p");p.className="spoken";p.textContent=text;return p;
  }));
  takeaway.textContent=c.takeaway;
  promptQuestion.textContent=c.question;
  promptAnswer.textContent=c.answer;
  promptAnswer.hidden=true;revealButton.setAttribute("aria-expanded","false");revealButton.textContent="Show a sample answer";
  tryLink.href=c.action.url;tryLink.textContent=c.action.label+" ↗";
  tryHint.textContent=c.action.hint;
  setStatus("Ready to listen");
  controls();
  if(autoplay)play();
}
function finishChapter(){
  speaking=false;paused=false;completed.add(index);
  setStatus("Chapter complete");
  controls();
  if(autoNext.checked && index<chapters.length-1)drawChapter(index+1,true);
}
function startParagraph(){
  if(!speaking||!canSpeak)return;
  const c=chapters[index];
  if(paragraphIndex>=c.paragraphs.length){finishChapter();return;}
  const myToken=token;
  const u=new SpeechSynthesisUtterance(c.paragraphs[paragraphIndex]);
  const selected=voiceItems.find(v=>v.voiceURI===voiceSelect.value);
  if(selected)u.voice=selected;
  u.lang=selected?.lang||"en-US";
  u.rate=Number(speedSelect.value)||0.96;
  u.pitch=1.0;u.volume=1;
  u.onstart=()=>{if(myToken===token){setStatus("Playing paragraph "+(paragraphIndex+1)+" of "+c.paragraphs.length);controls();}};
  u.onend=()=>{
    if(myToken!==token||!speaking)return;
    paragraphIndex++;
    if(paragraphIndex>=c.paragraphs.length){finishChapter();return;}
    controls();
    // Break between thoughts so narration isn't rushed or robotic.
    setTimeout(()=>{if(myToken===token&&speaking)startParagraph();},250);
  };
  u.onerror=e=>{
    if(myToken!==token||!speaking)return;
    speaking=false;
    setStatus("Voice playback stopped. Try Play or change the voice.");
    controls();
    if(e.error && e.error!=="canceled"&&e.error!=="interrupted")console.warn("Speech synthesis error:",e.error);
  };
  try{synth.speak(u);}catch{speaking=false;setStatus("Voice playback isn't available in this browser.");controls();}
  controls();
}
function play(){
  if(!canSpeak)return;
  if(speaking)return;
  if(paragraphIndex>=chapters[index].paragraphs.length)paragraphIndex=0;
  token++;speaking=true;paused=false;
  setStatus("Starting playback...");
  controls();
  startParagraph();
}
function pause(){
  if(!speaking)return;
  // Cancel-and-resume is more reliable than speechSynthesis.pause on iOS Safari.
  resetAudio();paused=true;
  setStatus("Paused. Play restarts the current paragraph.");
  controls();
}
function populateVoices(){
  if(!canSpeak)return;
  const all=synth.getVoices();
  const english=all.filter(v=>(v.lang||"").toLowerCase().startsWith("en"));
  if(!english.length){voiceSelect.innerHTML='<option value="">System voice (automatic)</option>';voiceItems=[];return;}
  const old=voiceSelect.value;
  voiceItems=english.sort((a,b)=>a.name.localeCompare(b.name));
  voiceSelect.replaceChildren();
  for(const voice of voiceItems){
    const option=document.createElement("option");
    option.value=voice.voiceURI;option.textContent=voice.name+" ("+voice.lang+")";
    voiceSelect.appendChild(option);
  }
  const prefer=voiceItems.find(v=>/(samantha|natural|premium|enhanced|ava|aria|jenny|google us english|allison)/i.test(v.name))||
    voiceItems.find(v=>/en[-_]US/i.test(v.lang))||voiceItems[0];
  voiceSelect.value=voiceItems.some(v=>v.voiceURI===old)?old:prefer.voiceURI;
}
function populateChapters(){
  chapterList.replaceChildren();
  chapters.forEach((c,i)=>{
    const li=document.createElement("li"),b=document.createElement("button");
    b.type="button";b.className="chapter-button";b.dataset.index=String(i);
    const n=document.createElement("span");n.className="chapter-index";n.textContent=String(i+1).padStart(2,"0");
    const name=document.createElement("span");name.className="chapter-name";name.textContent=c.title;
    const done=document.createElement("span");done.className="done";done.setAttribute("aria-label","Completed chapter");
    b.append(n,name,done);
    b.addEventListener("click",()=>drawChapter(i));
    li.appendChild(b);chapterList.appendChild(li);
  });
}
populateChapters();
playButton.addEventListener("click",play);
pauseButton.addEventListener("click",pause);
restartButton.addEventListener("click",()=>{drawChapter(index,true)});
prevButton.addEventListener("click",()=>drawChapter(index-1));
nextButton.addEventListener("click",()=>drawChapter(index+1));
revealButton.addEventListener("click",()=>{
  const shouldShow=promptAnswer.hidden;
  promptAnswer.hidden=!shouldShow;
  revealButton.setAttribute("aria-expanded",String(shouldShow));
  revealButton.textContent=shouldShow?"Hide sample answer":"Show a sample answer";
});
voiceSelect.addEventListener("change",()=>{if(speaking){pause();play();}});
speedSelect.addEventListener("change",()=>{if(speaking){pause();play();}});
fullTour.addEventListener("click",()=>{autoNext.checked=true;drawChapter(0,true)});
$("copy-script").addEventListener("click",async()=>{
  const text=chapters.map((c,i)=>"CHAPTER "+(i+1)+": "+c.title+"\n\n"+c.paragraphs.join("\n\n")+"\n\nTRY IT: "+c.action.label+"\n"+c.action.url+"\n\nKEY IDEA: "+c.takeaway).join("\n\n-----------------------------\n\n");
  const b=$("copy-script");const orig=b.textContent;
  try{await navigator.clipboard.writeText(text);b.textContent="Copied full transcript ✓"}
  catch{b.textContent="Copy unavailable — select the transcript text";}
  setTimeout(()=>b.textContent=orig,2300);
});
if(canSpeak){
  populateVoices();
  if("onvoiceschanged" in synth)synth.addEventListener("voiceschanged",populateVoices);
  supportNote.textContent="Audio uses your device's installed voices. Choose a voice you like; quality and availability depend on your browser and device. No recording or voice data is sent to this site.";
  window.addEventListener("pagehide",()=>resetAudio());
}else{
  supportNote.textContent="This browser doesn't support speech playback. You can still read every chapter, practice the prompts, or open the tutorial in Safari or Chrome.";
}
drawChapter(0);
