"use strict";

var TORMENT_AT = {
  10: "I", 15: "II", 20: "III", 25: "IV", 30: "V",
  40: "VI", 50: "VII", 60: "VIII", 70: "IX",
  80: "X", 90: "XI", 100: "XII"
};

var CLASSES = [
  { id: "barbarian", name: "Варвар", stat: "strength", icon: "i-barbarian" },
  { id: "druid", name: "Друид", stat: "willpower", icon: "i-druid" },
  { id: "necromancer", name: "Некромант", stat: "intelligence", icon: "i-necromancer" },
  { id: "rogue", name: "Разбойник", stat: "dexterity", icon: "i-rogue" },
  { id: "sorcerer", name: "Чародей", stat: "intelligence", icon: "i-sorcerer" },
  { id: "spiritborn", name: "Духорождённый", stat: "dexterity", icon: "i-spiritborn" },
  { id: "paladin", name: "Паладин", stat: "strength", icon: "i-paladin" },
  { id: "warlock", name: "Чернокнижник", stat: "willpower", icon: "i-warlock" }
];

var STAT_NAMES = {
  strength: "Сила",
  dexterity: "Ловкость",
  intelligence: "Интеллект",
  willpower: "Воля"
};

var STAT_GENITIVE = {
  strength: "силы",
  dexterity: "ловкости",
  intelligence: "интеллекта",
  willpower: "воли"
};

var SEASON_SPAN = {
  15: { start: "09.2026", end: "" },
  16: { start: "", end: "" },
  17: { start: "", end: "" }
};

var SEASONS = {
  15: {
    name: "Сезон 15. Наследие Преисподней",
    patch: "3.2.1",
    per10: {
      barbarian: 0.8,
      druid: 1.625,
      necromancer: 1.625,
      paladin: 1.625,
      sorcerer: 1.625,
      rogue: 1.25,
      spiritborn: 1.25,
      warlock: 1.25
    }
  }
};

var ELEMENTS = [
  { id: "physical", name: "Физический урон", short: "Физический" },
  { id: "fire", name: "Урон от огня", short: "Огонь" },
  { id: "lightning", name: "Урон от молнии", short: "Молния" },
  { id: "cold", name: "Урон от холода", short: "Холод" },
  { id: "holy", name: "Урон от сил Света", short: "Свет" },
  { id: "poison", name: "Урон от яда", short: "Яд" },
  { id: "shadow", name: "Урон от темной магии", short: "Тьма" }
];

var OVERPOWER_CHANCE = 3;
var FORTIFY_DR = 15;
var ARMOR_CAP = 1000;
var ARMOR_MAX = 85;

var TIPS = {
  season: "Сейчас внесена таблица только сезона 15, патч 3.2.1. Он начался в сентябре 2026, дату конца Blizzard ещё не назвал. У 16 и 17 сезонов даты тоже не объявлены, и без своей таблицы расчёт не идёт: старые коэффициенты подставлять нельзя.",
  class: "Класс выбирает основную характеристику и сколько урона даёт 10 её очков в этом сезоне.",
  level: "Список как в башне: уровни 1–150. На 10, 15, 20, 25, 30, 40, 50, 60, 70, 80, 90 и 100 вместо номера стоит знак истязания I–XII. Уровень не меняет ваш удар. Он поднимает здоровье монстров и урон, который они наносят вам. Штраф брони и сопротивлений уже сидит в числах листа: это входящий урон, не ваш.",
  weapon: "Одно число с листа атаки, «Базовый урон от оружия». На этом листе диапазона нет, поэтому удар считается по нему.",
  thorns: "Число шипов с листа. Шипы срабатывают, когда по вам попали прямым ударом, и не используют урон оружия, процент умения и крит. В них входят бонус характеристики, весь урон, физический урон и включённые состояния цели. Уязвимость даёт свой ×1,2.",
  "weapon-speed": "Скорость самого оружия, не итоговые удары в секунду.",
  "attack-speed": "Процент с листа «Бонус к скорости атаки».",
  aps: "По умолчанию 1. Очистите поле, чтобы считать скорость оружия × (1 + бонус скорости). Если умение бьёт реже или чаще, впишите его число ударов в секунду. На периодический урон скорость не умножается.",
  skill: "Прямой урон — мгновенный удар, взмах, снаряд или взрыв. Процент написан на умении, не на листе атаки. 100% значит, что удар начинается с числа оружия. Кровотечение, горение и яд сюда не входят.",
  dot: "Периодический урон — то, что тикает по цели: кровотечение, горение, отравление и часть теневых эффектов. Это процент от урона оружия в секунду с тултипа умения. Он не наносит критический удар. Скорость атаки его не умножает. Несколько стаков одного эффекта впишите уже суммой.",
  stat: "Полное значение с тултипа, вместе с бонусом предметов. Бонус предметов отдельно в урон не прибавляется.",
  "stat-bonus": "Строка тултипа «Увеличивает урон от умений на …%». Поле само считает её из таблицы сезона. Значок рядом открывает ручной ввод, если игра округлила число иначе. Повторное нажатие возвращает таблицу.",
  "stat-mode": "Открыть ручной ввод бонуса с тултипа. Повторное нажатие снова считает бонус по таблице сезона.",
  target: "Галочки решают, какие прибавки с листа входят в этот удар.",
  element: "Стихия этого удара. В сумму [+] входит только одноимённая строка листа. Остальные стихии в удар не входят.",
  "vuln-on": "Враг помечен уязвимостью. Тогда в сумму [+] входит урон по уязвимым, и сверху действует ×1,2, а также множитель уязвимости.",
  "elite-on": "Цель элитная или босс, и строка «урон элитным» входит в сумму.",
  demon: "Строка листа «урон демонам». В общий удар не входит. Если здесь или в поле «Урон демонам, × %» есть число, ниже в итогах появляется отдельный урон по демонам. Эликсир убийцы демонов и эта строка — один процент, второй раз его прибавлять не нужно.",
  undead: "Строка листа «урон нежити». В общий удар не входит. Если здесь или в поле «Урон нежити, × %» есть число, ниже в итогах появляется отдельный урон по нежити. Вампир к нежити не относится.",
  "demon-x": "Строка оружия со значком ×: «+…% к урону по демонам». Своя скобка, не строка листа. В общий удар не входит: если число есть, отдельный урон по демонам показан ниже в итогах. Процент в квадратных скобках под бонусом — полнота броска, его вписывать не нужно.",
  "undead-x": "Строка оружия со значком ×: «+…% к урону по нежити». Своя скобка, отдельно от строки листа. В общий удар не входит: если число есть, отдельный урон по нежити показан ниже в итогах. Процент в квадратных скобках не вписывайте. Вампир сюда не входит.",
  unstoppable: "Цель сейчас неудержима. В сумму [+] входит строка «урон неудержимым противникам». Если такой строки на листе нет, оставьте 0.",
  frost: "Строка листа «урон морозом»: метка умения, не стихия холода. В стандартных умениях она есть у чародея. Если умение не морозное, оставьте 0. Холодный удар берёт «урон от холода», когда выбрана стихия холод.",
  guaranteed: "Каждый прямой удар считается критическим. Шанс с листа на среднее больше не влияет, урон не уменьшается вероятностью.",
  "crit-base": "Число критического урона на листе уже содержит базовые 50%. Это и есть множитель ×1,5 на критическом ударе. В сумму [+] на крите входит только излишек над 50. То же правило у подавляющего урона. Средний урон с критами — обычный удар с весом промаха и критический с весом шанса. Периодический урон не критует.",
  overpower: "Процент подавляющего урона с листа. На подавляющем ударе излишек над базой 50% входит в сумму [+], и сверху действует ×1,5. Обычный удар этот процент не получает.",
  "op-chance": "Шанс подавления фиксированный: 3% на применение умения. Его нельзя поднять характеристикой, только отдельные эффекты делают подавление гарантированным. Поле только показывает это число.",
  "vuln-x": "Отдельный [×] «множитель урона по уязвимым», если он не входит в строки листа [+]. Не путать со строкой «урон уязвимым»: та строка складывается с остальными прибавками.",
  "crit-x": "Отдельный [×] критического урона. База крита ×1,5 сюда не входит и действует сама.",
  "dot-x": "Отдельный [×] периодического урона. Действует только на тикающий урон.",
  life: "Максимальное здоровье с листа. Если оно вписано, рядом с процентом показан запас: здоровье, делённое на долю урона, которая доходит.",
  barrier: "Текущий барьер. Он снимает фиксированное число уже после того, как удар срезан до процента. В сам процент барьер не входит.",
  regen: "Здоровье в секунду с листа. Полученный урон выключает регенерацию на 4 секунды.",
  dodge: "Шанс полностью избежать прямого удара. Периодический урон уклонение не режет. В процент доходящего урона этот шанс не подмешан.",
  armor: "1000 брони на листе — это 85% снижения физического урона. До порога снижение ровное: 500 брони дают 42,5%. Выше 1000 физический урон больше не режется. Стихии броня не режет, их режет сопротивление.",
  "resist-cap": "Обычный потолок сопротивления — 70%. Вещи вроде «максимальное сопротивление» поднимают его, но игра не пускает выше 85%. Число с листа уже не бывает выше потолка: поле нужно, чтобы срезать ввод.",
  resist: "Процент с листа для этой стихии. Физический урон идёт через броню, не через сопротивление.",
  dr: "Общее снижение урона. Каждое такое поле умножается отдельно: дважды по 50% оставляют 25% урона, а не ноль.",
  "dr-close": "Входит, когда отмечен удар вблизи.",
  "dr-far": "Входит, когда отмечен удар издалека.",
  "dr-elite": "Входит, когда источник удара — элита или босс.",
  "dr-fort": "Дополнительное снижение, пока герой укреплён. База укрепления 15% считается сама и сюда не вписывается.",
  "dr-unstop": "Входит, пока на герое неудержимость.",
  fortify: "Герой укреплён, когда укреплённое здоровье не ниже текущего. В этом состоянии игра режет любой урон на 15%. Это число фиксированное.",
  hero: "Галочки решают, какие снижения входят в удар и получает ли герой лишние 20% урона от уязвимости.",
  "hero-vuln": "Герой сам уязвим. Входящий урон умножается на 1,2 до брони и остальных снижений.",
  "hero-unstop": "На герое неудержимость. Тогда входит снижение урона при неудержимости. Само по себе состояние урон не режет.",
  "lab-base": "Изначальный урон до скобок. Каждая строка — одно оружие или другой плоский урон, строки складываются. Процент умения сюда не входит: он в следующем разделе. Скорость атаки здесь не участвует.",
  "lab-stat": "Бонус основной характеристики в процентах, не само число силы, интеллекта, ловкости или воли. На тултипе характеристики это строка «Увеличивает урон от умений на …%». На калькуляторе урона то же число стоит в поле «Бонус от характеристики».",
  "lab-skill": "Процент урона умения. Он написан на умении в дереве навыков или в другом месте, которое названо на тултипе, а не на листе атаки. 100% оставляет базу как есть. Несколько процентов складываются в один коэффициент: 100% и 40% дают ×1,40.",
  "lab-add": "Процент с плюсом [+]. Все строки этого раздела складываются в одну скобку: 30% и 20% дают ×1,50, а не два отдельных умножения. Берите с листа атаки строки этого удара: весь урон, урон от холода, урон уязвимым, урон элитным и другие подходящие [+]. Критический урон с листа тоже сюда, и только на крите: базовые 50% уже сидят в ×1,50, в скобку входит излишек над 50. Множители с крестом [×] сюда не кладут.",
  "lab-mul": "Отдельный множитель [×], своя скобка. Строки перемножаются и не складываются: дважды по 50% дают ×2,25. Берите эффекты, которые в игре написаны как [×]: множитель урона от холода, множитель всего урона, множитель урона по уязвимым, множитель критического урона. Если бонус уже вошёл в строку [+] на листе открытого мира, второй раз его не вписывайте.",
  "lab-vuln-factor": "Фиксированная уязвимость: ×1,20, пока ниже отмечено «Цель уязвима», иначе ×1. Процент «урон уязвимым» с листа сюда не подставляется, он среди прибавок [+]. Отдельный множитель урона по уязвимым [×] ставьте в одну из скобок с крестом.",
  "lab-crit-factor": "Фиксированный критический удар: ×1,50, пока отмечен «Удар критический», иначе ×1. Процент критического урона это число не увеличивает.",
  "lab-crit-pct": "Критический урон с листа. В числе уже есть базовые 50%, и эти 50% — множитель ×1,50. Излишек над 50 входит в скобку [+] только на критическом ударе. Отдельный множитель критического урона [×] ставьте в раздел множителей.",
  "lab-result": "Один удар после всех скобок. Это не урон в секунду: скорость атаки и число ударов сюда не входят.",
  "lab-vuln": "Отметьте, если цель помечена уязвимостью. Тогда в формуле появляется фиксированный ×1,20. Процент уязвимости с листа при этом всё равно вписывается в прибавки [+].",
  "lab-crit": "Отметьте, если смотрите уже выпавший критический удар. Тогда в формуле появляется фиксированный ×1,50. Шанс крита здесь не усредняется. Излишек критического урона над 50% при этом входит в скобку [+]."
};

