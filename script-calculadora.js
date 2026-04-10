// Base de Conocimiento - Parámetros de la Calculadora
// Tabla de precios actualizada por Lili Ortega
// Nota: Lili NO diferencia precios por tipo de pelaje

// Precios base REALES por servicio y tamaño (tabla oficial)
const PRICE_TABLE = {
    //              TOY   PEQ   MED   GRA   GIG
    bano: [30, 35, 40, 45, null],  // null = 50€/hora
    bano_arreglo: [35, 40, 45, null, null],
    corte_mixto: [40, 45, 50, null, null],
    corte_tijera: [50, null, 60, null, null],  // PEQ: 50-60€
    stripping: [45, 55, 60, null, null],
    deslanado: [42, 47, 50, null, null],  // aprox. media del rango
    unas: [5, 7, 9, 10, 15]
};

const KNOWLEDGE = {
    // Servicios con precio base (TOY como referencia de partida)
    servicios: {
        bano: { label: "Baño", tiempoBase: 45 },
        bano_arreglo: { label: "Baño + Arreglo", tiempoBase: 60 },
        corte_mixto: { label: "Corte Mixto", tiempoBase: 70 },
        corte_tijera: { label: "Corte Tijera", tiempoBase: 80 },
        stripping: { label: "Stripping", tiempoBase: 90 },
        deslanado: { label: "Deslanado", tiempoBase: 60 },
        unas: { label: "Uñas", tiempoBase: 15 }
    },
    // Índice de tamaño (0=TOY, 1=PEQUEÑO, 2=MEDIANO, 3=GRANDE, 4=GIGANTE)
    tamanos: {
        toy: { idx: 0, label: "TOY (<4 kg)", tiempoMult: 1.0 },
        pequeno: { idx: 1, label: "Pequeño (4-10 kg)", tiempoMult: 1.1 },
        mediano: { idx: 2, label: "Mediano (11-20 kg)", tiempoMult: 1.3 },
        grande: { idx: 3, label: "Grande (21-35 kg)", tiempoMult: 1.5 },
        gigante: { idx: 4, label: "Gigante (+35 kg)", tiempoMult: 2.0 }
    },
    multiplicadores: {
        estado: {
            bueno: { p: 1.0, t: 1.0, label: "Buen estado" },
            enredado: { p: 1.1, t: 1.2, label: "Algo enredado" },
            sucio: { p: 1.2, t: 1.3, label: "Sucio" },
            muy_sucio: { p: 1.4, t: 1.5, label: "Muy sucio / con nudos" }
        },
        comportamiento: {
            docil: { surcharge: 0, t: 1.0, label: "Dócil" },
            tranquilo: { surcharge: 0, t: 1.1, label: "Tranquilo" },
            nervioso: { surcharge: 15, t: 1.3, label: "Nervioso (+15€/30min extra)" },
            agresivo: { surcharge: 15, t: 1.6, label: "Difícil manejo (+15€/30min extra)" }
        }
    },
    extras: {
        lazos: { precio: 3, tiempo: 5, label: "Lazos decorativos" },
        nudos: { precio: 30, tiempo: 60, label: "Nudos (30€/hora)" },
        seniors: { precio: 0, tiempo: 0, label: "Senior (ver tabla)", esSenior: true },
        unas: { precio: 0, tiempo: 10, label: "Uñas (precio según tamaño)", esUnas: true }
    },
    // Suplemento senior por tamaño
    seniorPrecio: [5, 10, 10, 15, 15],
    // Precio uñas por tamaño
    unasPrecio: [5, 7, 9, 10, 15]
};

// Estado de la Calculadora
const STATE = {
    step: 1,
    selections: {
        raza: null,
        edad: null,
        sexo: null,
        servicio: null,
        tamano: null,
        estado: null,
        comportamiento: null,
        extras: []
    }
};

const TOTAL_STEPS = 7; // 6 pasos + 1 resultado

