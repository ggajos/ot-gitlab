var ot = ot || {};

ot.storage = (function() {
  var STORAGE_VERSION = 8;

  function set(key, value) {
    localStorage.setItem(key, LZString.compress(JSON.stringify(value)));
  }

  function get(key) {
    var data = localStorage.getItem(key);
    if(data) {
      return JSON.parse(LZString.decompress(data));
    }
  }

  function size(key) {
    var data = localStorage.getItem(key);
    if(data) {
      return (data.length/1024/1024).toFixed(2) + " MB"
    } else {
      return "not found"
    }
  }

  function init() {
    if (localStorage.getItem("version") != STORAGE_VERSION) {
      localStorage.clear();
      localStorage.setItem("version", STORAGE_VERSION);
    }
  }
  init();

  return {
    get: get,
    set: set,
    size: size
  }
});