var view = view || {};

view.homepage = (function() {
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
view.homepage();