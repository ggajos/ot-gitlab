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
    // Setup - add a text input to each footer cell
    $('#main-table thead th').each(function () {
      var title = $(this).text();
      $(this).html('<input type="text" placeholder="Search ' + title + '" />');
    });
    var table = $('#main-table').DataTable({
      dom: 'T<"clear">lfrtip',
      bPaginate: false,
      order: [[ 6, "desc" ]]
    });
    // Apply the search
    table.columns().every(function () {
      var that = this;
      $('input', this.header()).on('keyup change', function () {
        if (that.search() !== this.value) {
          that
            .search(this.value)
            .draw();
        }
      });
    });
  }

  function refreshNewsletter(entries) {
    $('#newsletter-target').html('');
    progress.message("Newsletter loaded");
    $.each(entries, function(i, entry) {
      $.each(entry.issues, function(i, issue) {
        issue.description = issue.description.substring(0,150) + " ...";
      });
    });
    new Ractive({
      el: 'newsletter-target',
      template: '#tpl-newsletter',
      data: {entries: entries}
    });
  }

  function loadDataFromCache() {
    if(db.loaded()) {
      refreshTable(db.issues());
      refreshNewsletter(db.newsletter(7));
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