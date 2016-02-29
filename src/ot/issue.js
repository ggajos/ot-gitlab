var ot = ot || {};

ot.issue = (function (it) {

  function init(it) {
    it.isNew = isNew();
    it.isWip = isWip();
    it.isDeployed = isDeployed();
    it.isCancelled = isCancelled();
    if(it.isNew) it.status = 0;
    if(it.isWip) it.status = 1;
    if(it.isDeployed) it.status = 2;
    if(it.isCancelled) it.status = 3;
    it.lastUpdatedMoment = moment(it.updated_at).startOf('hour').fromNow();
    it.lastUpdatedInDays = moment(new Date()).diff(moment(it.updated_at), 'days')
  }

  function isAssigned() {
    return it.assignee;
  }

  function isClosed() {
    return it.state === 'closed'
  }

  function isNew() {
    return !isClosed() && !isAssigned();
  }

  function isWip() {
    return isAssigned() && !isClosed() || isClosed() && !isDeployed()
  }

  function isCancelled() {
    return !hasLabel('Deployed') && hasLabel('Cancelled');
  }

  function isDeployed() {
    return !isCancelled() && (hasLabel('Deployed') || hasLabel('Production'));
  }

  function hasLabel(label) {
    var success = false;
    $.each(it.labels, function (index, value) {
      if (label.toLowerCase() === value.toLowerCase()) {
        success = true;
      }
    });
    return success;
  }

  init(it);

  return {};
});