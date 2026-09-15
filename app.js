const K="meus_gastos_v3",BK="meus_gastos_orcamento";let E=JSON.parse(localStorage.getItem(K)||"[]"),B=JSON.parse(localStorage.getItem(BK)||"{}"),M=new Date().toISOString().slice(0,7),T="variable",C="🍔 Alimentação",editingId=null,typeFilter="all",categoryFilter="all";
const cats={variable:["🍔 Alimentação","🛒 Mercado","⛽ Transporte","🎮 Lazer","👕 Roupas","💊 Farmácia","🐶 Pet","📦 Outros"],fixed:["🏠 Moradia","⚡ Contas","🌐 Internet","📱 Celular","🎓 Faculdade","🚗 Financiamento","🛡️ Seguro","📺 Assinaturas"]},
iconSvg={
"Alimentação":'<path d="M7 3v7M10 3v7M7 6h3M8.5 10v11M17 3v8a3 3 0 0 0 3 3h0V3M20 14v7"/>',
"Mercado":'<path d="M3 5h2l2 11h10l3-8H6M9 20a1 1 0 1 0 0 2 1 1 0 0 0 0-2M17 20a1 1 0 1 0 0 2 1 1 0 0 0 0-2"/>',
"Transporte":'<path d="M5 17h14l-1-8H6l-1 8ZM8 17v2m8-2v2M7 9l1-4h8l1 4M7 13h2m6 0h2"/>',
"Lazer":'<path d="M7 8h10a4 4 0 0 1 3.8 5.2l-1.2 4A2.5 2.5 0 0 1 15.2 19L12 16l-3.2 3a2.5 2.5 0 0 1-4.4-1.8l-1.2-4A4 4 0 0 1 7 8ZM8 11v4M6 13h4M16 12h.01M18 14h.01"/>',
"Roupas":'<path d="m9 4-4 2-2 5 4 2v8h10v-8l4-2-2-5-4-2c-.5 2-5.5 2-6 0Z"/>',
"Farmácia":'<path d="M8 3h8M9 3v3h6V3M7 6h10a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V9a3 3 0 0 1 3-3ZM8 13h8M12 9v8"/>',
"Pet":'<path d="M7 11c-2 0-3-2-2-4s3-2 4 0c1-2 3-2 4 0 1-2 3-1 4 1 1 2 0 4-2 4-1 0-2 1-3 2-1 1-2 1-3 0-1-1-2-2-3-2Z"/>',
"Outros":'<path d="M4 7h16v13H4zM4 7l3-3h10l3 3M9 11h6v5H9z"/>',
"Moradia":'<path d="m3 11 9-8 9 8v9H4v-9ZM9 20v-6h6v6"/>',
"Contas":'<path d="m13 2-9 11h7l-1 9 9-12h-7l1-8Z"/>',
"Internet":'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
"Celular":'<rect x="7" y="2" width="10" height="20" rx="2"/><path d="M11 18h2"/>',
"Faculdade":'<path d="m3 9 9-5 9 5-9 5-9-5ZM7 12v5c3 2 7 2 10 0v-5"/>',
"Financiamento":'<path d="M5 16h14l-1-7H6l-1 7ZM7 9l1-4h8l1 4M7 16v3m10-3v3M4 16h16"/>',
"Seguro":'<path d="M12 3 20 6v6c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6l8-3Z"/>',
"Assinaturas":'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m10 9 5 3-5 3V9Z"/>'
},
iconFor=c=>{let n=String(c).replace(/^[^ ]+\s/,'');return `<svg class="catSvg" viewBox="0 0 24 24" aria-hidden="true">${iconSvg[n]||iconSvg["Outros"]}</svg>`},
$=x=>document.getElementById(x),money=n=>new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(n),ml=m=>{let[a,b]=m.split("-");return new Date(+a,+b-1,1).toLocaleDateString("pt-BR",{month:"long",year:"numeric"})},pm=v=>parseFloat(v.replace(/[^\d,.-]/g,"").replace(/\./g,"").replace(",","."));

function getMonthlyReportData(month) {
  const list = expenses.filter(e => String(e.date || "").slice(0, 7) === month);
  const total = list.reduce((s,e) => s + Number(e.amount || 0), 0);
  const fixed = list.filter(e => e.type === "fixed").reduce((s,e) => s + Number(e.amount || 0), 0);
  const variable = list.filter(e => e.type === "variable").reduce((s,e) => s + Number(e.amount || 0), 0);
  return { list, total, fixed, variable };
}

