const MAX_HP = 30;
const DESP_THRESHOLD = 14;
const INITIAL_HAND = 5;
const DECK_SIZE = 30;
const MAX_COPIES = 3;
const MAX_TURNS = 100;

const AVATARS = {
    player: { name: "Carlos", src: "img/avatar-jugador.png" },
    enemy:  { name: "Magus Rojo", src: "img/avatar-enemigo.png" }
};

const CARD_POOL = [
    { id: "DM001", name: "Descarga Arcana", type: "spell", cost: 4, art: "⚡", text: "Inflige 6 de daño al Avatar enemigo.", effects: [{ action: "damage_enemy", value: 6 }] },
    { id: "DM002", name: "Absorción Vital", type: "spell", cost: 3, art: "💚", text: "Recuperas 5 HP.", effects: [{ action: "heal_self", value: 5 }] },
    { id: "DM003", name: "Velo de Sombra", type: "spell", cost: 5, art: "🌑", text: "El oponente descarta 1 carta al azar.", effects: [{ action: "discard_random_enemy", value: 1 }] },
    { id: "DM004", name: "Llama Menor", type: "spell", cost: 2, art: "🔥", text: "Inflige 3 de daño al Avatar enemigo.", effects: [{ action: "damage_enemy", value: 3 }] },
    { id: "DM005", name: "Rayo Concentrado", type: "spell", cost: 5, art: "⚡", text: "Inflige 7 de daño al Avatar enemigo.", effects: [{ action: "damage_enemy", value: 7 }] },
    { id: "DM006", name: "Curación Serena", type: "spell", cost: 2, art: "🕊️", text: "Recuperas 3 HP.", effects: [{ action: "heal_self", value: 3 }] },
    { id: "DM007", name: "Drenaje Oscuro", type: "spell", cost: 4, art: "🩸", text: "Inflige 4 de daño al enemigo y recuperas 2 HP.", effects: [{ action: "damage_enemy", value: 4 }, { action: "heal_self", value: 2 }] },
    { id: "DM008", name: "Impacto Ígneo", type: "spell", cost: 3, art: "💥", text: "Inflige 5 de daño al Avatar enemigo.", effects: [{ action: "damage_enemy", value: 5 }] },
    { id: "DM009", name: "Niebla Confusa", type: "spell", cost: 3, art: "🌫️", text: "El oponente descarta 1 carta.", effects: [{ action: "discard_random_enemy", value: 1 }] },
    { id: "DM010", name: "Bendición de Cristal", type: "spell", cost: 4, art: "💎", text: "Recuperas 6 HP.", effects: [{ action: "heal_self", value: 6 }] },
    { id: "DM011", name: "Golpe Astral", type: "spell", cost: 4, art: "🌟", text: "Inflige 5 de daño. Si estás en Desesperación, inflige 7 en su lugar.", effects: [{ action: "damage_enemy", value: 5 }, { action: "damage_enemy_if_self_desperation", value: 2 }] },
    { id: "DM012", name: "Sello de Dolor", type: "spell", cost: 2, art: "☠️", text: "Ambos jugadores reciben 2 de daño.", effects: [{ action: "damage_enemy", value: 2 }, { action: "damage_self", value: 2 }] },
    { id: "DM013", name: "Luz Restauradora", type: "spell", cost: 1, art: "✨", text: "Recuperas 2 HP.", effects: [{ action: "heal_self", value: 2 }] },
    { id: "DM014", name: "Martillo Rúnico", type: "spell", cost: 6, art: "🔨", text: "Inflige 8 de daño al Avatar enemigo.", effects: [{ action: "damage_enemy", value: 8 }] },
    { id: "DM015", name: "Pulso del Vacío", type: "spell", cost: 4, art: "🌀", text: "El oponente descarta 2 cartas.", effects: [{ action: "discard_random_enemy", value: 2 }] },
    { id: "DM016", name: "Eco del Dolor", type: "spell", cost: 3, art: "👁️", text: "Inflige 4 de daño al Avatar enemigo. Si controlas un objeto permanente, inflige 5 en su lugar.", effects: [{ action: "damage_enemy", value: 4 }, { action: "damage_enemy_if_self_has_permanent", value: 1 }] },
    { id: "DM017", name: "Estallido Celeste", type: "spell", cost: 5, art: "🌠", text: "Inflige 6 de daño al Avatar enemigo y robas 1 carta.", effects: [{ action: "damage_enemy", value: 6 }, { action: "draw_self", value: 1 }] },
    { id: "DM018", name: "Pacto de Sangre", type: "spell", cost: 1, art: "🔴", text: "Pierdes 2 HP adicionales y robas 2 cartas.", effects: [{ action: "damage_self", value: 2 }, { action: "draw_self", value: 2 }] },
    { id: "DM019", name: "Ruptura Mental", type: "spell", cost: 4, art: "🧠", text: "Mira la mano del oponente y elige 1 carta para que la descarte. En esta alpha, descarta 1 al azar.", effects: [{ action: "discard_random_enemy", value: 1 }] },
    { id: "DM020", name: "Nova Carmesí", type: "spell", cost: 6, art: "🌹", text: "Inflige 9 de daño al Avatar enemigo. Luego recibes 1 de daño.", effects: [{ action: "damage_enemy", value: 9 }, { action: "damage_self", value: 1 }] },

    { id: "DM021", name: "Interrupción", type: "quick", cost: 6, art: "✋", text: "Cancela un Hechizo normal o rápido.", effects: [{ action: "counter_spell", value: 1 }] },
    { id: "DM022", name: "Contragolpe", type: "quick", cost: 5, art: "⚔️", text: "Inflige 3 de daño al Avatar enemigo.", effects: [{ action: "damage_enemy", value: 3 }] },
    { id: "DM023", name: "Escudo Instante", type: "quick", cost: 4, art: "🛡️", text: "Previene hasta 4 de daño del próximo hechizo que recibas este turno.", effects: [{ action: "shield_self", value: 4 }] },
    { id: "DM024", name: "Paso Etéreo", type: "quick", cost: 3, art: "👻", text: "Previene hasta 2 de daño este turno.", effects: [{ action: "shield_self", value: 2 }] },
    { id: "DM025", name: "Reflejo Arcano", type: "quick", cost: 5, art: "🪞", text: "Cancela un Hechizo Rápido.", effects: [{ action: "counter_quick", value: 1 }] },
    { id: "DM026", name: "Descarga Súbita", type: "quick", cost: 4, art: "⚡", text: "Inflige 2 de daño al Avatar enemigo y robas 1 carta.", effects: [{ action: "damage_enemy", value: 2 }, { action: "draw_self", value: 1 }] },
    { id: "DM027", name: "Traba Mental", type: "quick", cost: 4, art: "🧩", text: "El oponente descarta 1 carta al azar.", effects: [{ action: "discard_random_enemy", value: 1 }] },
    { id: "DM028", name: "Chispa Defensiva", type: "quick", cost: 2, art: "✦", text: "Previene 1 de daño y robas 1 carta.", effects: [{ action: "shield_self", value: 1 }, { action: "draw_self", value: 1 }] },
    { id: "DM029", name: "Barrera de Sal", type: "quick", cost: 3, art: "🧂", text: "Cancela un objeto consumible.", effects: [{ action: "counter_consumable", value: 1 }] },
    { id: "DM030", name: "Reprensión", type: "quick", cost: 5, art: "⚡", text: "Si el oponente lanzó un hechizo este turno, inflige 4 de daño al Avatar enemigo.", effects: [{ action: "damage_enemy_if_enemy_cast_spell_this_turn", value: 4 }] },
    { id: "DM031", name: "Velo Espejo", type: "quick", cost: 6, art: "🔮", text: "Cancela un hechizo del oponente y robas 1 carta.", effects: [{ action: "counter_spell_if_from_enemy", value: 1 }, { action: "draw_self", value: 1 }] },
    { id: "DM032", name: "Toque de Ceniza", type: "quick", cost: 3, art: "💨", text: "Inflige 2 de daño al Avatar enemigo.", effects: [{ action: "damage_enemy", value: 2 }] },
    { id: "DM033", name: "Latido Reverso", type: "quick", cost: 4, art: "💗", text: "Recuperas 3 HP.", effects: [{ action: "heal_self", value: 3 }] },
    { id: "DM034", name: "Murmullo Roto", type: "quick", cost: 5, art: "🌊", text: "El oponente descarta 2 cartas al azar.", effects: [{ action: "discard_random_enemy", value: 2 }] },
    { id: "DM035", name: "Cierre Arcano", type: "quick", cost: 6, art: "🔒", text: "Cancela un hechizo. Si era rápido, ambos jugadores roban 1 carta.", effects: [{ action: "counter_spell", value: 1 }, { action: "draw_both_if_target_was_quick", value: 1 }] },
    { id: "DM036", name: "Chispa Cruel", type: "quick", cost: 4, art: "🌪️", text: "Inflige 3 de daño. Si estás en Desesperación, inflige 4 en su lugar.", effects: [{ action: "damage_enemy", value: 3 }, { action: "damage_enemy_if_self_desperation", value: 1 }] },
    { id: "DM037", name: "Juramento Breve", type: "quick", cost: 2, art: "🤝", text: "Recuperas 1 HP y previenes 1 de daño este turno.", effects: [{ action: "heal_self", value: 1 }, { action: "shield_self", value: 1 }] },
    { id: "DM038", name: "Última Palabra", type: "quick", cost: 7, art: "💀", text: "Cancela cualquier hechizo en la cadena.", effects: [{ action: "counter_any_spell_in_chain", value: 1 }] },

    { id: "DM039", name: "Manto de Espinas", type: "perm", cost: 2, art: "🌿", text: "Mientras esté en campo, cada vez que recibas daño, el oponente recibe 1 de daño.", effects: [{ action: "reflect_damage_when_hit", value: 1 }] },
    { id: "DM040", name: "Corona de Hueso", type: "perm", cost: 3, art: "👑", text: "Tus hechizos hacen 1 de daño adicional.", effects: [{ action: "buff_self_spell_damage", value: 1 }] },
    { id: "DM041", name: "Orbe del Alba", type: "perm", cost: 3, art: "🔮", text: "La primera vez que juegues un hechizo cada turno, recuperas 1 HP.", effects: [{ action: "heal_self_first_spell_each_turn", value: 1 }] },
    { id: "DM042", name: "Runa de Marfil", type: "perm", cost: 2, art: "🦴", text: "Tus hechizos de curación recuperan 1 HP adicional.", effects: [{ action: "buff_self_heal_spells", value: 1 }] },
    { id: "DM043", name: "Máscara de Niebla", type: "perm", cost: 4, art: "🎭", text: "La primera vez que el oponente te haga descartar cada turno, lo ignoras.", effects: [{ action: "prevent_first_discard_against_self_each_turn", value: 1 }] },
    { id: "DM044", name: "Reloj de Ceniza", type: "perm", cost: 3, art: "⏳", text: "Al inicio de tu turno, pierdes 1 HP y robas 1 carta.", effects: [{ action: "start_of_turn_damage_self", value: 1 }, { action: "start_of_turn_draw_self", value: 1 }] },
    { id: "DM045", name: "Tótem del Eco", type: "perm", cost: 4, art: "🗿", text: "La primera vez que juegues un Hechizo Rápido en el turno del oponente, recuperas 1 HP.", effects: [{ action: "heal_self_first_quick_on_enemy_turn", value: 1 }] },
    { id: "DM046", name: "Lámpara del Pacto", type: "perm", cost: 2, art: "🪔", text: "Tus objetos consumibles cuestan 1 HP menos, mínimo 1.", effects: [{ action: "reduce_self_consumable_cost", value: 1, minimum: 1 }] },
    { id: "DM047", name: "Anillo de Obsidiana", type: "perm", cost: 5, art: "💍", text: "Una vez por turno, cuando recibas daño de un hechizo, prevén 2 de ese daño.", effects: [{ action: "prevent_spell_damage_once_each_turn", value: 2 }] },
    { id: "DM048", name: "Placa de Bronce", type: "perm", cost: 3, art: "🛡️", text: "Tus Hechizos Rápidos cuestan 1 HP menos, mínimo 1.", effects: [{ action: "reduce_self_quick_cost", value: 1, minimum: 1 }] },
    { id: "DM049", name: "Ojo Carmesí", type: "perm", cost: 4, art: "👁️", text: "Al final de tu turno, si lanzaste un hechizo, inflige 1 de daño al Avatar enemigo.", effects: [{ action: "end_of_turn_damage_enemy_if_self_cast_spell", value: 1 }] },
    { id: "DM050", name: "Campana Vacía", type: "perm", cost: 2, art: "🔔", text: "Cuando reemplaces este objeto, roba 1 carta.", effects: [{ action: "draw_self_when_replaced", value: 1 }] },

    { id: "DM051", name: "Grimorio Menor", type: "consumable", cost: 3, art: "📖", text: "Roba 2 cartas.", effects: [{ action: "draw_self", value: 2 }] },
    { id: "DM052", name: "Poción Rubí", type: "consumable", cost: 2, art: "🧪", text: "Recuperas 4 HP.", effects: [{ action: "heal_self", value: 4 }] },
    { id: "DM053", name: "Pergamino de Fuego", type: "consumable", cost: 3, art: "📜", text: "Inflige 4 de daño al Avatar enemigo.", effects: [{ action: "damage_enemy", value: 4 }] },
    { id: "DM054", name: "Frasco de Humo", type: "consumable", cost: 2, art: "💨", text: "El oponente descarta 1 carta al azar.", effects: [{ action: "discard_random_enemy", value: 1 }] },
    { id: "DM055", name: "Sal Bendita", type: "consumable", cost: 1, art: "✦", text: "Previene hasta 2 de daño este turno.", effects: [{ action: "shield_self", value: 2 }] },
    { id: "DM056", name: "Elixir Sombrío", type: "consumable", cost: 1, art: "🌒", text: "Pierdes 2 HP y robas 2 cartas.", effects: [{ action: "damage_self", value: 2 }, { action: "draw_self", value: 2 }] },
    { id: "DM057", name: "Lente del Eco", type: "consumable", cost: 2, art: "🔍", text: "Roba 1 carta y recuperas 1 HP.", effects: [{ action: "draw_self", value: 1 }, { action: "heal_self", value: 1 }] },
    { id: "DM058", name: "Bomba de Ceniza", type: "consumable", cost: 4, art: "💣", text: "Ambos jugadores reciben 3 de daño.", effects: [{ action: "damage_enemy", value: 3 }, { action: "damage_self", value: 3 }] },
    { id: "DM059", name: "Talismán de Respiro", type: "consumable", cost: 2, art: "🌬️", text: "Recuperas 2 HP y robas 1 carta.", effects: [{ action: "heal_self", value: 2 }, { action: "draw_self", value: 1 }] },
    { id: "DM060", name: "Moneda del Riesgo", type: "consumable", cost: 0, art: "🪙", text: "Pierdes 1 HP y luego robas 1 carta.", effects: [{ action: "damage_self", value: 1 }, { action: "draw_self", value: 1 }] }
];

