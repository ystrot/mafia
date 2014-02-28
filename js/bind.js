
function Var(val) {
	this.val = val;
	this.listeners = [];
	var that = this;
	this.on = function(f) {
		that.listeners.push(f);
	}
	this.off = function() {
		that.listeners = [];
	}
	this.get = function() {
		return that.val;
	}
	this.set = function(newVal) {
		var oldVal = that.val;
		that.val = newVal;
		for (var i = 0; i < that.listeners.length; i++) {
			var f = that.listeners[i];
			f(newVal, oldVal);
		};
	}
}