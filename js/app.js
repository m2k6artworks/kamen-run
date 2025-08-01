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

    // QR Code Data Transfer System
    async exportDataAsQR() {
        try {
            const exportData = {
                version: '1.0.0',
                timestamp: new Date().toISOString(),
                data: {
                    runningScheduleData: this.currentData,
                    notificationTime: this.notificationTime,
                    currentProgress: localStorage.getItem('currentProgress') || '0'
                }
            };

            const dataString = JSON.stringify(exportData);
            
            // Check data size (QR codes have limits)
            if (dataString.length > 2000) {
                this.showToast('Data terlalu besar untuk QR code. Mencoba kompresi...', 'warning');
                
                // Compress data by removing unnecessary fields
                const compressedData = this.compressExportData(exportData);
                const compressedString = JSON.stringify(compressedData);
                
                if (compressedString.length > 2000) {
                    this.showToast('Data masih terlalu besar. Silakan export per fase.', 'error');
                    return;
                }
                
                await this.generateQRCode(compressedString);
            } else {
                await this.generateQRCode(dataString);
            }
            
        } catch (error) {
            console.error('Export failed:', error);
            this.showToast('Gagal mengexport data: ' + error.message, 'error');
        }
    }

    compressExportData(data) {
        // Remove completed tasks and keep only essential data
        const compressed = {
            v: data.version,
            t: data.timestamp,
            d: {
                schedule: data.data.runningScheduleData.map(phase => ({
                    name: phase.phaseName,
                    weeks: phase.weeks.map(week => ({
                        num: week.weekNumber,
                        days: week.days.map(day => ({
                            day: day.day.substring(0, 3), // Shorten day names
                            task: day.task.length > 50 ? day.task.substring(0, 50) + '...' : day.task,
                            done: day.done,
                            icon: day.icon,
                            rest: day.isRest
                        }))
                    }))
                })),
                notif: data.data.notificationTime,
                progress: data.data.currentProgress
            }
        };
        return compressed;
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
                            <video id="qr-video" class="w-100 mb-3" style="max-height: 300px;"></video>
                            <div class="alert alert-warning">
                                <small>Arahkan kamera ke QR code untuk scan otomatis</small>
                            </div>
                        </div>
                        
                                                 <div id="file-container" style="display: none;">
                             <input type="file" class="form-control mb-2" id="qr-file-input" accept="image/*">
                             <div class="text-center mb-2">atau</div>
                             <textarea class="form-control" id="manual-data-input" rows="4" placeholder="Paste data QR code di sini jika tidak bisa scan"></textarea>
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
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }
            });
            video.srcObject = stream;
            video.play();
            
            // Start QR scanning (simplified implementation)
            this.scanningInterval = setInterval(() => {
                this.captureAndScanFrame(video);
            }, 500);
            
        } catch (error) {
            console.error('Camera access failed:', error);
            this.showToast('Tidak dapat mengakses kamera. Gunakan upload file.', 'error');
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
        // This is a simplified implementation
        // In a real app, you'd use a QR code scanning library like jsQR
        console.log('Scanning frame...');
    }

    async processQRImage(file) {
        // This would typically use a QR code reading library
        // For now, we'll show a placeholder
        this.showToast('Fitur scan QR dari gambar akan segera hadir! Gunakan manual input sebagai alternatif.', 'info');
    }

    processManualQRData(data) {
        try {
            // Show preview of data to be imported
            const importResult = document.getElementById('import-result');
            const confirmBtn = document.getElementById('confirm-import-btn');
            
            // Try to parse and validate the data
            const parsedData = JSON.parse(data);
            
            if (!parsedData.data || !parsedData.data.runningScheduleData) {
                throw new Error('Format data tidak valid');
            }
            
            // Show preview
            const phaseCount = parsedData.data.runningScheduleData.length;
            const notification = parsedData.data.notificationTime || 'Tidak diatur';
            const progress = parsedData.data.currentProgress || '0';
            
            importResult.innerHTML = `
                <div class="alert alert-success">
                    <h6><i class="fas fa-check-circle me-2"></i>Data Valid Ditemukan!</h6>
                    <ul class="mb-0">
                        <li><strong>Jumlah Fase:</strong> ${phaseCount}</li>
                        <li><strong>Waktu Notifikasi:</strong> ${notification}</li>
                        <li><strong>Progress:</strong> ${progress}%</li>
                        <li><strong>Timestamp:</strong> ${new Date(parsedData.timestamp).toLocaleString('id-ID')}</li>
                    </ul>
                </div>
            `;
            
            confirmBtn.style.display = 'block';
            confirmBtn.onclick = () => {
                this.importDataFromQR(data);
                bootstrap.Modal.getInstance(document.getElementById('qrModal')).hide();
            };
            
        } catch (error) {
            const importResult = document.getElementById('import-result');
            importResult.innerHTML = `
                <div class="alert alert-danger">
                    <h6><i class="fas fa-exclamation-triangle me-2"></i>Data Tidak Valid</h6>
                    <p class="mb-0">Error: ${error.message}</p>
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
            
            // Validate data structure
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
            
            // Import new data
            this.currentData = importData.data.runningScheduleData;
            this.notificationTime = importData.data.notificationTime || '08:00';
            
            // Save imported data
            this.saveData();
            localStorage.setItem('notificationTime', this.notificationTime);
            localStorage.setItem('currentProgress', importData.data.currentProgress || '0');
            
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