let G = null;
let selectedHandIndex = null;
let humanReactionResolver = null;

const $ = (id) => document.getElementById(id);
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const rand = (max) => Math.floor(Math.random() * max);

function cloneCard(card) {
    return JSON.parse(JSON.stringify(card));
}

function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = rand(i + 1);
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function isDesperate(player) {
    return player.hp <= DESP_THRESHOLD;
}

function otherIndex(index) {
    return index === 0 ? 1 : 0;
}

function currentPlayer() {
    return G.players[G.activeIdx];
}

function opponentOf(index) {
    return G.players[otherIndex(index)];
}

function currentOpponent() {
    return G.players[otherIndex(G.activeIdx)];
}

function isSpellLike(card) {
    return card.type === "spell" || card.type === "quick" || card.type === "consumable";
}

function log(msg, cls = "") {
    G.logs.unshift({ msg, cls });
    if (G.logs.length > 120) G.logs.pop();
}

function createDeck() {
    const counts = {};
    const deck = [];

    while (deck.length < DECK_SIZE) {
        const template = CARD_POOL[rand(CARD_POOL.length)];
        counts[template.id] = counts[template.id] || 0;
        if (counts[template.id] < MAX_COPIES) {
            counts[template.id] += 1;
            deck.push(cloneCard(template));
        }
    }

    return shuffle(deck);
}

