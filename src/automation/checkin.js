const { performHRMAction } = require('./hrmController');

async function handleCheckin() {
    return performHRMAction('checkin');
}

module.exports = { handleCheckin };
