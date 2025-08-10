module.exports = async function (context, req) {
    context.log('HTTP trigger function received a request.');

    // Enable CORS for browser clients
    context.res = context.res || {};
    context.res.headers = context.res.headers || {};
    context.res.headers['Access-Control-Allow-Origin'] = 'https://mbconsult.io'; // set to your prod domain
    context.res.headers['Access-Control-Allow-Methods'] = 'POST, OPTIONS';
    context.res.headers['Access-Control-Allow-Headers'] = 'Content-Type, Accept';

    // Handle OPTIONS preflight
    if (req.method === 'OPTIONS') {
        context.res.status = 204;
        context.done();
        return;
    }

    // Parse and validate incoming data
    const { name, email, message, company } = req.body || {};
    if (company) {
        // Honeypot spam trap: silent success
        context.res = {
            status: 200,
            body: { success: true }
        };
        return;
    }
    const errors = [];
    if (!name || typeof name !== 'string' || !name.trim()) errors.push('Name is required.');
    if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('Valid email is required.');
    if (!message || typeof message !== 'string' || !message.trim()) errors.push('Message is required.');

    if (errors.length) {
        context.res = {
            status: 400,
            body: { success: false, errors }
        };
        return;
    }

    // TODO: Implement email sending (via SMTP, SendGrid, or relay to Power Automate)
    // For now, just simulate success:
    context.res = {
        status: 200,
        body: { success: true, message: "Your message has been received." }
    };
};