function createPlayer(name, human) {
    return {
        name,
        human,
        hp: MAX_HP,
        deck: createDeck(),
        hand: [],
        discard: [],
        permanent: null,
        shield: 0,
        aura: {},
        flags: {
            spellCastThisTurn: false,
            firstSpellBonusUsed: false,
            firstQuickOnEnemyTurnUsed: false,
            spellDamagePreventUsed: false,
            preventDiscardUsed: false
        }
    };
}

function calculateAura(player) {
    const aura = {
        reflectDamageWhenHit: 0,
        buffSelfSpellDamage: 0,
        healSelfFirstSpellEachTurn: 0,
        buffSelfHealSpells: 0,
        startOfTurnDamageSelf: 0,
        startOfTurnDrawSelf: 0,
        healSelfFirstQuickOnEnemyTurn: 0,
        reduceSelfConsumableCost: 0,
        preventSpellDamageOnceEachTurn: 0,
        reduceSelfQuickCost: 0,
        endOfTurnDamageEnemyIfSelfCastSpell: 0,
        drawSelfWhenReplaced: 0,
        preventFirstDiscardAgainstSelfEachTurn: false
    };

    if (player.permanent) {
        for (const fx of player.permanent.effects) {
            switch (fx.action) {
                case "reflect_damage_when_hit":
                    aura.reflectDamageWhenHit = fx.value;
                    break;
                case "buff_self_spell_damage":
                    aura.buffSelfSpellDamage = fx.value;
                    break;
                case "heal_self_first_spell_each_turn":
                    aura.healSelfFirstSpellEachTurn = fx.value;
                    break;
                case "buff_self_heal_spells":
                    aura.buffSelfHealSpells = fx.value;
                    break;
                case "start_of_turn_damage_self":
                    aura.startOfTurnDamageSelf = fx.value;
                    break;
                case "start_of_turn_draw_self":
                    aura.startOfTurnDrawSelf = fx.value;
                    break;
                case "heal_self_first_quick_on_enemy_turn":
                    aura.healSelfFirstQuickOnEnemyTurn = fx.value;
                    break;
                case "reduce_self_consumable_cost":
                    aura.reduceSelfConsumableCost = fx.value;
                    break;
                case "prevent_spell_damage_once_each_turn":
                    aura.preventSpellDamageOnceEachTurn = fx.value;
                    break;
                case "reduce_self_quick_cost":
                    aura.reduceSelfQuickCost = fx.value;
                    break;
                case "end_of_turn_damage_enemy_if_self_cast_spell":
                    aura.endOfTurnDamageEnemyIfSelfCastSpell = fx.value;
                    break;
                case "draw_self_when_replaced":
                    aura.drawSelfWhenReplaced = fx.value;
                    break;
                case "prevent_first_discard_against_self_each_turn":
                    aura.preventFirstDiscardAgainstSelfEachTurn = true;
                    break;
            }
        }
    }

    player.aura = aura;
}

function effectiveCost(player, card) {
    let value = card.cost;

    if (card.type === "quick" && player.aura.reduceSelfQuickCost) {
        value = Math.max(1, value - player.aura.reduceSelfQuickCost);
    }

    if (card.type === "consumable" && player.aura.reduceSelfConsumableCost) {
        value = Math.max(1, value - player.aura.reduceSelfConsumableCost);
    }

    if (isDesperate(player) && value > 0) {
        value = Math.max(1, Math.ceil(value / 2));
    }

    return value;
}

function canAfford(player, card) {
    return effectiveCost(player, card) < player.hp;
}

function removeCardFromHand(player, card) {
    const index = player.hand.indexOf(card);
    if (index >= 0) player.hand.splice(index, 1);
}

function drawCard(player, amount = 1, reason = "robo") {
    for (let i = 0; i < amount; i++) {
        if (G.over) return;
        if (player.deck.length === 0) {
            G.over = true;
            G.winnerIdx = otherIndex(G.players.indexOf(player));
            log(`☠ ${player.name} no puede robar por ${reason}. Mazo vacío.`, "dmg");
            return;
        }
        const card = player.deck.shift();
        player.hand.push(card);
        log(`+ ${player.name} roba ${card.name}.`, "sys");
    }
}

function rawDamage(target, value) {
    target.hp -= value;
    if (target.hp < 0) target.hp = 0;
}

function floatingDamage(side, amount, kind = "dmg") {
    const zone = $(side === "player" ? "playerZone" : "enemyZone");
    const r = zone.getBoundingClientRect();
    const el = document.createElement("div");
    el.className = `dmg-float ${kind}`;
    el.textContent = kind === "heal" ? `+${amount}` : `-${amount}`;
    el.style.left = `${r.left + r.width / 2 - 16}px`;
    el.style.top = `${r.top + r.height / 2}px`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 850);
}

