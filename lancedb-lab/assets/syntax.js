"use strict";
/* Lightweight syntax highlighting with no external CDN dependency.
   All snippets are plain text before tokenization, including dynamic lab output.
   Token spans preserve code.textContent so copying still yields valid source. */
(function () {
  const keywords = new Set(["import","from","as","for","in","if","else","elif","return","def","class","with","try","except","raise","assert","and","or","not","is","lambda","pass","while","yield","async","await","True","False","None"]);
  const builtins = new Set(["print","all","len","range","str","int","float","list","dict"]);
  function span(type, value) {
    const element = document.createElement("span");
    element.className = "syn-" + type;
    element.textContent = value;
    return element;
  }
  function tokenizeLine(line, type) {
    const out = document.createDocumentFragment();
    let i = 0;
    if (type === "shell") {
      const match = line.match(/^(\s*)(python3?|source|pip)(?=\s|$)/);
      if (match) {
        out.append(document.createTextNode(match[1]),span("keyword",match[2]));
        i = match[0].length;
      }
    }
    while (i < line.length) {
      const rest = line.slice(i);
      if (rest[0] === "#") {
        out.append(span("comment",rest));
        break;
      }
      if (rest[0] === "'" || rest[0] === '"') {
        const quote=rest[0];
        let end=1,escaped=false;
        for (;end<rest.length;end++) {
          const ch=rest[end];
          if (ch===quote && !escaped) {end++;break;}
          if (ch==="\\" && !escaped) escaped=true;
          else escaped=false;
        }
        out.append(span("string",rest.slice(0,end)));
        i+=end;continue;
      }
      const word=rest.match(/^[A-Za-z_][A-Za-z_0-9]*/);
      if(word) {
        const token=word[0];
        const style=keywords.has(token)?"keyword":builtins.has(token)?"builtin":null;
        out.append(style?span(style,token):document.createTextNode(token));
        i+=token.length;continue;
      }
      const number=rest.match(/^\b\d+(?:\.\d+)?\b/);
      if(number) {out.append(span("number",number[0]));i+=number[0].length;continue;}
      out.append(document.createTextNode(rest[0]));i++;
    }
    return out;
  }
  function highlightCode(code,type) {
    if (!code || code.dataset.highlighted === "true") return;
    const source=code.textContent;
    const output=document.createDocumentFragment();
    const lines=source.split("\n");
    lines.forEach((line,i)=>{
      if(i) output.append(document.createTextNode("\n"));
      output.append(tokenizeLine(line,type));
    });
    code.replaceChildren(output);
    code.dataset.highlighted="true";
    code.classList.add("syntax-highlighted");
  }
  window.highlightLabCode=function(code,type) {
    if(code) {delete code.dataset.highlighted;highlightCode(code,type||"python");}
  };
  document.querySelectorAll("pre code[data-language]").forEach(code=>highlightCode(code,code.dataset.language));
})();
