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

// Initialize form handling
window.addEventListener('load', function() {
    // Check if we're running locally or on a server
    const isLocal = window.location.protocol === 'file:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    
    if (isLocal) {
        console.log('Running locally - using mailto fallback');
        // Use mailto for local testing
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const buttonText = formBtn.querySelector('span');
            const originalText = buttonText.textContent;
            buttonText.textContent = 'Opening email...';
            formBtn.setAttribute('disabled', '');
            
            const name = document.querySelector('input[name="user_name"]').value;
            const email = document.querySelector('input[name="user_email"]').value;
            const message = document.querySelector('textarea[name="message"]').value;
            
            const subject = encodeURIComponent(`Portfolio Contact: Message from ${name}`);
            const body = encodeURIComponent(`Hi Henry,

You received a new message from your portfolio website:

Name: ${name}
Email: ${email}

Message:
${message}

---
Sent from your portfolio contact form`);
            
            // Small delay to show the "Opening email..." message
            setTimeout(function() {
                window.location.href = `mailto:h3nryhu@gmail.com?subject=${subject}&body=${body}`;
                
                // Reset button after a short delay
                setTimeout(function() {
                    buttonText.textContent = originalText;
                    formBtn.setAttribute('disabled', '');
                    form.reset();
                }, 1000);
            }, 500);
        });
    } else if (typeof emailjs !== 'undefined') {
        console.log('Running on server - using EmailJS');
        emailjs.init("0bFk33zdsm-Iyw5xr");
        
        // Handle form submission with EmailJS
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const buttonText = formBtn.querySelector('span');
            const originalText = buttonText.textContent;
            buttonText.textContent = 'Sending...';
            formBtn.setAttribute('disabled', '');
            
            emailjs.sendForm('Message_Gmail', 'template_ja228jq', this)
                .then(function(response) {
                    console.log('SUCCESS!', response.status, response.text);
                    alert('Message sent successfully!');
                    form.reset();
                    buttonText.textContent = originalText;
                    formBtn.setAttribute('disabled', '');
                }, function(error) {
                    console.log('FAILED...', error);
                    
                    // Reset button
                    buttonText.textContent = originalText;
                    if (form.checkValidity()) {
                        formBtn.removeAttribute('disabled');
                    }
                    
                    // Fallback to mailto even on server if EmailJS fails
                    if (confirm('Email service failed. Would you like to open your email client instead?')) {
                        const name = document.querySelector('input[name="user_name"]').value;
                        const email = document.querySelector('input[name="user_email"]').value;
                        const message = document.querySelector('textarea[name="message"]').value;
                        
                        const subject = encodeURIComponent(`Portfolio Contact: Message from ${name}`);
                        const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`);
                        
                        window.location.href = `mailto:h3nryhu@gmail.com?subject=${subject}&body=${body}`;
                    }
                });
        });
    } else {
        console.log('EmailJS not available - using mailto fallback');
        // Fallback to mailto if EmailJS is not loaded
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = document.querySelector('input[name="user_name"]').value;
            const email = document.querySelector('input[name="user_email"]').value;
            const message = document.querySelector('textarea[name="message"]').value;
            
            const subject = encodeURIComponent(`Portfolio Contact: Message from ${name}`);
            const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`);
            
            window.location.href = `mailto:h3nryhu@gmail.com?subject=${subject}&body=${body}`;
        });
    }
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