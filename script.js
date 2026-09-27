/* ==========================================================================
   ABISHEK L - ECE & EMBEDDED SYSTEMS ENGINEER PORTFOLIO JAVASCRIPT
   Interactive Engine: PCB Canvas, Waveforms, EV Sim, Robot Sim, Circuit Debugger
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    initPCBCanvas();
    initOscilloscope();
    initEVDashboard();
    initRobotSimulation();
    initCircuitDebugger();
    initResumeModal();
    initNavigationAndForm();
});

/* ==========================================================================
   1. BACKGROUND PCB CIRCUIT & PULSE CANVAS ANIMATION
   ========================================================================== */
function initPCBCanvas() {
    const canvas = document.getElementById('pcb-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        generateTraces();
    });

    // PCB Nodes and Traces
    let nodes = [];
    let pulses = [];

    function generateTraces() {
        nodes = [];
        pulses = [];
        const numNodes = Math.floor((width * height) / 35000);

        for (let i = 0; i < numNodes; i++) {
            nodes.push({
                x: Math.random() * width,
                y: Math.random() * height,
                radius: Math.random() * 2 + 2,
                connections: []
            });
        }

        // Connect close nodes with right-angled PCB traces
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                let dx = Math.abs(nodes[i].x - nodes[j].x);
                let dy = Math.abs(nodes[i].y - nodes[j].y);

                if (dx < 180 && dy < 180 && nodes[i].connections.length < 3) {
                    nodes[i].connections.push(nodes[j]);

                    // Create electrical pulse along this trace
                    if (Math.random() > 0.4) {
                        pulses.push({
                            start: nodes[i],
                            end: nodes[j],
                            progress: Math.random(),
                            speed: 0.003 + Math.random() * 0.005,
                            color: Math.random() > 0.3 ? '#00f3ff' : '#10b981'
                        });
                    }
                }
            }
        }
    }

    generateTraces();

    // Render Loop
    function animatePCB() {
        ctx.clearRect(0, 0, width, height);

        // Draw traces
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'rgba(0, 243, 255, 0.06)';

        nodes.forEach(node => {
            // Node soldering point
            ctx.beginPath();
            ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(0, 243, 255, 0.15)';
            ctx.fill();

            // Right-angled PCB traces
            node.connections.forEach(target => {
                ctx.beginPath();
                ctx.moveTo(node.x, node.y);
                ctx.lineTo(target.x, node.y); // Corner bend
                ctx.lineTo(target.x, target.y);
                ctx.stroke();
            });
        });

        // Animate Pulses (Current signals)
        pulses.forEach(p => {
            p.progress += p.speed;
            if (p.progress >= 1) p.progress = 0;

            // Compute current pulse position along right-angled wire
            let currentX, currentY;
            if (p.progress < 0.5) {
                let subProg = p.progress * 2;
                currentX = p.start.x + (p.end.x - p.start.x) * subProg;
                currentY = p.start.y;
            } else {
                let subProg = (p.progress - 0.5) * 2;
                currentX = p.end.x;
                currentY = p.start.y + (p.end.y - p.start.y) * subProg;
            }

            ctx.beginPath();
            ctx.arc(currentX, currentY, 2.5, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.shadowBlur = 8;
            ctx.shadowColor = p.color;
            ctx.fill();
            ctx.shadowBlur = 0; // reset
        });

        requestAnimationFrame(animatePCB);
    }

    animatePCB();
}

/* ==========================================================================
   2. HERO MINI-OSCILLOSCOPE WAVEFORM ENGINE
   ========================================================================== */
