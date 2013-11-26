function setup() {
	mafSetup();
	setupTimer();
	fillPlayers();
	prepareTable();
	//start();
}

function fillPlayers() {
	for(var i = 0; i < 10; i++) {
		var num = i + 1;
		var player = $("#player0").clone().show().css("top", 40 * i + "px");
		player.attr("id", "player" + num);
		player.find("#num0").html(num);
		player.find("#nomNum0").html(num);
		player.find("*").attr("id", function(i, val) {
			return val.replace(/0/g, num);
		});
		$("#players").append(player);
		makeEditable(num, "Fantom");
	}
}

function prepareTable() {
	$("#state").html("Укажите игроков, чтобы <span class='actionDisabled' id='startAction' onclick='onStart()'>начать игру</span>.");
	onMafEvent(MAF_EVENT_TABLE_READY, function() {
		$("#startAction").attr("class", "actionEnabled");
	});
}

function onStart() {
	if ($("#startAction").hasClass("actionEnabled")) {
		start();
	}
}

function start() {
	$("#state").html("Ночь в городе. Раздайте карты и разбудите дона и его мафию.<br>\
		У мафии есть <span class='actionEnabled' onclick='startTimer(60)'>минута на договорку</span>.<br>\
		Затем дайте <span class='actionEnabled' onclick='startTimer(30)'>30 секунд коммисару</span>, чтобы осмотреть город.<br>\
		Указав роли игроков, объявите <span class='actionDisabled'>утро в городе</span>.");
}

var timer;

function setupTimer() {
    $('#clock').countdown({
      image: 'img/digits.png',
      startTime: '00:00',
      format: 'mm:ss'
    });
	// timer = $('#timer').FlipClock(0, {
	// 	autoStart: false,
 //        clockFace: 'MinuteCounter',
 //        countdown: true
 //    });
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
	// timer.setTime(seconds);
	// timer.start();
}

function makeEditable(num, def) {
	$("#valName" + num).html("Игрок №" + num);
	$("#inputName" + num).typeahead({
		name: "player" + num,
		local: getPlayerNames()
	});

	var valName   = "#valName"   + num;
	var varName   = "#varName"   + num;
	var inputName = "#inputName" + num;
	$(valName).click(function() {
	    $(valName).css('display', 'none');
	    $(varName).css('display', '');
	    $(inputName).val($(valName).text()).focus().select();
	});

	var hide = function() {
	    $(varName).css('display', 'none');
	    $(valName).css('display', '');
	}

	var apply = function() {
		hide();
		var name = $(inputName).val();
		if (name.length > 0) {
			$(valName).text(name);
			var player = getPlayer(name);
			if (player == null) {
				player = {"id": -1, "name": name, "pic": "img/unknown.png"};
			}
			sitPlayer(num, player);
			$("#pic" + num).css("background-image", "url('" + player.pic + "')");
		}
	};

	$(inputName).blur(apply);
	$(inputName).keypress(function( event ) {
	  if (event.which == 13) apply();
	  else if (event.which == 27) hide();
	});

	$(inputName).bind('typeahead:selected', apply);
	$(inputName).bind('typeahead:escKeyed', hide);
}