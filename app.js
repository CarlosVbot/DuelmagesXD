/* ═══════════════ CONSTANTS ═══════════════ */
const MAX_HP = 30;
const DESP_THRESHOLD = 14;
const INITIAL_HAND = 5;
const DECK_SIZE = 30;
const MAX_COPIES = 3;
const MAX_TURNS = 100;

const AVATARS = {
    player: { name: "Carlos", src: "https://i.ibb.co/zVF8FdJX/Bruja-m-gica-de-cabellera-pastel.png" },
    enemy:  { name: "Magus Rojo", src: "https://i.ibb.co/7xG4HRkt/Chat-GPT-Image-13-abr-2026-10-07-15.png" }
};

let CARD_POOL = [];
let G = null;
let selectedHandIndex = null;
let humanReactionResolver = null;

const $ = (id) => document.getElementById(id);
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const rand = (max) => Math.floor(Math.random() * max);
const cloneCard = (c) => JSON.parse(JSON.stringify(c));

function shuffle(arr) { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=rand(i+1);[a[i],a[j]]=[a[j],a[i]];} return a; }
function isDesperate(p) { return p.hp <= DESP_THRESHOLD; }
function otherIndex(i) { return i===0?1:0; }
function currentPlayer() { return G.players[G.activeIdx]; }
function opponentOf(i) { return G.players[otherIndex(i)]; }
function currentOpponent() { return G.players[otherIndex(G.activeIdx)]; }
function isSpellLike(c) { return c.type==="spell"||c.type==="quick"||c.type==="consumable"; }
function log(msg, cls="") { G.logs.unshift({msg,cls}); if(G.logs.length>120) G.logs.pop(); }
function labelForType(t) { if(t==="spell")return"Hechizo";if(t==="quick")return"Rápido";if(t==="perm")return"Permanente";return"Consumible"; }

/* ═══ CARD ART ═══ */
function cardArtHTML(card, size="28px") {
    if(card.art_url) return `<img src="${card.art_url}" alt="${card.name}" style="width:100%;height:100%;object-fit:cover;border-radius:4px" onerror="this.style.display='none';this.nextSibling.style.display='flex'"><span style="display:none;width:100%;height:100%;align-items:center;justify-content:center;font-size:${size}">${card.art}</span>`;
    return `<span style="font-size:${size}">${card.art}</span>`;
}
function castArtHTML(card) {
    if(card.art_url) return `<img src="${card.art_url}" alt="${card.name}" style="width:80px;height:80px;border-radius:10px;object-fit:cover;border:2px solid var(--gold)">`;
    return card.art;
}

/* ═══ ANIMATIONS ═══ */
async function showPhaseBanner(icon,text,sub="",dur=1100) {
    const b=$("phaseBanner"); b.querySelector(".phase-banner-icon").textContent=icon;
    b.querySelector(".phase-banner-text").textContent=text; b.querySelector(".phase-banner-sub").textContent=sub;
    b.classList.remove("hide"); b.classList.add("show"); await wait(dur);
    b.classList.remove("show"); b.classList.add("hide"); await wait(300); b.classList.remove("hide");
}

async function showCastCinematic(card) {
    const cin=$("castCinematic"); $("castCardArt").innerHTML=castArtHTML(card); $("castCardName").textContent=card.name;
    const pc=$("castParticles"); pc.innerHTML="";
    if(!document.getElementById("particleDynStyle")){const s=document.createElement("style");s.id="particleDynStyle";s.textContent=`@keyframes particleFlyDir{from{transform:translate(0,0) scale(1);opacity:1}to{transform:translate(var(--tx),var(--ty)) scale(0);opacity:0}}`;document.head.appendChild(s);}
    const cols=["var(--gold2)","var(--purple2)","var(--teal2)","rgba(255,255,255,.6)"];
    for(let i=0;i<18;i++){const p=document.createElement("div");p.className="cast-particle";const a=(Math.PI*2*i)/18,d=80+rand(100);p.style.cssText=`left:50%;top:50%;background:${cols[rand(cols.length)]};width:${2+rand(4)}px;height:${2+rand(4)}px;--tx:${Math.cos(a)*d}px;--ty:${Math.sin(a)*d}px;animation:particleFlyDir .7s ease-out ${rand(150)}ms forwards`;pc.appendChild(p);}
    cin.classList.remove("hide"); cin.classList.add("show"); await wait(650);
    cin.classList.remove("show"); cin.classList.add("hide"); await wait(300); cin.classList.remove("hide");
}

async function showDrawAnimation(card,side="player") {
    const o=$("drawOverlay"); $("drawCardFace").innerHTML=cardArtHTML(card,"32px");
    const pile=$(side==="player"?"playerDeckPile":"enemyDeckPile");
    if(pile){pile.classList.add("drawing");setTimeout(()=>pile.classList.remove("drawing"),450);}
    o.classList.remove("hide");o.classList.add("show");await wait(480);
    o.classList.remove("show");o.classList.add("hide");await wait(200);o.classList.remove("hide");
}

