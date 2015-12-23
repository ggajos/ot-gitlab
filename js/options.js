var ot = ot || {};

ot.table = (function($table) {

  function download() {
    var $rows = $table.find('tr:has(td)'),
      tmpColDelim = String.fromCharCode(11),
      tmpRowDelim = String.fromCharCode(0),
      colDelim = '","',
      rowDelim = '"\r\n"',
      csv = '"' + $rows.map(function (i, row) {
          var $row = $(row),
            $cols = $row.find('td');
          return $cols.map(function (j, col) {
            var $col = $(col),
              text = $col.text();
            return text.replace('"', '""');
          }).get().join(tmpColDelim);
        }).get().join(tmpRowDelim)
          .split(tmpRowDelim).join(rowDelim)
          .split(tmpColDelim).join(colDelim) + '"';
    var csvData = 'data:application/csv;charset=utf-8,' + encodeURIComponent(csv);
    var link = document.createElement("a");
    link.setAttribute("href", csvData);
    link.setAttribute("download", "gitlab.csv");
    link.click();
  }

  return {
    download: download
  }
});

ot.progress = (function() {

  function message(msg) {
    $('.js-progress').text(msg);
  }

  return {
    message: message
  }

});

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

ot.gitlab = (function (token) {

  function projects() {
    return ot.rest(token).all('projects');
  }

  function issues() {
    var deffered = $.Deferred();
    var results = [];
    projects().done(function (jsonProjects) {
      var defs = [];
      $.each(jsonProjects, function (i, jsonProject) {
        var def = issuesByProjectId(jsonProject.id);
        defs.push(def);
        def.done(function (issues) {
          $.each(issues, function (i, issue) {
            issue.project = jsonProject
          });
          results = $.merge(results, issues);
        });
      });
      $.when.apply($, defs).then(function () {
        deffered.resolve(results);
      });
    });
    return deffered;
  }

  function issuesByProjectId(projectId) {
    return ot.rest(token).all(['projects', projectId, 'issues'].join('/'), {});
  }

  return {
    projects: projects,
    issuesByProjectId: issuesByProjectId,
    issues: issues
  };
});

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

ot.ui = (function() {
  var storage = ot.storage();
  var progress = ot.progress();

  function refreshTable(data) {
    $('#main-table-target').html('');
    new Ractive({
      el: 'main-table-target',
      template: '#tpl-main-table',
      data: {issues: data}
    });
    $('#main-table').DataTable({
      dom: 'T<"clear">lfrtip',
      bPaginate: false
    });
  }

  function loadDataFromCache() {
    var data = storage.get("database");
    if(data) {
      progress.message("Data loaded, " + storage.size('database'));
      refreshTable(data);
    }
  }

  function loadApiKey() {
    $('input[name=key]').val(storage.get("key"));
  }

  function addLoadButtonHandler() {
    var $load = $('.js-btn-load');
    $load.click(function () {
      $load.hide();
      progress.message("Started reloading data");
      var key = $('input[name=key]').val();
      storage.set("key", key);
      ot.gitlab(key).issues().done(function(database) {
        storage.set("database", database);
        loadDataFromCache();
        $load.show();
      });
    });
  }


  function addCsvButtonHandler() {
    $('.js-btn-csv').click(function () {
      ot.table($('#main-table')).download();
    });
  }

  function init() {
    addCsvButtonHandler();
    addLoadButtonHandler();
    loadApiKey();
    loadDataFromCache();
  }

  init();
});
ot.ui();