// Notification settings management
import { auth, db } from './firebase-config.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { doc, getDoc, setDoc, updateDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

let currentUser = null;
let notificationSettings = {
    sms: {
        enabled: true,
        phone: '',
        types: ['payment_reminder', 'appointment_reminder', 'payment_confirmation'],
        paymentTiming: 2,
        appointmentTiming: 24
    },
    email: {
        enabled: true,
        address: '',
        types: ['payment_reminder', 'appointment_reminder', 'payment_receipt'],
        paymentTiming: 24,
        appointmentTiming: 24
    },
    push: {
        enabled: false,
        permission: 'default'
    }
};

document.addEventListener('DOMContentLoaded', function() {
    initAuth();
    initToggleSwitches();
    initFormHandlers();
    initTestButtons();
    initSaveButton();
    initPushNotifications();
});

function initAuth() {
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            currentUser = user;
            await loadNotificationSettings();
            populateForm();
        } else {
            window.location.href = 'login.html';
        }
    });
}

async function loadNotificationSettings() {
    if (!currentUser) return;
    
    try {
        const settingsDoc = await getDoc(doc(db, 'notificationSettings', currentUser.uid));
        
        if (settingsDoc.exists()) {
            const data = settingsDoc.data();
            notificationSettings = { ...notificationSettings, ...data };
        }
        
        // Load user profile for default values
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
            const userData = userDoc.data();
            if (!notificationSettings.sms.phone && userData.phone) {
                notificationSettings.sms.phone = userData.phone;
            }
            if (!notificationSettings.email.address && userData.email) {
                notificationSettings.email.address = userData.email;
            }
        }
        
    } catch (error) {
        console.error('Error loading notification settings:', error);
    }
}

function populateForm() {
    // SMS Settings
    document.getElementById('smsEnabled').checked = notificationSettings.sms.enabled;
    document.getElementById('smsPhone').value = notificationSettings.sms.phone;
    document.getElementById('smsPaymentTiming').value = notificationSettings.sms.paymentTiming;
    document.getElementById('smsAppointmentTiming').value = notificationSettings.sms.appointmentTiming;
    
    // SMS Types
    document.querySelectorAll('input[name="smsTypes"]').forEach(checkbox => {
        checkbox.checked = notificationSettings.sms.types.includes(checkbox.value);
    });
    
    // Email Settings
    document.getElementById('emailEnabled').checked = notificationSettings.email.enabled;
    document.getElementById('emailAddress').value = notificationSettings.email.address;
    document.getElementById('emailPaymentTiming').value = notificationSettings.email.paymentTiming;
    document.getElementById('emailAppointmentTiming').value = notificationSettings.email.appointmentTiming;
    
    // Email Types
    document.querySelectorAll('input[name="emailTypes"]').forEach(checkbox => {
        checkbox.checked = notificationSettings.email.types.includes(checkbox.value);
    });
    
    // Push Settings
    document.getElementById('pushEnabled').checked = notificationSettings.push.enabled;
    
    // Update visibility
    updateSettingsVisibility();
}

function initToggleSwitches() {
    const smsToggle = document.getElementById('smsEnabled');
    const emailToggle = document.getElementById('emailEnabled');
    const pushToggle = document.getElementById('pushEnabled');
    
    smsToggle.addEventListener('change', function() {
        notificationSettings.sms.enabled = this.checked;
        updateSettingsVisibility();
    });
    
    emailToggle.addEventListener('change', function() {
        notificationSettings.email.enabled = this.checked;
        updateSettingsVisibility();
    });
    
    pushToggle.addEventListener('change', function() {
        notificationSettings.push.enabled = this.checked;
        updateSettingsVisibility();
    });
}

function updateSettingsVisibility() {
    const smsSettings = document.getElementById('smsSettings');
    const emailSettings = document.getElementById('emailSettings');
    const pushSettings = document.getElementById('pushSettings');
    
    smsSettings.style.display = notificationSettings.sms.enabled ? 'block' : 'none';
    emailSettings.style.display = notificationSettings.email.enabled ? 'block' : 'none';
    pushSettings.style.display = notificationSettings.push.enabled ? 'block' : 'none';
}

