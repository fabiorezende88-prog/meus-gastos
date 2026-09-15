const K="meus_gastos_v3",BK="meus_gastos_orcamento",CBK="meus_gastos_orcamento_categoria";
let supabaseClient=null,currentUser=null,cloudBusy=false,remoteTimer=null;let E=JSON.parse(localStorage.getItem(K)||"[]"),B=JSON.parse(localStorage.getItem(BK)||"{}"),CB=JSON.parse(localStorage.getItem(CBK)||"{}"),M=new Date().toISOString().slice(0,7),T="variable",C="🍔 Alimentação",editingId=null,typeFilter="all",categoryFilter="all";
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
function save(){localStorage.setItem(K,JSON.stringify(E));localStorage.setItem(BK,JSON.stringify(B));localStorage.setItem(CBK,JSON.stringify(CB))}
function configured(){return window.SUPABASE_CONFIG&&window.SUPABASE_CONFIG.url&&window.SUPABASE_CONFIG.anonKey&&!window.SUPABASE_CONFIG.url.startsWith("COLE_AQUI")&&!window.SUPABASE_CONFIG.anonKey.startsWith("COLE_AQUI")}
function syncText(t){const el=$("syncStatus");if(el)el.textContent=t}
async function cloudUpsertAll(){if(!supabaseClient||!currentUser||cloudBusy)return;cloudBusy=true;syncText("Sincronizando…");try{
 const uid=currentUser.id;
 const expenses=E.map(x=>({id:x.id,user_id:uid,amount:x.value,type:x.type,category:x.category,description:x.description||"",expense_date:x.date,created_at:x.created||Date.now()}));
 if(expenses.length){const {error}=await supabaseClient.from("expenses").upsert(expenses,{onConflict:"id"});if(error)throw error}
 const budgets=Object.entries(B).flatMap(([month,amount])=>amount?[{user_id:uid,month,amount}]:[]);
 if(budgets.length){const {error}=await supabaseClient.from("budgets").upsert(budgets,{onConflict:"user_id,month"});if(error)throw error}
 const cb=Object.entries(CB).flatMap(([month,vals])=>Object.entries(vals||{}).map(([category,amount])=>({user_id:uid,month,category,amount})));
 if(cb.length){const {error}=await supabaseClient.from("category_budgets").upsert(cb,{onConflict:"user_id,month,category"});if(error)throw error}
 syncText("Sincronizado");
}catch(e){console.error(e);syncText("Erro ao sincronizar");alert("Não foi possível sincronizar agora. Verifique a conexão.");}finally{cloudBusy=false}}
async function cloudLoad(mergeLocal=false){if(!supabaseClient||!currentUser)return;syncText("Carregando dados…");try{const uid=currentUser.id;
 const [{data:ex,error:e1},{data:bu,error:e2},{data:cb,error:e3}]=await Promise.all([
  supabaseClient.from("expenses").select("id,amount,type,category,description,expense_date,created_at").eq("user_id",uid),
  supabaseClient.from("budgets").select("month,amount").eq("user_id",uid),
  supabaseClient.from("category_budgets").select("month,category,amount").eq("user_id",uid)
 ]);if(e1||e2||e3)throw(e1||e2||e3);
 if(mergeLocal){
   const cloudIds=new Set((ex||[]).map(x=>x.id));
   const localOnly=E.filter(x=>!cloudIds.has(x.id));
   if(localOnly.length){const rows=localOnly.map(x=>({id:x.id,user_id:uid,amount:x.value,type:x.type,category:x.category,description:x.description||"",expense_date:x.date,created_at:x.created||Date.now()}));const {error}=await supabaseClient.from("expenses").upsert(rows,{onConflict:"id"});if(error)throw error}
   const cloudMonths=new Set((bu||[]).map(x=>x.month));
   const budgetRows=Object.entries(B).filter(([m])=>!cloudMonths.has(m)).map(([month,amount])=>({user_id:uid,month,amount}));
   if(budgetRows.length){const {error}=await supabaseClient.from("budgets").upsert(budgetRows,{onConflict:"user_id,month"});if(error)throw error}
   const cloudCB=new Set((cb||[]).map(x=>x.month+"|"+x.category));
   const cbRows=Object.entries(CB).flatMap(([month,vals])=>Object.entries(vals||{}).filter(([category])=>!cloudCB.has(month+"|"+category)).map(([category,amount])=>({user_id:uid,month,category,amount})));
   if(cbRows.length){const {error}=await supabaseClient.from("category_budgets").upsert(cbRows,{onConflict:"user_id,month,category"});if(error)throw error}
   if(localOnly.length||budgetRows.length||cbRows.length){return cloudLoad(false)}
 }
 E=(ex||[]).map(x=>({id:x.id,value:Number(x.amount),type:x.type,category:x.category,description:x.description||"",date:x.expense_date,created:Number(x.created_at||Date.now())}));
 B={};(bu||[]).forEach(x=>B[x.month]=Number(x.amount));
 CB={};(cb||[]).forEach(x=>{(CB[x.month]||(CB[x.month]={}))[x.category]=Number(x.amount)});
 save();render();syncText("Sincronizado");
 }catch(e){console.error(e);syncText("Erro ao carregar dados");alert("Não foi possível carregar seus dados da nuvem. Confira o Supabase e as políticas de acesso.")}}