function num(value) {
  var n = typeof value === "number" ? value : parseFloat(String(value).replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}

function seasonSpanText(seasonId) {
  var span = SEASON_SPAN[seasonId];
  if (!span || (!span.start && !span.end)) return "даты не объявлены";
  return (span.start || "…") + "–" + (span.end || "…");
}

function paintSeasonDates(seasonId) {
  var el = document.getElementById("season-dates");
  el.textContent = seasonSpanText(seasonId);
}

function classById(id) {
  return CLASSES.filter(function (c) { return c.id === id; })[0] || CLASSES[4];
}

function suggestedBonus(seasonId, classId, statValue) {
  var season = SEASONS[seasonId];
  if (!season) return null;
  var per10 = season.per10[classId];
  if (per10 == null) return null;
  return num(statValue) * per10 / 10;
}

function emptyElements() {
  var out = {};
  ELEMENTS.forEach(function (el) { out[el.id] = 0; });
  return out;
}

function calculate(input) {
  var season = SEASONS[input.season];
  if (!season) {
    return { ok: false, reason: "Для этого сезона нет таблицы коэффициентов." };
  }

  var weapon = Math.max(0, num(input.weapon));
  var skill = Math.max(0, num(input.skill)) / 100;
  var dotSkill = Math.max(0, num(input.dot)) / 100;
  var statFactor = 1 + num(input.statBonus) / 100;
  var type = input.damageType || "cold";
  var elements = input.elements || emptyElements();

  var parts = [];
  function add(name, pct, on) {
    if (on && pct) parts.push({ name: name, pct: pct });
  }

  add("весь урон", num(input.allDamage), true);
  var element = ELEMENTS.filter(function (el) { return el.id === type; })[0];
  add(element ? element.name.toLowerCase() : type, num(elements[type]), true);
  add("урон уязвимым противникам", num(input.vulnerableDamage), !!input.vulnerable);
  add("урон элитным противникам", num(input.eliteDamage), !!input.elite);
  add("урон морозом", num(input.frostDamage), true);
  add("урон демонам", num(input.demonDamage), !!input.demon);
  add("урон нежити", num(input.undeadDamage), !!input.undead);
  add("урон неудержимым противникам", num(input.unstoppableDamage), !!input.unstoppable);

  var sumPct = parts.reduce(function (s, p) { return s + p.pct; }, 0);
  var addFactor = 1 + sumPct / 100;

  var critSheet = num(input.critDamage);
  var critExtra = Math.max(0, critSheet - 50);
  var critSum = sumPct + critExtra;
  var critAddFactor = 1 + critSum / 100;

  var opSheet = num(input.overpowerDamage);
  var opExtra = Math.max(0, opSheet - 50);
  var opSum = sumPct + opExtra;
  var opAddFactor = 1 + opSum / 100;

  var vulnFactor = input.vulnerable ? 1.2 * (1 + num(input.vulnX) / 100) : 1;
  var dotX = 1 + num(input.dotX) / 100;
  var critX = 1 + num(input.critX) / 100;
  var familyX = 1;
  if (input.demon) familyX *= 1 + num(input.demonX) / 100;
  if (input.undead) familyX *= 1 + num(input.undeadX) / 100;

  var base = weapon * skill;
  var afterStat = base * statFactor;
  var directHit = afterStat * addFactor * vulnFactor * familyX;
  var critHit = afterStat * critAddFactor * vulnFactor * 1.5 * critX * familyX;
  var overpowerHit = afterStat * opAddFactor * vulnFactor * 1.5 * familyX;

  var thornParts = [];
  function addThorn(name, pct, on) {
    if (on && pct) thornParts.push({ name: name, pct: pct });
  }
  addThorn("весь урон", num(input.allDamage), true);
  addThorn("физический урон", num(elements.physical), true);
  addThorn("урон уязвимым противникам", num(input.vulnerableDamage), !!input.vulnerable);
  addThorn("урон элитным противникам", num(input.eliteDamage), !!input.elite);
  addThorn("урон демонам", num(input.demonDamage), !!input.demon);
  addThorn("урон нежити", num(input.undeadDamage), !!input.undead);
  addThorn("урон неудержимым противникам", num(input.unstoppableDamage), !!input.unstoppable);
  var thornSum = thornParts.reduce(function (s, p) { return s + p.pct; }, 0);
  var thornFactor = 1 + thornSum / 100;
  var thornsHit = Math.max(0, num(input.thorns)) * statFactor * thornFactor * vulnFactor * familyX;

  var apsFormula = Math.max(0, num(input.weaponSpeed)) * (1 + num(input.attackSpeed) / 100);
  var aps = input.apsOverride == null || input.apsOverride === ""
    ? apsFormula
    : Math.max(0, num(input.apsOverride));

  var directDps = directHit * aps;
  var critDps = critHit * aps;
  var dotDps = weapon * dotSkill * statFactor * addFactor * vulnFactor * dotX * familyX;

  var pRaw = num(input.critChance) / 100;
  var p = pRaw;
  if (p < 0) p = 0;
  if (p > 1) p = 1;
  if (input.guaranteed) p = 1;

  var total = directDps + dotDps;
  var totalCrit = directDps * (1 - p) + critDps * p + dotDps;

  var skipped = [];
  ELEMENTS.forEach(function (el) {
    if (el.id !== type && num(elements[el.id])) skipped.push(el.name.toLowerCase() + " " + formatPct(num(elements[el.id])) + "%");
  });
  if (!input.vulnerable && num(input.vulnerableDamage)) skipped.push("урон уязвимым " + formatPct(num(input.vulnerableDamage)) + "%");
  if (!input.elite && num(input.eliteDamage)) skipped.push("урон элитным " + formatPct(num(input.eliteDamage)) + "%");
  if (!input.unstoppable && num(input.unstoppableDamage)) skipped.push("урон неудержимым " + formatPct(num(input.unstoppableDamage)) + "%");

  return {
    ok: true,
    parts: parts,
    skipped: skipped,
    sumPct: sumPct,
    addFactor: addFactor,
    critExtra: critExtra,
    critSum: critSum,
    critAddFactor: critAddFactor,
    opExtra: opExtra,
    opSum: opSum,
    opAddFactor: opAddFactor,
    thornParts: thornParts,
    thornSum: thornSum,
    thornFactor: thornFactor,
    thornsHit: thornsHit,
    overpowerHit: overpowerHit,
    vulnFactor: vulnFactor,
    dotX: dotX,
    critX: critX,
    familyX: familyX,
    base: base,
    afterStat: afterStat,
    statFactor: statFactor,
    directHit: directHit,
    critHit: critHit,
    overpowerHit: overpowerHit,
    thornsHit: thornsHit,
    aps: aps,
    apsFormula: apsFormula,
    apsOverride: !(input.apsOverride == null || input.apsOverride === ""),
    directDps: directDps,
    critDps: critDps,
    dotDps: dotDps,
    p: p,
    pRaw: pRaw,
    guaranteed: !!input.guaranteed,
    total: total,
    totalCrit: totalCrit,
    vulnerable: !!input.vulnerable,
    elite: !!input.elite
  };
}

function selfCheck() {
  var result = calculate({
    season: 15,
    weapon: 2000,
    skill: 150,
    dot: 0,
    statBonus: 162.5,
    damageType: "holy",
    elements: emptyElements(),
    allDamage: 300,
    vulnerable: true,
    vulnerableDamage: 0,
    elite: false,
    eliteDamage: 0,
    frostDamage: 0,
    overpowerDamage: 50,
    critDamage: 150,
    critIncludesBase: true,
    critChance: 40,
    guaranteed: false,
    vulnX: 25,
    critX: 60,
    dotX: 0,
    weaponSpeed: 1,
    attackSpeed: 0
  });
  var direct = Math.round(result.directHit);
  var crit = Math.round(result.critHit);
  var average = Math.round(result.directHit * (1 - 0.4) + result.critHit * 0.4);
  return direct === 47250 && crit === 141750 && average === 85050;
}

function clampPct(value) {
  var n = num(value);
  if (n < 0) return 0;
  if (n > 100) return 100;
  return n;
}

function armorReduction(armor) {
  var a = Math.max(0, num(armor));
  return ARMOR_MAX * Math.min(a, ARMOR_CAP) / ARMOR_CAP;
}

function resistReduction(value, cap) {
  var n = Math.max(0, num(value));
  var limit = clampPct(cap);
  var capped = n > limit;
  if (n > limit) n = limit;
  return { pct: n, capped: capped };
}

function drFactor(list) {
  return list.reduce(function (product, pct) {
    return product * (1 - clampPct(pct) / 100);
  }, 1);
}

function calculateDefense(input) {
  var drs = [input.drAll];
  if (input.close) drs.push(input.drClose);
  if (input.far) drs.push(input.drFar);
  if (input.elite) drs.push(input.drElite);
  if (input.fortified) {
    drs.push(FORTIFY_DR);
    drs.push(input.drFortify);
  }
  if (input.unstoppable) drs.push(input.drUnstoppable);
  var common = drFactor(drs) * (input.vulnerable ? 1.2 : 1);
  var armor = armorReduction(input.armor);
  var life = Math.max(0, num(input.life));
  var barrier = Math.max(0, num(input.barrier));
  var specs = [
    { name: "Физический", resist: null },
    { name: "Огонь", resist: input.fire },
    { name: "Молния", resist: input.lightning },
    { name: "Холод", resist: input.cold },
    { name: "Яд", resist: input.poison },
    { name: "Тьма", resist: input.shadow }
  ];
  return {
    armor: armor,
    dodge: clampPct(input.dodge),
    regen: Math.max(0, num(input.regen)),
    life: life,
    barrier: barrier,
    fortified: !!input.fortified,
    vulnerable: !!input.vulnerable,
    rows: specs.map(function (spec) {
      var resist = spec.resist == null ? null : resistReduction(spec.resist, input.resistCap);
      var taken = spec.resist == null ? (1 - armor / 100) * common : (1 - resist.pct / 100) * common;
      if (taken < 0) taken = 0;
      return {
        name: spec.name,
        resist: resist,
        taken: taken,
        ehp: taken > 0 && life > 0 ? life / taken : null
      };
    })
  };
}

function formatInt(value) {
  if (!Number.isFinite(value)) return "—";
  return Math.round(value).toLocaleString("ru-RU");
}

function formatPct(value, digits) {
  var places = digits == null ? 1 : digits;
  return num(value).toLocaleString("ru-RU", { minimumFractionDigits: places, maximumFractionDigits: places });
}

function formatFactor(value) {
  return "×" + num(value).toLocaleString("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 3 });
}

function tormentName(level) {
  var mark = TORMENT_AT[level];
  return mark ? "Истязание " + mark : "";
}

function defaultState() {
  return {
    v: 1,
    season: 15,
    classId: "sorcerer",
    level: 1,
    plus: 0,
    weapon: 0,
    weaponSpeed: 1,
    attackSpeed: 0,
    skill: 100,
    dot: 0,
    thorns: 0,
    apsOverride: 1,
    stat: 0,
    statBonus: 0,
    statManual: false,
    allDamage: 0,
    elements: emptyElements(),
    vulnerableDamage: 0,
    eliteDamage: 0,
    frostDamage: 0,
    demonDamage: 0,
    undeadDamage: 0,
    unstoppableDamage: 0,
    overpowerDamage: 50,
    critDamage: 50,
    critChance: 5,
    damageType: "cold",
    vulnerable: true,
    elite: false,
    demon: false,
    undead: false,
    unstoppable: false,
    guaranteed: false,
    critIncludesBase: true,
    vulnX: 0,
    critX: 0,
    dotX: 0,
    demonX: 0,
    undeadX: 0,
    defense: defaultDefense()
  };
}

function defaultDefense() {
  return {
    life: 0,
    barrier: 0,
    regen: 0,
    dodge: 0,
    armor: 0,
    resistCap: 70,
    fire: 0,
    lightning: 0,
    cold: 0,
    poison: 0,
    shadow: 0,
    drAll: 0,
    drClose: 0,
    drFar: 0,
    drElite: 0,
    drFortify: 0,
    drUnstoppable: 0,
    fortified: false,
    vulnerable: false,
    unstoppable: false,
    close: true,
    far: false,
    elite: false
  };
}

function exampleState() {
  var state = defaultState();
  state.weapon = 3962;
  state.weaponSpeed = 1.15;
  state.attackSpeed = 37.7;
  state.apsOverride = "";
  state.skill = 100;
  state.stat = 5992;
  state.statBonus = 973.8;
  state.statManual = true;
  state.allDamage = 33.7;
  state.elements = {
    physical: 96,
    fire: 762.4,
    lightning: 762.4,
    cold: 4204.4,
    holy: 762.4,
    poison: 762.4,
    shadow: 762.4
  };
  state.vulnerableDamage = 668;
  state.eliteDamage = 287.8;
  state.critDamage = 50;
  state.critChance = 30.6;
  state.damageType = "cold";
  state.vulnerable = true;
  return state;
}

var lastState = defaultState();
var lastResult = null;

function init() {
  var seasonEl = document.getElementById("season");
  var classEl = document.getElementById("class");
  seasonEl.innerHTML = "";
  [15, 16, 17].forEach(function (id) {
    var option = document.createElement("option");
    option.value = String(id);
    option.textContent = "Сезон " + id;
    if (SEASONS[id]) option.title = SEASONS[id].name;
    seasonEl.appendChild(option);
  });
  classEl.innerHTML = "";
  CLASSES.forEach(function (item) {
    var option = document.createElement("option");
    option.value = item.id;
    option.textContent = item.name;
    classEl.appendChild(option);
  });

  buildTypes();
  buildSheet();
  buildLevels();
  buildPicks();
  buildLab();
  writeState(defaultState());
  bind();
  render();
}

function buildTypes() {
  var row = document.getElementById("type-row");
  row.innerHTML = "";
  ELEMENTS.forEach(function (el) {
    var button = document.createElement("button");
    button.type = "button";
    button.className = "type-btn";
    button.dataset.type = el.id;
    button.textContent = el.short;
    button.addEventListener("click", function () {
      document.querySelectorAll(".type-btn").forEach(function (node) {
        node.classList.toggle("on", node === button);
      });
      render();
    });
    row.appendChild(button);
  });
}

function buildSheet() {
  var host = document.getElementById("sheet-rows");
  var rows = [["all", "Весь урон, %", false]];
  ELEMENTS.forEach(function (el) {
    rows.push(["el-" + el.id, el.name + ", %", false]);
  });
  rows.push(
    ["vulnerable", "Урон, наносимый уязвимым противникам, %", false],
    ["elite", "Урон элитным противникам, %", false],
    ["frost", "Урон морозом, %", false, "frost"],
    ["demon", "Урон демонам, %", false, "demon"],
    ["undead", "Урон нежити, %", false, "undead"],
    ["unstoppable", "Урон неудержимым противникам, %", false],
    ["overpower", "Подавляющий урон, %", false],
    ["op-chance", "Шанс подавления, %", true],
    ["crit-damage", "Критический урон, %", false],
    ["crit-chance", "Вероятность критического удара, %", false]
  );
  host.innerHTML = rows.map(function (row) {
    var extra = row[2] ? " readonly tabindex=\"-1\" value=\"" + OVERPOWER_CHANCE + "\"" : " value=\"0\"";
    var tip = row[3] ? ' data-tip="' + row[3] + '"' : "";
    return '<div class="line"><label' + tip + '>' + row[1] + '</label><input id="' + row[0] + '" type="number" step="0.1"' + tip + extra + ' inputmode="decimal"></div>';
  }).join("");
}

function buildPicks() {
  ["season", "class"].forEach(function (id) {
    var select = document.getElementById(id);
    var pop = document.getElementById(id + "-pop");
    pop.innerHTML = "";
    Array.prototype.forEach.call(select.options, function (option) {
      var button = document.createElement("button");
      button.type = "button";
      button.className = "pick-item";
      button.dataset.pick = id;
      button.dataset.value = option.value;
      button.textContent = option.textContent;
      button.setAttribute("role", "option");
      pop.appendChild(button);
    });
  });
}

function paintPicks() {
  ["season", "class"].forEach(function (id) {
    var select = document.getElementById(id);
    var option = select.options[select.selectedIndex];
    document.getElementById(id + "-btn").textContent = option ? option.textContent : "";
    document.getElementById(id + "-pop").querySelectorAll(".pick-item").forEach(function (item) {
      var on = item.dataset.value === select.value;
      item.classList.toggle("on", on);
      item.setAttribute("aria-selected", on ? "true" : "false");
    });
  });
}

function closePicks() {
  document.querySelectorAll(".pick-pop").forEach(function (pop) { pop.hidden = true; });
  document.querySelectorAll(".pick-btn").forEach(function (button) {
    button.setAttribute("aria-expanded", "false");
  });
}

function buildLevels() {
  var pop = document.getElementById("level-pop");
  var html = "";
  for (var level = 1; level <= 150; level++) {
    var mark = TORMENT_AT[level];
    var label = mark || String(level);
    var aria = mark ? "Уровень " + level + ", Истязание " + mark : "Уровень " + level;
    html += '<button type="button" class="lv' + (mark ? " torment" : "") + '" data-level="' + level + '" aria-label="' + aria + '">' + label + "</button>";
  }
  pop.innerHTML = html;
}

function bind() {
  document.body.addEventListener("input", function (event) {
    if (event.target.closest("input, select")) render();
  });
  document.body.addEventListener("change", function (event) {
    if (event.target.closest("input, select")) render();
  });
  document.getElementById("class").addEventListener("change", updateClassLabel);
  document.querySelectorAll(".mode").forEach(function (button) {
    button.addEventListener("click", function () {
      var name = button.dataset.mode;
      document.querySelectorAll(".mode").forEach(function (node) {
        var on = node === button;
        node.classList.toggle("on", on);
        node.setAttribute("aria-selected", on ? "true" : "false");
      });
      document.getElementById("mode-damage").hidden = name !== "damage";
      document.getElementById("mode-defense").hidden = name !== "defense";
      document.getElementById("mode-formula").hidden = name !== "formula";
    });
  });
  document.getElementById("btn-stat-mode").addEventListener("click", function () {
    var input = document.getElementById("stat-bonus");
    input.dataset.manual = input.dataset.manual === "1" ? "0" : "1";
    render();
  });
  document.getElementById("btn-example").addEventListener("click", function () {
    writeState(exampleState());
    setStatus("Подставлен лист со скриншота. Коэффициент умения оставлен 100%: на листе атаки его нет.");
    render();
  });
  document.getElementById("btn-reset").addEventListener("click", function () {
    writeState(defaultState());
    setStatus("Поля сброшены.");
    render();
  });
  document.getElementById("btn-save").addEventListener("click", saveFile);
  document.getElementById("file-load").addEventListener("change", loadFile);
  document.body.addEventListener("click", function (event) {
    var level = event.target.closest("[data-level]");
    if (level) {
      document.getElementById("level").value = level.dataset.level;
      closeLevels();
      render();
      return;
    }
    var pick = event.target.closest(".pick-item");
    if (pick) {
      var select = document.getElementById(pick.dataset.pick);
      select.value = pick.dataset.value;
      closePicks();
      select.dispatchEvent(new Event("change", { bubbles: true }));
      return;
    }
    var pickBtn = event.target.closest(".pick-btn");
    if (pickBtn) {
      var pop = document.getElementById(pickBtn.getAttribute("aria-controls"));
      var willOpen = pop.hidden;
      closePicks();
      closeLevels();
      if (willOpen) {
        pop.hidden = false;
        pickBtn.setAttribute("aria-expanded", "true");
      }
      return;
    }
    if (event.target.id === "level-btn") {
      closePicks();
      toggleLevels();
      return;
    }
    if (!event.target.closest(".level-wrap")) closeLevels();
    if (!event.target.closest(".pick")) closePicks();
  });

  var tip = document.getElementById("float-tip");
  document.addEventListener("mouseover", function (event) { showTip(event.target); });
  document.addEventListener("focusin", function (event) { showTip(event.target); });
  document.addEventListener("mouseout", function (event) {
    if (!event.relatedTarget || !event.relatedTarget.closest("[data-tip]")) tip.hidden = true;
  });
  document.addEventListener("focusout", function () { tip.hidden = true; });
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      closeLevels();
      closePicks();
    }
  });
}

