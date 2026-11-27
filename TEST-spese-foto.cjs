const assert=require("node:assert/strict");const window={};const CATS=["Hotel","Escursioni","Cibo","Trasporti","Mance","Altro"];const num=v=>window.ttNum(v);
window.ttNum = function (v) {
  if (typeof v === "number") return isFinite(v) ? v : 0;
  let s = String(v == null ? "" : v).trim().replace(/[\s€]/g, "");
  if (!s) return 0;
  const c = s.lastIndexOf(","), d = s.lastIndexOf(".");
  if (c >= 0 && d >= 0) s = c > d ? s.replace(/\./g, "").replace(",", ".") : s.replace(/,/g, "");
  else if (c >= 0) s = s.replace(/,/g, ".").replace(/\.(?=.*\.)/g, "");
  else if (d >= 0 && /^-?\d{1,3}(\.\d{3})+$/.test(s)) s = s.replace(/\./g, "");
  const n = parseFloat(s);
  return isFinite(n) ? n : 0;
};
function dayCosts(d){
  const rows=[]; const add=(cat,desc,value)=>{const n=num(value);if(n)rows.push([d.date,cat,desc,n]);};
  (d.food||[]).forEach(f=>add("Cibo",(f.meal+" "+(f.dish||"")).trim(),f.price));
  (d.places||[]).forEach(p=>add("Escursioni",p.name||"Luogo visitato",p.price));
  if(d.hotel)add("Hotel",d.hotel.name||"Hotel",d.hotel.price);
  (d.expenses||[]).forEach(e=>add(CATS.includes(e.cat)?e.cat:"Altro",e.desc,e.amount));
  return rows;
}

function memories(t){return (window.__atlante?.all()||[]).filter(e=>e.tripId===String(t.id))}
function diaryPhotos(t){const state=window.__diario?.state();let days=[];try{days=state?.trip?.id===t.id?state.days:JSON.parse(localStorage.getItem('tt2:dv:days:'+t.id)||'[]')}catch(e){}return days.flatMap(d=>[...(d.places||[]),...(d.food||[]),...(d.hotel?[d.hotel]:[])].flatMap(x=>(x.photos||[]).map(p=>typeof p==='string'?p:p?.url||(p?.id?'/_blob/'+p.id:'')).filter(Boolean)))}
function albumPhotos(t){return [...new Set([...memories(t).flatMap(e=>e.photos),...diaryPhotos(t)])]}

const d={date:'2026-12-03',food:[{meal:'Pranzo',price:'500'},{meal:'Cena',price:'400'}],hotel:{price:'2000'},places:[{price:'300'}],expenses:[]};
const sum=()=>dayCosts(d).reduce((a,r)=>a+r[3],0);
assert.equal(sum(),3200);assert.equal(dayCosts(d).filter(r=>r[1]==='Cibo').reduce((a,r)=>a+r[3],0),900);d.hotel.price='2500';assert.equal(sum(),3700);d.places=[];assert.equal(sum(),3400);assert.equal(sum()/340,10);assert.equal(num('33.000,50'),33000.5);
const t={id:'sri-lanka-2026'};window.__atlante={all:()=>[{tripId:t.id,photos:['/_blob/a']},{tripId:'other',photos:['/_blob/x']}]};window.__diario={state:()=>({trip:t,days:[{places:[{photos:[{id:'b'},{url:'/_blob/a'}]}],food:[],hotel:{photos:[]}}]})};assert.deepEqual(albumPhotos(t),['/_blob/a','/_blob/b']);assert.equal(memories(t).length,1);console.log('8 assertions passed');