function showReactionBanner(text) {
    const el = document.createElement("div");
    el.className = "react-banner";
    el.textContent = text;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1700);
}

function showResolvingCard(card) {
    const el = document.createElement("div");
    el.className = "resolving";
    el.textContent = card.art || "✦";
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 450);
}

function shakeEl(id) {
    const el = $(id);
    el.classList.add("shake");
    setTimeout(() => el.classList.remove("shake"), 360);
}

function damage(targetPlayer, amount, sourcePlayer = null, sourceCard = null, allowReflect = true) {
    if (G.over || amount <= 0) return;

    let finalAmount = amount;

    if (targetPlayer.shield > 0) {
        const blocked = Math.min(targetPlayer.shield, finalAmount);
        targetPlayer.shield -= blocked;
        finalAmount -= blocked;
        if (blocked > 0) log(`🛡 ${targetPlayer.name} bloquea ${blocked} daño.`, "sys");
    }

    if (
        finalAmount > 0 &&
        sourceCard &&
        isSpellLike(sourceCard) &&
        targetPlayer.aura.preventSpellDamageOnceEachTurn &&
        !targetPlayer.flags.spellDamagePreventUsed
    ) {
        const prevented = Math.min(targetPlayer.aura.preventSpellDamageOnceEachTurn, finalAmount);
        finalAmount -= prevented;
        targetPlayer.flags.spellDamagePreventUsed = true;
        if (prevented > 0) {
            log(`🛡 ${targetPlayer.name} previene ${prevented} con ${targetPlayer.permanent?.name || "su objeto"}.`, "sys");
        }
    }

    if (finalAmount <= 0) return;

    rawDamage(targetPlayer, finalAmount);
    log(`💥 ${targetPlayer.name} recibe ${finalAmount} daño → ${targetPlayer.hp} HP.`, "dmg");
    floatingDamage(G.players.indexOf(targetPlayer) === 0 ? "player" : "enemy", finalAmount, "dmg");

    if (targetPlayer.hp <= 0) {
        G.over = true;
        G.winnerIdx = sourcePlayer ? G.players.indexOf(sourcePlayer) : otherIndex(G.players.indexOf(targetPlayer));
        return;
    }

    if (
        allowReflect &&
        sourcePlayer &&
        targetPlayer.aura.reflectDamageWhenHit > 0 &&
        sourcePlayer.hp > 0
    ) {
        const reflect = targetPlayer.aura.reflectDamageWhenHit;
        rawDamage(sourcePlayer, reflect);
        log(`↩ ${targetPlayer.name} refleja ${reflect} daño a ${sourcePlayer.name}.`, "react");
        floatingDamage(G.players.indexOf(sourcePlayer) === 0 ? "player" : "enemy", reflect, "dmg");
        if (sourcePlayer.hp <= 0) {
            G.over = true;
            G.winnerIdx = G.players.indexOf(targetPlayer);
        }
    }
}

function heal(player, amount, sourceCard = null) {
    if (G.over || amount <= 0) return;

    let finalAmount = amount;

    if (sourceCard && sourceCard.type === "spell" && player.aura.buffSelfHealSpells) {
        finalAmount += player.aura.buffSelfHealSpells;
    }

    const before = player.hp;
    player.hp = Math.min(MAX_HP, player.hp + finalAmount);
    const gained = player.hp - before;

    if (gained > 0) {
        log(`❤ ${player.name} recupera ${gained} HP → ${player.hp} HP.`, "heal");
        floatingDamage(G.players.indexOf(player) === 0 ? "player" : "enemy", gained, "heal");
    }
}

function discardRandom(enemyPlayer, amount) {
    for (let i = 0; i < amount; i++) {
        if (!enemyPlayer.hand.length) return;

        if (
            enemyPlayer.aura.preventFirstDiscardAgainstSelfEachTurn &&
            !enemyPlayer.flags.preventDiscardUsed
        ) {
            enemyPlayer.flags.preventDiscardUsed = true;
            log(`✨ ${enemyPlayer.name} evita un descarte con ${enemyPlayer.permanent?.name || "su objeto"}.`, "sys");
            continue;
        }

        const index = rand(enemyPlayer.hand.length);
        const [card] = enemyPlayer.hand.splice(index, 1);
        enemyPlayer.discard.push(card);
        log(`🗑 ${enemyPlayer.name} descarta ${card.name}.`, "sys");
    }
}

function hasCounterEffect(card, actionName) {
    return card.effects.some((fx) => fx.action === actionName);
}

function isCounterCard(card) {
    return card.effects.some((fx) =>
        ["counter_spell", "counter_quick", "counter_consumable", "counter_spell_if_from_enemy", "counter_any_spell_in_chain"].includes(fx.action)
    );
}

function findCounterTarget() {
    for (let i = G.stack.length - 1; i >= 0; i--) {
        if (!G.stack[i].canceled) return G.stack[i];
    }
    return null;
}

function counterMatches(card, targetEntry, counterCasterIdx) {
    if (!targetEntry) return false;

    const targetCard = targetEntry.card;
    const targetIsEnemy = targetEntry.casterIdx !== counterCasterIdx;

    if (hasCounterEffect(card, "counter_any_spell_in_chain")) {
        return targetCard.type === "spell" || targetCard.type === "quick";
    }

    if (hasCounterEffect(card, "counter_spell_if_from_enemy")) {
        return targetIsEnemy && (targetCard.type === "spell" || targetCard.type === "quick");
    }

    if (hasCounterEffect(card, "counter_spell")) {
        return targetCard.type === "spell" || targetCard.type === "quick";
    }

    if (hasCounterEffect(card, "counter_quick")) {
        return targetCard.type === "quick";
    }

    if (hasCounterEffect(card, "counter_consumable")) {
        return targetCard.type === "consumable";
    }

    return false;
}

function applyPermanent(caster, card) {
    const old = caster.permanent;

    if (old && caster.aura.drawSelfWhenReplaced) {
        drawCard(caster, caster.aura.drawSelfWhenReplaced, "reemplazo");
    }

    if (old) {
        caster.discard.push(old);
        log(`🔁 ${caster.name} reemplaza ${old.name} por ${card.name}.`, "sys");
    } else {
        log(`🧿 ${caster.name} coloca ${card.name}.`, "sys");
    }

    caster.permanent = card;
    calculateAura(caster);
}

function markSpellFlags(entry) {
    const caster = G.players[entry.casterIdx];
    const isEnemyTurnForCaster = G.activeIdx !== entry.casterIdx;

    if (entry.card.type === "spell") {
        caster.flags.spellCastThisTurn = true;

        if (
            caster.aura.healSelfFirstSpellEachTurn &&
            !caster.flags.firstSpellBonusUsed
        ) {
            heal(caster, caster.aura.healSelfFirstSpellEachTurn, null);
            caster.flags.firstSpellBonusUsed = true;
        }
    }

    if (
        entry.card.type === "quick" &&
        isEnemyTurnForCaster &&
        caster.aura.healSelfFirstQuickOnEnemyTurn &&
        !caster.flags.firstQuickOnEnemyTurnUsed
    ) {
        heal(caster, caster.aura.healSelfFirstQuickOnEnemyTurn, null);
        caster.flags.firstQuickOnEnemyTurnUsed = true;
    }
}