function initFormHandlers() {
    // Phone number formatting
    const phoneInput = document.getElementById('smsPhone');
    phoneInput.addEventListener('input', function() {
        let value = this.value.replace(/\D/g, '');
        if (value.length > 9) value = value.substring(0, 9);
        
        // Format as XXX XXX XXX
        if (value.length >= 6) {
            value = value.substring(0, 3) + ' ' + value.substring(3, 6) + ' ' + value.substring(6);
        } else if (value.length >= 3) {
            value = value.substring(0, 3) + ' ' + value.substring(3);
        }
        
        this.value = value;
        notificationSettings.sms.phone = value.replace(/\s/g, '');
    });
    
    // Email validation
    const emailInput = document.getElementById('emailAddress');
    emailInput.addEventListener('input', function() {
        notificationSettings.email.address = this.value;
        
        if (this.value && !isValidEmail(this.value)) {
            this.style.borderColor = '#dc3545';
        } else {
            this.style.borderColor = '#e9ecef';
        }
    });
    
    // Timing selects
    document.getElementById('smsPaymentTiming').addEventListener('change', function() {
        notificationSettings.sms.paymentTiming = parseInt(this.value);
    });
    
    document.getElementById('smsAppointmentTiming').addEventListener('change', function() {
        notificationSettings.sms.appointmentTiming = parseInt(this.value);
    });
    
    document.getElementById('emailPaymentTiming').addEventListener('change', function() {
        notificationSettings.email.paymentTiming = parseInt(this.value);
    });
    
    document.getElementById('emailAppointmentTiming').addEventListener('change', function() {
        notificationSettings.email.appointmentTiming = parseInt(this.value);
    });
    
    // Type checkboxes
    document.querySelectorAll('input[name="smsTypes"]').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            if (this.checked) {
                if (!notificationSettings.sms.types.includes(this.value)) {
                    notificationSettings.sms.types.push(this.value);
                }
            } else {
                notificationSettings.sms.types = notificationSettings.sms.types.filter(type => type !== this.value);
            }
        });
    });
    
    document.querySelectorAll('input[name="emailTypes"]').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            if (this.checked) {
                if (!notificationSettings.email.types.includes(this.value)) {
                    notificationSettings.email.types.push(this.value);
                }
            } else {
                notificationSettings.email.types = notificationSettings.email.types.filter(type => type !== this.value);
            }
        });
    });
}

function initTestButtons() {
    document.getElementById('testSmsBtn').addEventListener('click', async function() {
        if (!notificationSettings.sms.enabled || !notificationSettings.sms.phone) {
            utils.showError('errorMessage', 'Please enable SMS notifications and enter a phone number first.');
            return;
        }
        
        this.disabled = true;
        this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        
        try {
            await sendTestSMS();
            utils.showSuccess('Test SMS sent successfully! Check your phone.');
        } catch (error) {
            utils.showError('errorMessage', 'Failed to send test SMS. Please try again.');
        } finally {
            this.disabled = false;
            this.innerHTML = '<i class="fas fa-sms"></i> Test SMS';
        }
    });
    
    document.getElementById('testEmailBtn').addEventListener('click', async function() {
        if (!notificationSettings.email.enabled || !notificationSettings.email.address) {
            utils.showError('errorMessage', 'Please enable email notifications and enter an email address first.');
            return;
        }
        
        if (!isValidEmail(notificationSettings.email.address)) {
            utils.showError('errorMessage', 'Please enter a valid email address.');
            return;
        }
        
        this.disabled = true;
        this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        
        try {
            await sendTestEmail();
            utils.showSuccess('Test email sent successfully! Check your inbox.');
        } catch (error) {
            utils.showError('errorMessage', 'Failed to send test email. Please try again.');
        } finally {
            this.disabled = false;
            this.innerHTML = '<i class="fas fa-envelope"></i> Test Email';
        }
    });
    
    document.getElementById('testPushBtn').addEventListener('click', async function() {
        if (!notificationSettings.push.enabled) {
            utils.showError('errorMessage', 'Please enable push notifications first.');
            return;
        }
        
        try {
            await sendTestPushNotification();
            utils.showSuccess('Test push notification sent!');
        } catch (error) {
            utils.showError('errorMessage', 'Failed to send test push notification. Please check your browser permissions.');
        }
    });
}

function initSaveButton() {
    document.getElementById('saveSettingsBtn').addEventListener('click', async function() {
        // Validate settings
        if (notificationSettings.sms.enabled && !notificationSettings.sms.phone) {
            utils.showError('errorMessage', 'Please enter a phone number for SMS notifications.');
            return;
        }
        
        if (notificationSettings.email.enabled && !notificationSettings.email.address) {
            utils.showError('errorMessage', 'Please enter an email address for email notifications.');
            return;
        }
        
        if (notificationSettings.email.enabled && !isValidEmail(notificationSettings.email.address)) {
            utils.showError('errorMessage', 'Please enter a valid email address.');
            return;
        }
        
        this.disabled = true;
        this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
        
        try {
            await saveNotificationSettings();
            showSuccessModal();
        } catch (error) {
            utils.showError('errorMessage', 'Failed to save settings. Please try again.');
        } finally {
            this.disabled = false;
            this.innerHTML = '<i class="fas fa-save"></i> Save Notification Settings';
        }
    });
}

