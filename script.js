/**
 * ============================================================================
 * WEDDING INVITATION INTERACTIVE ENGINE - ULTIMATE FINAL VERSION
 * Features: Firebase Real-time, Custom Select, Toast di Atas Form,
 * REPEATING Scroll Animations, & MAGICAL Cover Reveal (Fast Sync).
 * ============================================================================
 */

// ============================================================================
// 1. GLOBAL CONFIGURATION & STATE
// ============================================================================
const CONFIG = {
    weddingDate: "2026-06-14T10:00:00+07:00", 
    wishes: { perPage: 5, loadMoreCount: 5 },
    toast: { duration: 3500 },
    firebase: {
        apiKey: "AIzaSyAPbPODvpIxm3yfVNTNOf5D2_nFglpUsPs",
        authDomain: "undangan-nuraisyah-rohil.firebaseapp.com",
        projectId: "undangan-nuraisyah-rohil",
        storageBucket: "undangan-nuraisyah-rohil.firebasestorage.app",
        messagingSenderId: "200403693255",
        appId: "1:200403693255:web:5614867d9d9c0db26c98e2"
    }
};

const STATE = {
    isPlaying: false,
    allWishes: [],
    displayedWishesCount: CONFIG.wishes.perPage,
    isFirebaseActive: false
};

const DOM = {
    body: document.body,
    cover: document.getElementById('cover'),
    btnOpen: document.getElementById('btn-open'),
    bgMusic: document.getElementById('bg-music'),
    musicControl: document.getElementById('music-control'),
    lightbox: {
        overlay: document.getElementById('lightbox'),
        img: document.getElementById('lightbox-img')
    },
    countdown: {
        days: document.getElementById('days'), hours: document.getElementById('hours'),
        minutes: document.getElementById('minutes'), seconds: document.getElementById('seconds')
    },
    rsvp: {
        form: document.getElementById('rsvpForm'),
        name: document.getElementById('guestName'),
        attendance: document.getElementById('attendance'), 
        wish: document.getElementById('guestWish'),
        submitBtn: document.querySelector('.submit-btn'),
        container: document.getElementById('wishes-container'),
        list: document.getElementById('wishes-list'),
        btnLoadMore: document.getElementById('btn-load-more')
    },
    toast: {
        container: document.getElementById('custom-toast'),
        message: document.getElementById('toast-message')
    },
    customSelect: {
        wrapper: document.getElementById('customSelect'),
        selected: document.querySelector('.select-selected'),
        text: document.getElementById('selected-text'),
        items: document.querySelector('.select-items')
    }
};

// ============================================================================
// 2. INITIALIZATION & MAGICAL REVEAL LOGIC
// ============================================================================
function initApp() {
    DOM.body.style.overflow = 'hidden';
    checkFirebaseStatus();
    initCountdown();
    initCustomSelect();
    setGuestNameFromURL(); // Panggil fungsi nama otomatis
    animateCoverOnLoad();
}

// FUNGSI BARU: Ambil nama dari parameter URL (?to=Nama)
function setGuestNameFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const namaTamu = urlParams.get('to');
    
    if (namaTamu) {
        const elemenNamaTamu = document.getElementById('nama-tamu');
        if (elemenNamaTamu) {
            elemenNamaTamu.innerText = namaTamu;
        }
    }
}

function animateCoverOnLoad() {
    const coverElements = document.querySelectorAll('#cover, #cover .animate-slide-up, #cover .animate-fade-in, #cover .animate-zoom');
    setTimeout(() => {
        coverElements.forEach(el => el.classList.add('is-visible'));
    }, 100);
}

// LOGIKA MAGICAL REVEAL SAAT TOMBOL DITEKAN (DI PERCEPAT & DISINKRONKAN)
DOM.btnOpen.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    
    // 1. Tombol mengecil
    DOM.btnOpen.classList.add('btn-unlocking');
    
    // 2. Efek cahaya menyebar
    const coverArch = document.querySelector('.cover-arch');
    if(coverArch) coverArch.classList.add('magical-unlock');
    
    // 3. JEDA DIPERCEPAT: Hanya 500ms, langsung terbang dan background hancur
    setTimeout(() => {
        if(coverArch) {
            coverArch.classList.remove('magical-unlock');
            coverArch.classList.add('shoot-up');
        }
        DOM.cover.classList.remove('is-visible', 'animate-zoom');
        DOM.cover.classList.add('opened-dramatic');
    }, 500); 
    
    // 4. Buka kunci scroll lebih cepat (di detik ke 1.1)
    setTimeout(() => {
        DOM.body.style.overflow = 'auto'; 
        initScrollAnimations();
        initCountUpNumbers();
    }, 1100); 
    
    // 5. AUDIO DISINKRONKAN: Musik baru nyala pas kotaknya mulai terbang (delay 400ms)
    setTimeout(() => {
        DOM.musicControl.style.display = 'block';
        playAudio();
    }, 400);
});

