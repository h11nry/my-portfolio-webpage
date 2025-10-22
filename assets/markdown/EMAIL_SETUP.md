# Email Setup Guide

This guide will help you set up EmailJS to receive contact form submissions directly to your email.

## Step 1: Create EmailJS Account

1. Go to [EmailJS](https://www.emailjs.com/)
2. Sign up for a free account
3. Verify your email address

## Step 2: Create Email Service

1. In your EmailJS dashboard, go to "Email Services"
2. Click "Add New Service"
3. Choose your email provider (Gmail, Outlook, etc.)
4. For Gmail:
   - Choose "Gmail"
   - Click "Connect Account" and authorize with your Gmail (h3nryhu@gmail.com)
   - Give it a Service ID (e.g., "service_gmail")

## Step 3: Create Email Template

1. Go to "Email Templates"
2. Click "Create New Template"
3. Use this template:

```
Subject: New Contact Form Message from {{user_name}}

From: {{user_name}}
Email: {{user_email}}

Message:
{{message}}

---
This message was sent from your portfolio contact form.
```

4. Save the template and note the Template ID (e.g., "template_contact")

## Step 4: Update Your Code

1. In your EmailJS dashboard, find your Public Key (in Account settings)
2. Open `assets/js/script.js`
3. Replace the following placeholders:
   - `YOUR_PUBLIC_KEY` with your actual public key
   - `YOUR_SERVICE_ID` with your service ID (e.g., "service_gmail")
   - `YOUR_TEMPLATE_ID` with your template ID (e.g., "template_contact")

## Step 5: Test

1. Open your portfolio website
2. Navigate to the Contact section
3. Fill out the form and submit
4. Check your email (h3nryhu@gmail.com) for the message

## Alternative Simple Solution

If you prefer a simpler approach without EmailJS, you can use a mailto link:

Replace the form submission JavaScript with:

```javascript
form.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const name = document.querySelector('input[name="user_name"]').value;
    const email = document.querySelector('input[name="user_email"]').value;
    const message = document.querySelector('textarea[name="message"]').value;
    
    const subject = encodeURIComponent(`Contact from ${name}`);
    const body = encodeURIComponent(`From: ${name}\nEmail: ${email}\n\nMessage:\n${message}`);
    
    window.location.href = `mailto:h3nryhu@gmail.com?subject=${subject}&body=${body}`;
});
```

This will open the user's default email client with a pre-filled message.

## Notes

- EmailJS free tier allows 200 emails per month
- The form will now be enabled when all required fields are filled
- You'll receive emails directly to h3nryhu@gmail.com
- Make sure to test the setup before going live