function initPushNotifications() {
    const enablePushBtn = document.getElementById('enablePushBtn');
    
    // Check if push notifications are supported
    if (!('Notification' in window)) {
        enablePushBtn.innerHTML = '<i class="fas fa-times"></i> Not Supported';
        enablePushBtn.disabled = true;
        return;
    }
    
    // Update button based on current permission
    updatePushButton();
    
    enablePushBtn.addEventListener('click', async function() {
        try {
            const permission = await Notification.requestPermission();
            notificationSettings.push.permission = permission;
            
            if (permission === 'granted') {
                notificationSettings.push.enabled = true;
                document.getElementById('pushEnabled').checked = true;
                updateSettingsVisibility();
            }
            
            updatePushButton();
        } catch (error) {
            console.error('Error requesting notification permission:', error);
        }
    });
}

function updatePushButton() {
    const enablePushBtn = document.getElementById('enablePushBtn');
    const permission = Notification.permission;
    
    switch (permission) {
        case 'granted':
            enablePushBtn.innerHTML = '<i class="fas fa-check"></i> Enabled';
            enablePushBtn.disabled = true;
            enablePushBtn.style.background = '#28a745';
            break;
        case 'denied':
            enablePushBtn.innerHTML = '<i class="fas fa-times"></i> Blocked';
            enablePushBtn.disabled = true;
            enablePushBtn.style.background = '#dc3545';
            break;
        default:
            enablePushBtn.innerHTML = '<i class="fas fa-bell"></i> Enable Push Notifications';
            enablePushBtn.disabled = false;
    }
}

async function saveNotificationSettings() {
    if (!currentUser) return;
    
    try {
        await setDoc(doc(db, 'notificationSettings', currentUser.uid), notificationSettings);
        
        // Also update user profile with contact info
        await updateDoc(doc(db, 'users', currentUser.uid), {
            phone: notificationSettings.sms.phone,
            email: notificationSettings.email.address,
            updatedAt: new Date()
        });
        
    } catch (error) {
        throw error;
    }
}

async function sendTestSMS() {
    // Simulate SMS sending
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log(`Test SMS sent to +233${notificationSettings.sms.phone}`);
            resolve();
        }, 2000);
    });
}

async function sendTestEmail() {
    // Simulate email sending
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log(`Test email sent to ${notificationSettings.email.address}`);
            resolve();
        }, 2000);
    });
}

async function sendTestPushNotification() {
    if (Notification.permission === 'granted') {
        new Notification('GhanaHealth+ Test', {
            body: 'This is a test notification from GhanaHealth+',
            icon: '/favicon.ico',
            badge: '/favicon.ico'
        });
    } else {
        throw new Error('Push notifications not permitted');
    }
}

