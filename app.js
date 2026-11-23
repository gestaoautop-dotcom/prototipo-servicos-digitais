(function(){
'use strict';
const $ = (s, el=document) => el.querySelector(s);
const $$ = (s, el=document) => [...el.querySelectorAll(s)];
const main = $('#conteudo');
let cidade = CIDADES[localStorage.getItem('cidade') || 'canoas'] || CIDADES.canoas;
let map = null;

const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm = s => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
function toast(msg){ const t=$('#toast'); t.textContent=msg; t.classList.add('show'); clearTimeout(toast._t); toast._t=setTimeout(()=>t.classList.remove('show'),3200); }

/* ---------- Cidade / tema ---------- */
function aplicaCidade(){
  const r = document.documentElement.style;
  r.setProperty('--c', cidade.cor); r.setProperty('--c2', cidade.cor2); r.setProperty('--soft', cidade.corSoft); r.setProperty('--ac', cidade.acento);
  $$('[data-city-name]').forEach(e=>e.textContent=cidade.nome);
  $$('.city-switch button').forEach(b=>b.setAttribute('aria-pressed', b.dataset.city===cidade.id));
  document.title = `${cidade.nome} Digital — Protótipo conceitual (proposta de Caroline Wilhelm S.)`;
}
$$('.city-switch button').forEach(b=>b.addEventListener('click',()=>{ cidade=CIDADES[b.dataset.city]; localStorage.setItem('cidade',cidade.id); aplicaCidade(); render(); toast(`Tema alterado para ${cidade.nome} (protótipo)`); }));
/* acessibilidade */
let fs = +localStorage.getItem('fs') || 16;
const setFs = v => { fs=Math.max(14,Math.min(22,v)); document.documentElement.style.setProperty('--fs', fs+'px'); localStorage.setItem('fs',fs); };
$('#fontUp').onclick=()=>setFs(fs+2); $('#fontDown').onclick=()=>setFs(fs-2); setFs(fs);
$('#contrast').onclick=e=>{ const on=document.body.classList.toggle('hc'); e.currentTarget.setAttribute('aria-pressed',on); };

/* ---------- Busca inteligente ---------- */
function busca(q){
  const stop=new Set(['de','da','do','das','dos','na','no','em','um','uma','para','pra','meu','minha','o','a','e','com','que','quero','preciso']);
  const t = norm(q).split(/\s+/).filter(w=>w.length>2 && !stop.has(w));
  if(!t.length) return [];
  const res = SERVICOS.map(s=>{
    const hay = norm(s.titulo+' '+s.termos+' '+s.cat);
    let score=0; t.forEach(w=>{ if(hay.includes(w)) score+= (norm(s.titulo).includes(w)?3:2); else if(w.length>=5 && hay.split(' ').some(h=>h.startsWith(w.slice(0,5)))) score+=1; });
    return {s,score};
  }).filter(x=>x.score>0).sort((a,b)=>b.score-a.score);
  return res.length ? res.filter(x=>x.score>=res[0].score*0.5).slice(0,6).map(x=>x.s) : [];
}
function ligaBusca(input, list){
  let idx=-1, res=[];
  const draw=()=>{ list.innerHTML = res.length ? res.map((s,i)=>`<li role="option" aria-selected="${i===idx}"><a href="${s.rota}" class="${i===idx?'on':''}"><span>${esc(s.titulo)}</span><small>${esc(s.cat)} · ${s.online?'100% online':'presencial'} · ${esc(s.tempo)}</small></a></li>`).join('') : (input.value.trim()?`<li><a href="#/em-breve?s=ouvidoria"><span>Não achou? Pergunte para a Prefeitura</span><small>resposta em até 2 dias úteis (meta fictícia)</small></a></li>`:'');
    list.hidden = !list.innerHTML; input.setAttribute('aria-expanded', !list.hidden); };
  input.addEventListener('input',()=>{ res=busca(input.value); idx=-1; draw(); $('#searchStatus').textContent = res.length? `${res.length} serviços encontrados`:'Nenhum serviço encontrado'; });
  input.addEventListener('keydown',e=>{
    if(e.key==='ArrowDown'){idx=Math.min(idx+1,res.length-1);draw();e.preventDefault();}
    if(e.key==='ArrowUp'){idx=Math.max(idx-1,0);draw();e.preventDefault();}
    if(e.key==='Enter'){ const s=res[idx]||res[0]; if(s){location.hash=s.rota;} e.preventDefault(); }
    if(e.key==='Escape'){list.hidden=true;}
  });
}

/* ---------- Views ---------- */
const icon = {iptu:'🏠',cnd:'📄',processo:'📂',saude:'🩺',endereco:'📍',matricula:'🎒',nfse:'🧾',alvara:'🏪',obra:'🏗️',ouvidoria:'💬',zeladoria:'💡',transparencia:'📊',itbi:'🔑'};

function vHome(){
  const P=PROCESSO;
  return `
  <section class="hero"><div class="wrap">
    <p class="badge" style="background:rgba(255,255,255,.18);color:#fff">Olá, Maria (exemplo) 👋</p>
    <h1>O que você precisa resolver hoje em ${esc(cidade.nome)}?</h1>
    <p>Escreva do seu jeito: “boleto da casa”, “marcar médico”, “meu processo parou”. A busca entende linguagem do dia a dia.</p>
    <div class="search" role="search">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
      <label for="q" class="sr">Buscar serviço</label>
      <input id="q" type="search" placeholder="Ex.: segunda via do IPTU, vaga na creche, buraco na rua…" autocomplete="off" role="combobox" aria-autocomplete="list" aria-controls="sug" aria-expanded="false">
      <ul id="sug" class="suggest" role="listbox" hidden></ul>
      <p id="searchStatus" class="sr" aria-live="polite"></p>
    </div>
    <div class="chips" aria-label="Buscas populares">
      <a class="chip" href="#/iptu">IPTU 2027</a><a class="chip" href="#/saude">Marcar consulta</a><a class="chip" href="#/iptu?doc=cnd">Certidão negativa</a><a class="chip" href="#/processo">Meu processo</a><a class="chip" href="#/endereco">Mudei de endereço</a>
    </div>
  </div></section>
  <div class="wrap lift">
    <div class="alert warn card" role="region" aria-label="Pendência">
      <span class="big" aria-hidden="true">⚠️</span>
      <div style="flex:1"><strong>Seu processo nº ${esc(cidade.protocolo)} está esperando uma resposta sua.</strong><br>
      <span class="small">${esc(P.pendencia.titulo)} · Prazo: <strong>${P.prazo}</strong></span></div>
      <a class="btn sm" href="#/processo">Responder agora</a>
    </div>
  </div>
  <section class="section"><div class="wrap">
    <h2 class="title">Mais usados</h2>
    <div class="grid g4">
      ${SERVICOS.slice(0,8).map(s=>`<a class="card svc" href="${s.rota}"><span class="ico" aria-hidden="true">${icon[s.id]||'•'}</span><h3>${esc(s.titulo)}</h3><span class="small muted">${esc(s.cat)} · ${s.online?'100% online':'presencial'} · ~${esc(s.tempo)}</span></a>`).join('')}
    </div>
  </div></section>
  <section class="section" style="padding-top:0"><div class="wrap">
    <h2 class="title">Por momento de vida</h2>
    <div class="grid g4">
      ${[['🏗️','Vou construir ou reformar','Projeto, licença, habite-se — em ordem.'],['🏪','Vou abrir um negócio','Alvará, inscrição, nota fiscal.'],['📦','Mudei de endereço','Atualize uma vez, vale para tudo.'],['👶','Tive um bebê','Creche, vacinas, UBS de referência.']].map(x=>`<a class="card svc" href="#/em-breve?s=jornada"><span class="ico" aria-hidden="true">${x[0]}</span><h3>${x[1]}</h3><span class="small muted">${x[2]}</span></a>`).join('')}
    </div>
  </div></section>
  <section class="section" style="padding-top:0"><div class="wrap grid g3">
    <div class="card"><h3>Atendimento humano</h3><p class="small muted">Chat, WhatsApp e telefone na mesma conversa, com protocolo único. ${esc(cidade.canal)}.</p><a class="btn sec sm" href="#/em-breve?s=ouvidoria">Falar com alguém</a></div>
    <div class="card"><h3>Acessível para todos</h3><p class="small muted">Texto maior, alto contraste, leitor de tela e Libras. Linguagem simples em todos os serviços.</p></div>
    <div class="card"><h3>Login único gov.br</h3><p class="small muted">Entre com a mesma conta gov.br que você já usa para o INSS e a CNH (simulado).</p></div>
  </div></section>`;
}

function vProcesso(){
  const P=PROCESSO;
  return `<div class="wrap">
  <p class="crumbs"><a href="#/">Início</a> › <a href="#/processo">Meus processos</a> › ${esc(cidade.protocolo)}</p>
  <div class="pagehead row" style="justify-content:space-between">
    <div><span class="badge warn">● ${esc(P.status)}</span><h1>${esc(P.assunto)}</h1>
    <p class="muted small" style="margin:0">Processo nº <strong>${esc(cidade.protocolo)}</strong> (fictício) · aberto em ${P.aberto} · ${esc(P.setor)}</p></div>
    <div class="row"><button class="btn sec sm" id="copyLink">Copiar link</button><button class="btn sec sm" onclick="window.print()">Imprimir</button></div>
  </div>
  <ol class="stepper" aria-label="Etapas do processo">${P.etapas.map((e,i)=>`<li class="${i<P.etapaAtual?'done':i===P.etapaAtual?'now':''}" ${i===P.etapaAtual?'aria-current="step"':''}>${esc(e)}</li>`).join('')}</ol>
  <div class="grid" style="grid-template-columns:minmax(0,1.6fr) minmax(0,1fr);margin-top:18px" id="procGrid">
    <div>
      <section class="card" style="border:2px solid #f5c27a" aria-labelledby="pend">
        <span class="badge warn">O que falta você fazer</span>
        <h2 id="pend" style="margin-top:8px">${esc(P.pendencia.titulo)}</h2>
        <p>${esc(P.pendencia.texto)}</p>
        <p class="small muted">Pedido por ${esc(P.pendencia.pedidoPor)} em ${P.pendencia.em}. Prazo para responder: <strong>${P.prazo}</strong>. Enquanto isso, o processo fica pausado (antes aparecia só como “Paralisado”).</p>
        <form id="resp" novalidate>
          <div class="field"><label for="ato">Ato da matrícula <span class="hint">Ex.: R-26/16.180 — está na certidão da matrícula, coluna “Registro”.</span></label><input id="ato" type="text" inputmode="text" placeholder="R-__/__.___" required aria-describedby="atoErr"><span id="atoErr" class="small" style="color:var(--err)" role="alert"></span></div>
          <div class="field"><label for="msg">Mensagem para o analista <span class="hint">Opcional</span></label><textarea id="msg" rows="3" placeholder="Ex.: A referência no planimétrico foi erro de digitação; segue planta corrigida."></textarea></div>
          <div class="field"><span id="anexoLbl" style="font-weight:600;font-size:.92rem;display:block;margin-bottom:6px">Anexar documentos <span class="hint">PDF ou imagem, até 20 MB cada</span></span>
            <div class="drop" id="drop" tabindex="0" role="button" aria-describedby="anexoLbl">📎 Arraste arquivos aqui ou <u>escolha do computador/celular</u><input type="file" id="file" multiple hidden></div>
            <ul class="files" id="fileList" aria-live="polite"></ul></div>
          <div class="row"><button class="btn" type="submit">Enviar resposta</button><span class="small muted">Você receberá confirmação por e-mail e WhatsApp.</span></div>
        </form>
      </section>
      <section class="card" style="margin-top:16px" aria-labelledby="tlh">
        <div class="row" style="justify-content:space-between"><h2 id="tlh">Linha do tempo</h2>
        <div class="row" role="group" aria-label="Filtrar linha do tempo"><button class="btn ghost sm" data-f="all" aria-pressed="true">Tudo</button><button class="btn ghost sm" data-f="anexo" aria-pressed="false">Documentos</button><button class="btn ghost sm" data-f="pedido" aria-pressed="false">Pedidos</button></div></div>
        <ol class="tl" id="tl">${P.timeline.map(tlItem).join('')}</ol>
      </section>
    </div>
    <aside>
      <div class="card"><h3>Resumo</h3>
        <dl class="small" style="margin:0;display:grid;grid-template-columns:auto 1fr;gap:6px 12px">
          <dt class="muted">Situação</dt><dd style="margin:0"><strong>Aguardando sua resposta</strong></dd>
          <dt class="muted">Com quem está</dt><dd style="margin:0">${esc(P.responsavel)}</dd>
          <dt class="muted">Próximo passo</dt><dd style="margin:0">Análise técnica retoma após sua resposta</dd>
          <dt class="muted">Previsão</dt><dd style="margin:0">Decisão em até 15 dias úteis após a resposta (meta fictícia)</dd>
          <dt class="muted">Endereço</dt><dd style="margin:0"><a href="#/endereco">Ver/ajustar no mapa</a></dd>
        </dl></div>
      <div class="card" style="margin-top:16px"><h3>Precisa de ajuda?</h3><p class="small muted">Fale direto com o setor responsável por este processo, sem abrir outro protocolo.</p><button class="btn sec sm" id="chatBtn">Mandar mensagem ao setor</button></div>
      <div class="card" style="margin-top:16px"><h3>Notificações</h3><label class="small" style="font-weight:500"><input type="checkbox" checked> WhatsApp</label><label class="small" style="font-weight:500"><input type="checkbox" checked> E-mail</label><p class="small muted" style="margin:6px 0 0">Avisamos quando algo mudar — você não precisa ficar entrando para conferir.</p></div>
    </aside>
  </div></div>`;
}
function tlItem(t){
  const ic={pedido:'❗',tramite:'➡️',anexo:'📎',inicio:'✉️',resposta:'✅'}[t.tipo]||'•';
  return `<li class="${t.tipo}" data-tipo="${t.tipo}"><span class="dot" aria-hidden="true">${ic}</span><h3>${esc(t.titulo)}</h3><p class="meta">${esc(t.data)} · ${esc(t.autor)}</p>${t.detalhe?`<p class="small" style="margin:4px 0 0">${esc(t.detalhe)}</p>`:''}${t.arquivos?`<ul class="files">${t.arquivos.map(a=>`<li><span>📄 ${esc(a)}</span><button class="btn ghost sm" type="button" onclick="this.closest('.files')&&document.dispatchEvent(new CustomEvent('toast',{detail:'Pré-visualização do arquivo (simulada)'}))">Ver</button></li>`).join('')}</ul>`:''}</li>`;
}
function initProcesso(){
  if(innerWidth<860) $('#procGrid').style.gridTemplateColumns='1fr';
  const files=[]; const fl=$('#fileList'); const drop=$('#drop'); const fi=$('#file');
  const draw=()=>{ fl.innerHTML=files.map((f,i)=>`<li><span>📄 ${esc(f.name)} <span class="muted">(${Math.max(1,Math.round(f.size/1024))} KB)</span></span><button type="button" class="btn ghost sm" data-rm="${i}" aria-label="Remover ${esc(f.name)}">Remover</button></li>`).join(''); };
  drop.onclick=()=>fi.click(); drop.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();fi.click();}};
  fi.onchange=()=>{files.push(...fi.files);draw();};
  ['dragover','dragenter'].forEach(ev=>drop.addEventListener(ev,e=>{e.preventDefault();drop.classList.add('over');}));
  ['dragleave','drop'].forEach(ev=>drop.addEventListener(ev,e=>{e.preventDefault();drop.classList.remove('over');}));
  drop.addEventListener('drop',e=>{files.push(...e.dataTransfer.files);draw();});
  fl.onclick=e=>{const i=e.target.dataset.rm; if(i!==undefined){files.splice(+i,1);draw();}};
  $('#resp').onsubmit=e=>{ e.preventDefault(); const ato=$('#ato'); if(!/^R-?\d+/i.test(ato.value.trim())){ $('#atoErr').textContent='Informe o ato no formato R-número/matrícula, por exemplo R-26/16.180.'; ato.focus(); ato.setAttribute('aria-invalid','true'); return; }
    $('#atoErr').textContent=''; ato.removeAttribute('aria-invalid');
    const now=new Date(); const d=now.toLocaleDateString('pt-BR')+' '+now.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});
    const item={data:d,tipo:'resposta',titulo:`Você respondeu: ato ${ato.value.trim()}`,autor:'Maria (exemplo) · Requerente',detalhe:($('#msg').value||'Resposta enviada.')+' O processo voltou para Análise técnica.',arquivos:files.map(f=>f.name)};
    $('#tl').insertAdjacentHTML('afterbegin',tlItem(item));
    const card=$('#pend').closest('section'); card.style.border='2px solid #9fd9b9';
    card.innerHTML=`<span class="badge ok">✓ Resposta enviada</span><h2 style="margin-top:8px">Pronto! Recebemos sua resposta.</h2><p>O processo voltou para <strong>Análise técnica</strong>. Comprovante nº RESP-${Math.floor(Math.random()*90000+10000)} (fictício) enviado para seu e-mail.</p><a class="btn sec sm" href="#/">Voltar ao início</a>`;
    $$('.stepper li')[3].className='done'; $$('.stepper li')[2].className='now';
    $$('.badge.warn')[0] && ($$('.badge.warn')[0].textContent='● Em análise'); toast('Resposta enviada com sucesso (simulação)'); card.focus?.();
  };
  $$('[data-f]').forEach(b=>b.onclick=()=>{ $$('[data-f]').forEach(x=>x.setAttribute('aria-pressed',x===b)); $$('#tl li').forEach(li=>li.hidden = b.dataset.f!=='all' && li.dataset.tipo!==b.dataset.f); });
  $('#copyLink').onclick=()=>{navigator.clipboard?.writeText(location.href);toast('Link do processo copiado');};
  $('#chatBtn').onclick=()=>toast('Abriria uma conversa vinculada a este processo (simulação)');
}