function initOscilloscope() {
    const canvas = document.getElementById('hero-scope-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const freqTag = document.getElementById('current-wave-freq');

    let currentWaveType = 'sine';
    let phase = 0;

    // Scope button click listeners
    const buttons = document.querySelectorAll('.scope-btn');
    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            buttons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentWaveType = btn.getAttribute('data-wave');

            if (currentWaveType === 'sine') freqTag.textContent = 'Freq: 1.2 kHz (Analog)';
            else if (currentWaveType === 'square') freqTag.textContent = 'Freq: 2.4 kHz (Clock)';
            else if (currentWaveType === 'pwm') freqTag.textContent = 'Duty Cycle: 65% (EV Control)';
        });
    });

    function drawScope() {
        const w = (canvas.width = canvas.parentElement.clientWidth - 20);
        const h = canvas.height;
        const centerY = h / 2;
        const amplitude = h * 0.35;

        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, w, h);

        // Draw Grid Lines (Oscilloscope grid)
        ctx.strokeStyle = 'rgba(0, 243, 255, 0.15)';
        ctx.lineWidth = 0.5;

        for (let x = 0; x < w; x += 20) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, h);
            ctx.stroke();
        }
        for (let y = 0; y < h; y += 15) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(w, y);
            ctx.stroke();
        }

        // Draw Waveform Line
        ctx.strokeStyle = '#00f3ff';
        ctx.lineWidth = 2.5;
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#00f3ff';
        ctx.beginPath();

        phase += 0.08;

        for (let x = 0; x < w; x++) {
            let y = centerY;

            if (currentWaveType === 'sine') {
                y = centerY + Math.sin(x * 0.05 + phase) * amplitude;
            } else if (currentWaveType === 'square') {
                y = centerY + (Math.sin(x * 0.05 + phase) >= 0 ? amplitude : -amplitude);
            } else if (currentWaveType === 'pwm') {
                let rawSine = Math.sin(x * 0.05 + phase);
                y = centerY + (rawSine > -0.2 ? amplitude : -amplitude);
            }

            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }

        ctx.stroke();
        ctx.shadowBlur = 0; // reset shadow

        requestAnimationFrame(drawScope);
    }

    drawScope();
}

/* ==========================================================================
   3. REAL-TIME EV DASHBOARD & ADAS SIMULATOR
   ========================================================================== */
function initEVDashboard() {
    const speedSlider = document.getElementById('speed-slider');
    const speedVal = document.getElementById('ev-speed-val');
    const batteryFill = document.getElementById('battery-fill');
    const batteryPct = document.getElementById('battery-pct');
    const triggerAdasBtn = document.getElementById('trigger-adas-btn');
    const resetAdasBtn = document.getElementById('reset-adas-btn');
    const adasCard = document.getElementById('adas-card');
    const adasIconSymbol = document.getElementById('adas-icon-symbol');
    const adasTitleText = document.getElementById('adas-title-text');
    const adasSubText = document.getElementById('adas-sub-text');
    const dynamicLog = document.getElementById('console-dynamic-log');

    if (!speedSlider) return;

    // Speed Slider Input Handler
    speedSlider.addEventListener('input', (e) => {
        const speed = e.target.value;
        speedVal.textContent = speed;

        // Dynamic battery drain calculation
        let batteryRemaining = Math.max(15, 100 - Math.floor(speed * 0.35));
        batteryPct.textContent = batteryRemaining;
        batteryFill.style.width = batteryRemaining + '%';

        if (speed > 100) {
            dynamicLog.textContent = `> SPEED WARNING: Motor RPM High (${speed} km/h) - Thermal nominal`;
            dynamicLog.style.color = '#f59e0b';
        } else {
            dynamicLog.textContent = `> Telemetry OK: Vehicle Speed ${speed} km/h`;
            dynamicLog.style.color = '#64748b';
        }
    });

    // Trigger ADAS Alert Simulation
    triggerAdasBtn.addEventListener('click', () => {
        adasCard.classList.add('warning-active');
        adasIconSymbol.className = 'fa-solid fa-triangle-exclamation';
        adasTitleText.textContent = 'CRITICAL ADAS ALERT: Obstacle Detected!';
        adasSubText.textContent = 'Proximity Sensor: 2.8 meters | Automatic Braking Triggered';
        dynamicLog.textContent = '> [EMERGENCY] ADAS Interrupt Triggered on STM32 EXTI_Line0!';
        dynamicLog.style.color = '#ef4444';
    });

    // Reset ADAS Simulation
    resetAdasBtn.addEventListener('click', () => {
        adasCard.classList.remove('warning-active');
        adasIconSymbol.className = 'fa-solid fa-shield-halved';
        adasTitleText.textContent = 'ADAS Active - Road Clear';
        adasSubText.textContent = 'Radar Sensor: 42 meters clear';
        dynamicLog.textContent = '> System Restored: All sensor channels operating normally.';
        dynamicLog.style.color = '#10b981';
        speedSlider.value = 45;
        speedVal.textContent = 45;
        batteryFill.style.width = '78%';
        batteryPct.textContent = '78';
    });
}

