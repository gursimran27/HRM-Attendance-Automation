const { performHRMAction } = require('./hrmController');

async function handleCheckout() {
    return performHRMAction('checkout');
}

module.exports = { handleCheckout };
