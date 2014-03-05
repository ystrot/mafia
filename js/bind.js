Array.prototype.remove = function(value) {
  var idx = this.indexOf(value);
  if (idx != -1) {
      return this.splice(idx, 1);
  }
  return false;
}

function Var(val) {
	this.val = val !== undefined ? val : null;
	this.listeners = [];
	var that = this;
	this.on = function(f) {
		that.listeners.push(f);
	}
	this.off = function(f) {
		if (f === undefined) {
			that.listeners = [];
		} else {
			that.listeners.remove(f);
		}
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