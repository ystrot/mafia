function setup() {
	mafSetup();
	setupTimer();
	fillPlayers();

	//prepareTable();

	start();
	for(var i = 0; i < 10; i++) {
		setPlayer(i + 1, mafPlayers[i]);
	}
}

var playerSearchEngine;

function fillPlayers() {
	// instantiate the bloodhound suggestion engine
	playerSearchEngine = new Bloodhound({
		datumTokenizer: function(d) { return Bloodhound.tokenizers.whitespace(d.name); },
		queryTokenizer: Bloodhound.tokenizers.whitespace,
		local: mafPlayers
	});

	// initialize the bloodhound suggestion engine
	playerSearchEngine.initialize();
 
	for(var i = 0; i < 10; i++) {
		var num = i + 1;
		var player = $("#player0").clone().show().css("top", 40 * i + "px");
		player.attr("id", "player" + num);
		player.find("#num0").html(num);
		player.find("#nomNum0").html(num);
		player.find("#role0").click(selectRole);
		player.find("*").attr("id", function(i, val) {
			return val.replace(/0/g, num);
		});
		$("#players").append(player);

		makeEditable(num, "Fantom");
	}
}

function prepareTable() {
	$("#state").html("Укажите игроков, чтобы <span class='linkOff' id='startAction' onclick='onStart()'>начать игру</span>.");
	onMafEvent(MAF_EVENT_TABLE_READY, function() {
		$("#startAction").attr("class", "linkOn");
	});
}

function onStart() {
	if ($("#startAction").hasClass("linkOn")) {
		start();
	}
}

function start() {
	$("#state").html("Ночь в городе. Раздайте карты и разбудите дона и его мафию.<br>\
		У мафии есть <span class='linkOn' onclick='startTimer(60)'>минута на договорку</span>.<br>\
		Затем дайте <span class='linkOn' onclick='startTimer(30)'>30 секунд коммисару</span>, чтобы осмотреть город.<br>\
		Указав роли игроков, объявите <span class='linkOff' id='startMorning'>утро в городе</span>.");
	onMafEvent(MAF_EVENT_ROLES, function(e) {
		$("#startMorning").attr("class", e.ready ? "linkOn" : "linkOff");
		updateRoles();
	});
}

// TIMER

var timer;

function setupTimer() {
    $('#clock').countdown({
      image: 'img/digits.png',
      startTime: '00:00',
      format: 'mm:ss'
    });
}

function startTimer(seconds) {
	var init = "0" + Math.floor(seconds / 60) + ":";
	seconds = seconds % 60;
	if (seconds < 10) init += "0";
	init += seconds;
	$('#clock').remove();
	$("#timer").append("<div id='clock'></div>");
    $('#clock').countdown({
      image: "img/digits.png",
      startTime: init,
      format: "mm:ss"
    });    
}

// TOOLS

function selectRole(e) {
	var num = parseInt(e.target.id.substring(4));
	var role = getRole(num);
	var close = openPopup(e, "roleDialog");

	$("#roleDialog").find("input").each(function(i, element) {
		element.checked = element.value == role;
	}).off("click").click(function(e) {
		setRole(num, e.target.value);
		close();
	});
}

function updateRoles() {
	var showRoles = $("#showRolesButton").is(":checked");
	for(var num = 1; num <= 10; num++) {
		var image = "role";
		if (showRoles) {
			var role = getRole(num);
			image = (role == null || role == "civ") ? "none" : role;
		}
		$("#role" + num).css("background-image", "url('img/" + image + ".png')");
	}
}

function openPopup(e, id) {
	var left = e.clientX;
	var top  = e.clientY;
	var uid  = "#" + id;
	var blocker = $("<div></div>").css({
		top: 0, right: 0, bottom: 0, left: 0,
		width: "100%", height: "100%",
		position: "fixed",
		zIndex: 1,
		opacity: 0
	});
	var close = function() {
		$(uid).hide();
		blocker.remove();
		$(document).off("keydown.popup");
	}
	blocker.click(close);
	$(document).on("keydown.popup", function(event) {
		if (event.which == 27) close();
	});
	$("body").append(blocker);
	$(uid).css("left", left).css("top", top).show();
	return close;
}

function makeEditable(num, def) {
	var label = $("#valName" + num);
	var input = $("#inputName" + num);
	var field = $("#varName" + num);
	input.typeahead(null, {
		name: "player" + num,
		displayKey: "name",
		source: playerSearchEngine.ttAdapter()
	});

	label.html("Игрок №" + num).click(function() {
	    label.hide();
	    field.show();
	    input.val(label.text()).focus().select();
	});

	var hide = function() {
	    field.hide();
	    label.show();
	}

	var apply = function() {
		hide();
		var name = input.val();
		if (name.length > 0) {
			var player = getPlayer(name);
			if (player == null) {
				player = {"id": -1, "name": name, "pic": "img/unknown.png"};
			}
			setPlayer(num, player);
		}
	};

	input.blur(hide);
	input.keypress(function( event ) {
	  if (event.which == 13) apply();
	  else if (event.which == 27) hide();
	});

	input.on('typeahead:selected', apply);
	input.on('typeahead:escKeyed', hide);
}

function setPlayer(num, player) {
	sitPlayer(num, player);
	$("#valName" + num).text(player.name);
	$("#pic" + num).css("background-image", "url('" + player.pic + "')");	
}