// EVENTS

var mafListeners = [];

function onMafEvent(f) {
	mafListeners.push(f);
}

function fireMafEvent(e) {
	for(var i = 0; i < mafListeners.length; i++) {
		var f = mafListeners[i];
		f(e);
	}	
}

// PLAYERS

var mafPlayers = [
	{"id": 1,  "name": "Фантом",           "pic": "https://pp.vk.me/c305305/v305305707/7569/lLg2u_eFHis.jpg"},
	{"id": 2,  "name": "Блэк",             "pic": "https://pp.vk.me/c417126/v417126728/93aa/ZO86EgNC2u0.jpg"},
	{"id": 3,  "name": "Рейвен",           "pic": "https://pp.vk.me/c425818/v425818926/2406/pf9yGtwQW9I.jpg"},
	{"id": 4,  "name": "Реин",             "pic": "https://pp.vk.me/c417225/v417225548/70db/pE9TMI0z6gA.jpg"},
	{"id": 5,  "name": "Митч",             "pic": "https://pp.vk.me/c411129/v411129376/dac6/Ne6H1FcOEM0.jpg"},
	{"id": 6,  "name": "Голодный",         "pic": "https://pp.vk.me/c319828/v319828257/94ab/951tVoZg-0U.jpg"},
	{"id": 7,  "name": "Тринадцатая",      "pic": "https://pp.vk.me/c314622/v314622037/5b18/XNYK3qIOaew.jpg"},
	{"id": 8,  "name": "Маруся",           "pic": "https://pp.vk.me/c413225/v413225446/1ca4/gvAyZebLKT0.jpg"},
	{"id": 9,  "name": "Джонни",           "pic": "https://pp.vk.me/c421319/v421319212/75c3/X7zUO76ZzfI.jpg"},
	{"id": 10, "name": "Окси",             "pic": "https://pp.vk.me/c411222/v411222417/72d2/iFUSdBU_K74.jpg"},
	{"id": 11, "name": "Провокация",       "pic": "https://pp.vk.me/c408621/v408621572/4415/yvtq2ZR_D0I.jpg"},
	{"id": 12, "name": "Инь",              "pic": "https://pp.vk.me/c418717/v418717592/a746/eY4FwBmu9o0.jpg"},
	{"id": 13, "name": "Корса",            "pic": "https://pp.vk.me/c403628/v403628094/b97d/OqpjfGSE5QY.jpg"},
	{"id": 14, "name": "Покахонтас",       "pic": "https://pp.vk.me/c314625/v314625528/3ec0/VeIq2aIfvg8.jpg"},
	{"id": 15, "name": "Казантип",         "pic": "https://pp.vk.me/c310631/v310631034/5b9d/TfLnTTLYiRI.jpg"},
	{"id": 16, "name": "Рэд",              "pic": "https://pp.vk.me/c320620/v320620381/16ba/8c5wrw9C6To.jpg"},
	{"id": 17, "name": "Мишка Косолапый",  "pic": "https://pp.vk.me/c421223/v421223479/978a/MXqJr1bpIlA.jpg"},
	{"id": 18, "name": "Lady Ann",         "pic": "https://pp.vk.me/c425226/v425226152/4758/bZE-T9j10p8.jpg"},
	{"id": 19, "name": "Хинт",             "pic": "https://pp.vk.me/c406621/v406621037/8d1a/5EzaDp-Dr5Q.jpg"},
	{"id": 20, "name": "Ларус",            "pic": "https://pp.vk.me/c317116/v317116616/81e9/9Yh84Syzn4M.jpg"},
	{"id": 21, "name": "Джери",            "pic": "https://pp.vk.me/c616425/v616425945/dde/l-meanyhMDo.jpg"}
];

function getPlayer(name) {
	for (var i = 0; i < mafPlayers.length; i++) {
		if (name == mafPlayers[i].name) {
			return mafPlayers[i];
		}
	}
	return null;
}

// SEATING

var mafTable;
var mafSeatingReady;

function seating() {
	mafTable = [];
	for (var i = 0; i < 10; i++) {
		mafTable.push(null);
	}
	mafSeatingReady = new Var(false);
	fireMafEvent({type: "seating"});
}

function sitPlayer(num, player) {
	mafTable[num - 1] = player;
	player.role = "civ";
	for (var i = 0; i < 10; i++) {
		if (mafTable[i] == null) {
			return;
		}
	}
	mafSeatingReady.set(true);
}

// CASTING

var mafCastingReady;
var mafComplotReady;
var mafLookoutReady;

function casting() {
	if (mafSeatingReady.get()) {
		mafCastingReady = new Var(false);
		mafComplotReady = new Var(true);
		mafLookoutReady = new Var(true);
		fireMafEvent({type: "casting"});
	}
}

function complot() {
	if (mafComplotReady.get()) {
		mafComplotReady.set(false);
		fireMafEvent({type: "complot"});
	}
}

function lookout() {
	if (mafLookoutReady.get()) {
		mafLookoutReady.set(false);
		fireMafEvent({type: "lookout"});
	}
}

function getRole(num) {
	var player = mafPlayers[num - 1];
	if (player) {
		return player.role;
	}
	return null;
}

function setRole(num, role) {
	mafPlayers[num - 1].role = role;
	fireMafEvent({type: "role", num: num, role: role});
	verifyRoles();
}

function verifyRoles() {
	var roles = {"civ": 6, "maf": 2, "com": 1, "don": 1};
	for(var i = 0; i < 10; i++) {
		var role = mafPlayers[i].role;
		roles[role] = roles[role] - 1;
	}
	for (var role in roles) {
		if (roles[role] != 0) {
			mafCastingReady.set(false);
			return;
		}
	}
	mafCastingReady.set(true);
}

// DAY

var dayNum;
var kill;
var opening;

function wakeup() {
	dayNum = new Var(0);
	opening = 0;
	kill = null;
	day();
}

function day() {
	dayNum.set(dayNum.get() + 1);
	lookupOpening();
	fireMafEvent({type: "day", num: dayNum.get()});
}

function isDead(num) {
	var player = mafPlayers[num - 1];
	if (!player) return true;
	return player.dead ? true : false;
}

function lookupOpening() {
	do {
		opening++;
		if (opening > 10) {
			opening = 1;
		}
	} while(isDead(opening));
	return opening;
}
