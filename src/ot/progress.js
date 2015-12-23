var ot = ot || {};

ot.progress = (function() {

  function message(msg) {
    console.log(msg);
    $('.js-progress').text(msg);
  }

  return {
    message: message
  }

});