async function deleteCloudExpense(id){if(!supabaseClient||!currentUser)return;const {error}=await supabaseClient.from("expenses").delete().eq("id",id).eq("user_id",currentUser.id);if(error)console.error(error)}
async function deleteCloudMonth(month){if(!supabaseClient||!currentUser)return;await supabaseClient.from("expenses").delete().eq("user_id",currentUser.id).gte("expense_date",month+"-01").lt("expense_date",nextMonth(month)+"-01");await supabaseClient.from("budgets").delete().eq("user_id",currentUser.id).eq("month",month);await supabaseClient.from("category_budgets").delete().eq("user_id",currentUser.id).eq("month",month)}
function nextMonth(m){const d=new Date(m+"-01T12:00");d.setMonth(d.getMonth()+1);return d.toISOString().slice(0,7)}
function startRealtime(){if(!supabaseClient||!currentUser)return;supabaseClient.channel("meus-gastos-sync").on("postgres_changes",{event:"*",schema:"public",table:"expenses",filter:"user_id=eq."+currentUser.id},()=>cloudLoad(false)).on("postgres_changes",{event:"*",schema:"public",table:"budgets",filter:"user_id=eq."+currentUser.id},()=>cloudLoad(false)).on("postgres_changes",{event:"*",schema:"public",table:"category_budgets",filter:"user_id=eq."+currentUser.id},()=>cloudLoad(false)).subscribe()}
function showAuth(msg=""){ $("authScreen").classList.remove("hidden");$("appShell").classList.add("hidden");$("authStatus").textContent=msg}
function showApp(){$("authScreen").classList.add("hidden");$("appShell").classList.remove("hidden")}
async function initCloud(){
 if(!configured()){showAuth("A sincronização ainda não está configurada. Abra o arquivo config.js e coloque a URL e a chave anon do seu projeto Supabase.");return}
 const authStorage={
  async getItem(key){
    try{const v=window.localStorage.getItem(key);if(v)return v}catch(e){}
    try{const db=await new Promise((resolve,reject)=>{const r=indexedDB.open("meus_gastos_auth",1);r.onupgradeneeded=()=>r.result.createObjectStore("kv");r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)});const v=await new Promise((resolve,reject)=>{const t=db.transaction("kv","readonly");const r=t.objectStore("kv").get(key);r.onsuccess=()=>resolve(r.result||null);r.onerror=()=>reject(r.error)});db.close();if(v){try{window.localStorage.setItem(key,v)}catch(e){}return v}}catch(e){}
    return null;
  },
  async setItem(key,value){
    try{window.localStorage.setItem(key,value)}catch(e){}
    try{const db=await new Promise((resolve,reject)=>{const r=indexedDB.open("meus_gastos_auth",1);r.onupgradeneeded=()=>r.result.createObjectStore("kv");r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)});await new Promise((resolve,reject)=>{const t=db.transaction("kv","readwrite");t.objectStore("kv").put(value,key);t.oncomplete=resolve;t.onerror=()=>reject(t.error)});db.close()}catch(e){}
  },
  async removeItem(key){
    try{window.localStorage.removeItem(key)}catch(e){}
    try{const db=await new Promise((resolve,reject)=>{const r=indexedDB.open("meus_gastos_auth",1);r.onupgradeneeded=()=>r.result.createObjectStore("kv");r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)});await new Promise((resolve,reject)=>{const t=db.transaction("kv","readwrite");t.objectStore("kv").delete(key);t.oncomplete=resolve;t.onerror=()=>reject(t.error)});db.close()}catch(e){}
  }
};
supabaseClient=window.supabase.createClient(window.SUPABASE_CONFIG.url,window.SUPABASE_CONFIG.anonKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,storage:authStorage,storageKey:"meus_gastos_supabase_auth"}});
 const {data:{session}}=await supabaseClient.auth.getSession();
 if(session){currentUser=session.user;showApp();await cloudLoad(true);startRealtime();}
 else showAuth("Entre ou crie sua conta para usar a sincronização.");
 supabaseClient.auth.onAuthStateChange(async(_event,session)=>{if(session){currentUser=session.user;showApp();await cloudLoad(true);startRealtime()}else{currentUser=null;showAuth("Você saiu da conta.")}});
}
function render(){let all=E.filter(x=>x.date.slice(0,7)==M).sort((a,b)=>b.created-a.created),tot=all.reduce((s,x)=>s+x.value,0),fix=all.filter(x=>x.type=="fixed").reduce((s,x)=>s+x.value,0);let L=all.filter(x=>(typeFilter=="all"||x.type==typeFilter)&&(categoryFilter=="all"||x.category==categoryFilter));$("monthBtn").textContent=ml(M);$("total").textContent=money(tot);$("fixed").textContent=money(fix);$("variable").textContent=money(tot-fix);
$("list").innerHTML=L.length?L.map(x=>`<div class="expense"><div class="icon">${iconFor(x.category)}</div><div class="main"><b>${esc(x.description||x.category.slice(2))}</b><span>${x.type=="fixed"?"Fixa":"Variável"} · ${br(x.date)}</span></div><div class="amount">${money(x.value)}<button type="button" class="edit" onclick="edit('${x.id}')">Editar</button><button class="delete" onclick="del('${x.id}')">Excluir</button></div></div>`).join(""):`<div class="empty">Nenhuma despesa neste mês.<br>Toque em <b>+ GASTO</b> para começar.</div>`;
let b=B[M]||0,avail=b-tot;$("spent").textContent=money(tot);$("available").textContent=b?(avail>=0?"Disponível: "+money(avail):"Acima do orçamento: "+money(-avail)):"Sem orçamento";$("progress").style.width=(b?Math.min(tot/b*100,100):0)+"%";$("progress").classList.toggle("danger",b&&tot>b);
let s={};L.forEach(x=>s[x.category]=(s[x.category]||0)+x.value);let a=Object.entries(s).sort((x,y)=>y[1]-x[1]),mx=a[0]?.[1]||1;$("cats").innerHTML=a.length?a.map(([c,v])=>`<div class="cat"><div class="icon">${iconFor(c)}</div><div class="name">${esc(c.slice(2))}<div class="bar"><i style="width:${v/mx*100}%"></i></div></div><b>${money(v)}</b></div>`).join(""):`<div class="empty">Sem gastos neste mês.</div>`;
// Relatório mensal
let d=new Date(M+"-01T12:00"),ms=[];for(let i=5;i>=0;i--){let q=new Date(d.getFullYear(),d.getMonth()-i,1);ms.push(q.toISOString().slice(0,7))}let vs=ms.map(m=>E.filter(x=>x.date.slice(0,7)==m).reduce((s,x)=>s+x.value,0)),max=Math.max(...vs,1);$("chart").innerHTML=ms.map((m,i)=>`<div class="barcol"><i style="height:${vs[i]/max*120}px" title="${money(vs[i])}"></i><span>${new Date(m+"-01T12:00").toLocaleDateString("pt-BR",{month:"short"}).replace(".","")}</span></div>`).join("")}

