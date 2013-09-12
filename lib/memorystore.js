function MemoryStore() {
  this._content = {};
}

MemoryStore.prototype.contains = function(key, true_callback, false_callback) {
  if (this._content.hasOwnProperty(key)) {
    if (typeof true_callback === "function") {
      true_callback();
    }
  }
  else if (typeof false_callback === "function") {
    false_callback();
  }
};

MemoryStore.prototype.get = function(key, success_callback, notfound_callback, error_callback) {
  if (this._content.hasOwnProperty(key)) {
    success_callback(this._content[key]);
  }
  else if (typeof notfound_callback === "function") {
    notfound_callback();
  }
};

MemoryStore.prototype.set = function(key, value, success_callback, error_callback) {
  this._content[key] = value;
  if(typeof success_callback === "function")
    success_callback(value);
};

MemoryStore.prototype.remove = function(key, success_callback, error_callback) {
  if (delete this._content[key]) {
    if (typeof success_callback === "function") {
      success_callback();
    }
  }
  else if (typeof error_callback === "function") {
    error_callback();
  }
};

module.exports = MemoryStore;