function vEndereco(){
  return `<div class="wrap">
  <p class="crumbs"><a href="#/">Início</a> › Endereço e localização do imóvel</p>
  <div class="pagehead"><h1>Endereço e localização do imóvel</h1><p class="muted" style="margin:0">Digite o CEP: o resto é preenchido sozinho. Depois, confirme o ponto exato no mapa.</p></div>
  <div class="grid g2" style="margin-top:18px;align-items:start">
    <form class="card" id="endForm" novalidate>
      <div class="fgrid">
        <div class="field s3"><label for="cep">CEP <span class="hint">Só números. <a href="https://buscacepinter.correios.com.br/" target="_blank" rel="noopener">Não sei meu CEP</a></span></label><input id="cep" type="text" inputmode="numeric" maxlength="9" placeholder="00000-000" autocomplete="postal-code"></div>
        <div class="field s3" style="align-self:end"><button class="btn sec" type="button" id="cepBtn" style="width:100%">Buscar CEP</button></div>
        <p id="cepMsg" class="small s6" role="status" aria-live="polite" style="margin:-6px 0 6px"></p>
        <div class="field s4"><label for="rua">Logradouro</label><input id="rua" type="text" autocomplete="address-line1"></div>
        <div class="field s2"><label for="num">Número</label><input id="num" type="text" inputmode="numeric"></div>
        <div class="field s3"><label for="bairro">Bairro</label><input id="bairro" type="text"></div>
        <div class="field s3"><label for="compl">Complemento <span class="hint">Opcional</span></label><input id="compl" type="text"></div>
        <div class="field s4"><label for="cidade">Cidade</label><input id="cidade" type="text" value="${esc(cidade.nome)}"></div>
        <div class="field s2"><label for="uf">UF</label><input id="uf" type="text" value="RS" maxlength="2"></div>
        <div class="field s6"><label for="ref">Ponto de referência <span class="hint">Opcional — ajuda a equipe de vistoria</span></label><input id="ref" type="text" placeholder="Ex.: perto do Beco do Pontilhão"></div>
      </div>
      <p class="small muted">Todos os campos continuam editáveis: se o CEP for de rua geral ou estiver desatualizado, você corrige à mão.</p>
      <button class="btn" type="submit">Salvar endereço e localização</button>
    </form>
    <section class="card" aria-labelledby="maph">
      <h2 id="maph">Confirme o ponto no mapa</h2>
      <p class="small muted" style="margin-top:0">Arraste o pino ou toque no mapa para marcar o lugar exato do imóvel.</p>
      <div class="maptools"><button class="btn sec sm" type="button" id="geo">📍 Usar minha localização</button><button class="btn sec sm" type="button" id="layer" aria-pressed="false">🛰️ Satélite</button><button class="btn ghost sm" type="button" id="recenter">Centralizar no endereço</button></div>
      <div id="map" role="application" aria-label="Mapa interativo. Use os campos de coordenadas abaixo como alternativa acessível."></div>
      <div class="legend"><span><b></b>Ponto do imóvel</span><span><i></i>Limite do lote (exemplo)</span></div>
      <div class="fgrid" style="margin-top:12px">
        <div class="field s3"><label for="lat">Latitude</label><input id="lat" type="text" inputmode="decimal"></div>
        <div class="field s3"><label for="lng">Longitude</label><input id="lng" type="text" inputmode="decimal"></div>
      </div>
      <p class="coords" id="coordTxt" aria-live="polite"></p>
    </section>
  </div></div>`;
}
function initEndereco(){
  if(!window.L){ $('#map').innerHTML='<p style="padding:20px">Mapa indisponível sem internet (Leaflet não carregou).</p>'; return; }
  map = L.map('map',{scrollWheelZoom:false}).setView(cidade.centro,16);
  const ruas = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© OpenStreetMap'}).addTo(map);
  const sat = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',{maxZoom:19,attribution:'Imagens © Esri'});
  const pin = L.marker(cidade.centro,{draggable:true,autoPan:true,title:'Ponto do imóvel (arraste)',keyboard:true}).addTo(map);
  let lote=null;
  const desenhaLote=([a,b])=>{ if(lote) lote.remove(); const d=.00018; lote=L.polygon([[a-d,b-d*1.4],[a-d,b+d*1.4],[a+d,b+d*1.4],[a+d,b-d*1.4]],{color:'#d92d20',weight:2,dashArray:'6 6',fill:false}).addTo(map); };
  const set=(ll,pan)=>{ const a=+(+ll[0]).toFixed(6), b=+(+ll[1]).toFixed(6); pin.setLatLng([a,b]); $('#lat').value=a; $('#lng').value=b; $('#coordTxt').textContent=`Ponto marcado: ${a}, ${b}`; desenhaLote([a,b]); if(pan) map.setView([a,b],18); };
  set(cidade.centro);
  pin.on('dragend',()=>{const p=pin.getLatLng(); set([p.lat,p.lng]); toast('Localização fixada');});
  map.on('click',e=>{set([e.latlng.lat,e.latlng.lng]); toast('Localização fixada');});
  ['lat','lng'].forEach(id=>$('#'+id).addEventListener('change',()=>{ const a=parseFloat($('#lat').value.replace(',','.')), b=parseFloat($('#lng').value.replace(',','.')); if(!isNaN(a)&&!isNaN(b)) set([a,b],true); }));
  $('#layer').onclick=e=>{ const on=e.currentTarget.getAttribute('aria-pressed')!=='true'; e.currentTarget.setAttribute('aria-pressed',on); if(on){map.removeLayer(ruas);sat.addTo(map);}else{map.removeLayer(sat);ruas.addTo(map);} };
  $('#geo').onclick=()=>{ if(!navigator.geolocation) return toast('Seu navegador não permite localização'); toast('Buscando sua localização…'); navigator.geolocation.getCurrentPosition(p=>{set([p.coords.latitude,p.coords.longitude],true);toast('Pino movido para sua localização');},()=>toast('Não foi possível obter a localização. Arraste o pino manualmente.'),{enableHighAccuracy:true,timeout:8000}); };
  let enderecoLL=cidade.centro; $('#recenter').onclick=()=>set(enderecoLL,true);
  const cep=$('#cep');
  cep.addEventListener('input',()=>{ let v=cep.value.replace(/\D/g,'').slice(0,8); cep.value=v.length>5?v.slice(0,5)+'-'+v.slice(5):v; if(v.length===8) buscaCep(v); });
  $('#cepBtn').onclick=()=>{ const v=cep.value.replace(/\D/g,''); v.length===8?buscaCep(v):($('#cepMsg').textContent='Digite os 8 números do CEP.'); };
  async function buscaCep(v){
    $('#cepMsg').textContent='Buscando endereço…';
    let d=null; try{ const r=await fetch(`https://viacep.com.br/ws/${v}/json/`); d=await r.json(); if(d.erro) d=null; }catch(e){}
    if(!d){ d={logradouro:'Rua Exemplo das Flores',bairro:cidade.bairros[0],localidade:cidade.nome,uf:'RS',_fake:true}; }
    [['rua',d.logradouro],['bairro',d.bairro],['cidade',d.localidade],['uf',d.uf]].forEach(([id,val])=>{const el=$('#'+id); el.value=val||''; el.classList.remove('autofill'); void el.offsetWidth; el.classList.add('autofill');});
    $('#cepMsg').innerHTML = d._fake? '⚠️ CEP não encontrado na base — preenchemos um <strong>exemplo</strong>. Corrija se precisar.' : '✓ Endereço preenchido. Agora informe o número.';
    $('#num').focus();
    try{ const q=encodeURIComponent(`${d.logradouro||''}, ${d.localidade}, ${d.uf}, Brasil`); const r=await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${q}`,{headers:{'Accept-Language':'pt-BR'}}); const j=await r.json(); if(j[0]){enderecoLL=[+j[0].lat,+j[0].lon]; set(enderecoLL,true);} else set(cidade.centro,true);}catch(e){ set(cidade.centro,true); }
  }
  $('#endForm').onsubmit=e=>{e.preventDefault(); if(!$('#rua').value){ $('#cepMsg').textContent='Preencha o CEP ou o logradouro antes de salvar.'; $('#cep').focus(); return;} toast(`Endereço e ponto (${$('#lat').value}, ${$('#lng').value}) salvos — simulação`);};
}

function vIptu(){
  const cnd = location.hash.includes('doc=cnd');
  return `<div class="wrap">
  <p class="crumbs"><a href="#/">Início</a> › IPTU e certidões</p>
  <div class="pagehead"><h1>${cnd?'Certidão negativa de débitos':'IPTU 2027 — pagar ou emitir 2ª via'}</h1><p class="muted" style="margin:0">${cnd?'Sai na hora, com validação por QR Code.':'Três passos, sem precisar saber o número de inscrição de cor.'}</p></div>
  <div class="row" style="margin-top:12px"><a class="btn ${cnd?'sec':''} sm" href="#/iptu">IPTU</a><a class="btn ${cnd?'':'sec'} sm" href="#/iptu?doc=cnd">Certidão negativa</a></div>
  <ol class="wiz" aria-label="Passos"><li class="on" id="w1">1. Identificar imóvel</li><li id="w2">2. ${cnd?'Conferir':'Escolher pagamento'}</li><li id="w3">3. ${cnd?'Baixar certidão':'Pagar'}</li></ol>
  <div class="card" id="wiz"></div></div>`;
}
function initIptu(){
  const cnd = location.hash.includes('doc=cnd'); const box=$('#wiz');
  const step=n=>{ ['w1','w2','w3'].forEach((w,i)=>{$('#'+w).className = i+1<n?'done':i+1===n?'on':'';}); box.innerHTML=steps[n](); box.querySelector('h2')?.setAttribute('tabindex','-1'); box.querySelector('h2')?.focus(); binds[n]&&binds[n](); };
  const steps={
    1:()=>`<h2>Qual imóvel?</h2><p class="muted small">Escolha um dos seus imóveis vinculados ao CPF ou procure de outra forma.</p>
      <label class="opt"><input type="radio" name="im" checked><span><strong>Rua Exemplo das Flores, 123 — ${esc(cidade.bairros[0])}</strong><br><span class="small muted">Inscrição 00.000.000 (fictícia) · seu CPF é proprietário</span></span></label>
      <label class="opt"><input type="radio" name="im"><span><strong>Av. Fictícia, 456, ap. 302 — ${esc(cidade.bairros[1])}</strong><br><span class="small muted">Inscrição 11.111.111 (fictícia)</span></span></label>
      <details class="small"><summary>Procurar por inscrição, endereço ou CPF de outra pessoa</summary><div class="field" style="margin-top:10px"><label for="insc">Inscrição, endereço ou CPF/CNPJ</label><input id="insc" type="text" placeholder="Pode digitar com ou sem pontos"></div></details>
      <div class="row" style="margin-top:14px"><button class="btn" id="n1">Continuar</button></div>`,
    2:()=> cnd ? `<h2>Tudo certo com este imóvel ✅</h2><p>Não há débitos em aberto para <strong>Rua Exemplo das Flores, 123</strong> (dados fictícios).</p><div class="alert info small"><span aria-hidden="true">ℹ️</span><span>Se houvesse débito, mostraríamos aqui <strong>qual</strong> é e um botão para pagar ou parcelar — em vez de só recusar a certidão.</span></div><div class="row" style="margin-top:14px"><button class="btn sec" id="b2">Voltar</button><button class="btn" id="n2">Emitir certidão</button></div>`
      : `<h2>Como você quer pagar?</h2>
      <label class="opt"><input type="radio" name="pg" value="u" checked><span style="flex:1"><strong>Cota única com desconto</strong> <span class="badge ok">economize R$ 87,40</span><br><span class="small muted">Vence em 02/01/2027 (exemplo)</span></span><span class="price">R$ 786,60</span></label>
      <label class="opt"><input type="radio" name="pg" value="p"><span style="flex:1"><strong>8 parcelas</strong><br><span class="small muted">De 10/02 a 10/09/2027 · todas as guias de uma vez (exemplo)</span></span><span class="price">8× R$ 109,25</span></label>
      <p class="small muted">Por que mudou o valor? Correção pela inflação + nenhuma alteração cadastral. <a href="#/em-breve?s=revisao">Pedir revisão</a></p>
      <div class="row" style="margin-top:14px"><button class="btn sec" id="b2">Voltar</button><button class="btn" id="n2">Gerar pagamento</button></div>`,
    3:()=> cnd ? `<h2>Certidão emitida 🎉</h2><p>Certidão Negativa de Débitos nº CND-2026-000000 (fictícia), válida por 90 dias, com QR Code de autenticidade.</p><div class="row"><button class="btn" id="dl">⬇️ Baixar PDF</button><button class="btn sec" id="sh">Enviar por WhatsApp/e-mail</button></div>`
      : `<h2>Pague com Pix ou boleto</h2><div class="row" style="gap:28px;align-items:flex-start"><div class="qr" role="img" aria-label="QR Code Pix de exemplo"></div><div style="flex:1;min-width:240px"><p style="margin-top:0"><strong>Pix copia e cola</strong> (exemplo — não pague)</p><input type="text" readonly value="00020126EXEMPLO-NAO-PAGAR-PROTOTIPO5204000053039865802BR" aria-label="Código Pix de exemplo"><div class="row" style="margin-top:10px"><button class="btn" id="cp">Copiar código Pix</button><button class="btn sec" id="dl">⬇️ Boleto PDF</button><button class="btn ghost" id="cal">📅 Lembrar no vencimento</button></div><p class="small muted">A baixa do Pix é imediata e você recebe o comprovante aqui e por e-mail.</p></div></div>`
  };
  const binds={1:()=>{$('#n1').onclick=()=>step(2);},2:()=>{$('#b2').onclick=()=>step(1);$('#n2').onclick=()=>step(3);},3:()=>{ $('#dl')&&($('#dl').onclick=()=>toast('Download simulado — protótipo')); $('#sh')&&($('#sh').onclick=()=>toast('Compartilhamento simulado')); $('#cp')&&($('#cp').onclick=()=>toast('Código Pix (exemplo) copiado')); $('#cal')&&($('#cal').onclick=()=>toast('Lembrete criado (simulação)')); }};
  step(1);
}

function vSaude(){
  const dias=[]; const base=new Date(); for(let i=1;i<=7;i++){const d=new Date(base);d.setDate(d.getDate()+i); if(d.getDay()!==0) dias.push(d);}
  const sem=['dom','seg','ter','qua','qui','sex','sáb'];
  return `<div class="wrap">
  <p class="crumbs"><a href="#/">Início</a> › Saúde › Agendar consulta</p>
  <div class="pagehead"><h1>Agendar consulta na UBS</h1><p class="muted" style="margin:0">Escolha a unidade, o tipo de atendimento e um horário. Lembrete automático no WhatsApp na véspera.</p></div>
  <div class="grid" style="grid-template-columns:minmax(0,1.6fr) minmax(0,1fr);margin-top:18px" id="sGrid">
  <form class="card" id="ag">
    <fieldset style="border:0;padding:0;margin:0 0 14px"><legend style="font-weight:700;margin-bottom:8px">1. Unidade de saúde</legend>
      ${cidade.ubs.map((u,i)=>`<label class="opt"><input type="radio" name="ubs" value="${i}" ${i===0?'checked':''}><span style="flex:1"><strong>${esc(u.nome)}</strong> ${i===0?'<span class="badge">sua UBS de referência</span>':''}<br><span class="small muted">${u.dist} de você · aberta hoje até 19h (exemplo)</span></span></label>`).join('')}
    </fieldset>
    <div class="field"><label for="tipo">2. Tipo de atendimento</label><select id="tipo"><option>Clínico geral</option><option>Pediatria</option><option>Saúde da mulher / ginecologia</option><option>Odontologia</option><option>Enfermagem (curativo, pressão)</option></select></div>
    <div class="field"><span style="font-weight:700;display:block;margin-bottom:8px" id="dl">3. Dia</span><div class="days" role="group" aria-labelledby="dl">${dias.map((d,i)=>`<button type="button" class="day" data-d="${d.toLocaleDateString('pt-BR')}" aria-pressed="${i===0}"><span class="small">${sem[d.getDay()]}</span><b>${d.getDate()}</b><span class="small muted">${d.toLocaleDateString('pt-BR',{month:'short'})}</span></button>`).join('')}</div></div>
    <div class="field"><span style="font-weight:700;display:block;margin-bottom:8px" id="hl">4. Horário</span><div class="slots" role="group" aria-labelledby="hl" id="slots"></div></div>
    <div class="field"><label for="obs">Motivo (opcional) <span class="hint">Ajuda a equipe a preparar seu atendimento. Não substitui triagem.</span></label><input id="obs" type="text" placeholder="Ex.: renovar receita, dor de garganta"></div>
    <button class="btn" type="submit">Confirmar agendamento</button>
  </form>
  <aside><div class="card" id="resumo" aria-live="polite"></div>
  <div class="card" style="margin-top:16px"><h3>Sem internet ou com dificuldade?</h3><p class="small muted">Agende pelo WhatsApp oficial, por telefone ou direto na UBS. Todos os canais usam a mesma agenda, sem fila separada.</p></div>
  <div class="card" style="margin-top:16px"><h3>Não vai poder ir?</h3><p class="small muted">Cancele com 1 toque no lembrete. A vaga volta para a fila e quem está esperando é avisado.</p></div></aside>
  </div></div>`;
}
function initSaude(){
  if(innerWidth<860) $('#sGrid').style.gridTemplateColumns='1fr';
  const horas=['07:30','08:00','08:30','09:00','09:30','10:00','13:30','14:00','14:30','15:00','16:00','17:30'];
  let dia=$('.day[aria-pressed=true]').dataset.d, hora=null;
  const drawSlots=()=>{ const seed=dia.charCodeAt(0)+dia.charCodeAt(1); $('#slots').innerHTML=horas.map((h,i)=>`<button type="button" class="slot" data-h="${h}" ${((i*7+seed)%4===0)?'disabled aria-label="'+h+' indisponível"':''} aria-pressed="${h===hora}">${h}</button>`).join(''); };
  const resumo=()=>{ const u=cidade.ubs[+$('input[name=ubs]:checked').value]; $('#resumo').innerHTML=`<h3>Resumo</h3><p class="small" style="margin:0"><strong>${esc(u.nome)}</strong><br>${esc($('#tipo').value)}<br>${dia}${hora?' às <strong>'+hora+'</strong>':' · escolha um horário'}</p><p class="small muted">Leve documento com foto e Cartão SUS.</p>`; };
  drawSlots(); resumo();
  $$('.day').forEach(b=>b.onclick=()=>{ $$('.day').forEach(x=>x.setAttribute('aria-pressed',x===b)); dia=b.dataset.d; hora=null; drawSlots(); resumo(); });
  $('#slots').onclick=e=>{ const b=e.target.closest('.slot'); if(!b||b.disabled) return; hora=b.dataset.h; $$('.slot').forEach(x=>x.setAttribute('aria-pressed',x===b)); resumo(); };
  $('#ag').onchange=resumo;
  $('#ag').onsubmit=e=>{ e.preventDefault(); if(!hora){ toast('Escolha um horário'); $('#slots .slot:not(:disabled)')?.focus(); return; } const u=cidade.ubs[+$('input[name=ubs]:checked').value];
    $('#ag').innerHTML=`<span class="badge ok">✓ Consulta agendada</span><h2 style="margin-top:8px" tabindex="-1" id="okh">${esc($('#tipo').value)} — ${dia} às ${hora}</h2><p>${esc(u.nome)}. Código de confirmação: <strong>SAU-${Math.floor(Math.random()*900000+100000)}</strong> (fictício).</p><p class="small muted">Você vai receber um lembrete no WhatsApp na véspera, com botões “Confirmar” e “Não vou poder ir”.</p><div class="row"><button class="btn" type="button" onclick="document.dispatchEvent(new CustomEvent('toast',{detail:'Evento adicionado à agenda (simulação)'}))">📅 Adicionar à agenda</button><button class="btn sec" type="button" onclick="document.dispatchEvent(new CustomEvent('toast',{detail:'Rota aberta no mapa (simulação)'}))">🗺️ Como chegar</button><a class="btn ghost" href="#/saude">Agendar outra</a></div>`; $('#okh').focus(); toast('Consulta agendada (simulação)'); };
}

function vProposta(){
  return `<div class="wrap">
  <p class="crumbs"><a href="#/">Início</a> › Sobre a proposta</p>
  <div class="pagehead"><h1>Proposta: ${esc(cidade.nome)} Digital, centrada no cidadão</h1><p class="muted">Protótipo conceitual de Caroline Wilhelm S. para apresentação à gestão municipal. Mostra o “depois” de jornadas que hoje são confusas. Nada aqui é oficial e todos os dados são fictícios.</p></div>
  <div class="grid g4" style="margin:18px 0">
    <div class="card"><div class="kpi">1</div><p class="small muted" style="margin:0">porta de entrada para todos os serviços, com busca em linguagem comum</p></div>
    <div class="card"><div class="kpi">3</div><p class="small muted" style="margin:0">passos para pagar IPTU ou tirar certidão</p></div>
    <div class="card"><div class="kpi">0</div><p class="small muted" style="margin:0">campos bloqueados sem explicação</p></div>
    <div class="card"><div class="kpi">AA</div><p class="small muted" style="margin:0">meta WCAG 2.2 / eMAG em todas as telas</p></div>
  </div>
  <h2 class="title">Antes × depois</h2>
  <div class="grid" style="gap:16px">
  ${(cidade.id==='cachoeirinha'?[
   ['Acompanhar processo','(Uso real no autoatendimento atende.net) Linha do tempo com vários cartões iguais “Anexo”, mesma data/hora, sem nome de arquivo nem autor; precisa abrir “+ Detalhes” um a um. Status “Paralisado” sem dizer o que falta. Sem botão Responder.','Status em linguagem simples, etapa atual destacada, cartão “O que falta você fazer” com prazo, formulário de resposta + anexos, linha do tempo agrupada com nome do arquivo e autor.','#/processo'],
   ['Endereço e mapa','Campos de endereço cinza/bloqueados sem dica de que é preciso usar a lupa. Mapa abre em local aleatório, sem pino fixável; coordenadas num rodapé minúsculo; limite do lote sem legenda.','CEP autopreenche e todos os campos seguem editáveis; mapa centraliza no endereço; pino arrastável; “usar minha localização”; satélite; legenda; coordenadas em campos acessíveis.','#/endereco'],
   ['IPTU e certidões','Links que levam a sistemas diferentes, número de inscrição obrigatório, recusa da certidão sem dizer qual é o débito.','Imóveis já vinculados ao CPF, comparação cota única × parcelas, Pix, lembrete de vencimento, certidão na hora ou explicação do débito com botão para regularizar.','#/iptu'],
   ['Agendamento de saúde','Troca de canal em 2026: o app atende.net foi anunciado como descontinuado para consultas e substituído por WhatsApp; o cidadão precisa descobrir qual canal vale.','Uma agenda só para todos os canais, UBS de referência sugerida, horários visíveis, lembrete com cancelamento em 1 toque devolvendo a vaga.','#/saude']
  ]:[
   ['Acompanhar processo','Dois sistemas (SEI e MVP) com formatos de número diferentes. A consulta MVP abre sem título nem instrução, pede “Processo / Ano / Volume / CPF” com campos pré-preenchidos com 0 e 1, o botão principal é “Imprimir” e o zoom no celular é bloqueado.','Um só lugar para todos os processos do CPF, status em linguagem simples, “O que falta você fazer”, botão Responder e linha do tempo legível.','#/processo'],
   ['Endereço e mapa','Cada sistema pede o endereço de novo; não há um cadastro único com localização confirmada no mapa.','CEP autopreenche, pino arrastável, “usar minha localização”, satélite e coordenadas acessíveis — salvo uma vez, reaproveitado em todos os serviços.','#/endereco'],
   ['IPTU e certidões','Links do portal (Portal da Fazenda, Transparência, Ouvidoria) usam endereços http:// que, nos nossos testes, retornaram erro 500 em vez de redirecionar para https; a guia exige inscrição e CPF “somente números”.','Imóveis já vinculados ao CPF, cota única × parcelas lado a lado, Pix, lembrete, certidão na hora ou explicação do débito.','#/iptu'],
   ['Agendamento de saúde','Informações espalhadas: consulta de exames especializados num sistema de Porto Alegre (Procempa), agendamento de atendimento em outro, e um serviço chamado só “Consultas” que é veterinário.','Uma agenda só, nomes claros, UBS de referência sugerida, lembrete no WhatsApp com cancelamento em 1 toque.','#/saude']
  ]).map(r=>`<div class="ba"><div class="card before"><span class="badge" style="background:#fdecea;color:var(--err)">Antes · ${r[0]}</span><p class="small">${r[1]}</p></div><div class="card after"><span class="badge ok">Depois · ${r[0]}</span><p class="small">${r[2]}</p><a class="btn sm" href="${r[3]}">Ver no protótipo</a></div></div>`).join('')}
  </div>
  <h2 class="title" style="margin-top:28px">Princípios</h2>
  <div class="grid g3">
   ${[['Linguagem simples','Escrever como o cidadão fala; explicar siglas (CMC, DAM, CND).'],['Um login, um cadastro','gov.br e dados que não precisam ser digitados de novo em cada sistema.'],['Mobile primeiro','A maioria acessa pelo celular: telas responsivas, botões grandes.'],['Acessibilidade de verdade','WCAG 2.2 AA / eMAG: contraste, teclado, leitor de tela, Libras.'],['Status proativo','Avisar por WhatsApp/e-mail quando algo muda ou falta algo.'],['Medir e melhorar','Avaliação após cada serviço e painel público de tempo de atendimento.']].map(p=>`<div class="card"><h3>${p[0]}</h3><p class="small muted" style="margin:0">${p[1]}</p></div>`).join('')}
  </div></div>`;
}
function vBreve(){
  const s=new URLSearchParams(location.hash.split('?')[1]||'').get('s')||'';
  const svc=SERVICOS.find(x=>x.id===s);
  return `<div class="wrap"><p class="crumbs"><a href="#/">Início</a></p><div class="card" style="margin-top:12px;max-width:720px"><span class="badge">Fora do escopo desta simulação</span><h1 style="font-size:1.5rem">${esc(svc?svc.titulo:'Esta jornada')}</h1><p>Este fluxo ainda não foi desenhado no protótipo. Na proposta, ele seguiria o mesmo padrão: linguagem simples, poucos passos, status claro e acompanhamento por WhatsApp/e-mail.</p><div class="row"><a class="btn" href="#/">Voltar ao início</a><a class="btn sec" href="#/proposta">Ver a proposta</a></div></div></div>`;
}

/* ---------- Router ---------- */
const routes={'':[vHome,()=>ligaBusca($('#q'),$('#sug'))],'processo':[vProcesso,initProcesso],'endereco':[vEndereco,initEndereco],'iptu':[vIptu,initIptu],'saude':[vSaude,initSaude],'proposta':[vProposta],'em-breve':[vBreve]};
function render(){
  if(map){ map.remove(); map=null; }
  $('#toast').classList.remove('show');
  const key=(location.hash.replace(/^#\/?/,'').split('?')[0]);
  const r=routes[key]||routes[''];
  main.innerHTML=r[0](); r[1]&&r[1]();
  $$('.mainnav a').forEach(a=>{ const k=a.getAttribute('href').replace(/^#\/?/,''); a.toggleAttribute('aria-current', k===key); if(k===key) a.setAttribute('aria-current','page'); });
  window.scrollTo(0,0);
  if(render._first) main.focus({preventScroll:true}); render._first=true;
}
document.addEventListener('toast',e=>toast(e.detail));
addEventListener('hashchange',render);
aplicaCidade(); render();
})();