function showTip(target) {
  var host = target && target.closest ? target.closest("[data-tip]") : null;
  if (!host) return;
  var text = TIPS[host.dataset.tip] || "";
  if (!text) return;
  var tip = document.getElementById("float-tip");
  tip.textContent = text;
  tip.hidden = false;
  var rect = host.getBoundingClientRect();
  var left = Math.min(rect.left, window.innerWidth - 360);
  var top = rect.bottom + 8;
  if (top + 160 > window.innerHeight) top = Math.max(8, rect.top - 8 - tip.offsetHeight);
  tip.style.left = Math.max(8, left) + "px";
  tip.style.top = top + "px";
}

function toggleLevels() {
  var pop = document.getElementById("level-pop");
  var open = pop.hidden;
  pop.hidden = !open;
  document.getElementById("level-btn").setAttribute("aria-expanded", open ? "true" : "false");
  if (open) {
    var current = pop.querySelector('.lv[data-level="' + document.getElementById("level").value + '"]');
    if (current) current.scrollIntoView({ block: "center" });
  }
}

function closeLevels() {
  document.getElementById("level-pop").hidden = true;
  document.getElementById("level-btn").setAttribute("aria-expanded", "false");
}

function setStatus(text) {
  document.getElementById("status").textContent = text;
}

