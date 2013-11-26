// SETUP

function mafSetup() {
	setupPlayers();
	setupTable();
}

// EVENTS

var MAF_EVENT_TABLE_READY = "ready";
var MAF_EVENT_START = "start";

var mafListeners = {};

function onMafEvent(code, f) {
	var list = mafListeners[code];
	if (list == null) {
		list = [];
		mafListeners[code] = list;
	}
	list.push(f);
}

function fireMafEvent(code, d) {
	var list = mafListeners[code];
	for(var i = 0; i < list.length; i++) {
		var listener = list[i];
		listener(d);
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

var mafPlayerNames = [];

function setupPlayers() {
	for (var i = 0; i < mafPlayers.length; i++) {
		mafPlayerNames.push(mafPlayers[i].name);
	}
}

function getPlayerNames() {
	return mafPlayerNames;
}

function getPlayer(name) {
	for (var i = 0; i < mafPlayers.length; i++) {
		if (name == mafPlayers[i].name) {
			return mafPlayers[i];
		}
	}
	return null;
}

// TABLE

var mafTable = [];
var mafTableReady = false;

function setupTable() {
	for (var i = 0; i < 10; i++) {
		mafTable.push(null);
	}
}

function sitPlayer(num, player) {
	mafTable[num - 1] = player;
	for (var i = 0; i < 10; i++) {
		if (mafTable[i] == null) {
			return;
		}
	}
	if (!mafTableReady) {
		mafTableReady = true;
		fireMafEvent(MAF_EVENT_TABLE_READY);
	}
}