function showResolvingCard(card) {
    const el=document.createElement("div");el.className="resolving";
    if(card.art_url) el.innerHTML=`<img src="${card.art_url}" style="width:38px;height:50px;object-fit:cover;border-radius:4px">`;
    else el.textContent=card.art||"✦";
    document.body.appendChild(el);setTimeout(()=>el.remove(),450);
}
function showReactionBanner(text) { const el=document.createElement("div");el.className="react-banner";el.textContent=text;document.body.appendChild(el);setTimeout(()=>el.remove(),1700); }
function floatingDamage(side,amount,kind="dmg") {
    const zone=$(side==="player"?"playerZone":"enemyZone");const r=zone.getBoundingClientRect();
    const el=document.createElement("div");el.className=`dmg-float ${kind}`;el.textContent=kind==="heal"?`+${amount}`:`-${amount}`;
    el.style.left=`${r.left+r.width/2-16}px`;el.style.top=`${r.top+r.height/2}px`;
    document.body.appendChild(el);setTimeout(()=>el.remove(),850);
}
function shakeEl(id) { const el=$(id);if(!el)return;el.classList.add("shake");setTimeout(()=>el.classList.remove("shake"),360); }

/* ═══ NAME EDITING ═══ */
function setupNameEditing(labelId,inputId,key) {
    const label=$(labelId),input=$(inputId);
    label.addEventListener("click",e=>{e.stopPropagation();label.style.display="none";input.style.display="block";input.value=AVATARS[key].name;input.focus();input.select();});
    function commit(){const n=input.value.trim()||AVATARS[key].name;AVATARS[key].name=n;label.textContent=n;label.style.display="";input.style.display="none";if(G){G.players[key==="player"?0:1].name=n;render();}}
    input.addEventListener("blur",commit);
    input.addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();commit();}if(e.key==="Escape"){input.value=AVATARS[key].name;commit();}});
}

/* ═══ FLOATING CARD POPUP ═══ */
function showCardPopup(cardEl,card,playable) {
    const popup=$("cardPopup");
    const player=G.players[0];
    const effCost=effectiveCost(player,card);
    const isReact=G.phase==="reaction";

    // Preview
    const preview=$("cardPopupPreview");
    if(card.art_url) preview.innerHTML=`<img src="${card.art_url}" alt="${card.name}" onerror="this.parentElement.innerHTML='<span style=font-size:48px>${card.art}</span>'">`;
    else preview.innerHTML=`<span style="font-size:48px">${card.art}</span>`;

    // Type color
    const bc=card.type==="spell"?"rgba(124,77,255,.4)":card.type==="quick"?"rgba(255,171,64,.4)":card.type==="perm"?"rgba(0,191,165,.35)":"rgba(100,255,218,.2)";

    // Info
    const info=$("cardPopupInfo");
    info.innerHTML=`
        <div class="cp-type" style="background:${bc};color:var(--text2)">${labelForType(card.type)}</div>
        <div class="cp-name">${card.name}</div>
        <div class="cp-cost">Costo base: ${card.cost} HP</div>
        <div class="cp-cost">Ahora: <span class="cp-cost-now">${effCost} HP</span>${isDesperate(player)?` <span class="cp-desp">(Desesperación ½)</span>`:""}</div>
        <div class="cp-text">${card.text}</div>
        <div class="cp-status ${playable?"cp-playable":"cp-unplayable"}">${playable?"✓ Jugable ahora":"✗ No jugable en esta fase"}</div>
    `;

    // Play button inside popup
    const existingBtn=info.querySelector(".card-popup-play");
    if(existingBtn) existingBtn.remove();
    if(playable) {
        const btn=document.createElement("button");
        btn.className=`card-popup-play ${isReact?"react-mode":""}`;
        btn.textContent=isReact?"⚡ Responder":"▶ Jugar Carta";
        btn.addEventListener("click",e=>{e.stopPropagation();hideCardPopup();onPlayCard();});
        info.appendChild(btn);
    }

    // Position popup next to the card
    const rect=cardEl.getBoundingClientRect();
    const popW=260;
    const vw=window.innerWidth;
    const vh=window.innerHeight;

    let left=rect.right+12;
    let top=rect.top-20;

    // If no room on right, put on left
    if(left+popW>vw-10) left=rect.left-popW-12;
    // If still off screen, center below
    if(left<10) { left=Math.max(10,rect.left+rect.width/2-popW/2); top=rect.bottom+10; }
    // Clamp vertical
    if(top<10) top=10;
    if(top+300>vh) top=Math.max(10,vh-310);

    popup.style.left=`${left}px`;
    popup.style.top=`${top}px`;
    popup.classList.add("show");
}

function hideCardPopup() {
    $("cardPopup").classList.remove("show");
}

/* ═══ DECK / PLAYER ═══ */
function createDeck(){const counts={},deck=[];while(deck.length<DECK_SIZE){const t=CARD_POOL[rand(CARD_POOL.length)];counts[t.id]=counts[t.id]||0;if(counts[t.id]<MAX_COPIES){counts[t.id]++;deck.push(cloneCard(t));}}return shuffle(deck);}
function createPlayer(name,human){return{name,human,hp:MAX_HP,deck:createDeck(),hand:[],discard:[],permanent:null,shield:0,aura:{},flags:{spellCastThisTurn:false,firstSpellBonusUsed:false,firstQuickOnEnemyTurnUsed:false,spellDamagePreventUsed:false,preventDiscardUsed:false}};}