function updateClassLabel() {
  var item = classById(document.getElementById("class").value);
  document.getElementById("stat-label").textContent = STAT_NAMES[item.stat];
  document.getElementById("stat-bonus-label").textContent = "Бонус от характеристики (" + STAT_NAMES[item.stat] + ")";
}

function field(id) {
  return num(document.getElementById(id).value);
}

function checked(id) {
  return document.getElementById(id).checked;
}

function readDefense() {
  return {
    life: field("def-life"),
    barrier: field("def-barrier"),
    regen: field("def-regen"),
    dodge: field("def-dodge"),
    armor: field("def-armor"),
    resistCap: field("def-cap"),
    fire: field("def-fire"),
    lightning: field("def-lightning"),
    cold: field("def-cold"),
    poison: field("def-poison"),
    shadow: field("def-shadow"),
    drAll: field("def-dr"),
    drClose: field("def-close"),
    drFar: field("def-far"),
    drElite: field("def-elite"),
    drFortify: field("def-fort"),
    drUnstoppable: field("def-unstop"),
    fortified: checked("hero-fort"),
    vulnerable: checked("hero-vuln"),
    unstoppable: checked("hero-unstop"),
    close: checked("hero-close"),
    far: checked("hero-far"),
    elite: checked("hero-elite")
  };
}

