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

        // QR Code Export/Import setup
        const exportQRBtn = document.getElementById('export-qr-btn');
        const importQRBtn = document.getElementById('import-qr-btn');
        
        if (exportQRBtn) {
            exportQRBtn.addEventListener('click', () => {
                this.exportDataAsQR();
            });
        }
        
        if (importQRBtn) {
            importQRBtn.addEventListener('click', () => {
                this.showQRModal('', 'import');
            });
        }

        // Additional data management buttons
        const resetProgressBtn = document.getElementById('reset-progress-btn');
        const backupDataBtn = document.getElementById('backup-data-btn');
        const viewStorageBtn = document.getElementById('view-storage-btn');
        const testNotificationBtn = document.getElementById('test-notification');
        
        if (resetProgressBtn) {
            resetProgressBtn.addEventListener('click', () => {
                this.resetProgress();
            });
        }
        
        if (backupDataBtn) {
            backupDataBtn.addEventListener('click', () => {
                this.createBackup();
            });
        }
        
        if (viewStorageBtn) {
            viewStorageBtn.addEventListener('click', () => {
                this.showStorageInfo();
            });
        }
        
        if (testNotificationBtn) {
            testNotificationBtn.addEventListener('click', () => {
                this.sendTestNotification();
            });
        }

        // Update notification status
        this.updateNotificationStatus();
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

    // Enhanced notification system with background support
    async setupNotifications() {
        if ('Notification' in window && 'serviceWorker' in navigator) {
            const permission = await Notification.requestPermission();
            
            if (permission === 'granted') {
                await this.scheduleBackgroundNotification();
            }
        }
    }

    async scheduleBackgroundNotification() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.ready;
                
                // Send notification schedule to service worker
                if (registration.active) {
                    registration.active.postMessage({
                        type: 'SCHEDULE_NOTIFICATION',
                        time: this.notificationTime,
                        isEnabled: true
                    });
                }
                
                // Register periodic background sync if supported
                if ('periodicSync' in registration) {
                    try {
                        await registration.periodicSync.register('daily-motivation', {
                            minInterval: 24 * 60 * 60 * 1000 // 24 hours
                        });
                        console.log('Periodic background sync registered');
                    } catch (error) {
                        console.log('Periodic background sync not supported:', error);
                    }
                }
            } catch (error) {
                console.error('Failed to schedule background notification:', error);
                // Fallback to direct scheduling
                this.scheduleDirectNotification();
            }
        }
    }

    // Fallback notification scheduling for when service worker isn't available
    scheduleDirectNotification() {
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
            this.sendDirectNotification();
            // Schedule daily notifications
            setInterval(() => {
                this.sendDirectNotification();
            }, 24 * 60 * 60 * 1000); // 24 hours
        }, timeUntilNotification);
    }

    // Direct notification for fallback
    sendDirectNotification() {
        const randomQuote = this.motivationalQuotes[Math.floor(Math.random() * this.motivationalQuotes.length)];
        
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('KamenRun - Waktunya Berlari! 🏃‍♂️', {
                body: randomQuote,
                icon: './icons/manifest-icon-192.maskable.png',
                badge: './icons/icon-72x72.png',
                tag: 'daily-reminder'
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

    // Optimized QR Code Data Transfer System (only user modifications)
    async exportDataAsQR() {
        try {
            // Extract only user-modified data (completion status)
            const userProgress = this.extractUserProgress();
            
            const exportData = {
                version: '2.0.0', // Updated version for new format
                timestamp: new Date().toISOString(),
                data: {
                    progress: userProgress,
                    notificationTime: this.notificationTime,
                    currentProgress: localStorage.getItem('currentProgress') || '0'
                }
            };

            const dataString = JSON.stringify(exportData);
            console.log('Export data size:', dataString.length, 'characters');
            
            // This should be much smaller now
            await this.generateQRCode(dataString);
            this.showToast(`Data berhasil diexport! (${dataString.length} karakter)`, 'success');
            
        } catch (error) {
            console.error('Export failed:', error);
            this.showToast('Gagal mengexport data: ' + error.message, 'error');
        }
    }

    // Extract only the completion status and essential identifiers
    extractUserProgress() {
        const progress = {};
        
        this.currentData.forEach((phase, phaseIndex) => {
            const phaseKey = `p${phaseIndex}`; // p0, p1, p2
            progress[phaseKey] = {};
            
            phase.weeks.forEach((week, weekIndex) => {
                const weekKey = `w${weekIndex}`; // w0, w1, w2...
                
                // Only store days that have been marked as done
                const completedDays = week.days
                    .map((day, dayIndex) => day.done ? dayIndex : null)
                    .filter(index => index !== null);
                
                if (completedDays.length > 0) {
                    progress[phaseKey][weekKey] = completedDays;
                }
            });
            
            // Remove phases with no progress
            if (Object.keys(progress[phaseKey]).length === 0) {
                delete progress[phaseKey];
            }
        });
        
        return progress;
    }

    async generateQRCode(dataString) {
        // Create QR code using QR Server API (free service)
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(dataString)}`;
        
        // Show QR code modal
        this.showQRModal(qrUrl, 'export');
    }

    showQRModal(qrUrl, type = 'export') {
        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.id = 'qrModal';
        modal.setAttribute('tabindex', '-1');
        
        const modalContent = type === 'export' ? `
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">
                            <i class="fas fa-qrcode me-2"></i>
                            Export Data QR Code
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body text-center">
                        <p class="mb-3">Scan QR code ini dengan browser lain untuk import data:</p>
                        <img src="${qrUrl}" alt="QR Code" class="img-fluid mb-3" style="max-width: 300px;">
                        <div class="alert alert-info">
                            <i class="fas fa-info-circle me-2"></i>
                            <small>QR code berisi semua data progress Anda. Simpan screenshot jika diperlukan.</small>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Tutup</button>
                        <button type="button" class="btn btn-primary" onclick="window.print()">
                            <i class="fas fa-print me-2"></i>Print QR Code
                        </button>
                    </div>
                </div>
            </div>
        ` : `
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">
                            <i class="fas fa-camera me-2"></i>
                            Import Data dari QR Code
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="mb-3">
                            <label class="form-label">Pilih metode import:</label>
                            <div class="btn-group w-100" role="group">
                                <button type="button" class="btn btn-outline-primary" id="camera-scan-btn">
                                    <i class="fas fa-camera me-2"></i>Scan dengan Kamera
                                </button>
                                <button type="button" class="btn btn-outline-primary" id="file-upload-btn">
                                    <i class="fas fa-upload me-2"></i>Upload Gambar
                                </button>
                            </div>
                        </div>
                        
                        <div id="camera-container" style="display: none;">
                            <div class="position-relative">
                                <video id="qr-video" class="w-100 mb-3" style="max-height: 300px; border-radius: 8px;"></video>
                                <div class="position-absolute top-50 start-50 translate-middle" style="pointer-events: none;">
                                    <div class="border border-3 border-success rounded" style="width: 200px; height: 200px; opacity: 0.7;">
                                        <div class="position-absolute top-0 start-0 border-top border-start border-success" style="width: 20px; height: 20px;"></div>
                                        <div class="position-absolute top-0 end-0 border-top border-end border-success" style="width: 20px; height: 20px;"></div>
                                        <div class="position-absolute bottom-0 start-0 border-bottom border-start border-success" style="width: 20px; height: 20px;"></div>
                                        <div class="position-absolute bottom-0 end-0 border-bottom border-end border-success" style="width: 20px; height: 20px;"></div>
                                    </div>
                                </div>
                            </div>
                            <div class="alert alert-info">
                                <i class="fas fa-info-circle me-2"></i>
                                <small>Arahkan kamera ke QR code dan posisikan dalam kotak hijau untuk scan otomatis</small>
                            </div>
                        </div>
                        
                                                 <div id="file-container" style="display: none;">
                             <input type="file" class="form-control mb-2" id="qr-file-input" accept="image/*">
                             <div class="text-center mb-2">atau</div>
                             <textarea class="form-control" id="manual-data-input" rows="4" placeholder="Paste data QR code di sini jika tidak bisa scan"></textarea>
                             <div class="form-text mb-2">
                                 <small>
                                     <i class="fas fa-info-circle me-1"></i>
                                     Jika QR code tidak bisa di-scan, Anda bisa copy-paste data JSON dari QR code generator atau hasil export sebelumnya.
                                 </small>
                             </div>
                             <button type="button" class="btn btn-outline-primary btn-sm mt-2 w-100" id="process-manual-data">
                                 <i class="fas fa-paste me-2"></i>Process Manual Data
                             </button>
                             <div class="alert alert-info mt-2">
                                 <small>Upload screenshot QR code atau paste text data secara manual</small>
                             </div>
                         </div>
                        
                        <div id="import-result" class="mt-3"></div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Batal</button>
                        <button type="button" class="btn btn-success" id="confirm-import-btn" style="display: none;">
                            <i class="fas fa-check me-2"></i>Confirm Import
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        modal.innerHTML = modalContent;
        document.body.appendChild(modal);
        
        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();
        
        if (type === 'import') {
            this.setupImportModalEvents(modal);
        }
        
        modal.addEventListener('hidden.bs.modal', () => {
            modal.remove();
        });
    }

    setupImportModalEvents(modal) {
        const cameraScanBtn = modal.querySelector('#camera-scan-btn');
        const fileUploadBtn = modal.querySelector('#file-upload-btn');
        const cameraContainer = modal.querySelector('#camera-container');
        const fileContainer = modal.querySelector('#file-container');
        const video = modal.querySelector('#qr-video');
        const fileInput = modal.querySelector('#qr-file-input');
        
        cameraScanBtn.addEventListener('click', () => {
            cameraContainer.style.display = 'block';
            fileContainer.style.display = 'none';
            this.startCameraScanning(video);
        });
        
        fileUploadBtn.addEventListener('click', () => {
            fileContainer.style.display = 'block';
            cameraContainer.style.display = 'none';
            this.stopCameraScanning();
        });
        
        fileInput.addEventListener('change', (e) => {
            if (e.target.files[0]) {
                this.processQRImage(e.target.files[0]);
            }
        });
        
        // Manual data input
        const manualDataInput = modal.querySelector('#manual-data-input');
        const processManualBtn = modal.querySelector('#process-manual-data');
        
        processManualBtn.addEventListener('click', () => {
            const data = manualDataInput.value.trim();
            if (data) {
                this.processManualQRData(data);
            } else {
                this.showToast('Silakan masukkan data QR code terlebih dahulu', 'warning');
            }
        });
    }

    async startCameraScanning(video) {
        try {
            // Show scanning status
            const importResult = document.getElementById('import-result');
            importResult.innerHTML = `
                <div class="alert alert-info">
                    <i class="fas fa-spinner fa-spin me-2"></i>
                    Mengakses kamera...
                </div>
            `;
            
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { 
                    facingMode: 'environment',
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                }
            });
            
            video.srcObject = stream;
            video.play();
            
            // Update status when video starts playing
            video.onloadedmetadata = () => {
                importResult.innerHTML = `
                    <div class="alert alert-success">
                        <i class="fas fa-camera me-2"></i>
                        Kamera aktif. Arahkan ke QR code untuk scan otomatis.
                    </div>
                `;
            };
            
            // Start QR scanning
            this.scanningInterval = setInterval(() => {
                this.captureAndScanFrame(video);
            }, 500);
            
        } catch (error) {
            console.error('Camera access failed:', error);
            const importResult = document.getElementById('import-result');
            
            let errorMessage = 'Tidak dapat mengakses kamera.';
            if (error.name === 'NotAllowedError') {
                errorMessage = 'Izin kamera ditolak. Silakan izinkan akses kamera di pengaturan browser.';
            } else if (error.name === 'NotFoundError') {
                errorMessage = 'Kamera tidak ditemukan. Pastikan perangkat memiliki kamera.';
            } else if (error.name === 'NotSupportedError') {
                errorMessage = 'Browser tidak mendukung akses kamera.';
            }
            
            importResult.innerHTML = `
                <div class="alert alert-danger">
                    <i class="fas fa-times-circle me-2"></i>
                    ${errorMessage}
                </div>
            `;
        }
    }

    stopCameraScanning() {
        if (this.scanningInterval) {
            clearInterval(this.scanningInterval);
        }
        
        const video = document.querySelector('#qr-video');
        if (video && video.srcObject) {
            video.srcObject.getTracks().forEach(track => track.stop());
        }
    }

    captureAndScanFrame(video) {
        try {
            // Create canvas to capture video frame
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            
            // Set canvas size to video size
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            
            // Draw video frame to canvas
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            
            // Get image data for QR scanning
            const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
            
            // Use jsQR to scan for QR codes
            const code = jsQR(imageData.data, imageData.width, imageData.height, {
                inversionAttempts: "dontInvert",
            });
            
            if (code) {
                console.log('QR Code found:', code.data);
                this.stopCameraScanning();
                
                // Show success message
                const importResult = document.getElementById('import-result');
                importResult.innerHTML = `
                    <div class="alert alert-success">
                        <i class="fas fa-check-circle me-2"></i>
                        QR code berhasil di-scan! Memproses data...
                    </div>
                `;
                
                // Process the QR data
                setTimeout(() => {
                    this.processQRData(code.data);
                }, 1000);
            }
        } catch (error) {
            console.error('Error scanning frame:', error);
        }
    }

    async processQRImage(file) {
        try {
            // Show loading state
            const importResult = document.getElementById('import-result');
            importResult.innerHTML = `
                <div class="alert alert-info">
                    <i class="fas fa-spinner fa-spin me-2"></i>
                    Memproses gambar QR code...
                </div>
            `;
            
            // Create canvas to process image
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            const img = new Image();
            
            img.onload = () => {
                // Set canvas size to image size
                canvas.width = img.width;
                canvas.height = img.height;
                
                // Draw image to canvas
                context.drawImage(img, 0, 0);
                
                // Get image data for QR scanning
                const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
                
                // Use jsQR to scan for QR codes
                const code = jsQR(imageData.data, imageData.width, imageData.height, {
                    inversionAttempts: "dontInvert",
                });
                
                if (code) {
                    console.log('QR Code found in image:', code.data);
                    importResult.innerHTML = `
                        <div class="alert alert-success">
                            <i class="fas fa-check-circle me-2"></i>
                            QR code berhasil ditemukan dalam gambar! Memproses data...
                        </div>
                    `;
                    
                    setTimeout(() => {
                        this.processQRData(code.data);
                    }, 1000);
                } else {
                    importResult.innerHTML = `
                        <div class="alert alert-warning">
                            <i class="fas fa-exclamation-triangle me-2"></i>
                            QR code tidak ditemukan dalam gambar. Pastikan gambar jelas dan QR code terlihat dengan baik.
                        </div>
                    `;
                }
            };
            
            img.onerror = () => {
                importResult.innerHTML = `
                    <div class="alert alert-danger">
                        <i class="fas fa-times-circle me-2"></i>
                        Gagal memuat gambar. Pastikan file adalah gambar yang valid.
                    </div>
                `;
            };
            
            // Load image from file
            const reader = new FileReader();
            reader.onload = (e) => {
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
            
        } catch (error) {
            console.error('Error processing QR image:', error);
            const importResult = document.getElementById('import-result');
            importResult.innerHTML = `
                <div class="alert alert-danger">
                    <i class="fas fa-times-circle me-2"></i>
                    Error: ${error.message}
                </div>
            `;
        }
    }

    // Common method to process QR data from any source
    processQRData(qrData) {
        try {
            // Try to parse the QR data
            let parsedData;
            
            // First, try to parse as JSON
            try {
                parsedData = JSON.parse(qrData);
            } catch (error) {
                // If not JSON, try to decode URL-encoded data
                try {
                    const decodedData = decodeURIComponent(qrData);
                    parsedData = JSON.parse(decodedData);
                } catch (decodeError) {
                    throw new Error('QR code tidak berisi data yang valid');
                }
            }
            
            // Validate the parsed data
            if (!parsedData || !parsedData.data) {
                throw new Error('Format data tidak sesuai');
            }
            
            // Show preview using the existing method
            this.processManualQRData(JSON.stringify(parsedData));
            
        } catch (error) {
            console.error('Error processing QR data:', error);
            const importResult = document.getElementById('import-result');
            importResult.innerHTML = `
                <div class="alert alert-danger">
                    <i class="fas fa-times-circle me-2"></i>
                    Error: ${error.message}
                </div>
            `;
        }
    }

    processManualQRData(data) {
        try {
            // Show preview of data to be imported
            const importResult = document.getElementById('import-result');
            const confirmBtn = document.getElementById('confirm-import-btn');
            
            // Clean the input data
            let cleanData = data.trim();
            
            // Remove any extra quotes or formatting
            if (cleanData.startsWith('"') && cleanData.endsWith('"')) {
                cleanData = cleanData.slice(1, -1);
            }
            
            // Try to decode URL-encoded data first
            try {
                cleanData = decodeURIComponent(cleanData);
            } catch (e) {
                // If decode fails, use original data
            }
            
            // Try to parse and validate the data
            let parsedData;
            try {
                parsedData = JSON.parse(cleanData);
            } catch (parseError) {
                throw new Error('Format JSON tidak valid. Pastikan data QR code lengkap dan tidak rusak.');
            }
            
            // Validate based on version
            let phaseCount, taskCount = 0;
            
            if (parsedData.version === '2.0.0') {
                // New optimized format
                if (!parsedData.data || !parsedData.data.progress) {
                    throw new Error('Format data progress tidak valid');
                }
                
                // Count completed tasks
                Object.keys(parsedData.data.progress).forEach(phaseKey => {
                    Object.keys(parsedData.data.progress[phaseKey]).forEach(weekKey => {
                        taskCount += parsedData.data.progress[phaseKey][weekKey].length;
                    });
                });
                
                phaseCount = Object.keys(parsedData.data.progress).length;
                
            } else if (parsedData.version === '1.0.0') {
                // Legacy format
                if (!parsedData.data || !parsedData.data.runningScheduleData) {
                    throw new Error('Format data tidak valid');
                }
                phaseCount = parsedData.data.runningScheduleData.length;
            } else {
                throw new Error('Versi data tidak dikenali');
            }
            
            const notification = parsedData.data.notificationTime || 'Tidak diatur';
            const progress = parsedData.data.currentProgress || '0';
            const timestamp = parsedData.timestamp ? new Date(parsedData.timestamp).toLocaleString('id-ID') : 'Tidak ada';
            
            const formatInfo = parsedData.version === '2.0.0' ? 
                `<li><strong>Format:</strong> Optimized (v2.0) - ${taskCount} tugas selesai</li>` :
                `<li><strong>Format:</strong> Legacy (v1.0) - Data lengkap</li>`;
            
            importResult.innerHTML = `
                <div class="alert alert-success">
                    <h6><i class="fas fa-check-circle me-2"></i>Data Valid Ditemukan!</h6>
                    <ul class="mb-0">
                        ${formatInfo}
                        <li><strong>Fase dengan Progress:</strong> ${phaseCount}</li>
                        <li><strong>Waktu Notifikasi:</strong> ${notification}</li>
                        <li><strong>Progress:</strong> ${progress}%</li>
                        <li><strong>Timestamp:</strong> ${timestamp}</li>
                    </ul>
                </div>
            `;
            
            confirmBtn.style.display = 'block';
            confirmBtn.onclick = () => {
                this.importDataFromQR(cleanData);
                bootstrap.Modal.getInstance(document.getElementById('qrModal')).hide();
            };
            
        } catch (error) {
            const importResult = document.getElementById('import-result');
            importResult.innerHTML = `
                <div class="alert alert-danger">
                    <h6><i class="fas fa-exclamation-triangle me-2"></i>Data Tidak Valid</h6>
                    <p class="mb-0">Error: ${error.message}</p>
                    <hr>
                    <small>
                        <strong>Tips:</strong><br>
                        • Pastikan data QR code lengkap dan tidak terpotong<br>
                        • Jika menggunakan manual input, copy-paste seluruh data<br>
                        • Coba scan ulang QR code jika masih bermasalah
                    </small>
                </div>
            `;
            
            document.getElementById('confirm-import-btn').style.display = 'none';
        }
    }

    async importDataFromQR(qrData) {
        try {
            let importData;
            
            // Try to parse QR data
            try {
                importData = JSON.parse(qrData);
            } catch (error) {
                throw new Error('QR code tidak valid atau rusak');
            }
            
            // Validate data structure based on version
            if (importData.version === '2.0.0') {
                // New optimized format - only progress data
                if (!importData.data || !importData.data.progress) {
                    throw new Error('Format data progress tidak sesuai');
                }
                
                // Backup current data
                const backup = {
                    data: this.currentData,
                    notificationTime: this.notificationTime,
                    timestamp: new Date().toISOString()
                };
                localStorage.setItem('kamenrun-backup', JSON.stringify(backup));
                
                // Apply progress to current schedule
                this.applyUserProgress(importData.data.progress);
                this.notificationTime = importData.data.notificationTime || '08:00';
                
                // Save imported data
                this.saveData();
                localStorage.setItem('notificationTime', this.notificationTime);
                localStorage.setItem('currentProgress', importData.data.currentProgress || '0');
                
            } else {
                // Legacy format (v1.0.0 or older) - full schedule data
                if (!importData.data || !importData.data.runningScheduleData) {
                    throw new Error('Format data tidak sesuai');
                }
                
                // Convert compressed data back to full format if needed
                if (importData.v) {
                    importData = this.decompressImportData(importData);
                }
                
                // Backup current data
                const backup = {
                    data: this.currentData,
                    notificationTime: this.notificationTime,
                    timestamp: new Date().toISOString()
                };
                localStorage.setItem('kamenrun-backup', JSON.stringify(backup));
                
                // Import full schedule data (legacy)
                this.currentData = importData.data.runningScheduleData;
                this.notificationTime = importData.data.notificationTime || '08:00';
                
                // Save imported data
                this.saveData();
                localStorage.setItem('notificationTime', this.notificationTime);
                localStorage.setItem('currentProgress', importData.data.currentProgress || '0');
            }
            
            // Update UI
            this.populatePhaseSelect();
            this.populateWeekSelect(0);
            this.renderSchedule(0, 0);
            
            // Update notification time input
            const notificationTimeInput = document.getElementById('notification-time');
            if (notificationTimeInput) {
                notificationTimeInput.value = this.notificationTime;
            }
            
            this.showToast('Data berhasil diimport! 🎉', 'success');
            
        } catch (error) {
            console.error('Import failed:', error);
            this.showToast('Gagal import data: ' + error.message, 'error');
        }
    }

    // Apply user progress to the default schedule
    applyUserProgress(progressData) {
        // Reset all completion status first
        this.currentData.forEach(phase => {
            phase.weeks.forEach(week => {
                week.days.forEach(day => {
                    day.done = false;
                });
            });
        });
        
        // Apply imported progress
        Object.keys(progressData).forEach(phaseKey => {
            const phaseIndex = parseInt(phaseKey.substring(1)); // p0 -> 0
            
            if (this.currentData[phaseIndex]) {
                const weekData = progressData[phaseKey];
                
                Object.keys(weekData).forEach(weekKey => {
                    const weekIndex = parseInt(weekKey.substring(1)); // w0 -> 0
                    
                    if (this.currentData[phaseIndex].weeks[weekIndex]) {
                        const completedDays = weekData[weekKey];
                        
                        completedDays.forEach(dayIndex => {
                            if (this.currentData[phaseIndex].weeks[weekIndex].days[dayIndex]) {
                                this.currentData[phaseIndex].weeks[weekIndex].days[dayIndex].done = true;
                            }
                        });
                    }
                });
            }
        });
    }

    decompressImportData(compressed) {
        // Convert compressed format back to full format
        return {
            version: compressed.v,
            timestamp: compressed.t,
            data: {
                runningScheduleData: compressed.d.schedule.map(phase => ({
                    phaseName: phase.name,
                    weeks: phase.weeks.map(week => ({
                        weekNumber: week.num,
                        days: week.days.map(day => ({
                            day: this.expandDayName(day.day),
                            task: day.task,
                            done: day.done,
                            icon: day.icon,
                            isRest: day.rest
                        }))
                    }))
                })),
                notificationTime: compressed.d.notif,
                currentProgress: compressed.d.progress
            }
        };
    }

    expandDayName(shortDay) {
        const dayMap = {
            'Sen': 'Senin',
            'Sel': 'Selasa', 
            'Rab': 'Rabu',
            'Kam': 'Kamis',
            'Jum': 'Jumat',
            'Sab': 'Sabtu',
            'Min': 'Minggu'
        };
        return dayMap[shortDay] || shortDay;
    }

    // Additional data management methods
    resetProgress() {
        if (confirm('Apakah Anda yakin ingin mereset semua progress? Tindakan ini tidak dapat dibatalkan.')) {
            // Reset all completion status
            this.currentData.forEach(phase => {
                phase.weeks.forEach(week => {
                    week.days.forEach(day => {
                        day.done = false;
                    });
                });
            });
            
            // Save reset data
            this.saveData();
            localStorage.setItem('currentProgress', '0');
            
            // Update UI
            this.populatePhaseSelect();
            this.populateWeekSelect(0);
            this.renderSchedule(0, 0);
            
            this.showToast('Progress berhasil direset! 🔄', 'warning');
        }
    }

    createBackup() {
        try {
            const backup = {
                version: '2.0.0',
                timestamp: new Date().toISOString(),
                type: 'backup',
                data: {
                    runningScheduleData: this.currentData,
                    notificationTime: this.notificationTime,
                    currentProgress: localStorage.getItem('currentProgress') || '0'
                }
            };

            const backupString = JSON.stringify(backup, null, 2);
            const blob = new Blob([backupString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `kamenrun-backup-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.showToast('Backup berhasil diunduh! 💾', 'success');
        } catch (error) {
            console.error('Backup failed:', error);
            this.showToast('Gagal membuat backup: ' + error.message, 'error');
        }
    }

    showStorageInfo() {
        try {
            // Calculate storage usage
            const scheduleData = JSON.stringify(this.currentData);
            const scheduleSize = new Blob([scheduleData]).size;
            
            const notificationTime = this.notificationTime;
            const currentProgress = localStorage.getItem('currentProgress') || '0';
            
            // Count tasks
            let totalTasks = 0;
            let completedTasks = 0;
            
            this.currentData.forEach(phase => {
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
            });

            const modal = document.createElement('div');
            modal.className = 'modal fade';
            modal.innerHTML = `
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">
                                <i class="fas fa-hdd me-2"></i>
                                Informasi Storage
                            </h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="row">
                                <div class="col-md-6">
                                    <h6><i class="fas fa-database me-2"></i>Data Storage</h6>
                                    <ul class="list-unstyled">
                                        <li><strong>Schedule Data:</strong> ${(scheduleSize / 1024).toFixed(2)} KB</li>
                                        <li><strong>Notification Time:</strong> ${notificationTime}</li>
                                        <li><strong>Overall Progress:</strong> ${currentProgress}%</li>
                                    </ul>
                                </div>
                                <div class="col-md-6">
                                    <h6><i class="fas fa-chart-pie me-2"></i>Progress Statistics</h6>
                                    <ul class="list-unstyled">
                                        <li><strong>Total Tasks:</strong> ${totalTasks}</li>
                                        <li><strong>Completed:</strong> ${completedTasks}</li>
                                        <li><strong>Remaining:</strong> ${totalTasks - completedTasks}</li>
                                    </ul>
                                </div>
                            </div>
                            
                            <div class="alert alert-info mt-3">
                                <small>
                                    <i class="fas fa-info-circle me-2"></i>
                                    Data disimpan secara lokal di browser Anda menggunakan localStorage.
                                </small>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Tutup</button>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            const bsModal = new bootstrap.Modal(modal);
            bsModal.show();
            
            modal.addEventListener('hidden.bs.modal', () => {
                modal.remove();
            });
            
        } catch (error) {
            console.error('Storage info failed:', error);
            this.showToast('Gagal menampilkan info storage: ' + error.message, 'error');
        }
    }

    sendTestNotification() {
        if ('Notification' in window) {
            if (Notification.permission === 'granted') {
                this.sendDirectNotification();
                this.showToast('Test notifikasi berhasil dikirim! 🔔', 'success');
            } else if (Notification.permission === 'denied') {
                this.showToast('Notifikasi diblokir. Silakan aktifkan di pengaturan browser.', 'error');
            } else {
                Notification.requestPermission().then(permission => {
                    if (permission === 'granted') {
                        this.sendDirectNotification();
                        this.showToast('Test notifikasi berhasil dikirim! 🔔', 'success');
                    } else {
                        this.showToast('Izin notifikasi ditolak.', 'error');
                    }
                });
            }
        } else {
            this.showToast('Browser tidak mendukung notifikasi.', 'error');
        }
    }

    updateNotificationStatus() {
        const statusElement = document.getElementById('notification-status');
        if (!statusElement) return;

        let statusHTML = '';
        
        if ('Notification' in window) {
            const permission = Notification.permission;
            let statusClass = '';
            let statusIcon = '';
            let statusText = '';
            
            switch (permission) {
                case 'granted':
                    statusClass = 'success';
                    statusIcon = 'fas fa-check-circle';
                    statusText = 'Aktif - Notifikasi diizinkan';
                    break;
                case 'denied':
                    statusClass = 'danger';
                    statusIcon = 'fas fa-times-circle';
                    statusText = 'Diblokir - Aktifkan di pengaturan browser';
                    break;
                default:
                    statusClass = 'warning';
                    statusIcon = 'fas fa-exclamation-triangle';
                    statusText = 'Pending - Belum ada izin';
            }
            
            statusHTML += `
                <div class="alert alert-${statusClass}">
                    <i class="${statusIcon} me-2"></i>
                    <strong>Status:</strong> ${statusText}
                </div>
            `;
            
            // Service Worker status
            if ('serviceWorker' in navigator) {
                statusHTML += `
                    <div class="alert alert-info">
                        <i class="fas fa-cog me-2"></i>
                        <strong>Service Worker:</strong> ${navigator.serviceWorker.controller ? 'Aktif' : 'Tidak aktif'}
                    </div>
                `;
            }
            
        } else {
            statusHTML = `
                <div class="alert alert-danger">
                    <i class="fas fa-times-circle me-2"></i>
                    <strong>Tidak Didukung:</strong> Browser tidak mendukung notifikasi
                </div>
            `;
        }
        
        statusElement.innerHTML = statusHTML;
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