function calculateAura(player){
    const a={reflectDamageWhenHit:0,buffSelfSpellDamage:0,healSelfFirstSpellEachTurn:0,buffSelfHealSpells:0,startOfTurnDamageSelf:0,startOfTurnDrawSelf:0,healSelfFirstQuickOnEnemyTurn:0,reduceSelfConsumableCost:0,preventSpellDamageOnceEachTurn:0,reduceSelfQuickCost:0,endOfTurnDamageEnemyIfSelfCastSpell:0,drawSelfWhenReplaced:0,preventFirstDiscardAgainstSelfEachTurn:false};
    if(player.permanent){for(const fx of player.permanent.effects){switch(fx.action){
        case "reflect_damage_when_hit":a.reflectDamageWhenHit=fx.value;break;case "buff_self_spell_damage":a.buffSelfSpellDamage=fx.value;break;
        case "heal_self_first_spell_each_turn":a.healSelfFirstSpellEachTurn=fx.value;break;case "buff_self_heal_spells":a.buffSelfHealSpells=fx.value;break;
        case "start_of_turn_damage_self":a.startOfTurnDamageSelf=fx.value;break;case "start_of_turn_draw_self":a.startOfTurnDrawSelf=fx.value;break;
        case "heal_self_first_quick_on_enemy_turn":a.healSelfFirstQuickOnEnemyTurn=fx.value;break;case "reduce_self_consumable_cost":a.reduceSelfConsumableCost=fx.value;break;
        case "prevent_spell_damage_once_each_turn":a.preventSpellDamageOnceEachTurn=fx.value;break;case "reduce_self_quick_cost":a.reduceSelfQuickCost=fx.value;break;
        case "end_of_turn_damage_enemy_if_self_cast_spell":a.endOfTurnDamageEnemyIfSelfCastSpell=fx.value;break;case "draw_self_when_replaced":a.drawSelfWhenReplaced=fx.value;break;
        case "prevent_first_discard_against_self_each_turn":a.preventFirstDiscardAgainstSelfEachTurn=true;break;}}}
    player.aura=a;
}

function effectiveCost(player,card){let v=card.cost;if(card.type==="quick"&&player.aura.reduceSelfQuickCost)v=Math.max(1,v-player.aura.reduceSelfQuickCost);if(card.type==="consumable"&&player.aura.reduceSelfConsumableCost)v=Math.max(1,v-player.aura.reduceSelfConsumableCost);if(isDesperate(player)&&v>0)v=Math.max(1,Math.ceil(v/2));return v;}
function canAfford(p,c){return effectiveCost(p,c)<p.hp;}
function removeCardFromHand(p,c){const i=p.hand.indexOf(c);if(i>=0)p.hand.splice(i,1);}

async function drawCard(player,amount=1,reason="robo",animate=true){
    for(let i=0;i<amount;i++){if(G.over)return;if(player.deck.length===0){G.over=true;G.winnerIdx=otherIndex(G.players.indexOf(player));log(`☠ ${player.name} no puede robar. Mazo vacío.`,"dmg");return;}
        const card=player.deck.shift();player.hand.push(card);log(`+ ${player.name} roba ${card.name}.`,"sys");
        if(animate&&player.human)await showDrawAnimation(card,"player");
        else if(animate&&!player.human){const pile=$("enemyDeckPile");if(pile){pile.classList.add("drawing");setTimeout(()=>pile.classList.remove("drawing"),400);}await wait(180);}}
}

/* ═══ DAMAGE / HEAL ═══ */
function rawDamage(t,v){t.hp-=v;if(t.hp<0)t.hp=0;}
function damage(tp,amount,sp=null,sc=null,refl=true){
    if(G.over||amount<=0)return;let fa=amount;
    if(tp.shield>0){const b=Math.min(tp.shield,fa);tp.shield-=b;fa-=b;if(b>0)log(`🛡 ${tp.name} bloquea ${b} daño.`,"sys");}
    if(fa>0&&sc&&isSpellLike(sc)&&tp.aura.preventSpellDamageOnceEachTurn&&!tp.flags.spellDamagePreventUsed){const pr=Math.min(tp.aura.preventSpellDamageOnceEachTurn,fa);fa-=pr;tp.flags.spellDamagePreventUsed=true;if(pr>0)log(`🛡 ${tp.name} previene ${pr}.`,"sys");}
    if(fa<=0)return;rawDamage(tp,fa);log(`💥 ${tp.name} recibe ${fa} daño → ${tp.hp} HP.`,"dmg");floatingDamage(G.players.indexOf(tp)===0?"player":"enemy",fa,"dmg");
    if(tp.hp<=0){G.over=true;G.winnerIdx=sp?G.players.indexOf(sp):otherIndex(G.players.indexOf(tp));return;}
    if(refl&&sp&&tp.aura.reflectDamageWhenHit>0&&sp.hp>0){const r=tp.aura.reflectDamageWhenHit;rawDamage(sp,r);log(`↩ ${tp.name} refleja ${r} daño.`,"react");floatingDamage(G.players.indexOf(sp)===0?"player":"enemy",r,"dmg");if(sp.hp<=0){G.over=true;G.winnerIdx=G.players.indexOf(tp);}}
}
function heal(p,amount,sc=null){if(G.over||amount<=0)return;let fa=amount;if(sc&&sc.type==="spell"&&p.aura.buffSelfHealSpells)fa+=p.aura.buffSelfHealSpells;const b=p.hp;p.hp=Math.min(MAX_HP,p.hp+fa);const g=p.hp-b;if(g>0){log(`❤ ${p.name} recupera ${g} HP → ${p.hp} HP.`,"heal");floatingDamage(G.players.indexOf(p)===0?"player":"enemy",g,"heal");}}
function discardRandom(ep,n){for(let i=0;i<n;i++){if(!ep.hand.length)return;if(ep.aura.preventFirstDiscardAgainstSelfEachTurn&&!ep.flags.preventDiscardUsed){ep.flags.preventDiscardUsed=true;log(`✨ ${ep.name} evita un descarte.`,"sys");continue;}const idx=rand(ep.hand.length);const[c]=ep.hand.splice(idx,1);ep.discard.push(c);log(`🗑 ${ep.name} descarta ${c.name}.`,"sys");}}

