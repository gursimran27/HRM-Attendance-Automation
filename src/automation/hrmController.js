const { chromium } = require('playwright');
require('dotenv').config();

async function performHRMAction(action) {
    const loginUrl = process.env.HRM_LOGIN_URL;
    const email = process.env.HRM_EMAIL;
    const password = process.env.HRM_PASSWORD;

    if (!loginUrl || !email || !password) {
        throw new Error("Missing HRM credentials in environment variables.");
    }

    const browser = await chromium.launch({ headless: true });
    // Use an average desktop viewport
    const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
    const page = await context.newPage();

    try {
        await page.goto(loginUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });

        // Fill Login Form
        await page.fill('input#username', email);
        await page.fill('input#password', password);
        
        // Click Login and wait for Navigation
        // Some sites use AJAX login instead of full navigation. 
        // We will wait for the attendance button to appear to confirm successful login.
        await Promise.all([
            page.waitForURL('**/*', { timeout: 15000 }).catch(() => {}), // optionally wait for navigation
            page.click('button[type="submit"]')
        ]);

        await page.waitForTimeout(2000);

        // Wait for the attendance button to appear (this means login was successful)
        // Using a simpler, robust selector based on the div ID wrapper
        const buttonSelector = '#attendance-activity-container button';
        
        try {
            await page.waitForSelector(buttonSelector, { state: 'attached', timeout: 30000 });
        } catch (e) {
            // Check if there was an invalid password alert
            const alertLocator = page.locator('.oh-alert--danger');
            if (await alertLocator.count() > 0) {
               const errorMsg = await alertLocator.first().textContent();
               throw new Error(`Login failed: ${errorMsg.trim()}`);
            }
            throw new Error("Login timed out. Attendance button not found. Check credentials or site structure.");
        }

        // Now find out its current state
        // We use a case-insensitive attribute selector [class*="..." i] because the HRM portal 
        // inconsistently capitalizes "hr-check-in-out-text" vs "hr-Check-In-out-text" over time!
        const stateTextLocator = page.locator(`${buttonSelector} span[class*="check-in-out-text" i]`);
        const stateTextCount = await stateTextLocator.count();
        let currentState = "unknown";
        if (stateTextCount > 0) {
            const rawText = await stateTextLocator.first().textContent();
            currentState = rawText ? rawText.trim().toLowerCase() : ''; // "check-in" or "check-out"
        }

        // Depending on action requested, decide if we should click
        if (action === 'checkin') {
            if (currentState.includes('out')) {
                throw new Error("You are already checked in! The button currently says 'Check-Out'.");
            }
        } else if (action === 'checkout') {
             if (currentState.includes('in')) {
                throw new Error("You are already checked out! The button currently says 'Check-In'.");
            }
        } else if( action == 'status'){
            if (currentState.includes('out')) {
                return `Current status is: 'Check-In' as button says for (${currentState}).`;
            }else if(currentState.includes('in')){
                return `Current status is: 'Check-Out' as button says for (${currentState}).`;
            }
        }

        // We will retry clicking up to 10 times.
        // We consider it a success ONLY if the button text physically changes.
        let isSuccess = false;
        for (let attempts = 1; attempts <= 10; attempts++) {
            // Perform the click! 
            await page.click(buttonSelector);
            
            // Wait 2 seconds for the HTMX HTML swap to update the text
            await page.waitForTimeout(7000);

            // Fetch the deeply nested text span to see if it changed
            const newTextCount = await stateTextLocator.count();
            let newState = "unknown";
            if (newTextCount > 0) {
                const rawText = await stateTextLocator.first().textContent();
                newState = rawText ? rawText.trim().toLowerCase() : '';
            }

            // Check if the DOM updated correctly
            let domSuccess = false;
            if (action === 'checkin' && newState.includes('out')) {
                domSuccess = true;
            } else if (action === 'checkout' && newState.includes('in')) {
                domSuccess = true;
            }
            
            if (domSuccess) {
                isSuccess = true;
                break; // Break the loop, it was successful!
            } else {
                console.warn(`Click attempt ${attempts} did not change DOM text. Retrying...`);
                await page.waitForTimeout(1000); // Brief wait before next click
            }
        }

        if (!isSuccess) {
            throw new Error("The button was clicked but the HRM server never responded. The Check-In/Out may not have been logged.");
        }

        // Give it a brief moment to settle the UI swap before closing
        await page.waitForTimeout(2000);

        return true;
    } finally {
        await browser.close();
    }
}

module.exports = { performHRMAction };
