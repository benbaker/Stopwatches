//function $(selector){return document.querySelectorAll(selector);}
/*
HTMLElement.prototype.append = function(){
	for(var n in arguments){
		if(typeof(arguments[n]) == 'string') arguments[n] = document.createElement(arguments[n]);
		this.appendChild(arguments[n]);
	}
	return arguments.length == 1? arguments[0] : arguments;
};
*/

var keymap = {"8":"backspace","9":"tab","13":"enter","16":"shift","17":"ctrl","18":"alt","19":"pause_break","20":"caps_lock","27":"escape","32": "space","33":"page_up","34":"page down","35":"end","36":"home","37":"LEFT","38":"UP","39":"RIGHT","40":"DOWN","45":"insert","46":"delete","48":"0","49":"1","50":"2","51":"3","52":"4","53":"5","54":"6","55":"7","56":"8","57":"9","65":"a","66":"b","67":"c","68":"d","69":"e","70":"f","71":"g","72":"h","73":"i","74":"j","75":"k","76":"l","77":"m","78":"n","79":"o","80":"p","81":"q","82":"r","83":"s","84":"t","85":"u","86":"v","87":"w","88":"x","89":"y","90":"z","91":"left_window key","92":"right_window key","93":"select_key","96":"numpad 0","97":"numpad 1","98":"numpad 2","99":"numpad 3","100":"numpad 4","101":"numpad 5","102":"numpad 6","103":"numpad 7","104":"numpad 8","105":"numpad 9","106":"multiply","107":"add","109":"subtract","110":"decimal point","111":"divide","112":"f1","113":"f2","114":"f3","115":"f4","116":"f5","117":"f6","118":"f7","119":"f8","120":"f9","121":"f10","122":"f11","123":"f12","144":"num_lock","145":"scroll_lock","186":";","187":"=","188":",","189":"-","190":".","191":"/","192":"`","219":"{","220":"\\","221":"}","222":"'"};

function setup_key_events(){
	document.onkeydown = function(event) {
		event.preventDefault();
		event = event || window.event;
		for(var n in stopwatches){
			stopwatches[n].handler(event);
		}
	};
}

function stop_key_events(){
	document.onkeydown = function(event){
	};
}