function applyEffects(entry) {
    const caster = G.players[entry.casterIdx];
    const enemy = G.players[otherIndex(entry.casterIdx)];

    markSpellFlags(entry);

    for (const fx of entry.card.effects) {
        if (G.over) break;

        switch (fx.action) {
            case "damage_enemy":
                damage(enemy, fx.value + (entry.card.type === "spell" ? caster.aura.buffSelfSpellDamage : 0), caster, entry.card);
                break;

            case "damage_self":
                damage(caster, fx.value, enemy, entry.card, false);
                break;

            case "heal_self":
                heal(caster, fx.value, entry.card);
                break;

            case "draw_self":
                drawCard(caster, fx.value, entry.card.name);
                break;

            case "shield_self":
                caster.shield += fx.value;
                log(`🛡 ${caster.name} gana ${fx.value} de escudo.`, "sys");
                break;

            case "discard_random_enemy":
                discardRandom(enemy, fx.value);
                break;

            case "damage_enemy_if_self_desperation":
                if (isDesperate(caster)) {
                    damage(enemy, fx.value + (entry.card.type === "spell" ? caster.aura.buffSelfSpellDamage : 0), caster, entry.card);
                }
                break;

            case "damage_enemy_if_self_has_permanent":
                if (caster.permanent) {
                    damage(enemy, fx.value + (entry.card.type === "spell" ? caster.aura.buffSelfSpellDamage : 0), caster, entry.card);
                }
                break;

            case "damage_enemy_if_enemy_cast_spell_this_turn":
                if (enemy.flags.spellCastThisTurn) {
                    damage(enemy, fx.value, caster, entry.card);
                }
                break;

            case "draw_both_if_target_was_quick":
                break;
        }
    }
}

async function resolveStack() {
    while (G.stack.length && !G.over) {
        const entry = G.stack.pop();

        if (entry.canceled) {
            entry.owner.discard.push(entry.card);
            log(`✖ ${entry.card.name} queda cancelada.`, "sys");
            continue;
        }

        showResolvingCard(entry.card);
        await wait(220);

        if (isCounterCard(entry.card)) {
            const target = findCounterTarget();

            if (target && counterMatches(entry.card, target, entry.casterIdx)) {
                target.canceled = true;
                log(`⛔ ${entry.card.name} cancela ${target.card.name}.`, "react");

                if (
                    hasCounterEffect(entry.card, "draw_both_if_target_was_quick") &&
                    target.card.type === "quick"
                ) {
                    drawCard(G.players[0], 1, "efecto de Cierre Arcano");
                    drawCard(G.players[1], 1, "efecto de Cierre Arcano");
                }
            } else {
                log(`… ${entry.card.name} no encuentra objetivo válido.`, "sys");
            }

            entry.owner.discard.push(entry.card);
            continue;
        }

        if (entry.card.type === "perm") {
            applyPermanent(entry.owner, entry.card);
            continue;
        }

        applyEffects(entry);
        entry.owner.discard.push(entry.card);
    }
}

function estimateIncomingDamage(topEntry, reactorIdx) {
    if (!topEntry || topEntry.casterIdx === reactorIdx) return 0;

    const caster = G.players[topEntry.casterIdx];
    let total = 0;

    for (const fx of topEntry.card.effects) {
        if (fx.action === "damage_enemy") {
            total += fx.value + (topEntry.card.type === "spell" ? caster.aura.buffSelfSpellDamage : 0);
        }
        if (fx.action === "damage_enemy_if_self_desperation" && isDesperate(caster)) {
            total += fx.value;
        }
        if (fx.action === "damage_enemy_if_self_has_permanent" && caster.permanent) {
            total += fx.value;
        }
        if (fx.action === "damage_enemy_if_enemy_cast_spell_this_turn") {
            const reactor = G.players[reactorIdx];
            if (reactor.flags.spellCastThisTurn) total += fx.value;
        }
    }

    return total;
}

function cardHeuristic(player, card) {
    if (!canAfford(player, card)) return -999;

    let score = 0;

    for (const fx of card.effects) {
        switch (fx.action) {
            case "damage_enemy":
                score += fx.value * 2.4;
                break;
            case "heal_self":
                score += player.hp < 16 ? fx.value * 2.2 : fx.value * 1.1;
                break;
            case "draw_self":
                score += player.hand.length < 4 ? fx.value * 2.8 : fx.value * 1.2;
                break;
            case "discard_random_enemy":
                score += currentOpponent().hand.length > 0 ? fx.value * 2 : 0;
                break;
            case "shield_self":
                score += player.hp < 12 ? fx.value * 2 : fx.value;
                break;
            case "damage_enemy_if_self_desperation":
                if (isDesperate(player)) score += fx.value * 1.8;
                break;
            case "damage_enemy_if_self_has_permanent":
                if (player.permanent) score += fx.value * 1.6;
                break;
        }
    }

    if (card.type === "perm" && !player.permanent) score += 5;
    if (card.type === "perm" && player.permanent) score += 1.5;
    if (card.type === "consumable" && player.aura.reduceSelfConsumableCost) score += 1;
    if (card.type === "quick" && player.aura.reduceSelfQuickCost) score += 1;

    return score;
}

function aiChooseReaction(reactorIdx) {
    const reactor = G.players[reactorIdx];
    const topEntry = G.stack[G.stack.length - 1];

    if (!topEntry) return null;

    const candidates = reactor.hand
        .filter((c) => c.type === "quick" && canAfford(reactor, c))
        .sort((a, b) => cardHeuristic(reactor, b) - cardHeuristic(reactor, a));

    if (!candidates.length) return null;

    const incoming = estimateIncomingDamage(topEntry, reactorIdx);
    const lethal = incoming >= reactor.hp;

    if (lethal || incoming >= 6) {
        const counter = candidates.find((c) => isCounterCard(c));
        if (counter) return counter;

        const shield = candidates.find((c) => c.effects.some((fx) => fx.action === "shield_self"));
        if (shield) return shield;
    }

    if (Math.random() < 0.28 && reactor.hp > 9) {
        return candidates.find((c) => c.effects.some((fx) => fx.action === "damage_enemy")) || null;
    }

    return null;
}

