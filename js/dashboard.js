// Dashboard functionality for GhanaHealth+
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const sidebarClose = document.getElementById('sidebar-close');
    const profileModal = document.getElementById('profile-modal');
    const bookingModal = document.getElementById('booking-modal');
    const sidebarName = document.getElementById('sidebar-name');
    const sidebarAvatar = document.getElementById('sidebar-avatar');
    const headerName = document.getElementById('header-name');
    const headerAvatar = document.getElementById('header-avatar');
    const nameInput = document.getElementById('profile-name-input');
    const ageInput = document.getElementById('profile-age-input');
    const phoneInput = document.getElementById('profile-phone-input');
    const locationInput = document.getElementById('profile-location-input');
    const picInput = document.getElementById('profile-pic-input');
    const notificationBtn = document.getElementById('notification-btn');
    const weatherWidget = document.getElementById('weather-widget');

    // Sample data
    const doctors = [
        { 
            name: "Dr. Kwame Mensah", 
            specialty: "Cardiologist", 
            location: "Accra", 
            rating: 4.8,
            experience: "15 years",
            image: "public/placeholder-user.jpg"
        },
        { 
            name: "Dr. Ama Asante", 
            specialty: "Dermatologist", 
            location: "Kumasi", 
            rating: 4.6,
            experience: "12 years",
            image: "public/placeholder-user.jpg"
        },
        { 
            name: "Dr. Kojo Owusu", 
            specialty: "General Practitioner", 
            location: "Takoradi", 
            rating: 4.7,
            experience: "18 years",
            image: "public/placeholder-user.jpg"
        },
        { 
            name: "Dr. Akosua Boateng", 
            specialty: "Pediatrician", 
            location: "Accra", 
            rating: 4.9,
            experience: "20 years",
            image: "public/placeholder-user.jpg"
        },
        { 
            name: "Dr. Yaw Boadu", 
            specialty: "Neurologist", 
            location: "Kumasi", 
            rating: 4.5,
            experience: "14 years",
            image: "public/placeholder-user.jpg"
        }
    ];

    // Initialize dashboard
    function initDashboard() {
        loadUserData();
        renderDoctors();
        setupEventListeners();
        showSection('overview');
        updateWeather();
    }

    // Load user data
    function loadUserData() {
        const currentUser = JSON.parse(localStorage.getItem('ghanahealth_current_user') || '{}');
        
        const userData = {
            name: currentUser.full_name || "User",
            email: currentUser.email || "user@email.com",
            phone: currentUser.phone || "Not provided",
            location: currentUser.location || "Not provided",
            age: currentUser.age ? `${currentUser.age} years old` : "Not provided",
            avatar: currentUser.profilePicture || "public/placeholder-user.jpg"
        };

        sidebarName.textContent = userData.name;
        headerName.textContent = userData.name.split(' ')[0];
        sidebarAvatar.src = userData.avatar;
        headerAvatar.src = userData.avatar;
        
        // Update profile section with user data
        updateProfileSection(userData, currentUser);
    }

    // Setup all event listeners
    function setupEventListeners() {
        // Sidebar toggle
        sidebarToggle.addEventListener('click', toggleSidebar);
        if (sidebarClose) {
            sidebarClose.addEventListener('click', toggleSidebar);
        }

        // Navigation
        document.querySelectorAll('[data-route]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const route = btn.getAttribute('data-route');
                showSection(route);
                updateActiveNav(btn);
            });
        });


        document.getElementById('close-profile-modal').addEventListener('click', closeProfileModal);
        document.getElementById('cancel-profile').addEventListener('click', closeProfileModal);
        document.getElementById('save-profile').addEventListener('click', saveProfile);

        // Chat modal
        document.getElementById('close-chat-modal').addEventListener('click', closeChatModal);
        document.getElementById('send-message').addEventListener('click', sendMessage);
        document.getElementById('chat-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });

        // Booking modal
        document.getElementById('close-booking-modal').addEventListener('click', closeBookingModal);
        document.getElementById('close-booking').addEventListener('click', closeBookingModal);
        document.getElementById('submit-booking').addEventListener('click', handleBookingSubmit);
        
        // Book appointment form submission
        document.getElementById('book-doctor-form').addEventListener('submit', handleBookingSubmit);

        // Quick actions
        document.querySelectorAll('.action-card').forEach(card => {
            card.addEventListener('click', handleQuickAction);
        });

        // Search and filters
        const searchInput = document.getElementById('search-doctor');
        const locationFilter = document.getElementById('location-filter');
        
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                renderDoctors(e.target.value.toLowerCase(), locationFilter.value);
            });
        }
        
        if (locationFilter) {
            locationFilter.addEventListener('change', (e) => {
                renderDoctors(searchInput.value.toLowerCase(), e.target.value);
            });
        }

        // Notification button
        if (notificationBtn) {
            notificationBtn.addEventListener('click', showNotifications);
        }

        // Profile avatar edit
        const avatarEdit = document.querySelector('.avatar-edit');
        if (avatarEdit) {
            avatarEdit.addEventListener('click', () => {
                picInput.click();
            });
        }

        // Profile picture input
        if (picInput) {
            picInput.addEventListener('change', handleProfilePictureChange);
        }
    }

    // Sidebar functionality
    function toggleSidebar() {
        sidebar.classList.toggle('open');
        document.body.classList.toggle('sidebar-open');
    }

    // Navigation functionality
    function showSection(sectionName) {
        // Hide all sections
        document.querySelectorAll('.dashboard-section').forEach(section => {
            section.classList.remove('active');
        });

        // Show target section
        const targetSection = document.getElementById(`${sectionName}-section`);
        if (targetSection) {
            targetSection.classList.add('active');
        }

        // Update active nav item
        document.querySelectorAll('[data-route]').forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-route') === sectionName) {
                btn.classList.add('active');
            }
        });
    }

    function updateActiveNav(activeBtn) {
        document.querySelectorAll('[data-route]').forEach(btn => {
            btn.classList.remove('active');
        });
        activeBtn.classList.add('active');
    }

    // Profile functionality
    function openProfileModal() {
        profileModal.classList.remove('hidden');
        
        const currentUser = JSON.parse(localStorage.getItem('ghanahealth_current_user') || '{}');
        document.getElementById('profile-name-input').value = currentUser.full_name || '';
        document.getElementById('profile-age-input').value = currentUser.age || '';
        document.getElementById('profile-phone-input').value = currentUser.phone || '';
        document.getElementById('profile-location-input').value = currentUser.location || '';
        
        if (window.innerWidth < 768) {
            sidebar.classList.remove('open');
            document.body.classList.remove('sidebar-open');
        }
    }

    function closeProfileModal() {
        profileModal.classList.add('hidden');
    }

    function saveProfile() {
        const currentUser = JSON.parse(localStorage.getItem('ghanahealth_current_user') || '{}');
        const users = JSON.parse(localStorage.getItem('ghanahealth_users') || '[]');
        
        const updatedData = {
            full_name: document.getElementById('profile-name-input').value.trim(),
            age: document.getElementById('profile-age-input').value,
            phone: document.getElementById('profile-phone-input').value.trim(),
            location: document.getElementById('profile-location-input').value.trim()
        };
        
        // Handle profile picture if selected
        const picFile = document.getElementById('profile-pic-input').files[0];
        if (picFile) {
            const reader = new FileReader();
            reader.onload = function(e) {
                updatedData.profilePicture = e.target.result;
                updateUserProfile(currentUser, users, updatedData);
            };
            reader.readAsDataURL(picFile);
        } else {
            updateUserProfile(currentUser, users, updatedData);
        }
    }
    
    function updateUserProfile(currentUser, users, updatedData) {
        const updatedUser = { ...currentUser, ...updatedData };
        
        // Update user in users array
        const userIndex = users.findIndex(user => user.email === currentUser.email);
        if (userIndex !== -1) {
            users[userIndex] = updatedUser;
            localStorage.setItem('ghanahealth_users', JSON.stringify(users));
        }
        localStorage.setItem('ghanahealth_current_user', JSON.stringify(updatedUser));
        
        loadUserData();
        closeProfileModal();
        showToast('Profile updated successfully!');
    }

    function handleProfilePictureChange() {
        if (picInput.files[0]) {
            const fileReader = new FileReader();
            fileReader.onload = function(e) {
                const newAvatar = e.target.result;
                sidebarAvatar.src = newAvatar;
                headerAvatar.src = newAvatar;
                showToast('Profile picture updated!');
            };
            fileReader.readAsDataURL(picInput.files[0]);
        }
    }

    // Booking functionality
    function openBooking(doctorName) {
        document.getElementById('booking-doctor-name').textContent = `Book Appointment with ${doctorName}`;
        bookingModal.classList.remove('hidden');
    }

    function closeBookingModal() {
        bookingModal.classList.add('hidden');
        document.getElementById('book-doctor-form').reset();
    }

    function handleBookingSubmit(e) {
        e.preventDefault();
        
        const appointmentData = {
            date: document.getElementById('appointment-date').value,
            time: document.getElementById('appointment-time').value,
            type: document.getElementById('appointment-type').value,
            reason: document.getElementById('appointment-reason').value
        };

        // Validate form
        if (!appointmentData.date || !appointmentData.time || !appointmentData.type) {
            showToast('Please fill in all required fields', 'error');
            return;
        }

        // Confirmation prompt
        const doctorName = document.getElementById('booking-doctor-name').textContent.replace('Book Appointment with ', '');
        const confirmMessage = `Confirm appointment booking:\n\nDoctor: ${doctorName}\nDate: ${appointmentData.date}\nTime: ${appointmentData.time}\nType: ${appointmentData.type}\n\nProceed with booking?`;
        
        if (!confirm(confirmMessage)) {
            return;
        }

        // In a real app, this would save to Firebase
        // console.log('Booking appointment:', appointmentData);
        
        closeBookingModal();
        showToast('Appointment booked successfully!');
        
        // Add to recent activity
        addRecentActivity('Appointment Booked', `Appointment scheduled for ${appointmentData.date} at ${appointmentData.time}`);
    }

    // Quick actions
    function handleQuickAction(e) {
        const actionCard = e.currentTarget;
        const actionType = actionCard.querySelector('h3').textContent;
        
        switch(actionType) {
            case 'Book Appointment':
                showSection('doctors');
                break;
            case 'Quick Chat':
                showSection('chat');
                break;
            case 'Emergency':
                emergencyCall();
                break;
        }
    }

    function emergencyCall() {
        if (confirm('This will initiate an emergency call. Continue?')) {
            // In a real app, this would integrate with phone/emergency services
            showToast('Emergency call initiated. Please stay on the line.', 'warning');
        }
    }

    // Doctor functionality
    function renderDoctors(filterText = "", location = "") {
        const list = document.getElementById("doctor-list");
        if (!list) return;
        
        list.innerHTML = "";
        
        const filteredDoctors = doctors.filter(doc =>
            (doc.name.toLowerCase().includes(filterText) ||
             doc.specialty.toLowerCase().includes(filterText)) &&
            (location === "" || doc.location === location)
        );

        filteredDoctors.forEach(doc => {
            const card = document.createElement("div");
            card.className = "doctor-card";
            card.innerHTML = `
                <div class="doctor-info">
                    <img src="${doc.image}" alt="${doc.name}" class="doctor-avatar">
                    <div class="doctor-details">
                        <h3>${doc.name}</h3>
                        <p class="specialty">${doc.specialty}</p>
                        <p class="location"><i class="fas fa-map-marker-alt"></i> ${doc.location}</p>
                        <p class="experience"><i class="fas fa-clock"></i> ${doc.experience}</p>
                        <div class="rating">
                            <span class="stars">${'⭐'.repeat(Math.floor(doc.rating))}</span>
                            <span class="rating-value">${doc.rating}</span>
                        </div>
                    </div>
                </div>
                <div class="doctor-actions">
                    <button class="btn btn-primary book-btn" onclick="openBooking('${doc.name}')">
                        <i class="fas fa-calendar-plus"></i> Book Appointment
                    </button>
                    <button class="btn btn-outline chat-btn" onclick="startChatWithDoctor('${doc.name}')">
                        <i class="fas fa-comments"></i> Chat
                    </button>
                </div>
            `;
            list.appendChild(card);
        });
    }

    // Chat functionality
    function startChatWithDoctor(doctorName) {
        openChatModal(doctorName);
        showToast(`Starting chat with ${doctorName}...`);
    }

    function openChatModal(doctorName) {
        const chatModal = document.getElementById('chat-modal');
        const chatDoctorName = document.getElementById('chat-doctor-name');
        const chatDoctorAvatar = document.getElementById('chat-doctor-avatar');
        
        chatDoctorName.textContent = doctorName;
        chatDoctorAvatar.src = 'public/placeholder-user.jpg';
        chatModal.classList.remove('hidden');
        
        // Focus on input
        setTimeout(() => {
            document.getElementById('chat-input').focus();
        }, 100);
    }

    function closeChatModal() {
        document.getElementById('chat-modal').classList.add('hidden');
    }

    function sendMessage() {
        const chatInput = document.getElementById('chat-input');
        const message = chatInput.value.trim();
        
        if (!message) return;
        
        const chatMessages = document.getElementById('chat-messages');
        const currentTime = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        
        // Add sent message
        const sentMessage = document.createElement('div');
        sentMessage.className = 'message sent';
        sentMessage.innerHTML = `
            <div class="message-content">
                <p>${message}</p>
                <span class="message-time">${currentTime}</span>
            </div>
        `;
        
        chatMessages.appendChild(sentMessage);
        chatInput.value = '';
        
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // Simulate doctor response after 2 seconds
        setTimeout(() => {
            const responses = [
                "Thank you for your message. I'll review your symptoms.",
                "Based on what you've described, I recommend...",
                "Let me check your medical history first.",
                "I understand your concern. Here's what I suggest...",
                "That's a good question. Let me explain..."
            ];
            
            const randomResponse = responses[Math.floor(Math.random() * responses.length)];
            const responseTime = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            
            const receivedMessage = document.createElement('div');
            receivedMessage.className = 'message received';
            receivedMessage.innerHTML = `
                <div class="message-content">
                    <p>${randomResponse}</p>
                    <span class="message-time">${responseTime}</span>
                </div>
            `;
            
            chatMessages.appendChild(receivedMessage);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }, 2000);
    }

    function startNewChat() {
        showSection('doctors');
        showToast('Please select a doctor to start chatting');
        // Update active navigation
        document.querySelectorAll('[data-route]').forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-route') === 'doctors') {
                btn.classList.add('active');
            }
        });
    }

    // Health metrics
    function addHealthMetric() {
        const metric = prompt('Enter health metric (e.g., Blood Pressure: 120/80)');
        if (metric) {
            showToast(`Health metric added: ${metric}`);
            // In a real app, this would save to the health records
        }
    }

    // Health records
    function addHealthRecord(recordType) {
        const record = prompt(`Enter ${recordType.toLowerCase()} information:`);
        if (record && record.trim()) {
            showToast(`${recordType} record added: ${record}`);
            // In a real app, this would save to the database
            addRecentActivity(`${recordType} Added`, `New ${recordType.toLowerCase()} record: ${record}`);
        }
    }

    // Notifications
    function showNotifications() {
        // In a real app, this would show a notifications panel
        showToast('You have 3 unread notifications');
    }

    // Recent activity
    function addRecentActivity(title, description) {
        const activityList = document.querySelector('.activity-list');
        if (!activityList) return;

        const activityItem = document.createElement('div');
        activityItem.className = 'activity-item';
        activityItem.innerHTML = `
            <div class="activity-icon">
                <i class="fas fa-calendar-check"></i>
            </div>
            <div class="activity-content">
                <h4>${title}</h4>
                <p>${description}</p>
                <span class="activity-time">Just now</span>
            </div>
        `;

        // Insert at the top
        activityList.insertBefore(activityItem, activityList.firstChild);
        
        // Remove old activities if too many
        const activities = activityList.querySelectorAll('.activity-item');
        if (activities.length > 5) {
            activities[activities.length - 1].remove();
        }
    }

    // Weather functionality
    function updateWeather() {
        // In a real app, this would fetch from a weather API
        const temperature = Math.floor(Math.random() * 15) + 20; // 20-35°C
        const weatherIcon = 'fas fa-cloud-sun';
        
        if (weatherWidget) {
            weatherWidget.innerHTML = `
                <i class="${weatherIcon}"></i>
                <span>${temperature}°C</span>
            `;
        }
    }

    // Utility functions
    function showToast(message, type = 'success') {
        // Create toast notification
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(toast);
        
        // Show toast
        setTimeout(() => toast.classList.add('show'), 100);
        
        // Remove toast
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // Global functions for onclick handlers
    window.bookAppointment = function() {
        showSection('doctors');
    };

    window.startChat = function() {
        showSection('chat');
    };

    window.emergencyCall = function() {
        emergencyCall();
    };

    window.addHealthMetric = function() {
        addHealthMetric();
    };

    window.startNewChat = function() {
        startNewChat();
    };

    window.openBooking = function(doctorName) {
        openBooking(doctorName);
    };

    window.startChatWithDoctor = function(doctorName) {
        startChatWithDoctor(doctorName);
    };

    window.editProfile = function() {
        openProfileModal();
    };

    window.logout = function() {
        if (confirm('Are you sure you want to logout?')) {
            localStorage.removeItem('ghanahealth_current_user');
            window.location.href = 'login.html';
        }
    };

    window.addHealthRecord = function(recordType) {
        addHealthRecord(recordType);
    };

    // Update profile section with user data
    function updateProfileSection(userData, currentUser) {
        const profileName = document.querySelector('.profile-info h3');
        const profileEmail = document.querySelector('.detail-item:nth-child(1) span');
        const profilePhone = document.querySelector('.detail-item:nth-child(2) span');
        const profileLocation = document.querySelector('.detail-item:nth-child(3) span');
        const profileAge = document.querySelector('.detail-item:nth-child(4) span');
        const profileAvatar = document.querySelector('.profile-avatar img');
        
        if (profileName) profileName.textContent = userData.name;
        if (profileEmail) profileEmail.textContent = userData.email;
        if (profilePhone) profilePhone.textContent = userData.phone;
        if (profileLocation) profileLocation.textContent = userData.location;
        if (profileAge) profileAge.textContent = userData.age;
        if (profileAvatar) profileAvatar.src = userData.avatar;
        
        // Update all profile images throughout the dashboard
        if (sidebarAvatar) sidebarAvatar.src = userData.avatar;
        if (headerAvatar) {
            const headerAvatarImg = headerAvatar.querySelector('img');
            if (headerAvatarImg) headerAvatarImg.src = userData.avatar;
        }
    }

    // Initialize dashboard
    initDashboard();
});
