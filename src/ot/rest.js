var ot = ot || {};

ot.rest = (function (token) {
  var deffered = $.Deferred();
  var result = [];

  function all(path, args) {
    if (!args) {
      args = {};
    }
    if (!args.page) {
      args.page = 1;
    }
    get(path, args).done(function (data) {
      if (data.length > 0) {
        result = $.merge(result, data);
        args.page += 1;
        all(path, args);
        ot.progress().message(["collecting data [", path, "], (", args.page, ")"].join(''))
      } else {
        deffered.resolve(result);
      }
    });
    return deffered;
  }

  function get(path, args) {
    return $.get(
      ['https://gitlab.com/api/v3/' + path].join(),
      $.extend({}, {private_token: token}, args)
    );
  }

  return {
    get: get,
    all: all
  }
});