// ============================================================================
// 3. AUDIO & LIGHTBOX
// ============================================================================
function playAudio() {
    DOM.bgMusic.play().then(() => {
        STATE.isPlaying = true;
        DOM.musicControl.classList.remove('paused');
        DOM.musicControl.classList.add('playing');
    }).catch(err => console.warn("Autoplay block:", err));
}

DOM.musicControl.addEventListener('click', () => {
    if (STATE.isPlaying) {
        DOM.bgMusic.pause();
        DOM.musicControl.classList.add('paused');
        DOM.musicControl.classList.remove('playing');
    } else {
        DOM.bgMusic.play();
        DOM.musicControl.classList.remove('paused');
        DOM.musicControl.classList.add('playing');
    }
    STATE.isPlaying = !STATE.isPlaying;
});

window.openLightbox = function(src) {
    DOM.lightbox.img.src = src;
    DOM.lightbox.overlay.classList.add('active');
    DOM.body.style.overflow = 'hidden';
};

window.closeLightbox = function() {
    DOM.lightbox.overlay.classList.remove('active');
    DOM.body.style.overflow = 'auto';
};

// ============================================================================
// 4. CUSTOM SELECT DROPDOWN LOGIC
// ============================================================================
function initCustomSelect() {
    if (!DOM.customSelect.wrapper) return;

    DOM.customSelect.selected.addEventListener("click", function(e) {
        e.stopPropagation();
        this.classList.toggle("select-arrow-active");
        DOM.customSelect.items.classList.toggle("select-hide");
    });

    const options = DOM.customSelect.items.querySelectorAll("div");
    options.forEach(option => {
        option.addEventListener("click", function(e) {
            e.stopPropagation();
            DOM.customSelect.text.innerHTML = this.innerHTML;
            DOM.rsvp.attendance.value = this.getAttribute("data-value");
            
            DOM.customSelect.selected.classList.remove("select-arrow-active");
            DOM.customSelect.items.classList.add("select-hide");
            DOM.customSelect.selected.style.borderColor = 'var(--border-color)';
        });
    });

    document.addEventListener("click", function(e) {
        if (!DOM.customSelect.wrapper.contains(e.target)) {
            DOM.customSelect.selected.classList.remove("select-arrow-active");
            DOM.customSelect.items.classList.add("select-hide");
        }
    });
}

// ============================================================================
// 5. ANIMATION SYSTEMS (SELALU MENGULANG SAAT DI-SCROLL)
// ============================================================================
function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
            } else {
                entry.target.classList.remove('is-visible');
            }
        });
    }, { threshold: 0.15 });

    const targets = document.querySelectorAll(
        '.animate-slide-up, .animate-fade-in, .animate-fade-left, .animate-fade-right, .animate-zoom'
    );
    
    targets.forEach(t => {
        if (!DOM.cover.contains(t) && t !== DOM.cover) {
            observer.observe(t);
        }
    });
}

function initCountUpNumbers() {
    const countElements = document.querySelectorAll('.count-up');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if(entry.isIntersecting) {
                const target = +entry.target.getAttribute('data-target');
                let count = 0;
                const speed = target / 40;

                const update = () => {
                    if(count < target) {
                        count += speed;
                        entry.target.innerText = Math.ceil(count);
                        requestAnimationFrame(update);
                    } else {
                        entry.target.innerText = target;
                    }
                };
                update();
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    countElements.forEach(el => observer.observe(el));
}

// ============================================================================
// 6. COUNTDOWN ENGINE
// ============================================================================
function initCountdown() {
    const target = new Date(CONFIG.weddingDate).getTime();
    setInterval(() => {
        const now = new Date().getTime();
        const diff = target - now;
        if (diff < 0) return;

        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);

        DOM.countdown.days.innerText = d < 10 ? "0" + d : d;
        DOM.countdown.hours.innerText = h < 10 ? "0" + h : h;
        DOM.countdown.minutes.innerText = m < 10 ? "0" + m : m;
        DOM.countdown.seconds.innerText = s < 10 ? "0" + s : s;
    }, 1000);
}

// ============================================================================
// 7. NOTIFICATION & UTILS
// ============================================================================
const ToastManager = {
    timeoutId: null,
    show(msg, type = 'success') {
        const toast = DOM.toast.container;
        const icon = toast.querySelector('.toast-icon');
        DOM.toast.message.innerText = msg;
        
        if (type === 'success') {
            if(icon) icon.innerText = '✨';
            toast.classList.remove('error');
        } else {
            if(icon) icon.innerText = '⚠️';
            toast.classList.add('error');
        }
        
        toast.classList.add('show');
        
        if (this.timeoutId) clearTimeout(this.timeoutId);
        this.timeoutId = setTimeout(() => {
            toast.classList.remove('show');
        }, CONFIG.toast.duration);
    }
};

window.copyText = function(text, btn) {
    navigator.clipboard.writeText(text).then(() => {
        const old = btn.innerText;
        btn.innerText = "Tersalin! ✔";
        ToastManager.show("Berhasil menyalin ke papan klip.");
        setTimeout(() => btn.innerText = old, 2000);
    });
};

function sanitizeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// ============================================================================
// 8. DATABASE INTEGRATION (FIREBASE & LOCALSTORAGE)
// ============================================================================
function checkFirebaseStatus() {
    if (CONFIG.firebase.apiKey !== "API_KEY_KAMU") {
        STATE.isFirebaseActive = true;
        initFirebase();
    } else {
        STATE.isFirebaseActive = false;
        initLocalStorageFallback();
    }
}

function initFirebase() {
    firebase.initializeApp(CONFIG.firebase);
    const db = firebase.firestore();

    db.collection("rsvp_tamu").orderBy("waktu_submit", "desc").onSnapshot((snap) => {
        STATE.allWishes = [];
        snap.forEach(doc => STATE.allWishes.push(doc.data()));
        renderWishes();
    });

    DOM.rsvp.form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const attendanceVal = DOM.rsvp.attendance.value;
        if (!attendanceVal) {
            ToastManager.show("Silakan pilih Konfirmasi Kehadiran terlebih dahulu!", "error");
            DOM.customSelect.selected.style.borderColor = '#c62828';
            return;
        }

        const btn = DOM.rsvp.submitBtn;
        const oldText = btn.innerText;
        btn.innerText = "Mengirim...";
        btn.disabled = true;

        db.collection("rsvp_tamu").add({
            nama: DOM.rsvp.name.value,
            kehadiran: attendanceVal,
            ucapan: DOM.rsvp.wish.value,
            waktu_submit: firebase.firestore.FieldValue.serverTimestamp()
        }).then(() => {
            ToastManager.show("Terima kasih! Doa & konfirmasi Anda telah tersimpan.");
            handleResetForm();
        }).catch(err => {
            console.error(err);
            ToastManager.show("Gagal mengirim, periksa koneksi Anda.", "error");
        }).finally(() => {
            btn.innerText = oldText;
            btn.disabled = false;
        });
    });
}

function initLocalStorageFallback() {
    const saved = localStorage.getItem('demoWeddingWishes');
    STATE.allWishes = saved ? JSON.parse(saved) : [];
    renderWishes();

    DOM.rsvp.form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const attendanceVal = DOM.rsvp.attendance.value;
        if (!attendanceVal) {
            ToastManager.show("Silakan pilih Konfirmasi Kehadiran terlebih dahulu!", "error");
            DOM.customSelect.selected.style.borderColor = '#c62828';
            return;
        }

        const btn = DOM.rsvp.submitBtn;
        btn.innerText = "Menyimpan...";
        btn.disabled = true;

        setTimeout(() => {
            const newWish = {
                nama: DOM.rsvp.name.value,
                kehadiran: attendanceVal,
                ucapan: DOM.rsvp.wish.value,
                waktu_submit: new Date().toISOString()
            };
            STATE.allWishes.unshift(newWish);
            localStorage.setItem('demoWeddingWishes', JSON.stringify(STATE.allWishes));
            
            renderWishes();
            ToastManager.show("Demo: Data tersimpan di browser Anda!");
            handleResetForm();
            btn.innerText = "Kirim Konfirmasi";
            btn.disabled = false;
        }, 800);
    });
}

// ============================================================================
// 9. RENDERING SYSTEM
// ============================================================================
function renderWishes() {
    if (!DOM.rsvp.list) return;
    
    DOM.rsvp.container.style.display = STATE.allWishes.length > 0 ? 'block' : 'none';

    DOM.rsvp.list.innerHTML = '';
    const toShow = STATE.allWishes.slice(0, STATE.displayedWishesCount);

    toShow.forEach(w => {
        const isHadir = w.kehadiran === 'Hadir';
        const badgeClass = isHadir ? 'badge-hadir' : 'badge-absen';
        const badgeText = isHadir ? '✓ Hadir' : '✕ Berhalangan';

        DOM.rsvp.list.innerHTML += `
            <div class="wish-item">
                <div class="wish-header">
                    <span class="wish-name">${sanitizeHTML(w.nama)}</span>
                    <span class="badge ${badgeClass}">${badgeText}</span>
                </div>
                <p class="wish-text">"${sanitizeHTML(w.ucapan)}"</p>
            </div>
        `;
    });

    DOM.rsvp.btnLoadMore.style.display = 
        STATE.allWishes.length > STATE.displayedWishesCount ? 'inline-block' : 'none';
}

function handleResetForm() {
    DOM.rsvp.form.reset();
    DOM.rsvp.attendance.value = "";
    DOM.customSelect.text.innerHTML = "Konfirmasi Kehadiran";
}

DOM.rsvp.btnLoadMore.addEventListener('click', () => {
    STATE.displayedWishesCount += CONFIG.wishes.loadMoreCount;
    renderWishes();
});

// START APPLICATION
document.addEventListener('DOMContentLoaded', initApp);