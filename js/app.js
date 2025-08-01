// KamenRun App - Enhanced JavaScript
class KamenRunApp {
    constructor() {
        this.currentData = null;
        this.phaseSelect = null;
        this.weekSelect = null;
        this.scheduleContainer = null;
        this.progressBar = null;
        this.motivationElement = null;
        this.notificationTime = localStorage.getItem('notificationTime') || '08:00';
        
        this.scheduleData = [
            // Fase 1: Zero to 5K (10 Weeks)
            {
                phaseName: "Fase 1: Zero to 5K",
                weeks: Array.from({ length: 10 }, (_, i) => {
                    let runWalkDesc = `Lari ${Math.floor(i/2) + 1} menit, Jalan ${Math.max(1, 4 - Math.floor(i/2))} menit. Ulangi 6-8x.`;
                    if(i >= 8) runWalkDesc = `Lari 5 menit, Jalan 1 menit. Ulangi 5x.`
                    return {
                        weekNumber: i + 1,
                        days: [
                            { day: "Senin", task: "Istirahat", done: false, icon: "fas fa-bed", isRest: true },
                            { day: "Selasa", task: `Lari/Jalan: ${runWalkDesc}`, done: false, icon: "fas fa-running", isRest: false },
                            { day: "Rabu", task: "Istirahat atau Cross Training (Yoga, Sepeda)", done: false, icon: "fas fa-dumbbell", isRest: true },
                            { day: "Kamis", task: `Lari/Jalan: ${runWalkDesc}`, done: false, icon: "fas fa-running", isRest: false },
                            { day: "Jumat", task: "Istirahat", done: false, icon: "fas fa-bed", isRest: true },
                            { day: "Sabtu", task: `Lari Jarak Jauh (Pemula): ${2 + i * 0.5} km`, done: false, icon: "fas fa-route", isRest: false },
                            { day: "Minggu", task: "Istirahat atau Strength Training (Squat, Lunges)", done: false, icon: "fas fa-dumbbell", isRest: true },
                        ]
                    }
                })
            },
            // Fase 2: 5K to 10K (10 Weeks)
            {
                phaseName: "Fase 2: 5K to 10K",
                weeks: Array.from({ length: 10 }, (_, i) => ({
                    weekNumber: i + 1,
                    days: [
                        { day: "Senin", task: "Istirahat", done: false, icon: "fas fa-bed", isRest: true },
                        { day: "Selasa", task: `Easy Run: ${3 + Math.floor(i/2)} km`, done: false, icon: "fas fa-running", isRest: false },
                        { day: "Rabu", task: "Strength Training atau Istirahat", done: false, icon: "fas fa-dumbbell", isRest: true },
                        { day: "Kamis", task: `Lari Variasi Pace: ${4 + Math.floor(i/2)} km`, done: false, icon: "fas fa-tachometer-alt", isRest: false },
                        { day: "Jumat", task: "Istirahat", done: false, icon: "fas fa-bed", isRest: true },
                        { day: "Sabtu", task: `Long Run: ${5 + i} km`, done: false, icon: "fas fa-route", isRest: false },
                        { day: "Minggu", task: "Istirahat atau Active Recovery (Jalan santai)", done: false, icon: "fas fa-walking", isRest: true },
                    ]
                }))
            },
            // Fase 3: 10K to Half Marathon (16 Weeks)
            {
                phaseName: "Fase 3: 10K to Half Marathon",
                weeks: Array.from({ length: 16 }, (_, i) => ({
                    weekNumber: i + 1,
                    days: [
                        { day: "Senin", task: "Istirahat", done: false, icon: "fas fa-bed", isRest: true },
                        { day: "Selasa", task: `Easy Run: ${5 + Math.floor(i/4)} km`, done: false, icon: "fas fa-running", isRest: false },
                        { day: "Rabu", task: "Strength Training (Wajib)", done: false, icon: "fas fa-dumbbell", isRest: false },
                        { day: "Kamis", task: `Tempo Run: ${6 + Math.floor(i/3)} km total`, done: false, icon: "fas fa-tachometer-alt", isRest: false },
                        { day: "Jumat", task: "Istirahat", done: false, icon: "fas fa-bed", isRest: true },
                        { day: "Sabtu", task: `Long Run: ${10 + i} km`.concat(i===15 ? ' (Taper Week, lari 8 km saja!)' : ''), done: false, icon: "fas fa-route", isRest: false },
                        { day: "Minggu", task: "Istirahat Total", done: false, icon: "fas fa-bed", isRest: true },
                    ]
                }))
            },
        ];

        this.motivationalQuotes = [
            "Langkah pertama adalah yang tersulit. Kamu sudah melewatinya! 💪",
            "Hari ini sakit, besok jadi kuat. Terus berlari! 🏃‍♂️",
            "Jangan ragu saat lelah, ragulah saat kamu berhenti. 🎯",
            "Satu-satunya lari yang buruk adalah yang tidak kamu lakukan. ✨",
            "Berlari adalah tentang dirimu sendiri. Kamu vs Kamu. 🔥",
            "Konsistensi lebih penting dari kecepatan. 📈",
            "Kamu lebih kuat dari yang kamu kira. Buktikan hari ini! 💯",
            "Setiap kilometer adalah pencapaian. 🏆",
            "Jangan biarkan pikiranmu menghentikan kakimu. 🧠"
        ];

        this.init();
    }