document.addEventListener('DOMContentLoaded', () => {

    // 1. Sticky Header
    const header = document.getElementById('header');
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }

    // 2. Mobile Menu Toggle
    const menuToggle = document.getElementById('menu-toggle');
    const nav = document.getElementById('nav');
    const navLinks = document.querySelectorAll('.nav-link');

    if (menuToggle && nav) {
        menuToggle.addEventListener('click', () => {
            nav.classList.toggle('active');
            const icon = menuToggle.querySelector('i');
            if (nav.classList.contains('active')) {
                icon.classList.replace('ph-list', 'ph-x');
            } else {
                icon.classList.replace('ph-x', 'ph-list');
            }
        });

        // Close mobile menu on link click
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                nav.classList.remove('active');
                const icon = menuToggle.querySelector('i');
                if (icon) {
                    icon.classList.replace('ph-x', 'ph-list');
                }
            });
        });
    }

    // --- Validation Step 1 Custom Listner ---
    const razaSelect = document.getElementById('raza-select');
    if (razaSelect) {
        razaSelect.addEventListener('change', (e) => {
            STATE.selections.raza = e.target.value;
            checkStep1Validation();
        });
    }

    // --- Option Cards Click ---
    document.querySelectorAll('.option-card').forEach(card => {
        card.addEventListener('click', (e) => {
            const key = card.dataset.key;
            const val = card.dataset.value;

            // Remover selección previa en su section hermanas
            const grid = card.closest('.grid');
            if (grid) {
                grid.querySelectorAll('.option-card').forEach(c => c.classList.remove('active'));
            }

            // Set nueva selección
            card.classList.add('active');
            STATE.selections[key] = val;

            // Si estamos en el paso 1, requerimos validar los 3 (edad, sexo, y tener raza)
            if (STATE.step === 1) {
                checkStep1Validation();
            } else {
                // Pasos normales de 1 en 1
                const parent = card.closest('.step');
                parent.querySelector('.next-btn').disabled = false;
            }
        });
    });

    // --- Extras (Checkbox Lists) ---
    document.querySelectorAll('.list-item').forEach(item => {
        const checkbox = item.querySelector('input[type="checkbox"]');
        item.addEventListener('click', (e) => {
            // Evitar doble triggering
            if (e.target !== checkbox) {
                checkbox.checked = !checkbox.checked;
            }
            if (checkbox.checked) {
                item.classList.add('active');
                if (!STATE.selections.extras.includes(checkbox.value)) {
                    STATE.selections.extras.push(checkbox.value);
                }
            } else {
                item.classList.remove('active');
                STATE.selections.extras = STATE.selections.extras.filter(v => v !== checkbox.value);
            }
        });
    });

    // --- Navegación ---
    document.querySelectorAll('.next-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (STATE.step < TOTAL_STEPS - 1) {
                goToStep(STATE.step + 1);
            }
        });
    });

    document.querySelectorAll('.prev-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (STATE.step > 1) {
                goToStep(STATE.step - 1);
            }
        });
    });

    document.getElementById('btn-calcular').addEventListener('click', () => {
        calcularResultado();
        goToStep(TOTAL_STEPS);
    });

    document.getElementById('btn-restart').addEventListener('click', () => {
        resetearCalculadora();
    });
});

function checkStep1Validation() {
    const btn = document.querySelector('.step[data-step="1"] .next-btn');
    if (STATE.selections.raza && STATE.selections.edad && STATE.selections.sexo) {
        btn.disabled = false;
    } else {
        btn.disabled = true;
    }
}

function goToStep(n) {
    // Hide current
    const currEl = document.querySelector(`.step[data-step="${STATE.step}"]`);
    if (currEl) currEl.classList.remove('active');

    STATE.step = n;

    // Show new
    const nextEl = document.querySelector(`.step[data-step="${STATE.step}"]`);
    if (nextEl) nextEl.classList.add('active');

    updateProgressBar();
}

function updateProgressBar() {
    const fill = document.getElementById('progress-fill');
    // Si entramos al ultimo paso (result), llenamos 100%
    const pct = ((STATE.step - 1) / (TOTAL_STEPS - 1)) * 100;
    fill.style.width = `${pct}%`;

    // Toggle active classes on labels
    document.querySelectorAll('.step-label').forEach((lbl, idx) => {
        if (idx === STATE.step - 1) {
            lbl.classList.add('active');
        } else {
            lbl.classList.remove('active');
        }
    });
}