/* ═══ COUNTER ═══ */
function hasCounterEffect(c,a){return c.effects.some(fx=>fx.action===a);}
function isCounterCard(c){return c.effects.some(fx=>["counter_spell","counter_quick","counter_consumable","counter_spell_if_from_enemy","counter_any_spell_in_chain"].includes(fx.action));}
function findCounterTarget(){for(let i=G.stack.length-1;i>=0;i--){if(!G.stack[i].canceled)return G.stack[i];}return null;}
function counterMatches(card,te,ci){if(!te)return false;const tc=te.card,isE=te.casterIdx!==ci;if(hasCounterEffect(card,"counter_any_spell_in_chain"))return tc.type==="spell"||tc.type==="quick";if(hasCounterEffect(card,"counter_spell_if_from_enemy"))return isE&&(tc.type==="spell"||tc.type==="quick");if(hasCounterEffect(card,"counter_spell"))return tc.type==="spell"||tc.type==="quick";if(hasCounterEffect(card,"counter_quick"))return tc.type==="quick";if(hasCounterEffect(card,"counter_consumable"))return tc.type==="consumable";return false;}

/* ═══ EFFECTS ═══ */
function applyPermanent(c,card){const old=c.permanent;if(old&&c.aura.drawSelfWhenReplaced)drawCard(c,c.aura.drawSelfWhenReplaced,"reemplazo",false);if(old){c.discard.push(old);log(`🔁 ${c.name} reemplaza ${old.name}.`,"sys");}else log(`🧿 ${c.name} coloca ${card.name}.`,"sys");c.permanent=card;calculateAura(c);}
function markSpellFlags(entry){const c=G.players[entry.casterIdx];const isET=G.activeIdx!==entry.casterIdx;if(entry.card.type==="spell"){c.flags.spellCastThisTurn=true;if(c.aura.healSelfFirstSpellEachTurn&&!c.flags.firstSpellBonusUsed){heal(c,c.aura.healSelfFirstSpellEachTurn,null);c.flags.firstSpellBonusUsed=true;}}if(entry.card.type==="quick"&&isET&&c.aura.healSelfFirstQuickOnEnemyTurn&&!c.flags.firstQuickOnEnemyTurnUsed){heal(c,c.aura.healSelfFirstQuickOnEnemyTurn,null);c.flags.firstQuickOnEnemyTurnUsed=true;}}

function applyEffects(entry){const c=G.players[entry.casterIdx],e=G.players[otherIndex(entry.casterIdx)];markSpellFlags(entry);for(const fx of entry.card.effects){if(G.over)break;switch(fx.action){
    case "damage_enemy":damage(e,fx.value+(entry.card.type==="spell"?c.aura.buffSelfSpellDamage:0),c,entry.card);break;case "damage_self":damage(c,fx.value,e,entry.card,false);break;
    case "heal_self":heal(c,fx.value,entry.card);break;case "draw_self":drawCard(c,fx.value,entry.card.name,false);break;
    case "shield_self":c.shield+=fx.value;log(`🛡 ${c.name} gana ${fx.value} escudo.`,"sys");break;case "discard_random_enemy":discardRandom(e,fx.value);break;
    case "damage_enemy_if_self_desperation":if(isDesperate(c))damage(e,fx.value+(entry.card.type==="spell"?c.aura.buffSelfSpellDamage:0),c,entry.card);break;
    case "damage_enemy_if_self_has_permanent":if(c.permanent)damage(e,fx.value+(entry.card.type==="spell"?c.aura.buffSelfSpellDamage:0),c,entry.card);break;
    case "damage_enemy_if_enemy_cast_spell_this_turn":if(e.flags.spellCastThisTurn)damage(e,fx.value,c,entry.card);break;}}}

async function resolveStack(){while(G.stack.length&&!G.over){const entry=G.stack.pop();if(entry.canceled){entry.owner.discard.push(entry.card);log(`✖ ${entry.card.name} cancelada.`,"sys");continue;}showResolvingCard(entry.card);await wait(220);if(isCounterCard(entry.card)){const t=findCounterTarget();if(t&&counterMatches(entry.card,t,entry.casterIdx)){t.canceled=true;log(`⛔ ${entry.card.name} cancela ${t.card.name}.`,"react");if(hasCounterEffect(entry.card,"draw_both_if_target_was_quick")&&t.card.type==="quick"){drawCard(G.players[0],1,"Cierre",false);drawCard(G.players[1],1,"Cierre",false);}}else log(`… ${entry.card.name} sin objetivo.`,"sys");entry.owner.discard.push(entry.card);continue;}if(entry.card.type==="perm"){applyPermanent(entry.owner,entry.card);continue;}applyEffects(entry);entry.owner.discard.push(entry.card);}}