function showSuccessModal() {
    const modal = document.getElementById('successModal');
    modal.style.display = 'block';
    
    document.getElementById('closeSuccessModal').addEventListener('click', function() {
        modal.style.display = 'none';
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Export functions for use in other modules
window.notificationManager = {
    schedulePaymentReminder,
    scheduleAppointmentReminder,
    sendPaymentConfirmation,
    sendAppointmentConfirmation
};

// Notification scheduling functions
async function schedulePaymentReminder(appointmentId, amount, dueDate, userSettings = null) {
    const settings = userSettings || notificationSettings;
    
    if (!settings.sms.enabled && !settings.email.enabled) return;
    
    const reminderTime = new Date(dueDate.getTime() - (settings.sms.paymentTiming * 60 * 60 * 1000));
    
    // In a real implementation, this would schedule the reminder
    console.log('Payment reminder scheduled:', {
        appointmentId,
        amount,
        reminderTime,
        sms: settings.sms.enabled,
        email: settings.email.enabled
    });
    
    // Simulate immediate reminder for demo
    if (settings.sms.enabled && settings.sms.types.includes('payment_reminder')) {
        await simulateSMSReminder('payment', { appointmentId, amount });
    }
    
    if (settings.email.enabled && settings.email.types.includes('payment_reminder')) {
        await simulateEmailReminder('payment', { appointmentId, amount });
    }
}

async function scheduleAppointmentReminder(appointmentId, appointmentDate, doctorName, userSettings = null) {
    const settings = userSettings || notificationSettings;
    
    if (!settings.sms.enabled && !settings.email.enabled) return;
    
    const reminderTime = new Date(appointmentDate.getTime() - (settings.sms.appointmentTiming * 60 * 60 * 1000));
    
    console.log('Appointment reminder scheduled:', {
        appointmentId,
        appointmentDate,
        reminderTime,
        sms: settings.sms.enabled,
        email: settings.email.enabled
    });
    
    // Simulate immediate reminder for demo
    if (settings.sms.enabled && settings.sms.types.includes('appointment_reminder')) {
        await simulateSMSReminder('appointment', { appointmentId, doctorName, appointmentDate });
    }
    
    if (settings.email.enabled && settings.email.types.includes('appointment_reminder')) {
        await simulateEmailReminder('appointment', { appointmentId, doctorName, appointmentDate });
    }
}

async function sendPaymentConfirmation(transactionId, amount, appointmentId) {
    if (notificationSettings.sms.enabled && notificationSettings.sms.types.includes('payment_confirmation')) {
        await simulateSMSConfirmation('payment', { transactionId, amount, appointmentId });
    }
    
    if (notificationSettings.email.enabled && notificationSettings.email.types.includes('payment_receipt')) {
        await simulateEmailConfirmation('payment', { transactionId, amount, appointmentId });
    }
}

async function sendAppointmentConfirmation(appointmentId, doctorName, appointmentDate) {
    if (notificationSettings.sms.enabled && notificationSettings.sms.types.includes('appointment_reminder')) {
        await simulateSMSConfirmation('appointment', { appointmentId, doctorName, appointmentDate });
    }
    
    if (notificationSettings.email.enabled && notificationSettings.email.types.includes('appointment_reminder')) {
        await simulateEmailConfirmation('appointment', { appointmentId, doctorName, appointmentDate });
    }
}

// Simulation functions for demo purposes
async function simulateSMSReminder(type, data) {
    let message = '';
    
    if (type === 'payment') {
        message = `GhanaHealth+: Payment reminder - GH₵${data.amount} due for appointment ${data.appointmentId}. Pay now: ghanahealth.com/pay`;
    } else if (type === 'appointment') {
        message = `GhanaHealth+: Appointment reminder - ${data.doctorName} tomorrow at ${utils.formatTime(data.appointmentDate)}. Join: ghanahealth.com/join`;
    }
    
    console.log(`SMS to +233${notificationSettings.sms.phone}: ${message}`);
}

async function simulateEmailReminder(type, data) {
    let subject = '';
    let body = '';
    
    if (type === 'payment') {
        subject = 'Payment Reminder - GhanaHealth+';
        body = `Your payment of GH₵${data.amount} for appointment ${data.appointmentId} is due soon. Click here to pay securely.`;
    } else if (type === 'appointment') {
        subject = 'Appointment Reminder - GhanaHealth+';
        body = `Your appointment with ${data.doctorName} is scheduled for ${utils.formatDate(data.appointmentDate)}. Prepare for your consultation.`;
    }
    
    console.log(`Email to ${notificationSettings.email.address}: ${subject} - ${body}`);
}

async function simulateSMSConfirmation(type, data) {
    let message = '';
    
    if (type === 'payment') {
        message = `GhanaHealth+: Payment confirmed! GH₵${data.amount} paid. Transaction ID: ${data.transactionId}. Your appointment is confirmed.`;
    } else if (type === 'appointment') {
        message = `GhanaHealth+: Appointment confirmed with ${data.doctorName} on ${utils.formatDate(data.appointmentDate)}. See you soon!`;
    }
    
    console.log(`SMS to +233${notificationSettings.sms.phone}: ${message}`);
}

async function simulateEmailConfirmation(type, data) {
    let subject = '';
    let body = '';
    
    if (type === 'payment') {
        subject = 'Payment Receipt - GhanaHealth+';
        body = `Payment confirmed! Amount: GH₵${data.amount}, Transaction ID: ${data.transactionId}. Your appointment is now confirmed.`;
    } else if (type === 'appointment') {
        subject = 'Appointment Confirmed - GhanaHealth+';
        body = `Your appointment with ${data.doctorName} is confirmed for ${utils.formatDate(data.appointmentDate)}. We look forward to seeing you.`;
    }
    
    console.log(`Email to ${notificationSettings.email.address}: ${subject} - ${body}`);
}