function readState() {
  var elements = {};
  ELEMENTS.forEach(function (el) {
    elements[el.id] = field("el-" + el.id);
  });
  var active = document.querySelector(".type-btn.on");
  var aps = document.getElementById("aps").value.trim();
  var bonusInput = document.getElementById("stat-bonus");
  var manual = bonusInput.dataset.manual === "1";
  var season = field("season");
  var classId = document.getElementById("class").value;
  var stat = field("stat");
  var auto = suggestedBonus(season, classId, stat);
  return {
    v: 1,
    season: season,
    classId: classId,
    level: field("level") || 1,
    plus: 0,
    weapon: field("weapon"),
    weaponSpeed: field("weapon-speed"),
    attackSpeed: field("attack-speed"),
    skill: field("skill"),
    dot: field("dot"),
    thorns: field("thorns"),
    apsOverride: aps === "" ? "" : num(aps),
    stat: stat,
    statBonus: manual ? num(bonusInput.value) : (auto == null ? 0 : auto),
    statManual: manual,
    allDamage: field("all"),
    elements: elements,
    vulnerableDamage: field("vulnerable"),
    eliteDamage: field("elite"),
    frostDamage: field("frost"),
    demonDamage: field("demon"),
    undeadDamage: field("undead"),
    unstoppableDamage: field("unstoppable"),
    overpowerDamage: field("overpower"),
    critDamage: field("crit-damage"),
    critChance: field("crit-chance"),
    damageType: active ? active.dataset.type : "cold",
    vulnerable: checked("vuln-on"),
    elite: checked("elite-on"),
    demon: false,
    undead: false,
    unstoppable: checked("unstoppable-on"),
    guaranteed: checked("guaranteed"),
    critIncludesBase: true,
    vulnX: field("vuln-x"),
    critX: field("crit-x"),
    dotX: field("dot-x"),
    demonX: field("demon-x"),
    undeadX: field("undead-x"),
    defense: readDefense()
  };
}

function writeState(state) {
  document.getElementById("season").value = String(state.season || 15);
  document.getElementById("class").value = state.classId || "sorcerer";
  document.getElementById("level").value = state.level || 1;
  document.getElementById("weapon").value = state.weapon || 0;
  document.getElementById("weapon-speed").value = state.weaponSpeed == null ? 1 : state.weaponSpeed;
  document.getElementById("attack-speed").value = state.attackSpeed || 0;
  document.getElementById("skill").value = state.skill == null ? 100 : state.skill;
  document.getElementById("dot").value = state.dot || 0;
  document.getElementById("thorns").value = state.thorns || 0;
  document.getElementById("aps").value = state.apsOverride == null ? "" : state.apsOverride;
  document.getElementById("stat").value = state.stat || 0;
  document.getElementById("all").value = state.allDamage || 0;
  ELEMENTS.forEach(function (el) {
    document.getElementById("el-" + el.id).value = (state.elements && state.elements[el.id]) || 0;
  });
  document.getElementById("vulnerable").value = state.vulnerableDamage || 0;
  document.getElementById("elite").value = state.eliteDamage || 0;
  document.getElementById("frost").value = state.frostDamage || 0;
  document.getElementById("demon").value = state.demonDamage || 0;
  document.getElementById("undead").value = state.undeadDamage || 0;
  document.getElementById("unstoppable").value = state.unstoppableDamage || 0;
  document.getElementById("overpower").value = state.overpowerDamage == null ? 50 : state.overpowerDamage;
  document.getElementById("crit-damage").value = state.critDamage == null ? 50 : state.critDamage;
  document.getElementById("crit-chance").value = state.critChance == null ? 5 : state.critChance;
  document.getElementById("vuln-on").checked = state.vulnerable !== false;
  document.getElementById("elite-on").checked = !!state.elite;
  document.getElementById("unstoppable-on").checked = !!state.unstoppable;
  document.getElementById("guaranteed").checked = !!state.guaranteed;
  document.getElementById("vuln-x").value = state.vulnX || 0;
  document.getElementById("crit-x").value = state.critX || 0;
  document.getElementById("dot-x").value = state.dotX || 0;
  document.getElementById("demon-x").value = state.demonX || 0;
  document.getElementById("undead-x").value = state.undeadX || 0;
  var bonusInput = document.getElementById("stat-bonus");
  var auto = suggestedBonus(state.season || 15, state.classId || "sorcerer", state.stat || 0);
  var manual = !!state.statManual;
  if (state.statManual == null && auto != null && Math.abs(num(state.statBonus) - auto) > 0.15) manual = true;
  bonusInput.dataset.manual = manual ? "1" : "0";
  bonusInput.value = manual ? (state.statBonus || 0) : (auto == null ? 0 : Number(auto.toFixed(1)));
  document.querySelectorAll(".type-btn").forEach(function (button) {
    button.classList.toggle("on", button.dataset.type === (state.damageType || "cold"));
  });
  writeDefense(Object.assign(defaultDefense(), state.defense || {}));
  updateClassLabel();
}