/* ═══ AI ═══ */
function estimateIncomingDamage(te,ri){if(!te||te.casterIdx===ri)return 0;const c=G.players[te.casterIdx];let t=0;for(const fx of te.card.effects){if(fx.action==="damage_enemy")t+=fx.value+(te.card.type==="spell"?c.aura.buffSelfSpellDamage:0);if(fx.action==="damage_enemy_if_self_desperation"&&isDesperate(c))t+=fx.value;if(fx.action==="damage_enemy_if_self_has_permanent"&&c.permanent)t+=fx.value;if(fx.action==="damage_enemy_if_enemy_cast_spell_this_turn"&&G.players[ri].flags.spellCastThisTurn)t+=fx.value;}return t;}
function cardHeuristic(p,card){if(!canAfford(p,card))return-999;let s=0;for(const fx of card.effects){switch(fx.action){case "damage_enemy":s+=fx.value*2.4;break;case "heal_self":s+=p.hp<16?fx.value*2.2:fx.value*1.1;break;case "draw_self":s+=p.hand.length<4?fx.value*2.8:fx.value*1.2;break;case "discard_random_enemy":s+=currentOpponent().hand.length>0?fx.value*2:0;break;case "shield_self":s+=p.hp<12?fx.value*2:fx.value;break;case "damage_enemy_if_self_desperation":if(isDesperate(p))s+=fx.value*1.8;break;case "damage_enemy_if_self_has_permanent":if(p.permanent)s+=fx.value*1.6;break;}}if(card.type==="perm"&&!p.permanent)s+=5;if(card.type==="perm"&&p.permanent)s+=1.5;return s;}
function aiChooseReaction(ri){const r=G.players[ri],te=G.stack[G.stack.length-1];if(!te)return null;const cands=r.hand.filter(c=>c.type==="quick"&&canAfford(r,c)).sort((a,b)=>cardHeuristic(r,b)-cardHeuristic(r,a));if(!cands.length)return null;const inc=estimateIncomingDamage(te,ri);if(inc>=r.hp||inc>=6){const ct=cands.find(c=>isCounterCard(c));if(ct)return ct;const sh=cands.find(c=>c.effects.some(fx=>fx.action==="shield_self"));if(sh)return sh;}if(Math.random()<0.28&&r.hp>9)return cands.find(c=>c.effects.some(fx=>fx.action==="damage_enemy"))||null;return null;}

/* ═══ REACTION ═══ */
async function handleReactionLoop(nri){G.reaction={active:true,reactorIdx:nri,passes:0};while(G.reaction.active&&!G.over){const reactor=G.players[G.reaction.reactorIdx];if(reactor.human){G.phase="reaction";log("⚡ Ventana de reacción.","react");render();await new Promise(r=>{humanReactionResolver=r;});if(G.reaction.passes>=2)break;}else{const rc=aiChooseReaction(G.reaction.reactorIdx);if(rc){removeCardFromHand(reactor,rc);const paid=effectiveCost(reactor,rc);reactor.hp-=paid;log(`⚡ ${reactor.name} reacciona con ${rc.name} (−${paid} HP).`,"react");showReactionBanner(`${reactor.name}: ${rc.name}`);if(reactor.hp<=0){G.over=true;G.winnerIdx=otherIndex(G.reaction.reactorIdx);break;}G.stack.push({card:rc,owner:reactor,casterIdx:G.reaction.reactorIdx,canceled:false});G.reaction.passes=0;G.reaction.reactorIdx=otherIndex(G.reaction.reactorIdx);render();await wait(260);}else{G.reaction.passes++;if(G.reaction.passes>=2)break;G.reaction.reactorIdx=otherIndex(G.reaction.reactorIdx);render();await wait(140);}}}G.reaction.active=false;humanReactionResolver=null;}

/* ═══ CAST ═══ */
async function castCard(ci,card){const c=G.players[ci];removeCardFromHand(c,card);const paid=effectiveCost(c,card);c.hp-=paid;log(`▶ ${c.name} juega ${card.name} (−${paid} HP).`,"sys");await showCastCinematic(card);if(c.hp<=0){G.over=true;G.winnerIdx=otherIndex(ci);return;}G.stack.push({card,owner:c,casterIdx:ci,canceled:false});await handleReactionLoop(otherIndex(ci));if(!G.over)await resolveStack();}

/* ═══ TURNS ═══ */
function resetTurnFlags(){for(const p of G.players){p.shield=0;p.flags.firstSpellBonusUsed=false;p.flags.firstQuickOnEnemyTurnUsed=false;p.flags.spellDamagePreventUsed=false;p.flags.preventDiscardUsed=false;p.flags.spellCastThisTurn=false;calculateAura(p);}}
function startOfTurnEffects(p){if(p.aura.startOfTurnDamageSelf)damage(p,p.aura.startOfTurnDamageSelf,opponentOf(G.players.indexOf(p)),p.permanent,false);if(!G.over&&p.aura.startOfTurnDrawSelf)drawCard(p,p.aura.startOfTurnDrawSelf,"inicio",false);}
function endOfTurnEffects(p){if(!G.over&&p.flags.spellCastThisTurn&&p.aura.endOfTurnDamageEnemyIfSelfCastSpell){log(`🌙 Efecto de fin de turno.`,"sys");damage(opponentOf(G.players.indexOf(p)),p.aura.endOfTurnDamageEnemyIfSelfCastSpell,p,p.permanent);}}
function shouldMulligan(p){return!p.hand.some(c=>c.cost<=2||c.type==="perm"||c.type==="consumable");}
function performMulligan(p){if(!shouldMulligan(p))return;log(`↺ ${p.name} toma mulligan.`,"sys");p.deck.push(...p.hand);p.deck=shuffle(p.deck);p.hand=[];drawCard(p,INITIAL_HAND,"mulligan",false);}