async function handleReactionLoop(nextReactorIdx) {
    G.reaction = {
        active: true,
        reactorIdx: nextReactorIdx,
        passes: 0
    };

    while (G.reaction.active && !G.over) {
        const reactor = G.players[G.reaction.reactorIdx];

        if (reactor.human) {
            G.phase = "reaction";
            log("⚡ Ventana de reacción: elige un Hechizo Rápido o pasa.", "react");
            render();

            await new Promise((resolve) => {
                humanReactionResolver = resolve;
            });

            if (G.reaction.passes >= 2) break;
        } else {
            const reactionCard = aiChooseReaction(G.reaction.reactorIdx);

            if (reactionCard) {
                removeCardFromHand(reactor, reactionCard);
                const paid = effectiveCost(reactor, reactionCard);
                reactor.hp -= paid;
                log(`⚡ ${reactor.name} reacciona con ${reactionCard.name} (−${paid} HP).`, "react");
                showReactionBanner(`${reactor.name}: ${reactionCard.name}`);

                if (reactor.hp <= 0) {
                    G.over = true;
                    G.winnerIdx = otherIndex(G.reaction.reactorIdx);
                    break;
                }

                G.stack.push({
                    card: reactionCard,
                    owner: reactor,
                    casterIdx: G.reaction.reactorIdx,
                    canceled: false
                });

                G.reaction.passes = 0;
                G.reaction.reactorIdx = otherIndex(G.reaction.reactorIdx);
                render();
                await wait(260);
            } else {
                G.reaction.passes += 1;
                if (G.reaction.passes >= 2) break;
                G.reaction.reactorIdx = otherIndex(G.reaction.reactorIdx);
                render();
                await wait(140);
            }
        }
    }

    G.reaction.active = false;
    humanReactionResolver = null;
}

async function castCard(casterIdx, card) {
    const caster = G.players[casterIdx];
    removeCardFromHand(caster, card);

    const paid = effectiveCost(caster, card);
    caster.hp -= paid;
    log(`▶ ${caster.name} juega ${card.name} (−${paid} HP).`, "sys");

    if (caster.hp <= 0) {
        G.over = true;
        G.winnerIdx = otherIndex(casterIdx);
        return;
    }

    G.stack.push({
        card,
        owner: caster,
        casterIdx,
        canceled: false
    });

    await handleReactionLoop(otherIndex(casterIdx));
    if (!G.over) await resolveStack();
}

function resetTurnFlags() {
    for (const p of G.players) {
        p.shield = 0;
        p.flags.firstSpellBonusUsed = false;
        p.flags.firstQuickOnEnemyTurnUsed = false;
        p.flags.spellDamagePreventUsed = false;
        p.flags.preventDiscardUsed = false;
        p.flags.spellCastThisTurn = false;
        calculateAura(p);
    }
}

function startOfTurnEffects(player) {
    if (player.aura.startOfTurnDamageSelf) {
        damage(player, player.aura.startOfTurnDamageSelf, opponentOf(G.players.indexOf(player)), player.permanent, false);
    }
    if (!G.over && player.aura.startOfTurnDrawSelf) {
        drawCard(player, player.aura.startOfTurnDrawSelf, "inicio de turno");
    }
}

function endOfTurnEffects(player) {
    if (
        !G.over &&
        player.flags.spellCastThisTurn &&
        player.aura.endOfTurnDamageEnemyIfSelfCastSpell
    ) {
        log(`🌙 ${player.permanent?.name || "Objeto"} activa su efecto de fin de turno.`, "sys");
        damage(opponentOf(G.players.indexOf(player)), player.aura.endOfTurnDamageEnemyIfSelfCastSpell, player, player.permanent);
    }
}

function shouldMulligan(player) {
    return !player.hand.some((card) => card.cost <= 2 || card.type === "perm" || card.type === "consumable");
}

function performMulligan(player) {
    if (!shouldMulligan(player)) return;

    log(`↺ ${player.name} toma mulligan.`, "sys");
    player.deck.push(...player.hand);
    player.deck = shuffle(player.deck);
    player.hand = [];
    drawCard(player, INITIAL_HAND, "mulligan");
}

async function beginTurn() {
    if (G.over) {
        render();
        showGameover();
        return;
    }

    G.turn += 1;
    resetTurnFlags();

    const player = currentPlayer();
    const firstTurnForFirstPlayer = G.turn === 1 && G.activeIdx === G.firstIdx;

    log(`════ Turno ${G.turn} · ${player.name} ════`, "sys");
    startOfTurnEffects(player);

    if (G.over) {
        render();
        showGameover();
        return;
    }

    if (!firstTurnForFirstPlayer) {
        drawCard(player, 1, "fase de robo");
    } else {
        log(`⏭ ${player.name} no roba en su primer turno.`, "sys");
    }

    if (G.over) {
        render();
        showGameover();
        return;
    }

    G.canNormalSpellThisTurn = !firstTurnForFirstPlayer;
    G.playerSpellPlayed = false;
    selectedHandIndex = null;

    if (player.human) {
        G.phase = "objects";
        render();
    } else {
        G.phase = "enemy_turn";
        render();
        await wait(400);
        await runAiTurn();
    }
}

async function endCurrentTurn() {
    if (G.over) {
        render();
        showGameover();
        return;
    }

    endOfTurnEffects(currentPlayer());

    if (G.over) {
        render();
        showGameover();
        return;
    }

    G.activeIdx = otherIndex(G.activeIdx);
    await beginTurn();
}

async function runAiTurn() {
    const aiIdx = G.activeIdx;
    const ai = G.players[aiIdx];

    const objectCards = ai.hand
        .filter((card) => (card.type === "perm" || card.type === "consumable") && canAfford(ai, card))
        .sort((a, b) => cardHeuristic(ai, b) - cardHeuristic(ai, a));

    let objectsPlayed = 0;

    for (const card of objectCards) {
        if (G.over || objectsPlayed >= 2) break;
        if (cardHeuristic(ai, card) < 2) continue;
        await castCard(aiIdx, card);
        objectsPlayed += 1;
        render();
        await wait(250);
    }

    if (!G.over && G.canNormalSpellThisTurn) {
        const spell = ai.hand
            .filter((card) => card.type === "spell" && canAfford(ai, card))
            .sort((a, b) => cardHeuristic(ai, b) - cardHeuristic(ai, a))[0];

        if (spell) {
            await castCard(aiIdx, spell);
            ai.flags.spellCastThisTurn = true;
            render();
            await wait(300);
        } else {
            log(`… ${ai.name} decide no lanzar hechizo.`, "sys");
        }
    }

    if (!G.over) {
        await endCurrentTurn();
    }
}

function canPlaySelectedCard(card) {
    if (!G || G.over) return false;

    const player = G.players[0];
    if (G.activeIdx !== 0) return false;

    if (G.phase === "reaction") {
        return G.reaction?.active && G.reaction.reactorIdx === 0 && card.type === "quick" && canAfford(player, card);
    }

    if (G.phase === "objects") {
        return (card.type === "perm" || card.type === "consumable") && canAfford(player, card);
    }

    if (G.phase === "spell") {
        return !G.playerSpellPlayed && card.type === "spell" && canAfford(player, card);
    }

    return false;
}