function writeDefense(defense) {
  document.getElementById("def-life").value = defense.life || 0;
  document.getElementById("def-barrier").value = defense.barrier || 0;
  document.getElementById("def-regen").value = defense.regen || 0;
  document.getElementById("def-dodge").value = defense.dodge || 0;
  document.getElementById("def-armor").value = defense.armor || 0;
  document.getElementById("def-cap").value = defense.resistCap == null ? 70 : defense.resistCap;
  document.getElementById("def-fire").value = defense.fire || 0;
  document.getElementById("def-lightning").value = defense.lightning || 0;
  document.getElementById("def-cold").value = defense.cold || 0;
  document.getElementById("def-poison").value = defense.poison || 0;
  document.getElementById("def-shadow").value = defense.shadow || 0;
  document.getElementById("def-dr").value = defense.drAll || 0;
  document.getElementById("def-close").value = defense.drClose || 0;
  document.getElementById("def-far").value = defense.drFar || 0;
  document.getElementById("def-elite").value = defense.drElite || 0;
  document.getElementById("def-fort").value = defense.drFortify || 0;
  document.getElementById("def-unstop").value = defense.drUnstoppable || 0;
  document.getElementById("hero-fort").checked = !!defense.fortified;
  document.getElementById("hero-vuln").checked = !!defense.vulnerable;
  document.getElementById("hero-unstop").checked = !!defense.unstoppable;
  document.getElementById("hero-close").checked = defense.close !== false;
  document.getElementById("hero-far").checked = !!defense.far;
  document.getElementById("hero-elite").checked = !!defense.elite;
}

function render() {
  var state = readState();
  lastState = state;
  updateClassLabel();
  paintLevel(state.level);
  paintPicks();
  paintSeasonDates(state.season);
  paintStatHint(state);
  document.getElementById("season-warn").hidden = !!SEASONS[state.season];
  var result = calculate(state);
  lastResult = result;
  applyStatField(state);
  paintResults(result, state);
  paintFormula(result, state);
  paintDefense(calculateDefense(state.defense));
  paintLab();
}

function applyStatField(state) {
  var input = document.getElementById("stat-bonus");
  var button = document.getElementById("btn-stat-mode");
  input.readOnly = !state.statManual;
  input.dataset.manual = state.statManual ? "1" : "0";
  if (!state.statManual) input.value = Number(num(state.statBonus).toFixed(1));
  button.setAttribute("aria-pressed", state.statManual ? "true" : "false");
  button.title = state.statManual ? "Снова считать по таблице сезона" : "Ввести число с тултипа";
}

function paintLevel(level) {
  var mark = TORMENT_AT[level];
  var button = document.getElementById("level-btn");
  button.textContent = mark ? "Истязание " + mark : String(level);
  document.querySelectorAll(".lv").forEach(function (node) {
    node.classList.toggle("on", Number(node.dataset.level) === Number(level));
  });
}

function paintStatHint(state) {
  var item = classById(state.classId);
  var season = SEASONS[state.season];
  var hint = document.getElementById("stat-hint");
  if (!season) {
    hint.textContent = "Таблицы этого сезона нет.";
    return;
  }
  var per10 = season.per10[state.classId];
  var bonus = suggestedBonus(state.season, state.classId, state.stat);
  hint.textContent = "Таблица сезона: " + formatPct(per10, 3) + "% за 10 " + STAT_GENITIVE[item.stat] +
    (state.stat ? " → " + formatPct(bonus) + "%." : ".") +
    (state.statManual ? " Сейчас вписано вручную." : " Считается само.");
}

function row(title, value, tip) {
  return '<div class="result-row"><strong data-tip="' + tip + '">' + title + '</strong><b>' + value + '</b></div>';
}

function paintResults(result, state) {
  var host = document.getElementById("results");
  if (!result.ok) {
    host.innerHTML = "<p class='warn'>" + esc(result.reason) + "</p>";
    return;
  }
  var chance = result.guaranteed
    ? "100% (гарантированные криты, на листе " + formatPct(state.critChance) + "%)"
    : (result.pRaw > 1
      ? "100% (на листе " + formatPct(state.critChance) + "%, выше потолка)"
      : formatPct(state.critChance) + "%");
  host.innerHTML =
    row("Прямой урон с тычки", formatInt(result.directHit), "weapon") +
    row("Прямой урон в секунду", formatInt(result.directDps), "aps") +
    row("Периодический урон в секунду", formatInt(result.dotDps), "dot") +
    row("Критический урон с тычки", formatInt(result.critHit), "crit-base") +
    row("Вероятность крита", chance, "guaranteed") +
    row("Подавляющий удар", formatInt(result.overpowerHit), "overpower") +
    row("Шанс подавления", OVERPOWER_CHANCE + "%", "op-chance") +
    row("Шипы за полученный удар", formatInt(result.thornsHit), "thorns") +
    '<div class="total"><span data-tip="skill">Общий урон в секунду</span><b>' + formatInt(result.total) + '</b></div>' +
    '<div class="total"><span data-tip="guaranteed">Общий урон в секунду с критами</span><b>' + formatInt(result.totalCrit) + '</b></div>' +
    familySections(state);
}

function familyOn(pct, x) {
  return num(pct) !== 0 || num(x) !== 0;
}

function familyNote(pct, x) {
  var bits = [];
  if (num(pct)) bits.push("с листа " + formatPct(pct) + "%");
  if (num(x)) bits.push("с оружия × " + formatPct(x) + "%");
  return bits.join(", ");
}

function familyCalc(state, flag) {
  var next = Object.assign({}, state, { demon: false, undead: false });
  next[flag] = true;
  return calculate(next);
}

function familyBlock(title, calc, note) {
  return '<div class="family">' +
    '<p class="family-title">' + esc(title) + '</p>' +
    '<p class="fine">' + esc(note) + ". В общий удар выше эти бонусы не входят.</p>" +
    row("Прямой урон с тычки", formatInt(calc.directHit), "weapon") +
    row("Критический урон с тычки", formatInt(calc.critHit), "crit-base") +
    '<div class="total"><span>Общий урон в секунду</span><b>' + formatInt(calc.total) + '</b></div>' +
    '<div class="total"><span>Общий урон в секунду с критами</span><b>' + formatInt(calc.totalCrit) + '</b></div>' +
    '</div>';
}

function familySections(state) {
  var html = "";
  if (familyOn(state.demonDamage, state.demonX)) {
    var demonCalc = familyCalc(state, "demon");
    if (demonCalc.ok) html += familyBlock("По демонам", demonCalc, familyNote(state.demonDamage, state.demonX));
  }
  if (familyOn(state.undeadDamage, state.undeadX)) {
    var undeadCalc = familyCalc(state, "undead");
    if (undeadCalc.ok) html += familyBlock("По нежити", undeadCalc, familyNote(state.undeadDamage, state.undeadX));
  }
  return html;
}

