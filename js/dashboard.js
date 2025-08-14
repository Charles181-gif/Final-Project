// Dashboard functionality for GhanaHealth+
import { supabase } from './supabase-config.js';
import { authFallback } from './auth-fallback.js';

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

    // Sanitize input to prevent XSS
    function sanitizeInput(input) {
        if (typeof input !== 'string') return String(input || '');
        return input.replace(/[<>"'&]/g, (match) => {
            const entityMap = {
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;',
                '&': '&amp;'
            };
            return entityMap[match];
        }).trim();
    }

    // Update user display elements
    function updateUserDisplay(userData) {
        if (sidebarName) sidebarName.textContent = sanitizeInput(userData.name);
        if (headerName) headerName.textContent = sanitizeInput(userData.name.split(' ')[0]);
        if (sidebarAvatar) sidebarAvatar.src = sanitizeInput(userData.avatar);
        if (headerAvatar) {
            const img = headerAvatar.querySelector('img');
            if (img) img.src = sanitizeInput(userData.avatar);
        }
        
        // Update profile section header
        const profileHeader = document.querySelector('.profile-info h3');
        if (profileHeader) profileHeader.textContent = sanitizeInput(userData.name);
        
        // Update profile avatar in profile section
        const profileAvatar = document.querySelector('.profile-avatar img');
        if (profileAvatar) profileAvatar.src = sanitizeInput(userData.avatar);
    }

    // Load user data
    async function loadUserData() {
        try {
            // Check fallback auth first
            let user = await authFallback.getCurrentUser();
            
            if (!user) {
                // Try Supabase as backup
                try {
                    const { data: { user: supabaseUser } } = await supabase.auth.getUser();
                    user = supabaseUser;
                } catch (error) {
                    console.log('Supabase auth check failed:', error.message);
                }
            }
            
            if (!user) {
                window.location.href = 'login.html';
                return;
            }

            // Get user profile data
            let profile = null;
            if (user.id && user.id.startsWith('user_')) {
                // Fallback user - get from localStorage
                profile = user;
            } else {
                // Supabase user - get from database
                try {
                    const { data } = await supabase
                        .from('users')
                        .select('*')
                        .eq('id', user.id)
                        .single();
                    profile = data;
                } catch (error) {
                    console.log('Could not fetch profile from Supabase:', error.message);
                }
            }

            const userData = {
                name: profile?.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
                email: user.email || profile?.email || '',
                phone: profile?.phone || '',
                age: profile?.age || '',
                location: profile?.location || '',
                gender: profile?.gender || '',
                blood_type: profile?.blood_type || '',
                avatar: profile?.avatar_url || "Pictures/portrait-african-american-woman-working-as-doctor.jpg"
            };
            
            // Store profile data globally for editing
            window.currentUserProfile = userData;

            // Update UI with real user data
            updateUserDisplay(userData);
            
            // Update profile section display
            updateProfileDisplay();
        } catch (error) {
            console.error('Error loading user data:', error.message);
        }
    }

    // Setup all event listeners
    function setupEventListeners() {
        // Sidebar toggle
        sidebarToggle.addEventListener('click', toggleSidebar);
        if (sidebarClose) {
            sidebarClose.addEventListener('click', toggleSidebar);
        }

        // Navigation (both sidebar and mobile)
        document.querySelectorAll('[data-route]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const route = btn.getAttribute('data-route');
                showSection(route);
                updateActiveNav(btn);
                
                // Close sidebar on mobile after navigation
                if (window.innerWidth <= 768) {
                    sidebar.classList.remove('open');
                    document.querySelector('.sidebar-overlay').style.display = 'none';
                }
            });
        });

        // Profile modal
        document.getElementById('edit-profile-btn').addEventListener('click', openProfileModal);
        document.getElementById('close-profile-modal').addEventListener('click', closeProfileModal);
        document.getElementById('cancel-profile').addEventListener('click', closeProfileModal);
        document.getElementById('save-profile').addEventListener('click', saveProfile);

        // Booking modal
        document.getElementById('close-booking-modal').addEventListener('click', closeBookingModal);
        document.getElementById('close-booking').addEventListener('click', closeBookingModal);
        document.getElementById('submit-booking').addEventListener('click', handleBookingSubmit);

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
        const route = activeBtn.getAttribute('data-route');
        
        // Update sidebar navigation
        document.querySelectorAll('.sidebar [data-route]').forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-route') === route) {
                btn.classList.add('active');
            }
        });
        
        // Update mobile navigation
        document.querySelectorAll('.mobile-nav [data-route]').forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-route') === route) {
                btn.classList.add('active');
            }
        });
    }

    // Profile functionality
    function openProfileModal() {
        profileModal.classList.remove('hidden');
        
        // Populate form with current user data
        if (window.currentUserProfile) {
            const profile = window.currentUserProfile;
            document.getElementById('profile-name-input').value = profile.name || '';
            document.getElementById('profile-phone-input').value = profile.phone || '';
            document.getElementById('profile-age-input').value = profile.age || '';
            document.getElementById('profile-location-input').value = profile.location || '';
            document.getElementById('profile-gender-input').value = profile.gender || '';
            document.getElementById('profile-blood-input').value = profile.blood_type || '';
        }
        
        if (window.innerWidth < 768) {
            sidebar.classList.remove('open');
            document.body.classList.remove('sidebar-open');
        }
    }

    function closeProfileModal() {
        profileModal.classList.add('hidden');
    }

    async function saveProfile() {
        try {
            const updatedProfile = {
                full_name: document.getElementById('profile-name-input').value.trim(),
                phone: document.getElementById('profile-phone-input').value.trim(),
                age: parseInt(document.getElementById('profile-age-input').value) || null,
                location: document.getElementById('profile-location-input').value,
                gender: document.getElementById('profile-gender-input').value,
                blood_type: document.getElementById('profile-blood-input').value,
                updated_at: new Date().toISOString()
            };
            
            // Get current user
            const user = await authFallback.getCurrentUser();
            
            if (user && user.id.startsWith('user_')) {
                // Update fallback user
                const users = JSON.parse(localStorage.getItem('ghanahealth_users') || '[]');
                const userIndex = users.findIndex(u => u.id === user.id);
                if (userIndex !== -1) {
                    users[userIndex] = { ...users[userIndex], ...updatedProfile };
                    localStorage.setItem('ghanahealth_users', JSON.stringify(users));
                    localStorage.setItem('ghanahealth_current_user', JSON.stringify(users[userIndex]));
                    
                    // Update global profile
                    window.currentUserProfile = { ...window.currentUserProfile, name: updatedProfile.full_name, ...updatedProfile };
                    
                    // Update UI with new data
                    updateUserDisplay(window.currentUserProfile);
                    
                    // Update profile section display
                    updateProfileDisplay();
                }
            }
            
            closeProfileModal();
            showToast('Profile updated successfully!');
        } catch (error) {
            console.error('Error saving profile:', error.message);
            showToast('Error updating profile', 'error');
        }
    }
    
    function updateProfileDisplay() {
        const profile = window.currentUserProfile;
        if (!profile) return;
        
        // Update profile section details
        const detailItems = document.querySelectorAll('.profile-details .detail-item');
        detailItems.forEach(item => {
            const icon = item.querySelector('i');
            const span = item.querySelector('span');
            
            if (icon && span) {
                if (icon.classList.contains('fa-envelope')) {
                    span.textContent = profile.email || '';
                } else if (icon.classList.contains('fa-phone')) {
                    span.textContent = profile.phone || 'Not provided';
                } else if (icon.classList.contains('fa-map-marker-alt')) {
                    span.textContent = profile.location || 'Not provided';
                } else if (icon.classList.contains('fa-birthday-cake')) {
                    span.textContent = profile.age ? `${profile.age} years old` : 'Not provided';
                }
            }
        });
    }

    function handleProfilePictureChange() {
        try {
            if (picInput && picInput.files[0]) {
                const file = picInput.files[0];
                
                // Validate file type
                if (!file.type.startsWith('image/')) {
                    showToast('Please select a valid image file', 'error');
                    return;
                }
                
                // Validate file size (max 5MB)
                if (file.size > 5 * 1024 * 1024) {
                    showToast('Image size must be less than 5MB', 'error');
                    return;
                }
                
                const fileReader = new FileReader();
                fileReader.onload = function(e) {
                    const newAvatar = e.target.result;
                    if (sidebarAvatar) sidebarAvatar.src = newAvatar;
                    if (headerAvatar) headerAvatar.src = newAvatar;
                    showToast('Profile picture updated!');
                };
                fileReader.onerror = function() {
                    showToast('Error reading image file', 'error');
                };
                fileReader.readAsDataURL(file);
            }
        } catch (error) {
            console.error('Error handling profile picture:', error.message);
            showToast('Error updating profile picture', 'error');
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
        try {
            e.preventDefault();
            
            const formData = new FormData(e.target);
            const appointmentData = {
                date: sanitizeInput(formData.get('appointment-date') || document.getElementById('appointment-date')?.value || ''),
                time: sanitizeInput(formData.get('appointment-time') || document.getElementById('appointment-time')?.value || ''),
                type: sanitizeInput(formData.get('appointment-type') || document.getElementById('appointment-type')?.value || ''),
                reason: sanitizeInput(formData.get('appointment-reason') || document.getElementById('appointment-reason')?.value || '')
            };

            // Validate form
            if (!appointmentData.date || !appointmentData.time || !appointmentData.type) {
                showToast('Please fill in all required fields', 'error');
                return;
            }

            // Validate date is not in the past
            const selectedDate = new Date(appointmentData.date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            if (selectedDate < today) {
                showToast('Please select a future date', 'error');
                return;
            }
            
            closeBookingModal();
            showToast('Appointment booked successfully!');
            
            // Add to recent activity
            addRecentActivity('Appointment Booked', `Appointment scheduled for ${appointmentData.date} at ${appointmentData.time}`);
        } catch (error) {
            console.error('Error handling booking:', error.message);
            showToast('Error booking appointment', 'error');
        }
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
        try {
            const list = document.getElementById("doctor-list");
            if (!list) return;
            
            list.innerHTML = "";
            
            const sanitizedFilter = sanitizeInput(filterText.toLowerCase());
            const sanitizedLocation = sanitizeInput(location);
            
            const filteredDoctors = doctors.filter(doc =>
                (doc.name.toLowerCase().includes(sanitizedFilter) ||
                 doc.specialty.toLowerCase().includes(sanitizedFilter)) &&
                (sanitizedLocation === "" || doc.location === sanitizedLocation)
            );

            filteredDoctors.forEach(doc => {
                const card = document.createElement("div");
                card.className = "doctor-card";
                
                // Sanitize all doctor data
                const sanitizedDoc = {
                    name: sanitizeInput(doc.name),
                    specialty: sanitizeInput(doc.specialty),
                    location: sanitizeInput(doc.location),
                    experience: sanitizeInput(doc.experience),
                    image: sanitizeInput(doc.image),
                    rating: parseFloat(doc.rating) || 0
                };
                
                card.innerHTML = `
                    <div class="doctor-info">
                        <img src="${sanitizedDoc.image}" alt="${sanitizedDoc.name}" class="doctor-avatar">
                        <div class="doctor-details">
                            <h3>${sanitizedDoc.name}</h3>
                            <p class="specialty">${sanitizedDoc.specialty}</p>
                            <p class="location"><i class="fas fa-map-marker-alt"></i> ${sanitizedDoc.location}</p>
                            <p class="experience"><i class="fas fa-clock"></i> ${sanitizedDoc.experience}</p>
                            <div class="rating">
                                <span class="stars">${'⭐'.repeat(Math.floor(sanitizedDoc.rating))}</span>
                                <span class="rating-value">${sanitizedDoc.rating}</span>
                            </div>
                        </div>
                    </div>
                    <div class="doctor-actions">
                        <button class="btn btn-primary book-btn" data-doctor="${sanitizedDoc.name}">
                            <i class="fas fa-calendar-plus"></i> Book Appointment
                        </button>
                        <button class="btn btn-outline chat-btn" data-doctor="${sanitizedDoc.name}">
                            <i class="fas fa-comments"></i> Chat
                        </button>
                    </div>
                `;
                
                // Add event listeners instead of onclick
                const bookBtn = card.querySelector('.book-btn');
                const chatBtn = card.querySelector('.chat-btn');
                
                if (bookBtn) {
                    bookBtn.addEventListener('click', () => openBooking(sanitizedDoc.name));
                }
                
                if (chatBtn) {
                    chatBtn.addEventListener('click', () => startChatWithDoctor(sanitizedDoc.name));
                }
                
                list.appendChild(card);
            });
        } catch (error) {
            console.error('Error rendering doctors:', error.message);
        }
    }

    // Chat functionality
    function startChatWithDoctor(doctorName) {
        showSection('chat');
        showToast(`Starting chat with ${doctorName}...`);
        // In a real app, this would open a chat interface
    }

    function startNewChat() {
        showSection('doctors');
        showToast('Please select a doctor to start chatting');
    }

    // Health metrics
    function addHealthMetric() {
        const metric = prompt('Enter health metric (e.g., Blood Pressure: 120/80)');
        if (metric) {
            showToast(`Health metric added: ${metric}`);
            // In a real app, this would save to the health records
        }
    }

    // Notifications
    function showNotifications() {
        // In a real app, this would show a notifications panel
        showToast('You have 3 unread notifications');
    }

    // Recent activity
    function addRecentActivity(title, description) {
        try {
            const activityList = document.querySelector('.activity-list');
            if (!activityList) return;

            const activityItem = document.createElement('div');
            activityItem.className = 'activity-item';
            
            const sanitizedTitle = sanitizeInput(title);
            const sanitizedDescription = sanitizeInput(description);
            
            activityItem.innerHTML = `
                <div class="activity-icon">
                    <i class="fas fa-calendar-check"></i>
                </div>
                <div class="activity-content">
                    <h4>${sanitizedTitle}</h4>
                    <p>${sanitizedDescription}</p>
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
        } catch (error) {
            console.error('Error adding activity:', error.message);
        }
    }

    // Weather functionality
    async function updateWeather() {
        try {
            const { weatherAPI } = await import('./weather-api.js');
            const weatherData = await weatherAPI.getCurrentWeather();
            weatherAPI.updateWeatherWidget(weatherData);
            
            // Show health recommendations
            const recommendations = weatherAPI.getHealthRecommendations(weatherData);
            if (recommendations.length > 0) {
                setTimeout(() => {
                    showWeatherAlert(recommendations[0]);
                }, 2000);
            }
        } catch (error) {
            console.error('Weather update failed:', error);
            // Fallback to random temperature
            const temperature = Math.floor(Math.random() * 15) + 20;
            if (weatherWidget) {
                weatherWidget.innerHTML = `
                    <i class="fas fa-cloud-sun"></i>
                    <span>${temperature}°C</span>
                    <small class="live-indicator"><span class="live-dot"></span></small>
                `;
            }
        }
    }
    
    function showWeatherAlert(message) {
        const alert = document.createElement('div');
        alert.className = 'weather-alert';
        alert.innerHTML = `
            <i class="fas fa-cloud-sun"></i>
            <span>${message}</span>
            <button onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;
        document.body.appendChild(alert);
        
        setTimeout(() => {
            if (alert.parentElement) alert.remove();
        }, 5000);
    }

    // Utility functions
    function showToast(message, type = 'success') {
        try {
            // Create toast notification
            const toast = document.createElement('div');
            const sanitizedType = sanitizeInput(type);
            const sanitizedMessage = sanitizeInput(message);
            
            toast.className = `toast toast-${sanitizedType}`;
            toast.innerHTML = `
                <i class="fas fa-${sanitizedType === 'success' ? 'check-circle' : sanitizedType === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                <span>${sanitizedMessage}</span>
            `;
            
            document.body.appendChild(toast);
            
            // Show toast
            setTimeout(() => toast.classList.add('show'), 100);
            
            // Remove toast
            setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => toast.remove(), 300);
            }, 3000);
        } catch (error) {
            console.error('Error showing toast:', error.message);
        }
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

    window.logout = async function() {
        if (confirm('Are you sure you want to logout?')) {
            await authFallback.signOut();
            try {
                await supabase.auth.signOut();
            } catch (error) {
                console.log('Supabase signout failed:', error.message);
            }
            window.location.href = 'login.html';
        }
    };

    // New functionality functions
    window.openHealthModal = function() {
        document.getElementById('health-modal').classList.remove('hidden');
    };

    window.viewRecord = function(type) {
        showToast(`Viewing ${type} records...`);
    };

    window.startVideoCall = function() {
        showToast('Starting video call...', 'info');
    };

    window.startVoiceCall = function() {
        showToast('Starting voice call...', 'info');
    };

    window.openSymptomChecker = function() {
        document.getElementById('symptom-modal').classList.remove('hidden');
    };

    window.viewPrescriptions = function() {
        showToast('Loading prescriptions...', 'info');
    };
    
    window.addPrescription = function() {
        const prescription = prompt('Enter prescription details:');
        if (prescription) {
            showToast('Prescription added successfully!');
            addRecentActivity('Prescription Added', prescription);
        }
    };
    
    window.orderMedication = function(medicationName, price) {
        if (confirm(`Add ${medicationName} to cart for ₵${price}?`)) {
            showToast(`${medicationName} added to cart!`);
            addRecentActivity('Medication Ordered', `${medicationName} - ₵${price}`);
        }
    };
    
    window.uploadPrescription = function() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*,.pdf';
        input.onchange = function(e) {
            const file = e.target.files[0];
            if (file) {
                showToast('Prescription uploaded successfully!');
                addRecentActivity('Prescription Uploaded', file.name);
            }
        };
        input.click();
    };
    
    window.viewMedication = function(medicationName) {
        showToast(`Viewing details for ${medicationName}...`, 'info');
    };
    
    window.trackOrder = function(orderNumber) {
        showToast(`Tracking order ${orderNumber}...`, 'info');
    };
    
    window.showNearbyPharmacies = function() {
        showToast('Finding nearby pharmacies...', 'info');
    };
    
    // Voice Call Functions
    window.startVoiceCall = function() {
        document.getElementById('voice-call-modal').classList.remove('hidden');
        simulateCall();
    };
    
    window.closeVoiceCall = function() {
        document.getElementById('voice-call-modal').classList.add('hidden');
        stopCallTimer();
    };
    
    window.toggleMute = function() {
        const btn = document.querySelector('.mute-btn i');
        btn.classList.toggle('fa-microphone');
        btn.classList.toggle('fa-microphone-slash');
        showToast(btn.classList.contains('fa-microphone-slash') ? 'Muted' : 'Unmuted');
    };
    
    window.toggleSpeaker = function() {
        const btn = document.querySelector('.speaker-btn i');
        btn.classList.toggle('fa-volume-up');
        btn.classList.toggle('fa-volume-down');
        showToast(btn.classList.contains('fa-volume-up') ? 'Speaker On' : 'Speaker Off');
    };
    
    window.endCall = function() {
        showToast('Call ended');
        closeVoiceCall();
    };
    
    let callTimer;
    let callSeconds = 0;
    
    function simulateCall() {
        const callState = document.querySelector('.call-state');
        const timer = document.querySelector('.call-timer');
        
        setTimeout(() => {
            callState.textContent = 'Connected';
            callState.style.color = '#28a745';
            startCallTimer();
        }, 3000);
    }
    
    function startCallTimer() {
        callTimer = setInterval(() => {
            callSeconds++;
            const minutes = Math.floor(callSeconds / 60);
            const seconds = callSeconds % 60;
            document.querySelector('.call-timer').textContent = 
                `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }, 1000);
    }
    
    function stopCallTimer() {
        if (callTimer) {
            clearInterval(callTimer);
            callSeconds = 0;
        }
    }
    
    // E-Prescription Functions
    window.viewPrescriptions = function() {
        document.getElementById('prescription-modal').classList.remove('hidden');
    };
    
    window.closePrescription = function() {
        document.getElementById('prescription-modal').classList.add('hidden');
    };
    
    window.downloadPrescription = function() {
        showToast('Prescription downloaded successfully!');
    };
    
    window.orderPrescription = function() {
        showToast('Redirecting to pharmacy...');
        setTimeout(() => showSection('pharmacy'), 1000);
    };
    
    // Enhanced Symptom Checker Functions
    window.openSymptomChecker = function() {
        document.getElementById('symptom-checker-modal').classList.remove('hidden');
        showStep(1);
    };
    
    window.closeSymptomChecker = function() {
        document.getElementById('symptom-checker-modal').classList.add('hidden');
        resetSymptomChecker();
    };
    
    window.nextStep = function(stepNumber) {
        const selectedSymptoms = document.querySelectorAll('input[name="symptoms"]:checked');
        if (stepNumber === 2 && selectedSymptoms.length === 0) {
            showToast('Please select at least one symptom', 'error');
            return;
        }
        showStep(stepNumber);
    };
    
    window.prevStep = function(stepNumber) {
        showStep(stepNumber);
    };
    
    window.analyzeSymptoms = function() {
        const duration = document.querySelector('input[name="duration"]:checked');
        if (!duration) {
            showToast('Please select symptom duration', 'error');
            return;
        }
        showStep(3);
    };
    
    window.restartChecker = function() {
        resetSymptomChecker();
        showStep(1);
    };
    
    window.bookConsultation = function() {
        closeSymptomChecker();
        showSection('doctors');
        showToast('Please select a doctor for consultation');
    };
    
    function showStep(stepNumber) {
        document.querySelectorAll('.step').forEach(step => step.classList.remove('active'));
        document.getElementById(`step-${stepNumber}`).classList.add('active');
    }
    
    function resetSymptomChecker() {
        document.querySelectorAll('input[name="symptoms"]').forEach(input => input.checked = false);
        document.querySelectorAll('input[name="duration"]').forEach(input => input.checked = false);
    }
    
    window.sendQuickReply = function() {
        const input = document.getElementById('quick-reply-input');
        const message = input.value.trim();
        if (message) {
            showToast('Message sent!', 'success');
            input.value = '';
            
            // Simulate typing indicator
            setTimeout(() => {
                const typingIndicator = document.querySelector('.typing-indicator');
                if (typingIndicator) {
                    typingIndicator.classList.remove('hidden');
                    setTimeout(() => {
                        typingIndicator.classList.add('hidden');
                        addNewMessage('Dr. Efua Asante', 'Thank you for your message. I\'ll review and get back to you.');
                    }, 2000);
                }
            }, 1000);
        }
    };
    
    function addNewMessage(sender, content) {
        const messagesList = document.getElementById('messages-list');
        const messageCard = document.createElement('div');
        messageCard.className = 'message-card unread real-time-card';
        messageCard.innerHTML = `
            <div class="message-avatar">
                <img src="Pictures/man-working-as-paediatrician.jpg" alt="${sender}">
                <div class="online-status"></div>
            </div>
            <div class="message-content">
                <div class="message-header">
                    <h3>${sender}</h3>
                    <span class="message-time">Just now</span>
                </div>
                <p>${content}</p>
            </div>
            <div class="message-status">
                <span class="unread-badge">1</span>
            </div>
        `;
        
        messagesList.insertBefore(messageCard, messagesList.firstChild);
        
        // Update notification count
        updateNotificationCount(1);
    }
    
    function updateNotificationCount(increment = 0) {
        const badge = document.querySelector('.notification-badge');
        if (badge) {
            const current = parseInt(badge.textContent) || 0;
            const newCount = current + increment;
            badge.textContent = newCount;
            badge.style.display = newCount > 0 ? 'block' : 'none';
        }
    }

    // Enhanced event listeners
    function setupEnhancedEventListeners() {
        // Health modal
        const healthModal = document.getElementById('health-modal');
        const closeHealthModal = document.getElementById('close-health-modal');
        const saveHealthRecord = document.getElementById('save-health-record');
        
        if (closeHealthModal) {
            closeHealthModal.addEventListener('click', () => {
                healthModal.classList.add('hidden');
            });
        }
        
        if (saveHealthRecord) {
            saveHealthRecord.addEventListener('click', () => {
                const form = document.getElementById('health-record-form');
                const formData = new FormData(form);
                const recordType = formData.get('record-type');
                const title = formData.get('record-title');
                
                if (recordType && title) {
                    showToast('Health record saved successfully!');
                    healthModal.classList.add('hidden');
                    form.reset();
                } else {
                    showToast('Please fill in required fields', 'error');
                }
            });
        }
        
        // Symptom checker modal
        const symptomModal = document.getElementById('symptom-modal');
        const closeSymptomModal = document.getElementById('close-symptom-modal');
        const analyzeSymptoms = document.getElementById('analyze-symptoms');
        const bookConsultation = document.getElementById('book-consultation');
        
        if (closeSymptomModal) {
            closeSymptomModal.addEventListener('click', () => {
                symptomModal.classList.add('hidden');
            });
        }
        
        if (analyzeSymptoms) {
            analyzeSymptoms.addEventListener('click', () => {
                const checkedSymptoms = document.querySelectorAll('input[name="symptoms"]:checked');
                if (checkedSymptoms.length > 0) {
                    const results = document.getElementById('symptom-results');
                    const conditionList = results.querySelector('.condition-list');
                    
                    // Simple symptom analysis
                    const symptoms = Array.from(checkedSymptoms).map(cb => cb.value);
                    let conditions = [];
                    
                    if (symptoms.includes('fever') && symptoms.includes('cough')) {
                        conditions.push('Common Cold or Flu');
                    }
                    if (symptoms.includes('chest-pain')) {
                        conditions.push('Possible Heart or Lung Issue');
                    }
                    if (symptoms.includes('headache') && symptoms.includes('fatigue')) {
                        conditions.push('Stress or Dehydration');
                    }
                    
                    if (conditions.length === 0) {
                        conditions.push('General Health Concern');
                    }
                    
                    conditionList.innerHTML = conditions.map(condition => 
                        `<div class="condition-item">• ${condition}</div>`
                    ).join('');
                    
                    results.classList.remove('hidden');
                } else {
                    showToast('Please select at least one symptom', 'error');
                }
            });
        }
        
        if (bookConsultation) {
            bookConsultation.addEventListener('click', () => {
                symptomModal.classList.add('hidden');
                showSection('doctors');
                showToast('Please select a doctor for consultation');
            });
        }
        
        // Enhanced sidebar for mobile
        const overlay = document.createElement('div');
        overlay.className = 'sidebar-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            z-index: 999;
            display: none;
        `;
        document.body.appendChild(overlay);
        
        overlay.addEventListener('click', () => {
            sidebar.classList.remove('open');
            overlay.style.display = 'none';
        });
        
        // Update sidebar toggle for mobile
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.add('open');
            if (window.innerWidth <= 768) {
                overlay.style.display = 'block';
            }
        });
        
        if (sidebarClose) {
            sidebarClose.addEventListener('click', () => {
                sidebar.classList.remove('open');
                overlay.style.display = 'none';
            });
        }
        
        // Quick reply enter key support
        const quickReplyInput = document.getElementById('quick-reply-input');
        if (quickReplyInput) {
            quickReplyInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    sendQuickReply();
                }
            });
        }
        
        // Real-time message time updates
        setInterval(() => {
            updateMessageTimes();
        }, 60000); // Update every minute
    }
    
    function updateMessageTimes() {
        const timeElements = document.querySelectorAll('.message-time[data-time]');
        timeElements.forEach(element => {
            const hours = parseInt(element.dataset.time);
            const newHours = hours + 1;
            element.dataset.time = newHours;
            
            if (newHours < 24) {
                element.textContent = `${newHours} hour${newHours > 1 ? 's' : ''} ago`;
            } else {
                const days = Math.floor(newHours / 24);
                element.textContent = `${days} day${days > 1 ? 's' : ''} ago`;
            }
        });
    }
    
    // Real-time data simulation
    function startRealTimeUpdates() {
        // Update health metrics every 5 seconds
        setInterval(() => {
            updateHealthMetrics();
        }, 5000);
        
        // Update weather every 30 seconds
        setInterval(() => {
            updateWeatherReal();
        }, 30000);
        
        // Update notifications every 10 seconds
        setInterval(() => {
            updateNotifications();
        }, 10000);
        
        // Update activity feed every 15 seconds
        setInterval(() => {
            updateActivityFeed();
        }, 15000);
    }
    
    function updateHealthMetrics() {
        // Simulate real-time blood pressure
        const bpSystolic = 115 + Math.floor(Math.random() * 20);
        const bpDiastolic = 75 + Math.floor(Math.random() * 15);
        const bpElement = document.getElementById('bp-value');
        if (bpElement) {
            bpElement.textContent = `${bpSystolic}/${bpDiastolic}`;
            
            // Add flash effect
            bpElement.style.background = '#e3f2fd';
            setTimeout(() => {
                bpElement.style.background = 'transparent';
            }, 500);
        }
        
        // Simulate real-time heart rate
        const heartRate = 65 + Math.floor(Math.random() * 20);
        const hrElement = document.getElementById('hr-value');
        if (hrElement) {
            hrElement.textContent = `${heartRate} bpm`;
            
            // Add flash effect
            hrElement.style.background = '#e8f5e8';
            setTimeout(() => {
                hrElement.style.background = 'transparent';
            }, 500);
        }
    }
    
    async function updateWeatherReal() {
        try {
            const { weatherAPI } = await import('./weather-api.js');
            const weatherData = await weatherAPI.getCurrentWeather();
            weatherAPI.updateWeatherWidget(weatherData);
        } catch (error) {
            const temps = [22, 23, 24, 25, 26, 27, 28];
            const temp = temps[Math.floor(Math.random() * temps.length)];
            const tempElement = document.getElementById('temp-display');
            if (tempElement) {
                tempElement.textContent = `${temp}°C`;
            }
        }
    }
    
    function updateNotifications() {
        const notificationBtn = document.getElementById('notification-btn');
        const badge = notificationBtn?.querySelector('.notification-badge');
        if (badge) {
            const currentCount = parseInt(badge.textContent) || 0;
            const newCount = Math.max(0, currentCount + Math.floor(Math.random() * 3) - 1);
            badge.textContent = newCount;
            badge.style.display = newCount > 0 ? 'block' : 'none';
        }
    }
    
    function updateActivityFeed() {
        const activities = [
            'New message from Dr. Asante',
            'Appointment reminder: Tomorrow 10 AM',
            'Health tip: Stay hydrated',
            'Lab results available',
            'Medication reminder'
        ];
        
        if (Math.random() > 0.7) {
            const activity = activities[Math.floor(Math.random() * activities.length)];
            addRecentActivity('System Update', activity);
        }
    }
    
    // Enhanced responsive handling
    function handleResponsiveLayout() {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.querySelector('.sidebar-overlay');
        
        function checkScreenSize() {
            if (window.innerWidth > 768) {
                sidebar?.classList.remove('open');
                if (overlay) overlay.style.display = 'none';
            }
        }
        
        window.addEventListener('resize', checkScreenSize);
        checkScreenSize();
    }
    
    // Initialize enhanced features
    function initEnhancedDashboard() {
        setupEnhancedEventListeners();
        startRealTimeUpdates();
        handleResponsiveLayout();
        
        // Initialize real-time features
        setTimeout(() => {
            // Simulate random online status changes
            setInterval(() => {
                const onlineStatuses = document.querySelectorAll('.online-status');
                onlineStatuses.forEach(status => {
                    if (Math.random() > 0.8) {
                        status.classList.toggle('offline');
                    }
                });
            }, 30000);
        }, 5000);
        
        // Simple chart simulation
        setTimeout(() => {
            const bpChart = document.getElementById('bp-chart');
            const weightChart = document.getElementById('weight-chart');
            
            if (bpChart) {
                const ctx = bpChart.getContext('2d');
                ctx.fillStyle = '#007bff';
                ctx.fillRect(10, 50, 30, 80);
                ctx.fillRect(50, 40, 30, 90);
                ctx.fillRect(90, 60, 30, 70);
                ctx.fillRect(130, 45, 30, 85);
                ctx.fillText('BP Trend', 10, 20);
            }
            
            if (weightChart) {
                const ctx = weightChart.getContext('2d');
                ctx.strokeStyle = '#28a745';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(10, 100);
                ctx.lineTo(80, 80);
                ctx.lineTo(150, 70);
                ctx.lineTo(220, 65);
                ctx.stroke();
                ctx.fillText('Weight Progress', 10, 20);
            }
        }, 1000);
    }

    // Initialize dashboard
    initDashboard();
    initEnhancedDashboard();
    
    // Load profile data after initialization
    setTimeout(() => {
        if (typeof updateProfileDisplay === 'function') {
            updateProfileDisplay();
        }
    }, 500);
});