function StopWatch(elem, options) {
	var me = this;
	// default options
	options = options || {};
	options.delay = options.delay || 10;

	// keymapping
	var keydown_function_map = {
		'space'	:	toggle,
		'shift'	:	lap,
		'tab'	:	reset,
	};

	function handler(event){
		if (selected.id != "selected") return;
		var _key = keymap[event.which];
		if(event.type == 'keydown' && _key in keydown_function_map){
			keydown_function_map[_key]();
		}
		else if(event.type == 'keyup' && _key in keyup_function_map){
			keyup_function_map[_key]();
		}
	}

	var style = {
			stopwatch: "panel panel-default",
			title: "panel-heading",
			button: {
				//"toggle"	: "btn-success ",
				"start"		: "btn-default ",
			},
			timer: "",
			total: "",
			panel: "btn-group"
	};

	var stopwatch		= $("<div/>").addClass(style.stopwatch),
		body			= $("<div/>").addClass("panel-body"),
		timer			= createTimer(),
		panel			= $("<div/>").addClass(style.panel || ""),
		toggleButton	= createToggle("toggle", toggle),
		startButton		= createButton("start", start),
		stopButton		= createButton("stop", stop),
		resetButton		= createButton("reset", reset),
		lapButton		= createButton("lap", lap),
		total_time		= 0,
		total			= $("<div/>").addClass("timer").text(formatTime(total_time)),
		title			= createTitle(),
		selected		= createSelected(),
		lap,
		offset,
		clock,
		interval;

	// private functions

	function createTimer() {
		var timer = $("<div/>");
		return timer;
	}
	
	function createPanel(){
		var panel = $("<div/>");
		panel.addClass(style.panel || "");
		return panel;
	}

	function createButton(action, actionfunc){
		var btn = $("<button/>");
		btn.addClass("btn " + action + " " + (style.button[action] || "btn-default"));
		btn.text(action);
		btn.click(function(event) {
			actionfunc();
		});
		return btn;
	}

	function createToggle(action, actionfunc){
		var btn = $("<button/>");
		btn.addClass("btn " + action + " " + (style.button[action] || "btn-default"));
		btn.append($('<span/>').attr('id', 'glyph').addClass('glyphicon glyphicon-play'));
		btn.click(function(event) {
			actionfunc();
		});
		return btn;
	}

	function createTotal(){
		total = $("<div/>");
		total.addClass("timer");
		total.text(formatTime(total_time));
		return total;
	}

	function createLap(t){
		var lap = timer.clone();
		lap.textContent = formatTime(t);
		lap.attr("time", t);
		lap.click(function(){
			total_time -= lap.attr("time");
			render();
			this.remove();
		});
		timer.after(lap);
		return lap;
	}

	function createTitle(string){
		string = string || "Stopwatch";

		var title_div = $('<div/>');
		title_div.addClass(style.title);
		title_div.click(function(event){
			editTitle(title);
			event.stopPropagation();
		});

		var title = $('<h3/>');
		title.addClass("panel-title").text(string).addClass("panel-title");
		return title_div.append(title);
	}

	function createSelected(){
		var selected = document.createElement("span");
		selected.className = "selected";
		selected.id = "selected";
		selected.title = "Click to change keyboard response\nGreen: on\nRed: off";
		selected.addEventListener("click",function(event){
			select();
		});
		return selected;
	}

	function editTitle(title){
		var editable = $("<input/>");
		title = $(title);
		title.replaceWith(editable);
		editable.val(title.text());

		editable.focus();
		editable.select();
		stop_key_events();

		editable.focusout(function(){
			if(editable.val().trim())
				title.text(editable.val().trim());
			editable.replaceWith(title);
			editable.remove();
			setup_key_events();
		});
	}

	function start(){
		if(interval) return;
		offset		= Date.now();
		interval	= setInterval(update, options.delay);
	}
	
	function stop(){
		if(interval){
		clearInterval(interval);
		interval = null;
		}
	}

	function toggle(){
		toggleButton.children('#glyph').toggleClass('glyphicon-play').toggleClass('glyphicon-pause');
		if(interval){
			stop();
		}
		else{
			start();
		}
	}
	
	function lap(){
		if( clock === 0) return;
		var t = clock;
		total_time += clock;
		createLap(t);
		reset();
	}
	
	function reset() {
		clock = 0;
		render();
	}
	
	function update() {
		clock += delta();
		render();
	}

	function formatTime(t){
		var	mil = ~~(t/10)%100,
			sec = ~~(t/1000)%60,
			min = ~~(t/60000)%60,
			hrs = ~~(t/3600000);
		if(mil<10) mil = '0'+mil;
		if(sec<10) sec = '0'+sec;
		if(min<10) min = '0'+min;
		if(hrs<10) hrs = '0'+hrs;
		return hrs+":"+min+":"+sec+"."+mil;
	}
	
	function render(){
		timer.text(formatTime(clock));
		total.text(formatTime(total_time+clock));
	}

	function select(){
		if(selected.id == "selected")
		selected.id = "";
		else selected.id = "selected";
	}

	function delta(){
		var now = Date.now(),
			d	= now - offset;
		offset	= now;
		return d;
	}

	selected.click();
	// append elements 
	elem.append(stopwatch);
	stopwatch.append(title, body);
	body.append(total, panel, timer);
	panel.append(toggleButton, resetButton, lapButton);
  
	// initialize
	reset();

	// public API
	this.handler	= handler;

	setup_key_events();
	select();

}

	var sw_c = $('#sw-container');
	sw_c.addClass('container');
	var holder = $('<div/>').addClass('center');
	sw_c.append(holder);

	var stopwatches = [];
	stopwatches.push(new StopWatch(holder));
	stopwatches.push(new StopWatch(holder));
	//stopwatches.push(new StopWatch(holder));