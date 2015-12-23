var ot = ot || {};

ot.progress = (function() {

  function message(msg) {
    $('.js-progress').text(msg);
  }

  return {
    message: message
  }

});