async function beginTurn(){
    if(G.over){render();showGameover();return;}G.turn++;resetTurnFlags();const player=currentPlayer();const ff=G.turn===1&&G.activeIdx===G.firstIdx;
    if(player.human)await showPhaseBanner("⚔️",`Turno ${G.turn}`,"Tu turno",900);else await showPhaseBanner("🔴",`Turno ${G.turn}`,`${player.name} se prepara...`,700);
    log(`════ Turno ${G.turn} · ${player.name} ════`,"sys");startOfTurnEffects(player);if(G.over){render();showGameover();return;}
    if(!ff)await drawCard(player,1,"fase de robo",true);else log(`⏭ ${player.name} no roba en su primer turno.`,"sys");
    if(G.over){render();showGameover();return;}G.canNormalSpellThisTurn=!ff;G.playerSpellPlayed=false;selectedHandIndex=null;hideCardPopup();
    if(player.human){G.phase="objects";await showPhaseBanner("🧿","Fase de Objetos","Permanentes o Consumibles",750);render();}
    else{G.phase="enemy_turn";render();await wait(400);await runAiTurn();}
}

async function endCurrentTurn(){if(G.over){render();showGameover();return;}endOfTurnEffects(currentPlayer());if(G.over){render();showGameover();return;}G.activeIdx=otherIndex(G.activeIdx);await beginTurn();}

async function runAiTurn(){const ai=G.players[G.activeIdx];const objs=ai.hand.filter(c=>(c.type==="perm"||c.type==="consumable")&&canAfford(ai,c)).sort((a,b)=>cardHeuristic(ai,b)-cardHeuristic(ai,a));let op=0;for(const card of objs){if(G.over||op>=2)break;if(cardHeuristic(ai,card)<2)continue;await castCard(G.activeIdx,card);op++;render();await wait(250);}if(!G.over&&G.canNormalSpellThisTurn){const sp=ai.hand.filter(c=>c.type==="spell"&&canAfford(ai,c)).sort((a,b)=>cardHeuristic(ai,b)-cardHeuristic(ai,a))[0];if(sp){await castCard(G.activeIdx,sp);ai.flags.spellCastThisTurn=true;render();await wait(300);}else log(`… ${ai.name} no lanza hechizo.`,"sys");}if(!G.over)await endCurrentTurn();}

/* ═══ PLAYER INPUT ═══ */
function canPlaySelectedCard(card){if(!G||G.over)return false;const p=G.players[0];if(G.activeIdx!==0&&G.phase!=="reaction")return false;if(G.phase==="reaction")return G.reaction?.active&&G.reaction.reactorIdx===0&&card.type==="quick"&&canAfford(p,card);if(G.phase==="objects")return(card.type==="perm"||card.type==="consumable")&&canAfford(p,card);if(G.phase==="spell")return!G.playerSpellPlayed&&card.type==="spell"&&canAfford(p,card);return false;}

async function onPlayCard(){
    if(!G||G.over||selectedHandIndex==null)return;const player=G.players[0],card=player.hand[selectedHandIndex];
    if(!card||!canPlaySelectedCard(card)){shakeEl("hand-wrap");return;}
    hideCardPopup();
    if(G.phase==="reaction"){removeCardFromHand(player,card);const paid=effectiveCost(player,card);player.hp-=paid;log(`⚡ ${player.name} reacciona con ${card.name} (−${paid} HP).`,"react");showReactionBanner(`${player.name}: ${card.name}`);if(player.hp<=0){G.over=true;G.winnerIdx=1;if(humanReactionResolver)humanReactionResolver();render();showGameover();return;}G.stack.push({card,owner:player,casterIdx:0,canceled:false});selectedHandIndex=null;G.reaction.passes=0;G.reaction.reactorIdx=1;if(humanReactionResolver)humanReactionResolver();render();return;}
    await castCard(0,card);if(card.type==="spell"){G.playerSpellPlayed=true;G.players[0].flags.spellCastThisTurn=true;G.phase="end";}else G.phase="objects";
    selectedHandIndex=null;render();if(G.over)showGameover();
}
function onPassReaction(){if(!G||G.over||G.phase!=="reaction"||!G.reaction?.active||G.reaction.reactorIdx!==0){shakeEl("btnPassReaction");return;}G.reaction.passes++;if(G.reaction.passes<2)G.reaction.reactorIdx=1;log(`… ${G.players[0].name} pasa.`,"sys");if(humanReactionResolver)humanReactionResolver();render();}
async function onToSpellPhase(){if(!G||G.over||G.activeIdx!==0||G.phase!=="objects"){shakeEl("btnToSpell");return;}selectedHandIndex=null;hideCardPopup();if(G.canNormalSpellThisTurn){await showPhaseBanner("✨","Fase de Hechizo","Lanza un hechizo",700);G.phase="spell";}else G.phase="end";render();}
async function onEndTurn(){if(!G||G.over||G.activeIdx!==0||G.phase==="reaction"){shakeEl("btnEndTurn");return;}hideCardPopup();await endCurrentTurn();render();}

/* ═══ GAME START ═══ */
async function startNewGame(auto=false){
    G={players:[createPlayer(AVATARS.player.name,!auto),createPlayer(AVATARS.enemy.name,false)],activeIdx:0,firstIdx:rand(2),turn:0,phase:"idle",stack:[],logs:[],over:false,winnerIdx:null,canNormalSpellThisTurn:true,playerSpellPlayed:false,reaction:null,startedAt:Date.now()};
    if(auto){G.players[0].human=false;G.players[1].human=false;}selectedHandIndex=null;humanReactionResolver=null;hideCardPopup();
    for(const p of G.players){drawCard(p,INITIAL_HAND,"mano inicial",false);performMulligan(p);calculateAura(p);}
    G.activeIdx=G.firstIdx;log(`═══ Nueva partida ═══`,"sys");log(`${G.players[G.firstIdx].name} comienza.`,"sys");
    render();await showPhaseBanner("⚔️","¡Duelo de Magos!","Que comience la batalla",1200);await beginTurn();
}
async function autoBattle(){await startNewGame(true);let g=0;while(!G.over&&g<MAX_TURNS){await wait(60);g++;}render();if(G.over)showGameover();}

