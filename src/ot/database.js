var ot = ot || {};

ot.database = (function() {
  var progress = ot.progress();
  var storage = ot.storage();
  var data = null;
  var api = null;

  function projects() {
    return data.projects;
  }

  function issues() {
    $.each(data.issues, function(index, it) {
      if(it.state == 'closed') {
        it.isClosed = true
      }
      if(it.state == 'opened') {
        it.isOpened = true
      }
      it.lastUpdatedMoment = moment(it.updated_at).startOf('hour').fromNow();
      it.lastUpdatedInDays = moment(new Date()).diff(moment(it.updated_at), 'days')
    });
    return data.issues;
  }

  function issuesByProjectId(projectId) {
    return $.grep(issues(), function(issue) {
        return issue.project_id == projectId;
      });
  }

  function issuesByProjectIdAndUpdatedSinceDays(projectId, days) {
    return $.grep(issuesByProjectId(projectId), function(issue) {
      return issue.lastUpdatedInDays <= days
    }).sort(function(a, b) {
      return ((a.lastUpdatedInDays < b.lastUpdatedInDays) ? -1 : ((a.lastUpdatedInDays > b.lastUpdatedInDays) ? 1 : 0))
    });
  }

  function newsletter(days) {
    var arr = [];
    $.each(projects(), function(index, project) {
      var entry = {
        project: project,
        issues: issuesByProjectIdAndUpdatedSinceDays(project.id, days)
      };
      if(entry.issues.length > 0) {
        arr.push(entry)
      }
    });
    $.each(arr, function(index, item) {
      item.issues.sort(function(a, b) {
        if(a.state == b.state) {
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        } else if(a.state == 'closed') {
          return -1;
        } else {
          return 1;
        }
      });
    });
    return arr;
  }

  function loaded() {
    return data != null;
  }

  function synchronize(key, callback) {
    storage.set("key", key);
    api = ot.gitlab(key);
    progress.message("Started reloading data");
    api.projects().done(function(projects) {
      api.issues().done(function(issues) {
        data = {
          projects: projects,
          issues: issues
        };
        storage.set("data", data);
        progress.message("Database synchronized, " + storage.size('data'));
        if(callback) {
          callback();
        }
      });
    });
  }

  function init() {
    data = storage.get("data");
    if(data) {
      progress.message("Database loaded from cache, " + storage.size('data'));
    }
  }
  init();

  return {
    projects: projects,
    issues: issues,
    synchronize: synchronize,
    loaded: loaded,
    issuesByProjectId: issuesByProjectId,
    issuesByProjectIdAndUpdatedSinceDays: issuesByProjectIdAndUpdatedSinceDays,
    newsletter: newsletter
  }
});