function paintFormula(result, state) {
  var list = document.getElementById("formula");
  if (!result.ok) {
    list.innerHTML = "<li>" + esc(result.reason) + "</li>";
    return;
  }
  var item = classById(state.classId);
  var steps = [];
  steps.push("Прямая база: " + formatInt(state.weapon) + " × " + formatPct(state.skill) + "% = " + formatInt(result.base) + ".");
  steps.push(STAT_NAMES[item.stat] + " даёт множитель " + formatFactor(result.statFactor) + " (1 + " + formatPct(state.statBonus) + "%). После неё " + formatInt(result.afterStat) + ".");
  if (result.parts.length) {
    steps.push("Сумма [+]: " + result.parts.map(function (p) {
      return formatPct(p.pct) + "% " + p.name;
    }).join(" + ") + " = " + formatPct(result.sumPct) + "%. Множитель " + formatFactor(result.addFactor) + ".");
  } else {
    steps.push("Подходящих [+] нет. Множитель ×1.");
  }
  if (result.skipped.length) {
    steps.push("Не вошли в этот удар: " + result.skipped.join(", ") + ".");
  }
  var multipliers = [];
  if (num(state.vulnX) && result.vulnerable) multipliers.push("уязвимость " + formatFactor(1 + num(state.vulnX) / 100));
  if (num(state.critX)) multipliers.push("крит " + formatFactor(result.critX));
  if (num(state.dotX)) multipliers.push("периодический " + formatFactor(result.dotX));
  steps.push(multipliers.length ? "Отдельные [×]: " + multipliers.join(", ") + "." : "Отдельных [×] сверх базы уязвимости и крита нет.");
  steps.push(result.vulnerable
    ? "Уязвимость: ×1,20 × (1 + " + formatPct(state.vulnX) + "%) = " + formatFactor(result.vulnFactor) + "."
    : "Враг не уязвим. Множитель уязвимости не применяется.");
  steps.push("Прямой удар: " + formatInt(result.directHit) + ".");
  steps.push("Крит. На листе " + formatPct(state.critDamage) + "%. Базовые 50% — это ×1,50, в сумму [+] на крите входит излишек " + formatPct(result.critExtra) + "%." +
    " Сумма [+] на крите " + formatPct(result.critSum) + "% → " + formatFactor(result.critAddFactor) +
    ". Сверху ×1,50 и множитель крита " + formatFactor(result.critX) + ". Критический удар: " + formatInt(result.critHit) + ".");
  steps.push("Каждый прямой удар бросает шанс отдельно. Скрытого роста шанса после промаха нет. " +
    (result.guaranteed
      ? "Гарантированные криты: в среднее идёт 100%."
      : "Шанс в среднем: " + formatPct(result.p * 100) + "%.") +
    " Средний прямой удар = обычный × (1 − шанс) + критический × шанс.");
  steps.push("Ударов в секунду: " + formatPct(result.aps, 2) + (result.apsOverride ? " (вписано вручную)." : " = скорость оружия × (1 + бонус скорости).") +
    " Прямой урон в секунду " + formatInt(result.directDps) + ".");
  steps.push("Подавление. Шанс фиксирован: " + OVERPOWER_CHANCE + "%. На листе " + formatPct(state.overpowerDamage) + "%. Базовые 50% уже внутри, в сумму [+] входит " + formatPct(result.opExtra) + "%." +
    " Сверху ×1,50. Подавляющий удар: " + formatInt(result.overpowerHit) + ". В общий урон в секунду эти 3% не подмешаны: удар показан отдельно.");
  steps.push("Шипы: " + formatInt(state.thorns) + " " + formatFactor(result.statFactor) + " " + formatFactor(result.thornFactor) +
    (result.vulnerable ? " " + formatFactor(result.vulnFactor) : "") +
    (result.familyX !== 1 ? " " + formatFactor(result.familyX) : "") +
    " = " + formatInt(result.thornsHit) + ". Оружие, умение и крит в шипах не участвуют.");
  steps.push("Периодический урон не критует и не подавляет. " + formatInt(state.weapon) + " × " + formatPct(state.dot) + "% в секунду, те же множители кроме крита, плюс множитель периодического урона " + formatFactor(result.dotX) + ". В секунду: " + formatInt(result.dotDps) + ".");
  steps.push("Общий урон в секунду без критов: прямой + периодический = " + formatInt(result.total) + ".");
  steps.push("Общий урон в секунду с критами: " + formatInt(result.directDps) + " × (1 − " + formatPct(result.p * 100) + "%) + " + formatInt(result.critDps) + " × " + formatPct(result.p * 100) + "% + " + formatInt(result.dotDps) + " = " + formatInt(result.totalCrit) + ".");
  if (familyOn(state.demonDamage, state.demonX) || familyOn(state.undeadDamage, state.undeadX)) {
    steps.push("Урон демонам и урон нежити в этот удар не входят. Заполненные поля посчитаны отдельным итогом ниже.");
  }
  steps.push("Уровень " + state.level + (tormentName(state.level) ? " (" + tormentName(state.level) + ")" : "") + " этот удар не меняет. Истязание поднимает здоровье монстров и урон по вам. Штраф брони и сопротивлений уже сидит в числах листа.");
  list.innerHTML = steps.map(function (step) { return "<li>" + esc(step) + "</li>"; }).join("");
}

function formatLab(value) {
  if (!Number.isFinite(value)) return "—";
  var rounded = Math.round(value * 100) / 100;
  return rounded.toLocaleString("ru-RU", { maximumFractionDigits: 2 });
}

function paintDefense(def) {
  var host = document.getElementById("defense-results");
  var rows = def.rows.map(function (item) {
    var bits = [];
    if (item.resist && item.resist.capped) bits.push("Потолок срезал сопротивление до " + formatPct(item.resist.pct) + "%.");
    if (item.ehp != null) bits.push("Запас здоровья: " + formatInt(item.ehp) + ".");
    var note = bits.length ? '<span>' + bits.join(" ") + '</span>' : '';
    return '<div class="result-row def-row"><strong>' + item.name + '</strong><b>' + formatPct(item.taken * 100) + '%</b>' + note + '</div>';
  }).join("");
  host.innerHTML = rows +
    '<p class="fine">Число — доля входящего удара, которая доходит. Броня даёт ' + formatPct(def.armor) + '% против физического урона.' +
    (def.fortified ? ' Укрепление режет ещё ' + FORTIFY_DR + '%.' : '') +
    (def.vulnerable ? ' Уязвимость увеличивает входящий урон на 20%.' : '') +
    (def.barrier ? ' Барьер ' + formatInt(def.barrier) + ' снимается уже после этого процента.' : '') +
    ' Регенерация ' + formatInt(def.regen) + ' в секунду и после удара молчит 4 секунды.' +
    (def.dodge ? ' Уклонение ' + formatPct(def.dodge) + '% — отдельный шанс избежать прямого удара, в процент не входит.' : '') +
    '</p>';
}

function paintLab() {
  var bases = labValues("lab-bases");
  var skills = labValues("lab-skills");
  var adds = labValues("lab-adds");
  var muls = labValues("lab-muls");
  var base = bases.reduce(function (sum, row) { return sum + row.value; }, 0);
  var stat = 1 + field("lab-stat") / 100;
  var skill = skills.length ? skills.reduce(function (sum, row) { return sum + row.value; }, 0) / 100 : 1;
  var addSum = adds.reduce(function (sum, row) { return sum + row.value; }, 0);
  var add = 1 + addSum / 100;
  var critSheet = field("lab-crit-pct");
  var critExtra = Math.max(0, critSheet - 50);
  var critOn = checked("lab-crit");
  var addUsed = critOn ? 1 + (addSum + critExtra) / 100 : add;
  var mul = muls.reduce(function (product, row) { return product * (1 + row.value / 100); }, 1);
  var vulnOn = checked("lab-vuln");
  var vuln = vulnOn ? 1.2 : 1;
  var crit = critOn ? 1.5 : 1;
  var total = base * stat * skill * addUsed * mul * vuln * crit;
  document.getElementById("lab-base-sum").textContent = formatLab(base);
  document.getElementById("lab-stat-factor").textContent = formatFactor(stat);
  document.getElementById("lab-skill-factor").textContent = formatFactor(skill);
  document.getElementById("lab-add-factor").textContent = formatFactor(add);
  document.getElementById("lab-mul-factor").textContent = formatFactor(mul);
  document.getElementById("lab-vuln-factor").textContent = formatFactor(vuln);
  document.getElementById("lab-crit-factor").textContent = formatFactor(crit);
  document.getElementById("lab-crit-note").textContent = critOn
    ? "На листе " + formatPct(critSheet) + "%. Базовые 50% — это ×1,50. Излишек " + formatPct(critExtra) + "% вошёл в скобку [+], вместе с прибавками она стала " + formatFactor(addUsed) + "."
    : "На листе " + formatPct(critSheet) + "%. Излишек над 50% — " + formatPct(critExtra) + "%. Он войдёт в скобку [+], когда отмечен критический удар.";
  document.getElementById("lab-result").textContent = formatLab(total);
  var parts = [formatLab(base), formatLab(stat), formatLab(skill), formatLab(addUsed)];
  if (muls.length) muls.forEach(function (row) { parts.push(formatLab(1 + row.value / 100)); });
  else parts.push(formatLab(1));
  parts.push(formatLab(vuln), formatLab(crit));
  document.getElementById("lab-work").textContent = parts.join(" × ") + " = " + formatLab(total);
}

var LAB_LISTS = { base: "lab-bases", skill: "lab-skills", add: "lab-adds", mul: "lab-muls" };
var LAB_LIMIT = 30;

function labValues(id) {
  return [].map.call(document.querySelectorAll("#" + id + " .lab-row"), function (row) {
    return {
      name: row.querySelector(".lab-name").value.trim(),
      value: num(row.querySelector(".lab-num").value)
    };
  });
}

function labPlaceholder(kind) {
  if (kind === "add") return "урон от холода";
  if (kind === "mul") return "весь урон";
  if (kind === "skill") return "умение";
  return "оружие";
}

