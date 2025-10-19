'use strict';



// element toggle function
const elementToggleFunc = function (elem) { elem.classList.toggle("active"); }



// sidebar variables
const sidebar = document.querySelector("[data-sidebar]");
const sidebarBtn = document.querySelector("[data-sidebar-btn]");

// sidebar toggle functionality for mobile
sidebarBtn.addEventListener("click", function () { elementToggleFunc(sidebar); });



// testimonials variables
const testimonialsItem = document.querySelectorAll("[data-testimonials-item]");
const modalContainer = document.querySelector("[data-modal-container]");
const modalCloseBtn = document.querySelector("[data-modal-close-btn]");
const overlay = document.querySelector("[data-overlay]");

// modal variable
const modalImg = document.querySelector("[data-modal-img]");
const modalTitle = document.querySelector("[data-modal-title]");
const modalText = document.querySelector("[data-modal-text]");

// modal toggle function
const testimonialsModalFunc = function () {
  modalContainer.classList.toggle("active");
  overlay.classList.toggle("active");
}

// add click event to all modal items
for (let i = 0; i < testimonialsItem.length; i++) {

  testimonialsItem[i].addEventListener("click", function () {

    modalImg.src = this.querySelector("[data-testimonials-avatar]").src;
    modalImg.alt = this.querySelector("[data-testimonials-avatar]").alt;
    modalTitle.innerHTML = this.querySelector("[data-testimonials-title]").innerHTML;
    modalText.innerHTML = this.querySelector("[data-testimonials-text]").innerHTML;

    testimonialsModalFunc();

  });

}

// add click event to modal close button
modalCloseBtn.addEventListener("click", testimonialsModalFunc);
overlay.addEventListener("click", testimonialsModalFunc);



// custom select variables
const select = document.querySelector("[data-select]");
const selectItems = document.querySelectorAll("[data-select-item]");
const selectValue = document.querySelector("[data-selecct-value]");
const filterBtn = document.querySelectorAll("[data-filter-btn]");

select.addEventListener("click", function () { elementToggleFunc(this); });

// add event in all select items
for (let i = 0; i < selectItems.length; i++) {
  selectItems[i].addEventListener("click", function () {

    let selectedValue = this.innerText.toLowerCase();
    selectValue.innerText = this.innerText;
    elementToggleFunc(select);
    filterFunc(selectedValue);

  });
}

// filter variables
const filterItems = document.querySelectorAll("[data-filter-item]");

const filterFunc = function (selectedValue) {

  for (let i = 0; i < filterItems.length; i++) {

    if (selectedValue === "all") {
      filterItems[i].classList.add("active");
    } else if (selectedValue === filterItems[i].dataset.category) {
      filterItems[i].classList.add("active");
    } else {
      filterItems[i].classList.remove("active");
    }

  }

}

// add event in all filter button items for large screen
let lastClickedBtn = filterBtn[0];

for (let i = 0; i < filterBtn.length; i++) {

  filterBtn[i].addEventListener("click", function () {

    let selectedValue = this.innerText.toLowerCase();
    selectValue.innerText = this.innerText;
    filterFunc(selectedValue);

    lastClickedBtn.classList.remove("active");
    this.classList.add("active");
    lastClickedBtn = this;

  });

}



// contact form variables
const form = document.querySelector("[data-form]");
const formInputs = document.querySelectorAll("[data-form-input]");
const formBtn = document.querySelector("[data-form-btn]");

// add event to all form input field
for (let i = 0; i < formInputs.length; i++) {
  formInputs[i].addEventListener("input", function () {

    // check form validation
    if (form.checkValidity()) {
      formBtn.removeAttribute("disabled");
    } else {
      formBtn.setAttribute("disabled", "");
    }

  });
}

// Create status message display function
function showStatusMessage(message, type = 'info', duration = 3000) {
    // Remove existing status messages
    const existingStatus = document.querySelector('.form-status-message');
    if (existingStatus) {
        existingStatus.remove();
    }
    
    // Create new status message
    const statusDiv = document.createElement('div');
    statusDiv.className = `form-status-message form-status-${type}`;
    statusDiv.textContent = message;
    
    // Add styles
    statusDiv.style.cssText = `
        margin: 10px 0;
        padding: 12px;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 500;
        transition: opacity 0.3s ease;
    `;
    
    // Set colors based on type
    if (type === 'success') {
        statusDiv.style.backgroundColor = '#d4edda';
        statusDiv.style.color = '#155724';
        statusDiv.style.border = '1px solid #c3e6cb';
    } else if (type === 'error') {
        statusDiv.style.backgroundColor = '#f8d7da';
        statusDiv.style.color = '#721c24';
        statusDiv.style.border = '1px solid #f5c6cb';
    } else {
        statusDiv.style.backgroundColor = '#d1ecf1';
        statusDiv.style.color = '#0c5460';
        statusDiv.style.border = '1px solid #bee5eb';
    }
    
    // Insert after the form
    form.parentNode.insertBefore(statusDiv, form.nextSibling);
    
    // Auto-hide after duration
    if (duration > 0) {
        setTimeout(() => {
            if (statusDiv.parentNode) {
                statusDiv.style.opacity = '0';
                setTimeout(() => {
                    if (statusDiv.parentNode) {
                        statusDiv.remove();
                    }
                }, 300);
            }
        }, duration);
    }
}

