const key="meus_gastos_v1";
let expenses=JSON.parse(localStorage.getItem(key)||"[]");
let type="variable", category="Alimentação";
const cats={variable:["🍔 Alimentação","🛒 Mercado","⛽ Transporte","🎮 Lazer","👕 Roupas","💊 Farmácia","🐶 Pet","📦 Outros"],fixed:["🏠 Moradia","⚡ Contas","🌐 Internet","📱 Celular","🎓 Faculdade","🚗 Financiamento","🛡️ Seguro","📺 Assinaturas"]};
const $=id=>document.getElementById(id);
const money=n=>new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(n);
function monthKey(d=new Date()){return d.toISOString().slice(0,7)}
function render(){
 const m=monthKey(), list=expenses.filter(x=>x.date.slice(0,7)===m);
 const total=list.reduce((s,x)=>s+x.value,0), fixed=list.filter(x=>x.type==="fixed").reduce((s,x)=>s+x.value,0);
 $("total").textContent=money(total);$("fixedTotal").textContent=money(fixed);$("variableTotal").textContent=money(total-fixed);
 $("monthBtn").textContent=new Date().toLocaleDateString("pt-BR",{month:"long",year:"numeric"});
 $("expenseList").innerHTML=list.length?list.sort((a,b)=>b.created-a.created).map(x=>`<div class="expense"><div class="icon">${x.category.split(" ")[0]}</div><div class="expense-main"><b>${escapeHtml(x.description||x.category.slice(2))}</b><span>${x.type==="fixed"?"Fixa":"Variável"} · ${new Date(x.date+"T12:00").toLocaleDateString("pt-BR")}</span></div><div class="expense-value">${money(x.value)}<button class="delete" onclick="del('${x.id}')">Excluir</button></div></div>`).join(""):"<div class='empty'>Nenhuma despesa cadastrada neste mês.<br>Toque em <b>+ GASTO</b> para começar.</div>";
}
function renderCats(){ $("categories").innerHTML=cats[type].map(c=>`<button class="${c.endsWith(category)||c===category?'active':''}" onclick="chooseCat('${c.replace(/'/g,"\\'")}')">${c}</button>`).join("")}
function chooseCat(c){category=c;renderCats()}
function del(id){expenses=expenses.filter(x=>x.id!==id);localStorage.setItem(key,JSON.stringify(expenses));render()}
function escapeHtml(s){return s.replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
$("addBtn").onclick=()=>{$("modal").classList.remove("hidden");$("value").focus();renderCats()}
$("closeBtn").onclick=()=>$("modal").classList.add("hidden");
$("modal").onclick=e=>{if(e.target===$("modal"))$("modal").classList.add("hidden")};
document.querySelectorAll(".toggle button").forEach(b=>b.onclick=()=>{type=b.dataset.type;document.querySelectorAll(".toggle button").forEach(x=>x.classList.toggle("active",x===b));category=cats[type][0];renderCats()});
$("saveBtn").onclick=()=>{
 let raw=$("value").value.replace(/[^\d,.-]/g,"").replace(".","").replace(",",".");
 let value=parseFloat(raw); if(!value||value<=0){alert("Digite um valor válido.");return}
 expenses.push({id:crypto.randomUUID(),value,type,category,description:$("description").value.trim(),date:new Date().toISOString().slice(0,10),created:Date.now()});
 localStorage.setItem(key,JSON.stringify(expenses));$("value").value="";$("description").value="";$("modal").classList.add("hidden");render()
};
$("clearBtn").onclick=()=>{if(confirm("Apagar todas as despesas deste mês?")){expenses=expenses.filter(x=>x.date.slice(0,7)!==monthKey());localStorage.setItem(key,JSON.stringify(expenses));render()}};
render();