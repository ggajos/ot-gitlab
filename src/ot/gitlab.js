var ot = ot || {};

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

  function latestNotesByProjectIdAndIssueId(projectId, issueId) {
    return ot.rest(token).get(['projects', projectId, 'issues', issueId, 'notes'].join('/'), {});
  }

  return {
    projects: projects,
    issuesByProjectId: issuesByProjectId,
    issues: issues,
    latestNotesByProjectIdAndIssueId: latestNotesByProjectIdAndIssueId
  };
});