// Initialize form handling
window.addEventListener('load', function() {
    // Check if form exists
    if (!form) {
        console.log('Contact form not found');
        return;
    }
    
    // Check if we're running locally or on a server
    const isLocal = window.location.protocol === 'file:' || 
                   window.location.hostname === 'localhost' || 
                   window.location.hostname === '127.0.0.1';
    
    console.log('Contact form initialized. Environment:', isLocal ? 'Local' : 'Server');
    console.log('EmailJS available:', typeof emailjs !== 'undefined');
    
    // Main form submit handler
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const buttonText = formBtn.querySelector('span');
        const originalText = buttonText.textContent;
        const formData = new FormData(form);
        
        // Get form values
        const name = formData.get('user_name');
        const email = formData.get('user_email');
        const message = formData.get('message');
        
        // Validate form data
        if (!name || !email || !message) {
            showStatusMessage('Please fill in all required fields.', 'error');
            return;
        }
        
        // Update button state
        buttonText.textContent = 'Sending...';
        formBtn.setAttribute('disabled', '');
        
        if (isLocal) {
            console.log('Using mailto for local environment');
            showStatusMessage('Opening your email client...', 'info', 2000);
            
            const subject = encodeURIComponent(`Portfolio Contact: Message from ${name}`);
            const body = encodeURIComponent(`Hi Henry,

You received a new message from your portfolio website:

Name: ${name}
Email: ${email}

Message:
${message}

---
Sent from your portfolio contact form`);
            
            setTimeout(() => {
                window.location.href = `mailto:h3nryhu@gmail.com?subject=${subject}&body=${body}`;
                
                // Reset form after delay
                setTimeout(() => {
                    buttonText.textContent = originalText;
                    formBtn.setAttribute('disabled', '');
                    form.reset();
                    showStatusMessage('Email client opened! Please send the email to complete your message.', 'success');
                }, 1000);
            }, 500);
            
    } else if (typeof emailjs !== 'undefined') {
      console.log('Using EmailJS for server environment');
            
      // Read EmailJS config from data-attributes on the form
      const publicKey = (form.dataset.emailjsPublicKey || '').trim();
      const serviceId = (form.dataset.emailjsService || '').trim();
      const templateId = (form.dataset.emailjsTemplate || '').trim();

      // Log for debugging
      console.log('EmailJS config ->', { publicKey, serviceId, templateId });

      // Validate IDs
      if (!publicKey || !serviceId || !templateId) {
        showStatusMessage('Email service is not configured properly. Please set Public Key, Service ID and Template ID.', 'error', 0);
        buttonText.textContent = originalText;
        if (form.checkValidity()) formBtn.removeAttribute('disabled');
        return;
      }

      // Initialize EmailJS
      emailjs.init(publicKey);
            
      // Send email using EmailJS
      emailjs.sendForm(serviceId, templateId, form)
                .then(function(response) {
                    console.log('EmailJS SUCCESS!', response.status, response.text);
                    showStatusMessage('Message sent successfully! I\'ll get back to you soon.', 'success');
                    form.reset();
                })
                .catch(function(error) {
                    console.log('EmailJS FAILED...', error);
                    
                    // Show error and offer mailto fallback
          const errorMessage = (error && (error.text || error.message)) || 'Unknown error occurred';
          let friendly = `Email service failed: ${errorMessage}`;
          if (/template id/i.test(errorMessage)) {
            friendly += `\nPlease verify Template ID exactly matches in EmailJS (case-sensitive): ${templateId}`;
          }
          showStatusMessage(friendly, 'error', 0);
                    
                    // Add mailto fallback option
                    setTimeout(() => {
                        if (confirm('Email service failed. Would you like to open your email client instead?')) {
                            const subject = encodeURIComponent(`Portfolio Contact: Message from ${name}`);
                            const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`);
                            
                            window.location.href = `mailto:h3nryhu@gmail.com?subject=${subject}&body=${body}`;
                        }
                    }, 1000);
                })
                .finally(() => {
                    buttonText.textContent = originalText;
                    if (form.checkValidity()) {
                        formBtn.removeAttribute('disabled');
                    }
                });
                
        } else {
            console.log('EmailJS not available - using mailto fallback');
            showStatusMessage('Opening your email client...', 'info', 2000);
            
            const subject = encodeURIComponent(`Portfolio Contact: Message from ${name}`);
            const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`);
            
            setTimeout(() => {
                window.location.href = `mailto:h3nryhu@gmail.com?subject=${subject}&body=${body}`;
                buttonText.textContent = originalText;
                formBtn.setAttribute('disabled', '');
                form.reset();
            }, 500);
        }
    });
});



// page navigation variables
const navigationLinks = document.querySelectorAll("[data-nav-link]");
const pages = document.querySelectorAll("[data-page]");

// add event to all nav link
for (let i = 0; i < navigationLinks.length; i++) {
  navigationLinks[i].addEventListener("click", function () {

    for (let i = 0; i < pages.length; i++) {
      if (this.innerHTML.toLowerCase() === pages[i].dataset.page) {
        pages[i].classList.add("active");
        navigationLinks[i].classList.add("active");
        window.scrollTo(0, 0);
      } else {
        pages[i].classList.remove("active");
        navigationLinks[i].classList.remove("active");
      }
    }

  });
}

// Handle hash navigation on page load
window.addEventListener('DOMContentLoaded', function() {
  const hash = window.location.hash.substring(1); // Remove the '#' character
  
  if (hash) {
    // Find the page that matches the hash
    for (let i = 0; i < pages.length; i++) {
      if (pages[i].dataset.page === hash) {
        // Remove active class from all pages and nav links
        pages.forEach(page => page.classList.remove("active"));
        navigationLinks.forEach(link => link.classList.remove("active"));
        
        // Add active class to the matching page and nav link
        pages[i].classList.add("active");
        navigationLinks[i].classList.add("active");
        window.scrollTo(0, 0);
        break;
      }
    }
  }
});