async function onPlayButton() {
    if (!G || G.over || selectedHandIndex == null) {
        shakeEl("btnPlay");
        return;
    }

    const player = G.players[0];
    const card = player.hand[selectedHandIndex];
    if (!card || !canPlaySelectedCard(card)) {
        shakeEl("btnPlay");
        return;
    }

    if (G.phase === "reaction") {
        removeCardFromHand(player, card);
        const paid = effectiveCost(player, card);
        player.hp -= paid;
        log(`⚡ ${player.name} reacciona con ${card.name} (−${paid} HP).`, "react");
        showReactionBanner(`${player.name}: ${card.name}`);

        if (player.hp <= 0) {
            G.over = true;
            G.winnerIdx = 1;
            if (humanReactionResolver) humanReactionResolver();
            render();
            showGameover();
            return;
        }

        G.stack.push({
            card,
            owner: player,
            casterIdx: 0,
            canceled: false
        });

        selectedHandIndex = null;
        G.reaction.passes = 0;
        G.reaction.reactorIdx = 1;
        if (humanReactionResolver) humanReactionResolver();
        render();
        return;
    }

    await castCard(0, card);

    if (card.type === "spell") {
        G.playerSpellPlayed = true;
        G.players[0].flags.spellCastThisTurn = true;
        G.phase = "end";
    } else {
        G.phase = "objects";
    }

    selectedHandIndex = null;
    render();

    if (G.over) showGameover();
}

function onPassReaction() {
    if (!G || G.over || G.phase !== "reaction" || !G.reaction?.active || G.reaction.reactorIdx !== 0) {
        shakeEl("btnPassReaction");
        return;
    }

    G.reaction.passes += 1;
    if (G.reaction.passes < 2) {
        G.reaction.reactorIdx = 1;
    }

    log(`… ${G.players[0].name} pasa la reacción.`, "sys");
    if (humanReactionResolver) humanReactionResolver();
    render();
}

function onToSpellPhase() {
    if (!G || G.over || G.activeIdx !== 0 || G.phase !== "objects") {
        shakeEl("btnToSpell");
        return;
    }

    selectedHandIndex = null;
    G.phase = G.canNormalSpellThisTurn ? "spell" : "end";
    render();
}

async function onEndTurn() {
    if (!G || G.over || G.activeIdx !== 0 || G.phase === "reaction") {
        shakeEl("btnEndTurn");
        return;
    }
    await endCurrentTurn();
    render();
}

async function startNewGame(autoBattle = false) {
    G = {
        players: [
            createPlayer(AVATARS.player.name, !autoBattle),
            createPlayer(AVATARS.enemy.name, false)
        ],
        activeIdx: 0,
        firstIdx: rand(2),
        turn: 0,
        phase: "idle",
        stack: [],
        logs: [],
        over: false,
        winnerIdx: null,
        canNormalSpellThisTurn: true,
        playerSpellPlayed: false,
        reaction: null,
        startedAt: Date.now()
    };

    if (autoBattle) {
        G.players[0].human = false;
        G.players[1].human = false;
    }

    selectedHandIndex = null;
    humanReactionResolver = null;

    for (const p of G.players) {
        drawCard(p, INITIAL_HAND, "mano inicial");
        performMulligan(p);
        calculateAura(p);
    }

    G.activeIdx = G.firstIdx;
    log(`═══ Nueva partida iniciada ═══`, "sys");
    log(`${G.players[G.firstIdx].name} comienza.`, "sys");

    render();
    await beginTurn();
}

async function autoBattle() {
    await startNewGame(true);

    let guard = 0;
    while (!G.over && guard < MAX_TURNS) {
        await wait(60);
        guard++;
    }

    render();
    if (G.over) showGameover();
}

function renderHp(prefix, player) {
    $(`${prefix}HpText`).innerHTML = `${player.hp} <span>/ ${MAX_HP}</span>`;
    const bar = $(`${prefix}HpBar`);
    const pct = Math.max(0, (player.hp / MAX_HP) * 100);
    bar.style.width = `${pct}%`;

    bar.className = "hp-fill";
    if (player.hp <= DESP_THRESHOLD) {
        bar.classList.add("desp");
    } else if (player.hp <= 10) {
        bar.classList.add("low");
    } else if (player.hp <= 18) {
        bar.classList.add("mid");
    }

    $(`${prefix}DesperationTag`).classList.toggle("on", player.hp <= DESP_THRESHOLD);
    $(`${prefix === "player" ? "playerZone" : "enemyZone"}`).classList.toggle("desp-glow", player.hp <= DESP_THRESHOLD);
}

function renderObject(prefix, player) {
    const slot = $(`${prefix}ObjectSlot`);
    if (player.permanent) {
        slot.className = "obj-slot filled";
        slot.innerHTML = `
      <div class="obj-slot-name">${player.permanent.name}</div>
      <div class="obj-cost">${player.permanent.cost}HP</div>
    `;
    } else {
        slot.className = "obj-slot";
        slot.innerHTML = `<span class="obj-slot-empty">⬡</span>`;
    }
}

function renderEnemyBackHand() {
    const container = $("enemyHandBacks");
    container.innerHTML = "";
    if (!G) return;

    const count = Math.min(G.players[1].hand.length, 6);
    for (let i = 0; i < count; i++) {
        const card = document.createElement("div");
        card.className = "card back";
        card.style.width = "22px";
        card.innerHTML = `<div class="ci" style="height:32px;display:flex;align-items:center;justify-content:center"><span style="font-size:12px;opacity:.18">✦</span></div>`;
        container.appendChild(card);
    }
}

function renderHand() {
    const container = $("hand");
    container.innerHTML = "";

    if (!G) return;

    const player = G.players[0];
    const desper = isDesperate(player);

    player.hand.forEach((card, index) => {
        const playable = canPlaySelectedCard(card);
        const typeClass = card.type === "spell" ? "spell" : card.type === "quick" ? "quick" : card.type === "perm" ? "perm" : "consumable";
        const effCost = effectiveCost(player, card);

        const el = document.createElement("div");
        el.className = `card ${typeClass} ${selectedHandIndex === index ? "selected" : ""} ${!playable ? "unplayable" : ""} ${desper && effCost < card.cost ? "desp-mode" : ""}`;
        el.innerHTML = `
      <div class="ci">
        <div class="c-cost ${effCost <= 2 ? "cheap" : ""}">${effCost}</div>
        <div class="c-tbadge">${labelForType(card.type)}</div>
        <div class="c-art">${card.art}</div>
        <div class="c-foot">
          <div class="c-name">${card.name}</div>
          <div class="c-fx">${card.text}</div>
        </div>
        <div class="c-desp-disc">½</div>
      </div>
    `;

        el.addEventListener("click", () => {
            selectedHandIndex = selectedHandIndex === index ? null : index;
            render();
        });

        container.appendChild(el);
    });
}

function labelForType(type) {
    if (type === "spell") return "Hechizo";
    if (type === "quick") return "Rápido";
    if (type === "perm") return "Permanente";
    return "Consumible";
}

