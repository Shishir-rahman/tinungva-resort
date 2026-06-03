// Tinungva Resort & Restaurant - Interactive Scripts

document.addEventListener('DOMContentLoaded', () => {
    // ----------------------------------------------------
    // 1. Sticky Header & Scroll Effects
    // ----------------------------------------------------
    const header = document.querySelector('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // ----------------------------------------------------
    // 2. Mobile Navigation Toggle
    // ----------------------------------------------------
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    const navItems = document.querySelectorAll('.nav-links a');

    const toggleMenu = () => {
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('active');
    };

    hamburger.addEventListener('click', toggleMenu);

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            if (navLinks.classList.contains('active')) {
                toggleMenu();
            }
        });
    });

    // ----------------------------------------------------
    // 3. Testimonial Slider
    // ----------------------------------------------------
    const track = document.querySelector('.testimonials-track');
    const slides = Array.from(document.querySelectorAll('.testimonial-card'));
    const dotsContainer = document.querySelector('.slider-controls');
    
    let currentIndex = 0;
    let slideInterval;

    if (slides.length > 0) {
        // Create indicator dots dynamically
        slides.forEach((_, index) => {
            const dot = document.createElement('button');
            dot.classList.add('slider-dot');
            if (index === 0) dot.classList.add('active');
            dot.setAttribute('aria-label', `Go to slide ${index + 1}`);
            dotsContainer.appendChild(dot);
        });

        const dots = Array.from(document.querySelectorAll('.slider-dot'));

        const updateSlider = (index) => {
            track.style.transform = `translateX(-${index * 100}%)`;
            dots.forEach(dot => dot.classList.remove('active'));
            dots[index].classList.add('active');
            currentIndex = index;
        };

        const nextSlide = () => {
            let nextIndex = currentIndex + 1;
            if (nextIndex >= slides.length) {
                nextIndex = 0;
            }
            updateSlider(nextIndex);
        };

        const startAutoPlay = () => {
            slideInterval = setInterval(nextSlide, 5000); // Change slide every 5 seconds
        };

        const stopAutoPlay = () => {
            clearInterval(slideInterval);
        };

        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                stopAutoPlay();
                updateSlider(index);
                startAutoPlay();
            });
        });

        // Initialize autoplay
        startAutoPlay();
    }

    // ----------------------------------------------------
    // 4. Restaurant Menu Filtering
    // ----------------------------------------------------
    const menuTabButtons = document.querySelectorAll('.menu-tab-btn');
    const menuItems = document.querySelectorAll('.menu-item');

    menuTabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Set active class
            menuTabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            const filterValue = button.getAttribute('data-filter');

            menuItems.forEach(item => {
                const category = item.getAttribute('data-category');
                if (filterValue === 'all' || category === filterValue) {
                    item.style.display = 'flex';
                    // Trigger reflow for transition
                    setTimeout(() => {
                        item.style.opacity = '1';
                        item.style.transform = 'translateX(0)';
                    }, 50);
                } else {
                    item.style.opacity = '0';
                    item.style.transform = 'translateX(-10px)';
                    setTimeout(() => {
                        item.style.display = 'none';
                    }, 300);
                }
            });
        });
    });

    // ----------------------------------------------------
    // 5. Booking Modal & Calculations Engine
    // ----------------------------------------------------
    const bookingModal = document.getElementById('bookingModal');
    const closeBookingBtn = document.getElementById('closeBooking');
    const openBookingBtns = document.querySelectorAll('.btn-book, .btn-card-book, .btn-search');
    
    // Modal Form Fields
    const modalForm = document.getElementById('modalBookingForm');
    const roomSelect = document.getElementById('modalRoomSelect');
    const checkInInput = document.getElementById('modalCheckIn');
    const checkOutInput = document.getElementById('modalCheckOut');
    const guestsInput = document.getElementById('modalGuests');
    const guestNameInput = document.getElementById('modalName');
    const guestPhoneInput = document.getElementById('modalPhone');
    
    // Extra Checkboxes
    const extraBreakfast = document.getElementById('extraBreakfast');
    const extraTrekking = document.getElementById('extraTrekking');
    const extraDinner = document.getElementById('extraDinner');
    
    // Summary Fields
    const summaryRoomName = document.getElementById('sumRoomName');
    const summaryNights = document.getElementById('sumNights');
    const summaryRoomCost = document.getElementById('sumRoomCost');
    const summaryExtrasCost = document.getElementById('sumExtrasCost');
    const summaryTotalCost = document.getElementById('sumTotalCost');
    
    // Success View
    const modalNormalBody = document.getElementById('modalNormalBody');
    const modalSuccessBody = document.getElementById('modalSuccessBody');
    
    // Room rates database (Mock API database)
    const roomRates = {
        couple: { name: 'Couple Room', rate: 4000 },
        family: { name: 'Family Suit', rate: 4000 }
    };

    // Helper: Set default dates in form inputs (Today and Tomorrow)
    const setDefaultDates = () => {
        const today = new Date();
        const tomorrow = new Date();
        tomorrow.setDate(today.getDate() + 1);

        const formatDate = (date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };

        const todayStr = formatDate(today);
        const tomorrowStr = formatDate(tomorrow);

        // Limit inputs so check-in can't be in the past
        if (checkInInput) {
            checkInInput.min = todayStr;
            if (!checkInInput.value) checkInInput.value = todayStr;
        }
        if (checkOutInput) {
            checkOutInput.min = tomorrowStr;
            if (!checkOutInput.value) checkOutInput.value = tomorrowStr;
        }

        // Search bar inputs on home screen (if they exist)
        const searchCheckIn = document.getElementById('checkIn');
        const searchCheckOut = document.getElementById('checkOut');
        if (searchCheckIn) {
            searchCheckIn.min = todayStr;
            searchCheckIn.value = todayStr;
        }
        if (searchCheckOut) {
            searchCheckOut.min = tomorrowStr;
            searchCheckOut.value = tomorrowStr;
        }
    };

    setDefaultDates();

    // Open Modal function
    const openModal = (roomType = 'couple') => {
        // Pre-select room if specified
        if (roomSelect && roomRates[roomType]) {
            roomSelect.value = roomType;
        }
        
        // Match dates from home search bar if they were filled out
        const searchCheckIn = document.getElementById('checkIn');
        const searchCheckOut = document.getElementById('checkOut');
        const searchGuests = document.getElementById('guests');
        const searchRoomType = document.getElementById('roomType');

        if (searchCheckIn && searchCheckIn.value) checkInInput.value = searchCheckIn.value;
        if (searchCheckOut && searchCheckOut.value) checkOutInput.value = searchCheckOut.value;
        if (searchGuests && searchGuests.value) guestsInput.value = searchGuests.value;
        if (searchRoomType && searchRoomType.value) roomSelect.value = searchRoomType.value;

        // Reset success state
        modalNormalBody.style.display = 'block';
        modalSuccessBody.style.display = 'none';

        bookingModal.classList.add('open');
        calculateCosts();
    };

    // Close Modal function
    const closeModal = () => {
        bookingModal.classList.remove('open');
    };

    // Bind triggers to open modal
    openBookingBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            // Check if clicked from a Room Card
            const roomType = btn.getAttribute('data-room');
            openModal(roomType || 'couple');
        });
    });

    closeBookingBtn.addEventListener('click', closeModal);

    // Close modal if user clicks background overlay
    bookingModal.addEventListener('click', (e) => {
        if (e.target === bookingModal) {
            closeModal();
        }
    });

    // ----------------------------------------------------
    // Cost Calculation Logic
    // ----------------------------------------------------
    const calculateCosts = () => {
        const selectedRoomKey = roomSelect.value;
        const roomData = roomRates[selectedRoomKey] || roomRates.couple;
        
        const checkInDate = new Date(checkInInput.value);
        const checkOutDate = new Date(checkOutInput.value);
        const guests = parseInt(guestsInput.value) || 1;

        // Calculate nights
        let nights = 1;
        if (checkOutDate > checkInDate) {
            const timeDiff = checkOutDate.getTime() - checkInDate.getTime();
            nights = Math.ceil(timeDiff / (1000 * 3600 * 24));
        } else {
            // Automatically adjust checkout date to be checkin + 1 day
            const adjustedCheckout = new Date(checkInDate);
            adjustedCheckout.setDate(checkInDate.getDate() + 1);
            
            const year = adjustedCheckout.getFullYear();
            const month = String(adjustedCheckout.getMonth() + 1).padStart(2, '0');
            const day = String(adjustedCheckout.getDate()).padStart(2, '0');
            checkOutInput.value = `${year}-${month}-${day}`;
            nights = 1;
        }

        // Room rate calculations
        const roomTotal = roomData.rate * nights;

        // Extras calculations
        let extrasTotal = 0;
        if (extraBreakfast.checked) {
            extrasTotal += 250 * guests * nights; // 250 BDT per guest per day
        }
        if (extraTrekking.checked) {
            extrasTotal += 500 * guests; // 500 BDT flat fee per guest
        }
        if (extraDinner.checked) {
            extrasTotal += 400 * guests * nights; // 400 BDT per guest per day
        }

        const totalCost = roomTotal + extrasTotal;

        // Update UI Summary Elements
        summaryRoomName.textContent = roomData.name;
        summaryNights.textContent = `${nights} ${nights === 1 ? 'Night' : 'Nights'}`;
        summaryRoomCost.textContent = `${roomTotal.toLocaleString()} BDT`;
        summaryExtrasCost.textContent = `${extrasTotal.toLocaleString()} BDT`;
        summaryTotalCost.textContent = `${totalCost.toLocaleString()} BDT`;
    };

    // Calculate whenever inputs change
    if (roomSelect) {
        roomSelect.addEventListener('change', calculateCosts);
        checkInInput.addEventListener('change', () => {
            // Update min date of check out based on check in
            const checkInVal = checkInInput.value;
            if (checkInVal) {
                const checkInDate = new Date(checkInVal);
                const nextDay = new Date(checkInDate);
                nextDay.setDate(checkInDate.getDate() + 1);
                
                const year = nextDay.getFullYear();
                const month = String(nextDay.getMonth() + 1).padStart(2, '0');
                const day = String(nextDay.getDate()).padStart(2, '0');
                checkOutInput.min = `${year}-${month}-${day}`;
            }
            calculateCosts();
        });
        checkOutInput.addEventListener('change', calculateCosts);
        guestsInput.addEventListener('change', calculateCosts);
        
        extraBreakfast.addEventListener('change', calculateCosts);
        extraTrekking.addEventListener('change', calculateCosts);
        extraDinner.addEventListener('change', calculateCosts);
    }

    // ----------------------------------------------------
    // WhatsApp Booking Submission
    // ----------------------------------------------------
    if (modalForm) {
        modalForm.addEventListener('submit', (e) => {
            e.preventDefault();

            // Form validations
            const name = guestNameInput.value.trim();
            const phone = guestPhoneInput.value.trim();
            const selectedRoomKey = roomSelect.value;
            const roomData = roomRates[selectedRoomKey];
            const checkIn = checkInInput.value;
            const checkOut = checkOutInput.value;
            const guests = guestsInput.value;

            if (!name || !phone) {
                alert('Please provide your name and phone number to continue.');
                return;
            }

            // Gather extras for summary message
            const selectedExtras = [];
            if (extraBreakfast.checked) selectedExtras.push('Complimentary Zoom Breakfast (250 BDT/person/day)');
            if (extraTrekking.checked) selectedExtras.push('Guided Hill Trekking (500 BDT/person)');
            if (extraDinner.checked) selectedExtras.push('Traditional Hill Dinner (400 BDT/person/day)');

            const extrasListText = selectedExtras.length > 0 ? selectedExtras.join(', ') : 'None';

            // Extract calculated rates
            const totalNightsText = summaryNights.textContent;
            const totalCostText = summaryTotalCost.textContent;

            // Host info: Stephen Bawm (01876355275)
            const hostNumber = '8801876355275';
            
            // Format WhatsApp Message
            const message = `*TINUNGVA RESORT BOOKING REQUEST*
-----------------------------
*Name:* ${name}
*Phone:* ${phone}
*Room:* ${roomData.name}
*Dates:* ${checkIn} to ${checkOut} (${totalNightsText})
*Guests:* ${guests} Person(s)
*Services:* ${extrasListText}
-----------------------------
*Estimated Total:* ${totalCostText}
-----------------------------
_Please confirm room availability._ Thank you!`;

            // URL Encode the message
            const encodedMessage = encodeURIComponent(message);
            const whatsappUrl = `https://api.whatsapp.com/send?phone=${hostNumber}&text=${encodedMessage}`;

            // Switch to Success Modal Screen
            modalNormalBody.style.display = 'none';
            modalSuccessBody.style.display = 'block';

            // Trigger WhatsApp in a new window/tab
            window.open(whatsappUrl, '_blank');

            // Reset form details
            modalForm.reset();
            setDefaultDates();
        });
    }

    // ----------------------------------------------------
    // 6. Contact Form Submission (Main Site)
    // ----------------------------------------------------
    const mainContactForm = document.getElementById('mainContactForm');
    if (mainContactForm) {
        mainContactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('contactName').value.trim();
            const email = document.getElementById('contactEmail').value.trim();
            const message = document.getElementById('contactMessage').value.trim();

            if (!name || !message) {
                alert('Please fill out your Name and Message.');
                return;
            }

            alert(`Thank you, ${name}! Your inquiry has been logged. Stephen Bawm will contact you shortly if required.`);
            mainContactForm.reset();
        });
    }
});