/* ═══ RENDER ═══ */
function renderHp(prefix,player){$(`${prefix}HpText`).innerHTML=`${player.hp} <span>/ ${MAX_HP}</span>`;const bar=$(`${prefix}HpBar`);bar.style.width=`${Math.max(0,(player.hp/MAX_HP)*100)}%`;bar.className="hp-fill";if(player.hp<=DESP_THRESHOLD)bar.classList.add("desp");else if(player.hp<=10)bar.classList.add("low");else if(player.hp<=18)bar.classList.add("mid");$(`${prefix}DesperationTag`).classList.toggle("on",player.hp<=DESP_THRESHOLD);$(`${prefix==="player"?"playerZone":"enemyZone"}`).classList.toggle("desp-glow",player.hp<=DESP_THRESHOLD);}
function renderObject(prefix,player){const slot=$(`${prefix}ObjectSlot`);if(player.permanent){slot.className="obj-slot filled";let art=player.permanent.art;if(player.permanent.art_url)art=`<img src="${player.permanent.art_url}" style="width:24px;height:24px;border-radius:4px;object-fit:cover">`;slot.innerHTML=`<div class="obj-slot-name">${art} ${player.permanent.name}</div><div class="obj-cost">${player.permanent.cost}HP</div>`;}else{slot.className="obj-slot";slot.innerHTML=`<span class="obj-slot-empty">⬡</span>`;}}
function renderEnemyBackHand(){const c=$("enemyHandBacks");c.innerHTML="";if(!G)return;for(let i=0;i<Math.min(G.players[1].hand.length,6);i++){const d=document.createElement("div");d.className="card back";d.style.width="22px";d.innerHTML=`<div class="ci" style="height:32px;display:flex;align-items:center;justify-content:center"><span style="font-size:12px;opacity:.18">✦</span></div>`;c.appendChild(d);}}

function renderHand(){
    const container=$("hand");container.innerHTML="";if(!G)return;
    const player=G.players[0],desp=isDesperate(player);
    player.hand.forEach((card,index)=>{
        const playable=canPlaySelectedCard(card);const typeClass=card.type;const effCost=effectiveCost(player,card);const isSel=selectedHandIndex===index;
        const el=document.createElement("div");
        el.className=`card ${typeClass} ${isSel?"selected":""} ${!playable?"unplayable":""} ${desp&&effCost<card.cost?"desp-mode":""}`;
        el.style.animationDelay=`${index*60}ms`;
        const artContent=card.art_url?`<img src="${card.art_url}" alt="${card.name}" onerror="this.style.display='none';this.nextSibling.style.display='block'" style="width:100%;height:100%;object-fit:cover"><span style="display:none;font-size:28px;text-align:center;width:100%">${card.art}</span>`:`<span>${card.art}</span>`;
        el.innerHTML=`<div class="ci"><div class="c-cost ${effCost<=2?"cheap":""}">${effCost}</div><div class="c-tbadge">${labelForType(card.type)}</div><div class="c-art">${artContent}</div><div class="c-foot"><div class="c-name">${card.name}</div><div class="c-fx">${card.text}</div></div><div class="c-desp-disc">½</div></div>`;
        el.addEventListener("click",()=>{
            if(selectedHandIndex===index){selectedHandIndex=null;hideCardPopup();}
            else{selectedHandIndex=index;render();/* show popup after render so el is in DOM */setTimeout(()=>{const cardEl=container.children[index];if(cardEl)showCardPopup(cardEl,card,playable);},20);}
            render();
        });
        container.appendChild(el);
    });
}

function renderPhase(){
    if(!G){$("turnText").textContent="—";$("phasePill").textContent="Sin partida";$("reactionHint").textContent="";return;}
    const pn={idle:"Preparando",objects:"Fase objetos",spell:"Fase hechizo",end:"Fin de turno",reaction:"Reacción",enemy_turn:"Turno rival"};
    $("turnText").textContent=G.over?`Ganador: ${G.players[G.winnerIdx].name}`:G.players[G.activeIdx].name;
    $("phasePill").textContent=G.over?"Fin de partida":(pn[G.phase]||G.phase);
    $("phasePill").classList.toggle("active",G.activeIdx===0&&!G.over);
    $("playerZone").classList.toggle("active",G.activeIdx===0&&!G.over);
    $("enemyZone").classList.toggle("active",G.activeIdx===1&&!G.over);
    if(G.phase==="reaction"&&G.reaction?.active)$("reactionHint").textContent=G.reaction.reactorIdx===0?"Tu ventana de reacción":"Reacción rival";else $("reactionHint").textContent="";
}
function renderBattlefieldButtons(){
    if(!G){$("btnToSpell").disabled=true;$("btnEndTurn").disabled=true;$("btnPassReaction").disabled=true;return;}
    $("btnToSpell").disabled=!(G.activeIdx===0&&!G.over&&G.phase==="objects");
    $("btnEndTurn").disabled=!(G.activeIdx===0&&!G.over&&G.phase!=="reaction");
    $("btnPassReaction").disabled=!(G.phase==="reaction"&&G.reaction?.active&&G.reaction.reactorIdx===0);
    $("btnToSpell").style.display=(G.phase==="objects"&&G.activeIdx===0&&!G.over)?"":"none";
    $("btnEndTurn").style.display=(G.activeIdx===0&&!G.over&&G.phase!=="reaction")?"":"none";
    $("btnPassReaction").style.display=(G.phase==="reaction"&&G.reaction?.active&&G.reaction.reactorIdx===0)?"":"none";
}
function renderLog(){$("logBox").innerHTML=G.logs.slice(0,50).map(e=>`<div class="log-e ${e.cls}">${e.msg}</div>`).join("");}
function renderStats(){if(!G)return;$("statTurn").textContent=G.turn||"—";$("statPlayerDiscard").textContent=G.players[0].discard.length;$("statEnemyHand").textContent=G.players[1].hand.length;}

