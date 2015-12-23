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