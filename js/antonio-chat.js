(function(){'use strict';
const panel=document.getElementById('antonioPanel'),overlay=document.getElementById('antonioFondo'),form=document.getElementById('antonioForm');
const messages=document.getElementById('antonioMensajes'),input=document.getElementById('antonioTexto'),submit=document.getElementById('antonioEnviar'),status=document.getElementById('antonioEstado'),contextBox=document.getElementById('antonioContexto');
let context={},history=[],busy=false;
function add(role,content){const item=document.createElement('div');item.className='antonio-burbuja '+(role==='user'?'user':'model');const title=document.createElement('span');title.className='antonio-role';title.textContent=role==='user'?'Tú':'Antonio IA';const body=document.createElement('div');if(role==='model'&&window.AntonioRender){window.AntonioRender.render(body,content);}else{body.textContent=content;}item.append(title,body);messages.append(item);messages.scrollTop=messages.scrollHeight;}
function open(ctx){context=ctx||{};panel.classList.add('abierto');panel.setAttribute('aria-hidden','false');overlay.hidden=false;const desc=context.exerciseStatement?('Ejercicio '+(context.exerciseId||'')+': '+context.exerciseStatement):'';contextBox.textContent=desc.length>350?desc.slice(0,350)+'…':desc;contextBox.hidden=!desc;input.focus();}
function close(){panel.classList.remove('abierto');panel.setAttribute('aria-hidden','true');overlay.hidden=true;}
function reset(){history=[];context={};messages.textContent='';contextBox.hidden=true;add('model','¿Qué concepto quieres comprender? Podemos empezar identificando qué variables y qué objetivo de análisis tienes.');}
async function send(event){event.preventDefault();if(busy)return;const text=input.value.trim();if(!text)return;const endpoint=(window.ANTONIO_IA_CONFIG||{}).endpoint;
if(!endpoint){status.textContent='El profesorado debe configurar la URL del servidor.';return;}
const recent=history.slice(-8);add('user',text);input.value='';busy=true;submit.disabled=true;status.textContent='Antonio está pensando…';
try{const response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:text,history:recent,...context})});const data=await response.json().catch(()=>({}));if(!response.ok)throw Error(data.error||'Servicio no disponible');const reply=data.reply||'No he podido generar una respuesta.';add('model',reply);history.push({role:'user',content:text},{role:'model',content:reply});status.textContent='Respuesta generada con Gemini.';}
catch(err){add('model','No he podido atender esta consulta: '+(err.message||'Error de conexión')+'.');status.textContent='Error temporal.';}finally{busy=false;submit.disabled=false;input.focus();}}
document.getElementById('antonioCerrar').addEventListener('click',close);overlay.addEventListener('click',close);document.getElementById('antonioNueva').addEventListener('click',reset);form.addEventListener('submit',send);document.addEventListener('keydown',e=>{if(e.key==='Escape')close();});input.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();form.requestSubmit();}});
window.AntonioIA={abrir:open,cerrar:close};reset();
})();