function renderCardDetail() {
    const box = $("cardDetail");

    if (!G || selectedHandIndex == null || !G.players[0].hand[selectedHandIndex]) {
        box.innerHTML = `<span class="muted">Ninguna carta seleccionada.</span>`;
        return;
    }

    const player = G.players[0];
    const card = player.hand[selectedHandIndex];
    const effCost = effectiveCost(player, card);
    const playable = canPlaySelectedCard(card);

    const badgeColor =
        card.type === "spell" ? "rgba(124,77,255,.4)" :
            card.type === "quick" ? "rgba(255,171,64,.4)" :
                card.type === "perm" ? "rgba(0,191,165,.35)" :
                    "rgba(100,255,218,.2)";

    box.innerHTML = `
    <div class="type-badge" style="background:${badgeColor};color:var(--text2)">${labelForType(card.type)}</div>
    <div style="font-family:'Cinzel',serif;font-size:14px;font-weight:700;margin-bottom:6px">${card.name}</div>
    <div>Costo base: ${card.cost} HP</div>
    <div>Costo ahora: <span class="cost-now">${effCost} HP</span>${isDesperate(player) ? ` <em style="font-size:10px;color:var(--desp)">(Desesperación)</em>` : ""}</div>
    <div style="margin-top:6px;font-size:11px;color:var(--text3)">${card.text}</div>
    <div style="margin-top:6px;font-size:10px;color:${playable ? "var(--teal2)" : "var(--red3)"}">${playable ? "✓ Jugable ahora" : "✗ No jugable en esta fase"}</div>
  `;
}

function renderPhase() {
    if (!G) {
        $("turnText").textContent = "—";
        $("phasePill").textContent = "Sin partida";
        $("reactionHint").textContent = "";
        return;
    }

    const phaseNames = {
        idle: "Preparando",
        objects: "Fase objetos",
        spell: "Fase hechizo",
        end: "Fin de turno",
        reaction: "Reacción",
        enemy_turn: "Turno rival"
    };

    $("turnText").textContent = G.over ? `Ganador: ${G.players[G.winnerIdx].name}` : G.players[G.activeIdx].name;
    $("phasePill").textContent = G.over ? "Fin de partida" : (phaseNames[G.phase] || G.phase);
    $("phasePill").classList.toggle("active", G.activeIdx === 0 && !G.over);

    $("playerZone").classList.toggle("active", G.activeIdx === 0 && !G.over);
    $("enemyZone").classList.toggle("active", G.activeIdx === 1 && !G.over);

    if (G.phase === "reaction" && G.reaction?.active) {
        $("reactionHint").textContent = G.reaction.reactorIdx === 0 ? "Tu ventana de reacción" : "Reacción rival";
    } else {
        $("reactionHint").textContent = "";
    }
}

function renderButtons() {
    if (!G) {
        $("btnPlay").disabled = true;
        $("btnToSpell").disabled = true;
        $("btnEndTurn").disabled = true;
        $("btnPassReaction").disabled = true;
        return;
    }

    const selectedCard = selectedHandIndex != null ? G.players[0].hand[selectedHandIndex] : null;
    const playable = selectedCard ? canPlaySelectedCard(selectedCard) : false;

    $("btnPlay").disabled = !playable;
    $("btnPlay").textContent = G.phase === "reaction" ? "Responder con rápido" : "Jugar carta";

    $("btnToSpell").disabled = !(G.activeIdx === 0 && !G.over && G.phase === "objects");
    $("btnEndTurn").disabled = !(G.activeIdx === 0 && !G.over && G.phase !== "reaction");
    $("btnPassReaction").disabled = !(G.phase === "reaction" && G.reaction?.active && G.reaction.reactorIdx === 0);
}

function renderLog() {
    $("logBox").innerHTML = G.logs
        .slice(0, 40)
        .map((entry) => `<div class="log-e ${entry.cls}">${entry.msg}</div>`)
        .join("");
}

function renderStats() {
    if (!G) return;
    $("statTurn").textContent = G.turn || "—";
    $("statPlayerDiscard").textContent = G.players[0].discard.length;
    $("statEnemyHand").textContent = G.players[1].hand.length;
    $("statEnemyDiscard").textContent = G.players[1].discard.length;
}

function render() {
    $("playerAvatarImg").src = AVATARS.player.src;
    $("enemyAvatarImg").src = AVATARS.enemy.src;
    $("playerName").textContent = AVATARS.player.name;
    $("enemyName").textContent = AVATARS.enemy.name;

    if (!G) return;

    renderHp("player", G.players[0]);
    renderHp("enemy", G.players[1]);

    renderObject("player", G.players[0]);
    renderObject("enemy", G.players[1]);

    $("playerDeckText").textContent = G.players[0].deck.length;
    $("enemyDeckText").textContent = G.players[1].deck.length;

    renderEnemyBackHand();
    renderHand();
    renderCardDetail();
    renderPhase();
    renderButtons();
    renderLog();
    renderStats();

    if (G.over) {
        showGameover();
    }
}

function showGameover() {
    if (!G || !G.over) return;

    const winner = G.players[G.winnerIdx];
    const youWin = G.winnerIdx === 0;
    const durationSeconds = Math.round((Date.now() - G.startedAt) / 1000);

    $("gameoverTitle").textContent = youWin ? "¡Victoria!" : "Derrota";
    $("gameoverTitle").style.color = youWin ? "var(--gold2)" : "var(--red3)";
    $("gameoverSub").textContent = youWin ? `Has derrotado a ${G.players[1].name}` : `${G.players[1].name} te ha vencido`;
    $("gameoverStats").innerHTML = `
    Turnos jugados: ${G.turn}<br>
    Ganador: ${winner.name}<br>
    Tu vida final: ${G.players[0].hp} HP<br>
    Duración: ${durationSeconds}s
  `;

    $("gameoverOverlay").classList.add("on");
}

function hideGameover() {
    $("gameoverOverlay").classList.remove("on");
}

function initBackground() {
    const cosmos = $("cosmos");
    cosmos.innerHTML = "";

    for (let i = 0; i < 80; i++) {
        const star = document.createElement("div");
        star.className = "star";
        const size = Math.random() * 1.8 + 0.4;
        star.style.cssText = `
      width:${size}px;
      height:${size}px;
      left:${Math.random() * 100}%;
      top:${Math.random() * 100}%;
      animation-duration:${Math.random() * 4 + 2}s;
      animation-delay:${Math.random() * 5}s;
      opacity:${Math.random() * 0.6 + 0.1};
    `;
        cosmos.appendChild(star);
    }

    const runes = ["✦", "✧", "⬡", "◈", "⟡", "⌬", "⊕"];
    for (let i = 0; i < 10; i++) {
        const rune = document.createElement("div");
        rune.className = "rune-bg";
        rune.textContent = runes[rand(runes.length)];
        rune.style.cssText = `
      left:${Math.random() * 100}%;
      font-size:${rand(50) + 30}px;
      animation-duration:${rand(14) + 12}s;
      animation-delay:${rand(10)}s;
    `;
        cosmos.appendChild(rune);
    }
}

$("btnPlay").addEventListener("click", onPlayButton);
$("btnToSpell").addEventListener("click", onToSpellPhase);
$("btnEndTurn").addEventListener("click", onEndTurn);
$("btnPassReaction").addEventListener("click", onPassReaction);
$("btnNewGame").addEventListener("click", () => startNewGame(false));
$("btnAutoBattle").addEventListener("click", () => autoBattle());
$("btnRestartOverlay").addEventListener("click", () => {
    hideGameover();
    startNewGame(false);
});

initBackground();
render();