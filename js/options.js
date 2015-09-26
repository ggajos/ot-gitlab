var ot = ot || {};

function exportTableToCSV($table) {
    var filename = "export.csv";
    var $rows = $table.find('tr:has(td)'),

    // Temporary delimiter characters unlikely to be typed by keyboard
    // This is to avoid accidentally splitting the actual contents
        tmpColDelim = String.fromCharCode(11), // vertical tab character
        tmpRowDelim = String.fromCharCode(0), // null character

    // actual delimiter characters for CSV format
        colDelim = '","',
        rowDelim = '"\r\n"',

    // Grab text from table into CSV formatted string
        csv = '"' + $rows.map(function (i, row) {
                var $row = $(row),
                    $cols = $row.find('td');

                return $cols.map(function (j, col) {
                    var $col = $(col),
                        text = $col.text();

                    return text.replace('"', '""'); // escape double quotes

                }).get().join(tmpColDelim);

            }).get().join(tmpRowDelim)
                .split(tmpRowDelim).join(rowDelim)
                .split(tmpColDelim).join(colDelim) + '"',

    // Data URI
        csvData = 'data:application/csv;charset=utf-8,' + encodeURIComponent(csv);

    var link = document.createElement("a");
    link.setAttribute("href", csvData);
    link.setAttribute("download", "analysis.csv");
    link.click();
}

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
                $('#header').text(["collecting data [", path, "], (", args.page, ")"].join(''));
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
        return ot.rest(token).get('projects');
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

$('input[name=key]').val(localStorage.getItem("key"));

$('#load').click(function () {
    $('#load').hide();
    var key = $('input[name=key]').val();
    localStorage.setItem("key", key);
    var api = ot.gitlab(key);
    api.issues().done(function (data) {
        new Ractive({
            el: 'target',
            template: '#tpl-main',
            data: {issues: data}
        });
        $('#main-table').DataTable({
            dom: 'T<"clear">lfrtip',
            bPaginate: false
        });
        $('#header').text("Loaded")
        console.log(data)
    });
});

$('#csv').click(function () {
    exportTableToCSV($('#main-table'))
});