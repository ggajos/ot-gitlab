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
    return data.issues;
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
        }
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
    loaded: loaded
  }
});