function save(){localStorage.setItem(K,JSON.stringify(E));localStorage.setItem(BK,JSON.stringify(B))}
function render(){let all=E.filter(x=>x.date.slice(0,7)==M).sort((a,b)=>b.created-a.created),tot=all.reduce((s,x)=>s+x.value,0),fix=all.filter(x=>x.type=="fixed").reduce((s,x)=>s+x.value,0);let L=all.filter(x=>(typeFilter=="all"||x.type==typeFilter)&&(categoryFilter=="all"||x.category==categoryFilter));$("monthBtn").textContent=ml(M);$("total").textContent=money(tot);$("fixed").textContent=money(fix);$("variable").textContent=money(tot-fix);
$("list").innerHTML=L.length?L.map(x=>`<div class="expense"><div class="icon">${iconFor(x.category)}</div><div class="main"><b>${esc(x.description||x.category.slice(2))}</b><span>${x.type=="fixed"?"Fixa":"Variável"} · ${br(x.date)}</span></div><div class="amount">${money(x.value)}<button type="button" class="edit" onclick="edit('${x.id}')">Editar</button><button class="delete" onclick="del('${x.id}')">Excluir</button></div></div>`).join(""):`<div class="empty">Nenhuma despesa neste mês.<br>Toque em <b>+ GASTO</b> para começar.</div>`;
let b=B[M]||0,avail=b-tot;$("spent").textContent=money(tot);$("available").textContent=b?(avail>=0?"Disponível: "+money(avail):"Acima do orçamento: "+money(-avail)):"Sem orçamento";$("progress").style.width=(b?Math.min(tot/b*100,100):0)+"%";$("progress").classList.toggle("danger",b&&tot>b);
let s={};L.forEach(x=>s[x.category]=(s[x.category]||0)+x.value);let a=Object.entries(s).sort((x,y)=>y[1]-x[1]),mx=a[0]?.[1]||1;$("cats").innerHTML=a.length?a.map(([c,v])=>`<div class="cat"><div class="icon">${iconFor(c)}</div><div class="name">${esc(c.slice(2))}<div class="bar"><i style="width:${v/mx*100}%"></i></div></div><b>${money(v)}</b></div>`).join(""):`<div class="empty">Sem gastos neste mês.</div>`;
// Relatório mensal
function renderReport(){
  const current=E.filter(x=>x.date.slice(0,7)==M);
  const total=current.reduce((s,x)=>s+x.value,0);
  const fixed=current.filter(x=>x.type=="fixed").reduce((s,x)=>s+x.value,0);
  const variable=total-fixed;
  const budget=B[M]||0;
  const available=budget-total;
  const d=new Date(M+"-01T12:00");
  const prev=new Date(d.getFullYear(),d.getMonth()-1,1).toISOString().slice(0,7);
  const prevTotal=E.filter(x=>x.date.slice(0,7)==prev).reduce((s,x)=>s+x.value,0);
  $("reportMonth").textContent=ml(M);
  $("reportTotal").textContent=money(total);
  $("reportFixed").textContent=money(fixed);
  $("reportVariable").textContent=money(variable);
  $("reportBudget").textContent=budget?money(budget):"Não definido";
  $("reportAvailable").textContent=budget?(available>=0?money(available):"- "+money(-available)):"—";
  $("reportAvailable").className=budget?(available>=0?"positive":"negative"):"";
  const comp=$("comparisonValue");
  comp.className="";
  if(prevTotal===0 && total===0) comp.textContent="Sem gastos nos dois meses";
  else if(prevTotal===0) { comp.textContent="Novo gasto neste mês"; comp.className="negative"; }
  else { const pct=((total-prevTotal)/prevTotal)*100; const arrow=pct>0?"↑ ":pct<0?"↓ ":""; comp.textContent=arrow+Math.abs(pct).toFixed(1).replace(".",",")+"%"; comp.className=pct>0?"negative":pct<0?"positive":""; }
}

let d=new Date(M+"-01T12:00"),ms=[];for(let i=5;i>=0;i--){let q=new Date(d.getFullYear(),d.getMonth()-i,1);ms.push(q.toISOString().slice(0,7))}let vs=ms.map(m=>E.filter(x=>x.date.slice(0,7)==m).reduce((s,x)=>s+x.value,0)),max=Math.max(...vs,1);$("chart").innerHTML=ms.map((m,i)=>`<div class="barcol"><i style="height:${vs[i]/max*120}px" title="${money(vs[i])}"></i><span>${new Date(m+"-01T12:00").toLocaleDateString("pt-BR",{month:"short"}).replace(".","")}</span></div>`).join("")}
function renderCats(){$("categoryButtons").innerHTML=cats[T].map(c=>`<button class="${c==C?"selected":""}" onclick="choose('${c.replace(/'/g,"\\'")}')">${iconFor(c)}<span>${c.replace(/^[^ ]+\s/,"")}</span></button>`).join("")}
function choose(c){C=c;renderCats()}function br(d){return new Date(d+"T12:00").toLocaleDateString("pt-BR")}function esc(s){return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
function del(id){if(confirm("Excluir esta despesa?")){E=E.filter(x=>x.id!=id);save();render()}}
function openNew(){editingId=null;$("modalTitle").textContent="Novo gasto";$("save").textContent="SALVAR GASTO";$("value").value="";$("desc").value="";T="variable";document.querySelectorAll(".toggle button").forEach(x=>x.classList.toggle("on",x.dataset.t==T));C=cats[T][0];$("modal").classList.remove("hidden");renderCats();$("value").focus()}
function edit(id){let x=E.find(e=>e.id==id);if(!x)return;editingId=id;T=x.type;C=x.category;$("modalTitle").textContent="Editar gasto";$("save").textContent="SALVAR ALTERAÇÕES";$("value").value=String(x.value).replace(".",",");$("desc").value=x.description||"";document.querySelectorAll(".toggle button").forEach(b=>b.classList.toggle("on",b.dataset.t==T));$("modal").classList.remove("hidden");renderCats();$("value").focus()}
$("addBtn").onclick=openNew;$("close").onclick=()=>{$("modal").classList.add("hidden");editingId=null};
document.querySelectorAll(".toggle button").forEach(b=>b.onclick=()=>{T=b.dataset.t;document.querySelectorAll(".toggle button").forEach(x=>x.classList.toggle("on",x==b));C=cats[T][0];renderCats()});
$("save").onclick=()=>{let v=pm($("value").value);if(!v||v<=0)return alert("Digite um valor válido.");if(editingId){let x=E.find(e=>e.id==editingId);if(x){x.value=v;x.type=T;x.category=C;x.description=$("desc").value.trim()}}else{E.push({id:crypto.randomUUID(),value:v,type:T,category:C,description:$("desc").value.trim(),date:M==new Date().toISOString().slice(0,7)?new Date().toISOString().slice(0,10):M+"-01",created:Date.now()})}save();$("value").value="";$("desc").value="";$("modal").classList.add("hidden");editingId=null;render()};
$("clearBtn").onclick=()=>{if(confirm("Apagar todas as despesas deste mês?")){E=E.filter(x=>x.date.slice(0,7)!=M);save();render()}};
$("budgetBtn").onclick=()=>{$("budgetModal").classList.remove("hidden");$("budgetValue").value=B[M]?String(B[M]).replace(".",","):""};$("budgetClose").onclick=()=>$("budgetModal").classList.add("hidden");
$("budgetSave").onclick=()=>{let v=pm($("budgetValue").value);if(!v||v<=0)return alert("Digite um orçamento válido.");B[M]=v;save();$("budgetModal").classList.add("hidden");render()};
$("monthBtn").onclick=()=>{$("months").classList.remove("hidden");$("monthList").innerHTML=Array.from({length:12},(_,i)=>{let d=new Date();d.setDate(1);d.setMonth(d.getMonth()-i);let m=d.toISOString().slice(0,7);return `<button class="monthOpt ${m==M?"sel":""}" onclick="selMonth('${m}')">${ml(m)}</button>`}).join("")};$("monthsClose").onclick=()=>$("months").classList.add("hidden");
function selMonth(m){M=m;$("months").classList.add("hidden");render()}
function populateCategoryFilter(){let vals=[...new Set(E.filter(x=>x.date.slice(0,7)==M).map(x=>x.category))];$("categoryFilter").innerHTML='<option value="all">Todas as categorias</option>'+vals.map(c=>`<option value="${esc(c)}">${esc(c.replace(/^[^ ]+\s/,""))}</option>`).join("");$("categoryFilter").value=vals.includes(categoryFilter)?categoryFilter:"all";categoryFilter=$("categoryFilter").value}
document.querySelectorAll(".filter-pill").forEach(b=>b.onclick=()=>{typeFilter=b.dataset.type;document.querySelectorAll(".filter-pill").forEach(x=>x.classList.remove("active"));b.classList.add("active");render()});
$("categoryFilter").onchange=()=>{categoryFilter=$("categoryFilter").value;render()};
const oldRender=render;render=function(){populateCategoryFilter();oldRender();renderReport()};render();