/* ==========================================================================
   4. ROBOT ICE ANIMATION (MINI PROJECT SIMULATION)
   ========================================================================== */
function initRobotSimulation() {
    const canvas = document.getElementById('robot-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const animToggleBtn = document.getElementById('robot-anim-toggle');
    const angleText = document.getElementById('robot-angle-text');

    let isAnimating = true;
    let angleAlpha = 45;
    let angleBeta = 90;
    let step = 0.03;

    animToggleBtn.addEventListener('click', () => {
        isAnimating = !isAnimating;
        animToggleBtn.innerHTML = isAnimating 
            ? '<i class="fa-solid fa-pause"></i> Pause Motion Cycle' 
            : '<i class="fa-solid fa-play"></i> Resume Motion Cycle';
    });

    function drawRobotArm() {
        const w = (canvas.width = canvas.parentElement.clientWidth - 20);
        const h = canvas.height;

        ctx.fillStyle = '#020617';
        ctx.fillRect(0, 0, w, h);

        // Base coordinate
        const baseX = w / 2;
        const baseY = h - 30;

        if (isAnimating) {
            angleAlpha = 45 + Math.sin(Date.now() * 0.002) * 35;
            angleBeta = 80 + Math.cos(Date.now() * 0.003) * 45;
            angleText.textContent = `Joint Alpha: ${Math.round(angleAlpha)}° | Joint Beta: ${Math.round(angleBeta)}°`;
        }

        // Base platform
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(baseX - 40, baseY, 80, 15);
        ctx.strokeStyle = '#a855f7';
        ctx.strokeRect(baseX - 40, baseY, 80, 15);

        // Joint 1 (Base Joint)
        let radAlpha = (angleAlpha * Math.PI) / 180;
        let arm1Length = 70;
        let joint1X = baseX + Math.cos(-radAlpha) * arm1Length;
        let joint1Y = baseY - Math.sin(radAlpha) * arm1Length;

        // Draw Arm 1
        ctx.strokeStyle = '#00f3ff';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(baseX, baseY);
        ctx.lineTo(joint1X, joint1Y);
        ctx.stroke();

        // Joint 1 Node
        ctx.beginPath();
        ctx.arc(baseX, baseY, 8, 0, Math.PI * 2);
        ctx.fillStyle = '#a855f7';
        ctx.fill();

        // Joint 2 (Elbow)
        let radBeta = ((angleAlpha + angleBeta) * Math.PI) / 180;
        let arm2Length = 60;
        let endX = joint1X + Math.cos(-radBeta) * arm2Length;
        let endY = joint1Y - Math.sin(radBeta) * arm2Length;

        // Draw Arm 2
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(joint1X, joint1Y);
        ctx.lineTo(endX, endY);
        ctx.stroke();

        // Joint 2 Node
        ctx.beginPath();
        ctx.arc(joint1X, joint1Y, 7, 0, Math.PI * 2);
        ctx.fillStyle = '#00f3ff';
        ctx.fill();

        // End Effector (Ice Tool Head)
        ctx.beginPath();
        ctx.arc(endX, endY, 6, 0, Math.PI * 2);
        ctx.fillStyle = '#fbbf24';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#fbbf24';
        ctx.fill();
        ctx.shadowBlur = 0;

        requestAnimationFrame(drawRobotArm);
    }

    drawRobotArm();
}

/* ==========================================================================
   5. INTERACTIVE CIRCUIT DEBUGGER (1ST PRIZE HIGHLIGHT)
   ========================================================================== */
function initCircuitDebugger() {
    const inputABtn = document.getElementById('input-a-btn');
    const fixWireBtn = document.getElementById('fix-wire-btn');
    const outputLed = document.getElementById('output-led');
    const circuitStatus = document.getElementById('circuit-status');
    const successMsg = document.getElementById('debug-success-msg');

    let inputAState = true; // HIGH
    let wireFixedState = false; // Faulty by default

    if (!inputABtn) return;

    inputABtn.addEventListener('click', () => {
        inputAState = !inputAState;
        if (inputAState) {
            inputABtn.textContent = 'HIGH (1)';
            inputABtn.classList.add('active');
        } else {
            inputABtn.textContent = 'LOW (0)';
            inputABtn.classList.remove('active');
        }
        evaluateCircuit();
    });

    fixWireBtn.addEventListener('click', () => {
        wireFixedState = !wireFixedState;
        if (wireFixedState) {
            fixWireBtn.classList.add('fixed');
            fixWireBtn.innerHTML = '<i class="fa-solid fa-check"></i> Wire Connected!';
        } else {
            fixWireBtn.classList.remove('fixed');
            fixWireBtn.innerHTML = '<i class="fa-solid fa-plug"></i> Connect Broken Wire';
        }
        evaluateCircuit();
    });

    function evaluateCircuit() {
        if (inputAState && wireFixedState) {
            outputLed.classList.add('powered');
            outputLed.textContent = 'ON (1)';
            circuitStatus.textContent = 'Circuit Restored! System Fully Operational';
            circuitStatus.className = 'status-ok';
            successMsg.classList.remove('hidden');
        } else {
            outputLed.classList.remove('powered');
            outputLed.textContent = 'OFF';
            circuitStatus.textContent = 'Circuit Fault Detected! (No Output LED)';
            circuitStatus.className = 'status-warn';
            successMsg.classList.add('hidden');
        }
    }
}

/* ==========================================================================
   6. RESUME MODAL HANDLER
   ========================================================================== */
function initResumeModal() {
    const openBtn = document.getElementById('open-resume-btn');
    const modal = document.getElementById('resume-modal');
    const closeBtn1 = document.getElementById('close-modal-btn');
    const closeBtn2 = document.getElementById('close-modal-btn-2');

    if (!openBtn || !modal) return;

    function openModal() {
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        modal.classList.add('hidden');
        document.body.style.overflow = 'auto';
    }

    openBtn.addEventListener('click', openModal);
    closeBtn1.addEventListener('click', closeModal);
    closeBtn2.addEventListener('click', closeModal);

    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
            closeModal();
        }
    });
}