function render(){
    $("playerAvatarImg").src=AVATARS.player.src;$("enemyAvatarImg").src=AVATARS.enemy.src;
    if($("playerNameInput").style.display==="none")$("playerName").textContent=AVATARS.player.name;
    if($("enemyNameInput").style.display==="none")$("enemyName").textContent=AVATARS.enemy.name;
    if(!G)return;
    renderHp("player",G.players[0]);renderHp("enemy",G.players[1]);
    renderObject("player",G.players[0]);renderObject("enemy",G.players[1]);
    $("playerDeckText").textContent=G.players[0].deck.length;$("enemyDeckText").textContent=G.players[1].deck.length;
    renderEnemyBackHand();renderHand();renderPhase();renderBattlefieldButtons();renderLog();renderStats();
    if(G.over)showGameover();
}

/* ═══ MODALS ═══ */
function showGameover(){if(!G||!G.over)return;const w=G.players[G.winnerIdx],y=G.winnerIdx===0;$("gameoverTitle").textContent=y?"¡Victoria!":"Derrota";$("gameoverTitle").style.color=y?"var(--gold2)":"var(--red3)";$("gameoverSub").textContent=y?`Has derrotado a ${G.players[1].name}`:`${G.players[1].name} te ha vencido`;$("gameoverStats").innerHTML=`Turnos: ${G.turn}<br>Ganador: ${w.name}<br>Tu vida: ${G.players[0].hp} HP<br>Duración: ${Math.round((Date.now()-G.startedAt)/1000)}s`;$("gameoverOverlay").classList.add("on");}
function hideGameover(){$("gameoverOverlay").classList.remove("on");}
function openRules(){$("rulesOverlay").classList.add("on");}
function closeRules(){$("rulesOverlay").classList.remove("on");}
function openLog(){$("logOverlay").classList.add("on");if(G)renderLog();}
function closeLog(){$("logOverlay").classList.remove("on");}

/* ═══ BACKGROUND ═══ */
function initBackground(){const cosmos=$("cosmos");cosmos.innerHTML="";for(let i=0;i<80;i++){const s=document.createElement("div");s.className="star";const sz=Math.random()*1.8+0.4;s.style.cssText=`width:${sz}px;height:${sz}px;left:${Math.random()*100}%;top:${Math.random()*100}%;animation-duration:${Math.random()*4+2}s;animation-delay:${Math.random()*5}s;opacity:${Math.random()*0.6+0.1};`;cosmos.appendChild(s);}const runes=["✦","✧","⬡","◈","⟡","⌬","⊕"];for(let i=0;i<10;i++){const r=document.createElement("div");r.className="rune-bg";r.textContent=runes[rand(runes.length)];r.style.cssText=`left:${Math.random()*100}%;font-size:${rand(50)+30}px;animation-duration:${rand(14)+12}s;animation-delay:${rand(10)}s;`;cosmos.appendChild(r);}}

/* ═══ INIT ═══ */
async function loadCards(){try{const r=await fetch("cards.json");CARD_POOL=await r.json();console.log(`✅ ${CARD_POOL.length} cartas`);}catch(e){console.error(e);alert("Error al cargar cards.json");}}

async function init(){
    await loadCards();
    $("btnToSpell").addEventListener("click",onToSpellPhase);
    $("btnEndTurn").addEventListener("click",onEndTurn);
    $("btnPassReaction").addEventListener("click",onPassReaction);
    $("btnNewGame").addEventListener("click",()=>startNewGame(false));
    $("btnAutoBattle").addEventListener("click",()=>autoBattle());
    $("btnRestartOverlay").addEventListener("click",()=>{hideGameover();startNewGame(false);});
    $("btnRules").addEventListener("click",openRules);
    $("btnCloseRules").addEventListener("click",closeRules);
    $("rulesOverlay").addEventListener("click",e=>{if(e.target===$("rulesOverlay"))closeRules();});
    $("btnOpenLog").addEventListener("click",openLog);
    $("btnCloseLog").addEventListener("click",closeLog);
    $("logOverlay").addEventListener("click",e=>{if(e.target===$("logOverlay"))closeLog();});
    $("cardPopupClose").addEventListener("click",()=>{hideCardPopup();selectedHandIndex=null;render();});
    // Close popup when clicking outside
    document.addEventListener("click",e=>{const popup=$("cardPopup");if(popup.classList.contains("show")&&!popup.contains(e.target)&&!e.target.closest(".card")){hideCardPopup();selectedHandIndex=null;render();}});
    setupNameEditing("playerName","playerNameInput","player");
    setupNameEditing("enemyName","enemyNameInput","enemy");
    initBackground();render();
}
init();