    async init() {
        await this.initializePWA();
        this.initializeElements();
        this.loadData();
        this.setupEventListeners();
        this.populatePhaseSelect();
        this.populateWeekSelect(0);
        this.renderSchedule(0, 0);
        this.showMotivation();
        this.setupNotifications();
        this.checkNetworkStatus();
    }

    initializeElements() {
        this.phaseSelect = document.getElementById('phase-select');
        this.weekSelect = document.getElementById('week-select');
        this.scheduleContainer = document.getElementById('schedule-container');
        this.progressBar = document.getElementById('progressBar');
        this.motivationElement = document.getElementById('motivation');
    }

    loadData() {
        const savedData = localStorage.getItem('runningScheduleData');
        if (savedData) {
            this.currentData = JSON.parse(savedData);
        } else {
            this.currentData = JSON.parse(JSON.stringify(this.scheduleData)); // Deep copy
        }
    }

    saveData() {
        localStorage.setItem('runningScheduleData', JSON.stringify(this.currentData));
    }

    populatePhaseSelect() {
        this.currentData.forEach((phase, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = phase.phaseName;
            this.phaseSelect.appendChild(option);
        });
    }

    populateWeekSelect(phaseIndex) {
        this.weekSelect.innerHTML = '';
        const phase = this.currentData[phaseIndex];
        phase.weeks.forEach((week, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = `Minggu ${week.weekNumber}`;
            this.weekSelect.appendChild(option);
        });
    }

    renderSchedule(phaseIndex, weekIndex) {
        this.scheduleContainer.innerHTML = '';
        const week = this.currentData[phaseIndex].weeks[weekIndex];
        
        week.days.forEach((day, dayIndex) => {
            const dayCard = document.createElement('div');
            dayCard.className = `day-card fade-in ${day.isRest ? 'rest-day' : ''}`;
            
            if (day.done) {
                dayCard.classList.add('completed');
            }

            dayCard.innerHTML = `
                <div class="day-header">
                    <h4 class="day-title">${day.day}</h4>
                    <i class="day-icon ${day.icon}"></i>
                </div>
                <div class="task-container">
                    <input type="checkbox" class="custom-checkbox" id="task-${dayIndex}" ${day.done ? 'checked' : ''}>
                    <label for="task-${dayIndex}" class="task-text">${day.task}</label>
                </div>
            `;

            const checkbox = dayCard.querySelector('input[type="checkbox"]');
            checkbox.addEventListener('change', () => {
                this.toggleTaskStatus(phaseIndex, weekIndex, dayIndex);
                dayCard.classList.toggle('completed');
                this.showToast(day.done ? 'Tugas selesai! 🎉' : 'Tugas dibatalkan', day.done ? 'success' : 'info');
            });
            
            this.scheduleContainer.appendChild(dayCard);
        });
        
        this.updateProgress(phaseIndex);
    }

    toggleTaskStatus(phaseIndex, weekIndex, dayIndex) {
        this.currentData[phaseIndex].weeks[weekIndex].days[dayIndex].done = !this.currentData[phaseIndex].weeks[weekIndex].days[dayIndex].done;
        this.saveData();
        this.updateProgress(phaseIndex);
    }

    updateProgress(phaseIndex) {
        const phase = this.currentData[phaseIndex];
        let totalTasks = 0;
        let completedTasks = 0;

        phase.weeks.forEach(week => {
            week.days.forEach(day => {
                if (!day.isRest || !day.task.toLowerCase().includes('istirahat')) {
                    totalTasks++;
                    if (day.done) {
                        completedTasks++;
                    }
                }
            });
        });

        const percentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
        this.progressBar.style.width = `${percentage}%`;
        this.progressBar.textContent = `${percentage}%`;
        
        // Update progress in local storage for PWA
        localStorage.setItem('currentProgress', percentage);
    }

    showMotivation() {
        const randomIndex = Math.floor(Math.random() * this.motivationalQuotes.length);
        this.motivationElement.textContent = this.motivationalQuotes[randomIndex];
    }

    setupEventListeners() {
        this.phaseSelect.addEventListener('change', (e) => {
            const newPhaseIndex = e.target.value;
            this.populateWeekSelect(newPhaseIndex);
            this.renderSchedule(newPhaseIndex, 0);
        });

        this.weekSelect.addEventListener('change', (e) => {
            const newWeekIndex = e.target.value;
            this.renderSchedule(this.phaseSelect.value, newWeekIndex);
        });

        // Notification time setup
        const notificationTimeInput = document.getElementById('notification-time');
        const saveNotificationBtn = document.getElementById('save-notification');
        
        if (notificationTimeInput) {
            notificationTimeInput.value = this.notificationTime;
            
            saveNotificationBtn.addEventListener('click', () => {
                this.notificationTime = notificationTimeInput.value;
                localStorage.setItem('notificationTime', this.notificationTime);
                this.setupNotifications();
                this.showToast('Waktu notifikasi berhasil disimpan! 🔔', 'success');
            });
        }
    }