/* ==========================================================================
   7. NAVIGATION & FORM UTILITIES
   ========================================================================== */
function initNavigationAndForm() {
    // Mobile Navigation Toggle
    const mobileToggle = document.getElementById('mobile-toggle');
    const navMenu = document.getElementById('nav-menu');

    if (mobileToggle && navMenu) {
        mobileToggle.addEventListener('click', () => {
            navMenu.classList.toggle('mobile-active');
        });

        // Close menu on nav item click
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('mobile-active');
            });
        });
    }

    // Email Copy to Clipboard Trigger
    const copyTrigger = document.getElementById('email-copy-trigger');
    const emailVal = document.getElementById('email-val');

    if (copyTrigger && emailVal) {
        copyTrigger.addEventListener('click', () => {
            navigator.clipboard.writeText('abis51473@gmail.com').then(() => {
                const originalText = emailVal.textContent;
                emailVal.textContent = 'Copied to Clipboard!';
                emailVal.style.color = '#10b981';

                setTimeout(() => {
                    emailVal.textContent = originalText;
                    emailVal.style.color = '#fff';
                }, 2000);
            });
        });
    }

    // Contact Form Submission Handler
    const contactForm = document.getElementById('contact-form');
    const formStatus = document.getElementById('form-status');

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            formStatus.className = 'form-status-msg success-alert';
            formStatus.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Thank you! Your message has been sent to Abishek L.';
            formStatus.classList.remove('hidden');
            contactForm.reset();

            setTimeout(() => {
                formStatus.classList.add('hidden');
            }, 5000);
        });
    }
}
