function setup() {
	handleEvents();
	bindAll();

	fillPlayers();
	fillNomination();
	setupTimer();

	seating();
	for(var i = 0; i < 10; i++) {
		setPlayer(i + 1, mafPlayers[i]);
	}

	casting();
	setRole(1, "com");
	setRole(2, "maf");
	setRole(3, "maf");
	setRole(4, "don");

	wakeup();
}

function handleEvents() {
	onMafEvent(function(e) {
		switch(e.type) {
		case "seating":
			$("#seating").show();
			$("#timer").show();
			break;
		case "casting":
			$("#seating").hide();
			$("#casting").show();
			break;
		case "role":
			updateRole(e.num);
			break;
		case "complot":
			startTimer(60);
			break;
		case "lookout":
			startTimer(30);
			break;
		case "day":
			$("#casting").hide();
			$("#day").show();
			break;
		case "speech":
			startTimer(60);
			break;
		default:
			break;
		}
		$("#log").prepend("<div>" + formatTime() + " " + JSON.stringify(e) + "</div>");
	});
}

function bindAll() {
	bindLink(mafSeatingReady, "#mafSeatingReady");
	bindLink(mafCastingReady, "#mafCastingReady");
	bindLink(mafComplotReady, "#mafComplotReady");
	bindLink(mafLookoutReady, "#mafLookoutReady");
	bindVal(day, ".day");
	bindVal(speaker, ".speaker");
	bindDisplay(speaker, "#nomination");
	bindVal(nextSpeaker, ".nextSpeaker");
	bindDisplay(nextSpeaker, "#nextSpeakerTime");
	bindNominees();
	bindDisplay(nextSpeaker.convert(function(val) { return val == null ? true : null; }), "#toVoting");
	bindVotingTable();
	bindDisplay(debaters, "#debate");
	bindVal(debaters, ".debaters");
	bindDisplay(leavers, "#leave");
	bindVal(leavers, ".leavers");
}

// PLAYERS

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
		var card = $("#player0").clone().show().css("top", 40 * i + "px");
		card.attr("id", "player" + num);
		card.find("#num0").html(num);
		card.find("#nomNum0").html(num);
		card.find("#role0, #mask0").click(selectRole);
		card.find("*").attr("id", function(i, val) {
			return val.replace(/0/g, num);
		});
		$("#players").append(card);

		makeEditable(num);
		bindVal(player(num).nominee, "#nomNum" + num);
		bindDisplay(player(num).nominee, "#nomPic" + num);
		//, function(val) { return val == null ? "X" : val; } 
	}
}

function makeEditable(num) {
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
	if ($("#showRolesButton").is(":checked")) {
		$(".mask").hide();
		$(".role").show();
	} else {
		$(".mask").show();
		$(".role").hide();
	}
}

function updateRole(num) {
	var role = getRole(num);
	var image = (role == null || role == "civ") ? "none" : role;
	$("#role" + num).css("background-image", "url('img/" + image + ".png')");
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

// NOMINATION

function fillNomination() {
	var nums = $("#nominationNums");
	var setNominee = function(val) {
		return function() {
			if (!$("#nominee" + val).hasClass("nomineeDisabled")) {
				player(speaker.get()).nominee.set(val);
			}
		};
	};
	$("<span id='nomineeX' class='nominee nomineeNo'>X</span>").click(setNominee(null)).appendTo(nums);
	for (var i = 1; i <= 10; i++) {
		$("<span id='nominee" + i + "' class='nominee'>" + i + "</span>").click(setNominee(i)).appendTo(nums);
	}
	var nominee = function(val) {
		var app = val == null ? "X" : val.toString();
		return $("#nominee" + app);
	};
	var onNomineeChange = function(newVal, oldVal) {
		nominee(oldVal).removeClass("nomineeActive");
		nominee(newVal).addClass("nomineeActive");
	};
	speaker.on(function(newVal, oldVal) {
		if (oldVal != null) player(oldVal).nominee.off(onNomineeChange);
		if (newVal != null) {
			player(newVal).nominee.on(onNomineeChange);
			onNomineeChange(player(newVal).nominee.get(), oldVal == null ? null : player(oldVal).nominee.get());
		}
	});
}

function bindNominees() {
	var f = function(val) {
		if (val.length == 0) {
			$("#voteNobody").show();
			$("#voteList").hide();
		} else {
			$("#voteNobody").hide();
			$("#voteList").show();
			$(".nominees").text(val);
		}
		for (var i = 1; i <= 10; i++) {
			var nominee = $("#nominee" + i);
			if (val.indexOf(i) < 0 && !isDead(i)) {
				nominee.removeClass("nomineeDisabled");
			} else {
				nominee.addClass("nomineeDisabled");
				if (nominee.hasClass("nomineeActive")) {
					nominee.removeClass("nomineeActive");
					nominee.addClass("nomineeActive");
				}
			}
		}
	};
	nominees.on(f);
	f(nominees.get());
}

// VOTING

function bindVotingTable() {
	var f = function(val) {
		var list = nominees.get();
		if (val.length <= 1 || list.length != val.length) {
			$("#voting").empty().hide();
			return;
		}
		var applyVotes = function(num, count) {
			return function() { setVotes(num, count); };
		};

		var container = $("#voting").empty().show();
		var disableRaw = false;
		var playerCount = getPlayerCount();
		for (var i = 0; i < list.length; i++) {
			var nominee = list[i];
			var votes = val[i];
			var raw = $("<div class='votingRaw'></div>").appendTo(container);
			raw.append($("<span class='votingNominee'>" + nominee + ":</span>"));
			for (var j = 0; j <= 10; j++) {
				var votingCount = $("<span class='votingCount'>" + j + "</span>").click(applyVotes(i, j));
				if (disableRaw || playerCount < j) {
					votingCount.addClass("votingCountDisabled");
				} else if (j == votes) {
					votingCount.addClass("votingCountActive");
				}
				raw.append(votingCount);
			}
			if (votes < 0) {
				disableRaw = true;
			} else {
				playerCount -= votes;
			}
		}
	};
	votingTable.on(f);
	f(votingTable.get());
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

function bindLink(variable, link) {
	var f = function(val) {
		$(link).attr("class", val ? "linkOn" : "linkOff");
	};
	variable.on(f);
	f(variable.get());
}

function bindVal(variable, link, converter) {
	var f = function(val) {
		$(link).text(converter ? converter(val) : val);
	};
	variable.on(f);
	f(variable.get());
}

function bindDisplay(variable, id) {
	var f = function(val) {
		if (val !== null) $(id).show();
		else $(id).hide();
	};
	variable.on(f);
	f(variable.get());
}

function formatTime() {
	var date = new Date();
	var result = "[";
	result += padLeft(date.getHours().toString(), 2, "0");
	result += ":";
	result += padLeft(date.getMinutes().toString(), 2, "0");
	result += ":";
	result += padLeft(date.getSeconds().toString(), 2, "0");
	result += "]";
	return result;
}

function padLeft(str, width, ch) {
	if (ch.length == 0) {
		throw "Illegal arguments";
	}
	while(str.length < width) {
		str = ch + str;
	}
	return str;
}