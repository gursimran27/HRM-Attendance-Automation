const { performHRMAction } = require('./hrmController');

async function handleStatus() {
    return performHRMAction('status');
}

module.exports = { handleStatus };
