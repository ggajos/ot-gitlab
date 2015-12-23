var view = view || {};

view.homepage = (function() {
  var storage = ot.storage();
  var progress = ot.progress();
  var db = ot.database();

  function refreshTable(issues) {
    $('#main-table-target').html('');
    progress.message("Table loaded");
    new Ractive({
      el: 'main-table-target',
      template: '#tpl-main-table',
      data: {issues: issues}
    });
    $('#main-table').DataTable({
      dom: 'T<"clear">lfrtip',
      bPaginate: false
    });
  }

  function loadDataFromCache() {
    if(db.loaded()) {
      refreshTable(db.issues());
      $('.js-btn-csv').show();
    }
  }

  function loadApiKey() {
    $('input[name=key]').val(storage.get("key"));
  }

  function addLoadButtonHandler() {
    var $load = $('.js-btn-load');
    $load.click(function () {
      $load.hide();
      db.synchronize($('input[name=key]').val(), function() {
        loadDataFromCache();
        $load.show();
      });
    });
  }


  function addCsvButtonHandler() {
    var $btn = $('.js-btn-csv');
    $btn.hide();
    $btn.click(function () {
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