function addLabRow(kind, name, value) {
  var host = document.getElementById(LAB_LISTS[kind]);
  if (!host || host.children.length >= LAB_LIMIT) return;
  var row = document.createElement("div");
  row.className = "lab-row";
  var nameInput = document.createElement("input");
  nameInput.type = "text";
  nameInput.className = "lab-name";
  nameInput.value = name || "";
  nameInput.placeholder = labPlaceholder(kind);
  var numInput = document.createElement("input");
  numInput.type = "number";
  numInput.className = "lab-num";
  numInput.step = "0.1";
  numInput.value = value == null ? 0 : value;
  numInput.inputMode = "decimal";
  var del = document.createElement("button");
  del.type = "button";
  del.className = "lab-del";
  del.textContent = "×";
  del.setAttribute("aria-label", "Убрать строку");
  del.addEventListener("click", function () {
    row.remove();
    paintLab();
  });
  row.appendChild(nameInput);
  row.appendChild(numInput);
  if (kind !== "base") {
    var pct = document.createElement("span");
    pct.className = "lab-op";
    pct.textContent = "%";
    row.appendChild(pct);
  }
  row.appendChild(del);
  host.appendChild(row);
}

function buildLab() {
  addLabRow("base", "оружие 1", 100);
  addLabRow("skill", "умение", 100);
  document.querySelectorAll("[data-lab-add]").forEach(function (button) {
    button.addEventListener("click", function () {
      var kind = button.dataset.labAdd;
      var host = document.getElementById(LAB_LISTS[kind]);
      var count = host.children.length + 1;
      var name = kind === "base" ? "оружие " + count : "";
      addLabRow(kind, name, 0);
      paintLab();
    });
  });
}

function maxHit(result) {
  if (!result || !result.ok) return 0;
  return Math.round(result.p > 0 ? result.critHit : result.directHit);
}

function saveFile() {
  var state = readState();
  var result = calculate(state);
  if (!result.ok) {
    setStatus(result.reason);
    return;
  }
  var item = classById(state.classId);
  var now = new Date();
  var pad = function (n) { return String(n).padStart(2, "0"); };
  var date = pad(now.getDate()) + "." + pad(now.getMonth() + 1) + "." + now.getFullYear() + "_" + pad(now.getHours()) + "-" + pad(now.getMinutes());
  var max = maxHit(result);
  var filename = item.name + "_" + date + "_" + max + ".txt";
  var body = humanText(state, result, item);
  var encoded = "D4C1:" + encodeBase64(JSON.stringify(state));
  download(filename, encoded + "\n\n" + body);
  setStatus("Файл " + filename + " сохранён в загрузки. Первая строка восстанавливает расчёт.");
}

function humanText(state, result, item) {
  var lines = [];
  lines.push("Калькулятор урона Diablo IV");
  lines.push((SEASONS[state.season] ? SEASONS[state.season].name : "Сезон " + state.season));
  lines.push("");
  lines.push("Класс: " + item.name);
  lines.push("Уровень сложности: " + state.level + (tormentName(state.level) ? " (" + tormentName(state.level) + ")" : "") + ". На удар не влияет.");
  lines.push(STAT_NAMES[item.stat] + ": " + formatInt(state.stat) + ", бонус урона " + formatPct(state.statBonus) + "%");
  lines.push("Базовый урон от оружия: " + formatInt(state.weapon));
  lines.push("Скорость оружия: " + formatPct(state.weaponSpeed, 2) + ", бонус скорости " + formatPct(state.attackSpeed) + "%, ударов в секунду " + formatPct(result.aps, 2));
  lines.push("Прямой урон умения: " + formatPct(state.skill) + "%");
  lines.push("Периодический урон умения: " + formatPct(state.dot) + "% в секунду");
  lines.push("Шипы: " + formatInt(state.thorns));
  lines.push("Стихия удара: " + (ELEMENTS.filter(function (el) { return el.id === state.damageType; })[0] || {}).name);
  lines.push("Весь урон: " + formatPct(state.allDamage) + "%");
  ELEMENTS.forEach(function (el) {
    lines.push(el.name + ": " + formatPct(state.elements[el.id]) + "%");
  });
  lines.push("Урон уязвимым: " + formatPct(state.vulnerableDamage) + "% (" + (state.vulnerable ? "включён" : "выключен") + ")");
  lines.push("Урон элитным: " + formatPct(state.eliteDamage) + "% (" + (state.elite ? "включён" : "выключен") + ")");
  lines.push("Урон морозом: " + formatPct(state.frostDamage) + "%");
  lines.push("Урон демонам: " + formatPct(state.demonDamage) + "%, с оружия × " + formatPct(state.demonX) + "%");
  lines.push("Урон нежити: " + formatPct(state.undeadDamage) + "%, с оружия × " + formatPct(state.undeadX) + "%");
  lines.push("Урон неудержимым: " + formatPct(state.unstoppableDamage) + "% (" + (state.unstoppable ? "включён" : "выключен") + ")");
  lines.push("Критический урон на листе: " + formatPct(state.critDamage) + "%");
  lines.push("Вероятность крита: " + formatPct(state.critChance) + "%" + (state.guaranteed ? ", гарантированные криты" : ""));
  lines.push("Подавляющий урон на листе: " + formatPct(state.overpowerDamage) + "%, шанс " + OVERPOWER_CHANCE + "%");
  lines.push("");
  lines.push("Прямой урон с тычки: " + formatInt(result.directHit));
  lines.push("Прямой урон в секунду: " + formatInt(result.directDps));
  lines.push("Периодический урон в секунду: " + formatInt(result.dotDps));
  lines.push("Критический урон с тычки: " + formatInt(result.critHit));
  lines.push("Подавляющий удар: " + formatInt(result.overpowerHit));
  lines.push("Шипы за полученный удар: " + formatInt(result.thornsHit));
  lines.push("Общий урон в секунду: " + formatInt(result.total));
  lines.push("Общий урон в секунду с критами: " + formatInt(result.totalCrit));
  if (familyOn(state.demonDamage, state.demonX)) {
    var demonCalc = familyCalc(state, "demon");
    if (demonCalc.ok) {
      lines.push("По демонам. Прямой удар: " + formatInt(demonCalc.directHit) + ". В секунду: " + formatInt(demonCalc.total) + ". В секунду с критами: " + formatInt(demonCalc.totalCrit) + ".");
    }
  }
  if (familyOn(state.undeadDamage, state.undeadX)) {
    var undeadCalc = familyCalc(state, "undead");
    if (undeadCalc.ok) {
      lines.push("По нежити. Прямой удар: " + formatInt(undeadCalc.directHit) + ". В секунду: " + formatInt(undeadCalc.total) + ". В секунду с критами: " + formatInt(undeadCalc.totalCrit) + ".");
    }
  }
  lines.push("");
  lines.push("Имя файла использует максимальный удар, который эта сборка может нанести: критический, если шанс больше нуля.");
  return lines.join("\n");
}

function encodeBase64(text) {
  var bytes = new TextEncoder().encode(text);
  var bin = "";
  bytes.forEach(function (b) { bin += String.fromCharCode(b); });
  return btoa(bin);
}

function decodeBase64(text) {
  var bin = atob(text);
  var bytes = Uint8Array.from(bin, function (ch) { return ch.charCodeAt(0); });
  return new TextDecoder().decode(bytes);
}

function download(filename, text) {
  var blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  var link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

function loadFile(event) {
  var file = event.target.files && event.target.files[0];
  event.target.value = "";
  if (!file) return;
  file.text().then(function (text) {
    var line = text.split(/\r?\n/)[0].trim();
    if (line.indexOf("D4C1:") !== 0) {
      setStatus("В первой строке нет данных калькулятора.");
      return;
    }
    try {
      var state = JSON.parse(decodeBase64(line.slice(5)));
      writeState(state);
      render();
      setStatus("Расчёт восстановлен из файла " + file.name + ".");
    } catch (error) {
      setStatus("Первую строку не удалось прочитать.");
    }
  });
}

function esc(text) {
  return String(text == null ? "" : text).replace(/[&<>"']/g, function (ch) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
  });
}

if (typeof document !== "undefined") init();

if (typeof module !== "undefined" && module.exports) {
  module.exports = { calculate: calculate, calculateDefense: calculateDefense, selfCheck: selfCheck, suggestedBonus: suggestedBonus };
}