// Relatório mensal

function allCategories(){return [...cats.variable,...cats.fixed]}
function categoryLabel(c){return String(c).replace(/^[^ ]+\s/,"")}
function renderCategoryBudgets(){
  const box=$("categoryBudgets");
  if(!box)return;
  const monthExpenses=E.filter(x=>x.date.slice(0,7)==M);
  const spent={};
  monthExpenses.forEach(x=>spent[x.category]=(spent[x.category]||0)+Number(x.value||0));
  const limits=CB[M]||{};
  const categories=[...new Set([...allCategories(),...Object.keys(limits)])];
  box.innerHTML=categories.map(c=>{
    const s=spent[c]||0, b=Number(limits[c]||0), r=b-s;
    const pct=b?Math.min((s/b)*100,100):0;
    const state=!b?"none":r<0?"over":r<=b*.2?"warn":"ok";
    const text=!b?"Sem limite":r<0?"Ultrapassado":r<=b*.2?"Atenção":"Dentro do limite";
    return `<div class="cat-budget"><div class="cat-budget-head"><div class="cat-budget-name"><span class="mini-icon">${iconFor(c)}</span><span>${esc(categoryLabel(c))}</span></div><button type="button" class="cat-budget-edit" onclick="openCategoryBudget('${esc(c).replace(/'/g,"\\'")}')">${b?"Alterar":"Definir"}</button></div><div class="cat-budget-values"><span>Gasto: <b>${money(s)}</b></span><span>${b?`Limite: <b>${money(b)}</b>`:"Nenhum limite definido"}</span></div>${b?`<div class="cat-budget-bar"><i class="${state}" style="width:${pct}%"></i></div><div class="cat-budget-foot"><span class="${state}">${text}</span><b class="${state}">${r>=0?`Restante: ${money(r)}`:`Excesso: ${money(-r)}`}</b></div>`:`<div class="cat-budget-foot"><span class="none">Defina um limite para acompanhar</span><span></span></div>`}</div>`;
  }).join("");
}
function openCategoryBudget(category){
  $("categoryBudgetTitle").textContent="Orçamento — "+categoryLabel(category);
  $("categoryBudgetCategory").value=category;
  const current=(CB[M]&&CB[M][category])||"";
  $("categoryBudgetValue").value=current?String(current).replace(".",","):"";
  $("categoryBudgetModal").classList.remove("hidden");
  setTimeout(()=>$("categoryBudgetValue").focus(),50);
}

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
  if(prevTotal===0 && total===0) { comp.textContent="Sem gastos nos dois meses"; const st=$("summaryTrend"); if(st) st.querySelector("b").textContent="—"; }
  else if(prevTotal===0) { comp.textContent="Novo gasto neste mês"; comp.className="negative"; const st=$("summaryTrend"); if(st) {st.querySelector("b").textContent="NOVO"; st.querySelector("b").style.color="#16d887";} }
  else { const pct=((total-prevTotal)/prevTotal)*100; const arrow=pct>0?"↑ ":pct<0?"↓ ":""; comp.textContent=arrow+Math.abs(pct).toFixed(1).replace(".",",")+"%"; comp.className=pct>0?"negative":pct<0?"positive":""; const st=$("summaryTrend"); if(st){st.querySelector("b").textContent=arrow+Math.abs(pct).toFixed(0)+"%"; st.querySelector("b").style.color=pct>0?"#ffb3bd":"#16d887";} }
}
function renderCats(){$("categoryButtons").innerHTML=cats[T].map(c=>`<button class="${c==C?"selected":""}" onclick="choose('${c.replace(/'/g,"\\'")}')">${iconFor(c)}<span>${c.replace(/^[^ ]+\s/,"")}</span></button>`).join("")}
function choose(c){C=c;renderCats()}function br(d){return new Date(d+"T12:00").toLocaleDateString("pt-BR")}function esc(s){return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
function del(id){if(confirm("Excluir esta despesa?")){E=E.filter(x=>x.id!=id);save();deleteCloudExpense(id).then(()=>cloudLoad(false))}}
function openNew(){editingId=null;$("modalTitle").textContent="Novo gasto";$("save").textContent="SALVAR GASTO";$("value").value="";$("desc").value="";T="variable";document.querySelectorAll(".toggle button").forEach(x=>x.classList.toggle("on",x.dataset.t==T));C=cats[T][0];$("modal").classList.remove("hidden");renderCats();$("value").focus()}
function edit(id){let x=E.find(e=>e.id==id);if(!x)return;editingId=id;T=x.type;C=x.category;$("modalTitle").textContent="Editar gasto";$("save").textContent="SALVAR ALTERAÇÕES";$("value").value=String(x.value).replace(".",",");$("desc").value=x.description||"";document.querySelectorAll(".toggle button").forEach(b=>b.classList.toggle("on",b.dataset.t==T));$("modal").classList.remove("hidden");renderCats();$("value").focus()}
$("addBtn").onclick=openNew;$("close").onclick=()=>{$("modal").classList.add("hidden");editingId=null};
document.querySelectorAll(".toggle button").forEach(b=>b.onclick=()=>{T=b.dataset.t;document.querySelectorAll(".toggle button").forEach(x=>x.classList.toggle("on",x==b));C=cats[T][0];renderCats()});
$("save").onclick=()=>{let v=pm($("value").value);if(!v||v<=0)return alert("Digite um valor válido.");if(editingId){let x=E.find(e=>e.id==editingId);if(x){x.value=v;x.type=T;x.category=C;x.description=$("desc").value.trim()}}else{E.push({id:crypto.randomUUID(),value:v,type:T,category:C,description:$("desc").value.trim(),date:M==new Date().toISOString().slice(0,7)?new Date().toISOString().slice(0,10):M+"-01",created:Date.now()})}save();cloudUpsertAll();$("value").value="";$("desc").value="";$("modal").classList.add("hidden");editingId=null;render()};
$("clearBtn").onclick=()=>{if(confirm("Apagar todas as despesas deste mês?")){E=E.filter(x=>x.date.slice(0,7)!=M);delete B[M];delete CB[M];save();deleteCloudMonth(M).then(()=>cloudLoad(false));render()}};
$("budgetBtn").onclick=()=>{$("budgetModal").classList.remove("hidden");$("budgetValue").value=B[M]?String(B[M]).replace(".",","):""};$("budgetClose").onclick=()=>$("budgetModal").classList.add("hidden");
$("budgetSave").onclick=()=>{let v=pm($("budgetValue").value);if(!v||v<=0)return alert("Digite um orçamento válido.");B[M]=v;save();cloudUpsertAll();$("budgetModal").classList.add("hidden");render()};
$("monthBtn").onclick=()=>{$("months").classList.remove("hidden");$("monthList").innerHTML=Array.from({length:12},(_,i)=>{let d=new Date();d.setDate(1);d.setMonth(d.getMonth()-i);let m=d.toISOString().slice(0,7);return `<button class="monthOpt ${m==M?"sel":""}" onclick="selMonth('${m}')">${ml(m)}</button>`}).join("")};$("monthsClose").onclick=()=>$("months").classList.add("hidden");
function selMonth(m){M=m;$("months").classList.add("hidden");render()}
function populateCategoryFilter(){let vals=[...new Set(E.filter(x=>x.date.slice(0,7)==M).map(x=>x.category))];$("categoryFilter").innerHTML='<option value="all">Todas as categorias</option>'+vals.map(c=>`<option value="${esc(c)}">${esc(c.replace(/^[^ ]+\s/,""))}</option>`).join("");$("categoryFilter").value=vals.includes(categoryFilter)?categoryFilter:"all";categoryFilter=$("categoryFilter").value}
document.querySelectorAll(".filter-pill").forEach(b=>b.onclick=()=>{typeFilter=b.dataset.type;document.querySelectorAll(".filter-pill").forEach(x=>x.classList.remove("active"));b.classList.add("active");render()});
$("categoryFilter").onchange=()=>{categoryFilter=$("categoryFilter").value;render()};
const oldRender=render;render=function(){populateCategoryFilter();oldRender();renderReport();renderCategoryBudgets()};$("categoryBudgetClose").onclick=()=>$("categoryBudgetModal").classList.add("hidden");
$("categoryBudgetCancel").onclick=()=>$("categoryBudgetModal").classList.add("hidden");
$("categoryBudgetSave").onclick=()=>{
  const category=$("categoryBudgetCategory").value;
  const v=pm($("categoryBudgetValue").value);
  if(!v||v<=0){alert("Digite um orçamento válido.");return;}
  if(!CB[M])CB[M]={};
  CB[M][category]=v;
  save();
  cloudUpsertAll();
  $("categoryBudgetModal").classList.add("hidden");
  render();
};

$("loginBtn").onclick=async()=>{if(!supabaseClient)return;const email=$("authEmail").value.trim(),password=$("authPassword").value;if(!email||!password){$("authStatus").textContent="Informe e-mail e senha.";return}$("authStatus").textContent="Entrando…";const {error}=await supabaseClient.auth.signInWithPassword({email,password});if(error)$("authStatus").textContent="Não foi possível entrar: "+error.message};
$("signupBtn").onclick=async()=>{if(!supabaseClient)return;const email=$("authEmail").value.trim(),password=$("authPassword").value;if(!email||password.length<6){$("authStatus").textContent="Informe um e-mail e uma senha com pelo menos 6 caracteres.";return}$("authStatus").textContent="Criando conta…";const {data,error}=await supabaseClient.auth.signUp({email,password});if(error)$("authStatus").textContent="Não foi possível criar a conta: "+error.message;else $("authStatus").textContent=data.session?"Conta criada. Entrando…":"Conta criada. Verifique seu e-mail para confirmar a conta."};
$("logoutBtn").onclick=async()=>{if(supabaseClient)await supabaseClient.auth.signOut()};
// Inicia o aplicativo conectado à nuvem.
initCloud();