function calcularResultado() {
    const vals = STATE.selections;

    const servData = KNOWLEDGE.servicios[vals.servicio] || { tiempoBase: 45, label: vals.servicio };
    const tamData = KNOWLEDGE.tamanos[vals.tamano];
    const m_est = KNOWLEDGE.multiplicadores.estado[vals.estado];
    const m_comp = KNOWLEDGE.multiplicadores.comportamiento[vals.comportamiento];

    const tamIdx = tamData.idx;

    // Precio base según tabla real de Lili (servicio + tamaño)
    const tabla = PRICE_TABLE[vals.servicio];
    const rawPrecio = tabla ? tabla[tamIdx] : undefined;

    // null en la tabla indica tarifa por hora (razas grandes en servicios de corte)
    const esPorHora = rawPrecio === null;
    let precioBase = esPorHora ? 50 : (rawPrecio ?? 30);

    // Aplicar multiplicadores de estado del pelo
    let finalPrice = precioBase * m_est.p;

    // Suplemento por comportamiento (cantidad fija)
    finalPrice += m_comp.surcharge;

    // Tiempo base según servicio y tamaño
    let finalTime = servData.tiempoBase * tamData.tiempoMult * m_est.t * m_comp.t;

    let extrasPrice = 0;
    let extrasTime = 0;
    const extrasLog = [];

    vals.extras.forEach(ext => {
        const extObj = KNOWLEDGE.extras[ext];
        if (extObj.esSenior) {
            const seniorExtra = KNOWLEDGE.seniorPrecio[tamIdx] ?? 15;
            extrasPrice += seniorExtra;
            extrasLog.push({ label: `Senior (${tamData.label})`, price: seniorExtra });
        } else if (extObj.esUnas) {
            const unasExtra = KNOWLEDGE.unasPrecio[tamIdx] ?? 5;
            extrasPrice += unasExtra;
            extrasTime += extObj.tiempo;
            extrasLog.push({ label: `Uñas (${tamData.label})`, price: unasExtra });
        } else {
            extrasPrice += extObj.precio;
            extrasTime += extObj.tiempo;
            extrasLog.push({ label: extObj.label, price: extObj.precio });
        }
    });

    finalPrice += extrasPrice;
    finalTime += extrasTime;

    // Redondeos
    finalPrice = Math.round(finalPrice * 10) / 10;
    finalTime = Math.round(finalTime);

    // Humanizar el tiempo (Xh Ymin)
    const hours = Math.floor(finalTime / 60);
    const mins = finalTime % 60;
    let timeStr = '';
    if (hours > 0) timeStr += `${hours}h `;
    if (mins > 0 || hours === 0) timeStr += `${mins}min`;

    // Nota si precio es por hora
    const notaHora = esPorHora ? ' (tarifa hora)' : '';

    // Renderizar
    document.getElementById('final-price').innerText =
        (finalPrice % 1 === 0 ? finalPrice : finalPrice.toFixed(1)) + notaHora;
    document.getElementById('final-time').innerText = timeStr;

    renderDesglose({
        raza: vals.raza,
        edad: vals.edad,
        sexo: vals.sexo,
        servData, tamData, m_est, m_comp,
        precioBase, esPorHora, extrasLog, finalPrice
    });
}

function renderDesglose(data) {
    const list = document.getElementById('breakdown-list');
    list.innerHTML = '';

    const row = (label, value) => {
        return `<div class="breakdown-item"><span>${label}</span> <span>${value}</span></div>`;
    };

    list.innerHTML += row(`🐾 Mascota`, `${data.raza} (${data.sexo}, ${data.edad})`);
    list.innerHTML += row(`💼 Servicio: ${data.servData.label}`, data.esPorHora ? `50€/hora` : `€${data.precioBase}`);
    list.innerHTML += row(`📏 Tamaño: ${data.tamData.label}`, ``);
    if (data.m_est.p !== 1.0) list.innerHTML += row(`🪣 Estado pelo: ${data.m_est.label}`, `x${data.m_est.p}`);
    if (data.m_comp.surcharge > 0) list.innerHTML += row(`🐶 Carácter: ${data.m_comp.label}`, `+€${data.m_comp.surcharge}`);

    data.extrasLog.forEach(ex => {
        list.innerHTML += row(`✨ Extra: ${ex.label}`, `+€${ex.price}`);
    });

    list.innerHTML += row(`Total Estimado`, `€${data.finalPrice % 1 === 0 ? data.finalPrice : data.finalPrice.toFixed(1)}`);
}

function resetearCalculadora() {
    // Reset Data
    STATE.selections = {
        raza: null,
        edad: null,
        sexo: null,
        servicio: null,
        tamano: null,
        estado: null,
        comportamiento: null,
        extras: []
    };

    // Reset Select
    const rs = document.getElementById('raza-select');
    if (rs) rs.value = "";

    // Reset UI Cards
    document.querySelectorAll('.option-card').forEach(c => c.classList.remove('active'));

    // Reset Checkboxes
    document.querySelectorAll('.list-item').forEach(item => {
        item.classList.remove('active');
        item.querySelector('input').checked = false;
    });

    // Disable next buttons
    document.querySelectorAll('.next-btn').forEach(btn => btn.disabled = true);

    goToStep(1);
}