    // PWA functionality
    async initializePWA() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('./sw.js');
                console.log('Service Worker registered successfully:', registration);
            } catch (error) {
                console.log('Service Worker registration failed:', error);
            }
        }

        // Install prompt
        this.setupInstallPrompt();
    }

    setupInstallPrompt() {
        let deferredPrompt;
        
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            
            const installPrompt = document.createElement('div');
            installPrompt.className = 'install-prompt';
            installPrompt.innerHTML = `
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <h6 class="mb-1">Install KamenRun</h6>
                        <small class="text-muted">Get the full app experience</small>
                    </div>
                    <div>
                        <button class="btn btn-primary btn-sm me-2" id="install-btn">Install</button>
                        <button class="btn btn-outline-secondary btn-sm" id="dismiss-btn">×</button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(installPrompt);
            installPrompt.style.display = 'block';
            
            document.getElementById('install-btn').addEventListener('click', async () => {
                deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;
                if (outcome === 'accepted') {
                    console.log('User accepted the install prompt');
                }
                installPrompt.remove();
                deferredPrompt = null;
            });
            
            document.getElementById('dismiss-btn').addEventListener('click', () => {
                installPrompt.remove();
            });
        });
    }

    // Notification system
    async setupNotifications() {
        if ('Notification' in window && 'serviceWorker' in navigator) {
            const permission = await Notification.requestPermission();
            
            if (permission === 'granted') {
                this.scheduleNotification();
            }
        }
    }

    scheduleNotification() {
        // Clear existing notifications
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.ready.then(registration => {
                registration.getNotifications().then(notifications => {
                    notifications.forEach(notification => notification.close());
                });
            });
        }

        const now = new Date();
        const [hours, minutes] = this.notificationTime.split(':');
        const notificationTime = new Date();
        notificationTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

        // If time has passed today, schedule for tomorrow
        if (notificationTime <= now) {
            notificationTime.setDate(notificationTime.getDate() + 1);
        }

        const timeUntilNotification = notificationTime.getTime() - now.getTime();

        setTimeout(() => {
            this.sendNotification();
            // Schedule daily notifications
            setInterval(() => {
                this.sendNotification();
            }, 24 * 60 * 60 * 1000); // 24 hours
        }, timeUntilNotification);
    }

    sendNotification() {
        const randomQuote = this.motivationalQuotes[Math.floor(Math.random() * this.motivationalQuotes.length)];
        
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.ready.then(registration => {
                registration.showNotification('KamenRun - Waktunya Berlari! 🏃‍♂️', {
                    body: randomQuote,
                    icon: './icons/icon-192x192.png',
                    badge: './icons/icon-72x72.png',
                    tag: 'daily-reminder',
                    renotify: true,
                    actions: [
                        {
                            action: 'view',
                            title: 'Lihat Jadwal'
                        },
                        {
                            action: 'dismiss',
                            title: 'Tutup'
                        }
                    ]
                });
            });
        }
    }

    // Network status monitoring
    checkNetworkStatus() {
        const updateNetworkStatus = () => {
            const offlineIndicator = document.querySelector('.offline-indicator');
            if (!navigator.onLine) {
                offlineIndicator.style.display = 'block';
                offlineIndicator.textContent = '⚠️ Anda sedang offline. Data akan disinkronkan saat online kembali.';
            } else {
                offlineIndicator.style.display = 'none';
            }
        };

        window.addEventListener('online', updateNetworkStatus);
        window.addEventListener('offline', updateNetworkStatus);
        updateNetworkStatus();
    }

    // Toast notifications
    showToast(message, type = 'info') {
        const toastContainer = document.getElementById('toast-container') || this.createToastContainer();
        
        const toast = document.createElement('div');
        toast.className = `toast toast-custom align-items-center text-white bg-${type === 'success' ? 'success' : type === 'error' ? 'danger' : 'info'} border-0`;
        toast.setAttribute('role', 'alert');
        
        toast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">${message}</div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        `;
        
        toastContainer.appendChild(toast);
        
        const bsToast = new bootstrap.Toast(toast, { delay: 3000 });
        bsToast.show();
        
        toast.addEventListener('hidden.bs.toast', () => {
            toast.remove();
        });
    }

    createToastContainer() {
        const container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container position-fixed top-0 end-0 p-3';
        container.style.zIndex = '1055';
        document.body.appendChild(container);
        return container;
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new KamenRunApp();
});

// Handle service worker messages
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', event => {
        if (event.data && event.data.type === 'NOTIFICATION_CLICK') {
            // Handle notification click
            window.focus();
        }
    });
} 