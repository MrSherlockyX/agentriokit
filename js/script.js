/* JS/SCRIPT.JS */
const i18n = {
    en: {
        greeting: "Hello passenger!",
        intro: "My name is Ian Magalhães and I am very happy you are interested in my guide!",
        tip: "Feel free to leave a tip.",
        thanks: "Thank you!",
        contact: "Contact me for trips and daily rates",
        tab_advices: "Advices",
        tab_tourist: "Tourist Places",
        visit_time: "Visit time:",
        price: "Place Price:",
        distance: "Distance(current):",
        travel_time: "Travel time:",
        calculating: "Calculating...",
        unavailable: "Unavailable",
        gps_blocked: "GPS blocked",
        no_places: "No places registered.",
        no_advices: "No advice registered.",
        tip_balloon: "Tip",
        support_me: "Support my work!",
        support_text: "Choose the best way to leave your tip.",
        copy_btn: "Copy",
        copied: "Copied!"
    },
    pt: {
        greeting: "Olá passageiro!",
        intro: "Meu nome é Ian Magalhães e fico muito feliz que tenha tido interesse no meu guia!",
        tip: "Sinta-se à vontade para deixar uma gorjeta.",
        thanks: "Obrigado!",
        contact: "Entre em contato para viagens e diárias",
        tab_advices: "Conselhos",
        tab_tourist: "Pontos Turísticos",
        visit_time: "Tempo de visita:",
        price: "Preço do Local:",
        distance: "Distância(atual):",
        travel_time: "Tempo até o local:",
        calculating: "Calculando...",
        unavailable: "Indisponível",
        gps_blocked: "GPS bloqueado",
        no_places: "Nenhum ponto registrado.",
        no_advices: "Nenhum conselho registrado.",
        tip_balloon: "Gorgeta",
        support_me: "Apoie meu trabalho!",
        support_text: "Escolha a melhor forma para deixar a sua gorjeta.",
        copy_btn: "Copiar",
        copied: "Copiado!"
    },
    es: {
        greeting: "¡Hola pasajero!",
        intro: "¡Mi nombre es Ian Magalhães y estoy muy feliz de que se haya interesado en mi guía!",
        tip: "Siéntete libre de dejar una propina.",
        thanks: "¡Gracias!",
        contact: "Contáctame para viajes y tarifas diarias",
        tab_advices: "Consejos",
        tab_tourist: "Lugares Turísticos",
        visit_time: "Tiempo de visita:",
        price: "Precio del Lugar:",
        distance: "Distancia(actual):",
        travel_time: "Tiempo de viaje:",
        calculating: "Calculando...",
        unavailable: "No disponible",
        gps_blocked: "GPS bloqueado",
        no_places: "No hay lugares registrados.",
        no_advices: "No hay consejos registrados.",
        tip_balloon: "Propina",
        support_me: "¡Apoya mi trabajo!",
        support_text: "Elige la mejor forma de dejar tu propina.",
        copy_btn: "Copiar",
        copied: "¡Copiado!"
    }
};

let currentLang = 'en';

function applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if(i18n[currentLang] && i18n[currentLang][key]) {
            el.innerText = i18n[currentLang][key];
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    applyTranslations();

    const langBtns = document.querySelectorAll('.lang-btn');
    langBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            langBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            currentLang = btn.getAttribute('data-lang');
            applyTranslations();
            renderCards();
            renderAdvices();
        });
    });

    const tabs = document.querySelectorAll('.tab');
    const panes = document.querySelectorAll('.tab-pane');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            panes.forEach(p => p.classList.remove('active'));
            tab.classList.add('active');
            
            const targetId = tab.getAttribute('data-tab');
            const targetPane = document.getElementById(targetId);
            if(targetPane) targetPane.classList.add('active');
        });
    });

    renderCards();
    renderAdvices();

    // === Tips Modal Logic ===
    const btnTip = document.querySelector('.circle-pix');
    const tipsModal = document.getElementById('tipsModal');
    const closeTips = document.getElementById('closeTips');
    
    if(btnTip) {
        btnTip.addEventListener('click', (e) => {
            e.preventDefault();
            tipsModal.style.display = 'flex';
        });
    }
    
    if(closeTips) {
        closeTips.addEventListener('click', () => {
            tipsModal.style.display = 'none';
        });
    }
    
    // Close modal when clicking outside content
    window.addEventListener('click', (e) => {
        if(e.target === tipsModal) {
            tipsModal.style.display = 'none';
        }
    });

    // === Copy logical binding ===
    const copyBtns = document.querySelectorAll('.btn-copy');
    copyBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const textToCopy = btn.getAttribute('data-copy');
            navigator.clipboard.writeText(textToCopy).then(() => {
                const originalText = btn.innerText;
                btn.innerText = i18n[currentLang].copied || "Copiado!";
                btn.classList.add('copied');
                
                setTimeout(() => {
                    btn.innerText = originalText;
                    btn.classList.remove('copied');
                }, 2000);
            }).catch(err => {
                console.error('Failed to copy: ', err);
            });
        });
    });
});

const translationCache = {};
async function getTranslation(text, targetLang) {
    if (!text) return text;
    if (targetLang === 'pt') return text;
    
    const key = `${targetLang}_${text}`;
    if (translationCache[key]) return translationCache[key];
    
    try {
        const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=pt&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`);
        const data = await res.json();
        const translated = data[0].map(x => x[0]).join('');
        translationCache[key] = translated;
        return translated;
    } catch(e) {
        return text;
    }
}

// Fórmulas matemáticas para fallback 100% confiável e instantâneo
function getLocalDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Raio da Terra em km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return Math.round(R * c);
}

// OSRM Route API (Graça ~ Informação de distância e tráfego rodoviário simulado/médio)
async function getRouteInfo(userLat, userLon, destLat, destLon) {
    const fallbackDist = getLocalDistance(userLat, userLon, destLat, destLon);
    // Assumindo velocidade média na cidade de 30km/h (1km = 2min), multiplicamos a distancia por 2.5 pra margem de segurança no trânsito do RJ
    const fallbackTime = Math.round(fallbackDist * 2.5);
    
    try {
        // Wrapper com AbortController para dropar o OSRM caso demore mais de 2.0 segundos! (Impede demoras)
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);
        
        const url = `https://router.project-osrm.org/route/v1/driving/${userLon},${userLat};${destLon},${destLat}?overview=false`;
        const res = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);
        
        const data = await res.json();
        if(data.routes && data.routes.length > 0) {
            const distanceKm = Math.round(data.routes[0].distance / 1000);
            const durationMin = Math.round(data.routes[0].duration / 60);
            return { dist: distanceKm, timeMin: durationMin };
        }
    } catch(e) {
        console.error('OSRM timeout - Using Math Local Calculation');
    }
    
    // Retorna o cálculo matemático manual instantâneo se a API falhar! (NUNCA mais dará Unavailable)
    return { dist: fallbackDist, timeMin: fallbackTime };
}

function renderCards() {
    const placesPane = document.getElementById('tourist-places');
    if (!placesPane) return;

    let places = JSON.parse(localStorage.getItem('tourPlaces'));
    if (!places) {
        places = (typeof tourPlaces !== 'undefined') ? tourPlaces : [];
        localStorage.setItem('tourPlaces', JSON.stringify(places));
    }
    
    if (places.length === 0) {
        placesPane.innerHTML = `<p style="text-align:center; font-weight:300;">${i18n[currentLang].no_places}</p>`;
        return;
    }

    // 1. RENDERIZAR CARDS IMEDIATAMENTE (MUITO RÁPIDO)
    buildInitialCardsView(placesPane, places).then(() => {
        // 2. BUSCAR GEOLOCALIZAÇÃO E CALCULAR AS DISTÂNCIAS POR TRÁS DOS PANOS (LAZY)
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition((position) => {
                calculateAndUpdateRoutes(places, position.coords.latitude, position.coords.longitude);
            }, () => {
                markAllRoutes(places, i18n[currentLang].gps_blocked);
            });
        } else {
            markAllRoutes(places, i18n[currentLang].unavailable);
        }
    });
}

async function buildInitialCardsView(container, places) {
    const cardPromises = places.map(async (place) => {
        const mapUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(place.endereco)}`;
        const tTitulo = await getTranslation(place.titulo, currentLang);
        const tTempo = await getTranslation(place.tempo, currentLang);
        const tPreco = await getTranslation(place.preco, currentLang);

        return `
            <div class="card">
                <div class="tour-card-header">
                    <img src="${place.foto}" alt="${tTitulo}">
                    <div class="tour-card-overlay">
                        <h3>${tTitulo}</h3>
                    </div>
                </div>
                <div class="tour-card-body">
                    <div class="tour-info-row">
                        <div class="icon-circle">🕒</div>
                        <span>${i18n[currentLang].visit_time} ${tTempo}</span>
                    </div>
                    <div class="tour-info-row">
                        <div class="icon-circle">💲</div>
                        <span>${i18n[currentLang].price} ${tPreco}</span>
                    </div>
                    <div class="tour-info-row">
                        <div class="icon-circle">📍</div>
                        <span>${i18n[currentLang].distance} <span id="dist-${place.id}" style="color: #f39c12;">${i18n[currentLang].calculating}</span></span>
                    </div>
                    <div class="tour-info-row">
                        <div class="icon-circle">🚗</div>
                        <span>${i18n[currentLang].travel_time} <span id="time-${place.id}" style="color: #f39c12;">${i18n[currentLang].calculating}</span></span>
                    </div>
                    <a href="${mapUrl}" target="_blank">
                        <button class="btn-go">GO!</button>
                    </a>
                </div>
            </div>
        `;
    });

    const cardsHtmlArray = await Promise.all(cardPromises);
    container.innerHTML = cardsHtmlArray.join('');
}

function markAllRoutes(places, msg) {
    places.forEach(place => {
        const elDist = document.getElementById(`dist-${place.id}`);
        const elTime = document.getElementById(`time-${place.id}`);
        if(elDist) {
            elDist.innerText = msg;
            elDist.style.color = '#e74c3c';
        }
        if(elTime) {
            elTime.innerText = msg;
            elTime.style.color = '#e74c3c';
        }
    });
}

async function calculateAndUpdateRoutes(places, userLat, userLon) {
    places.forEach(async (place, index) => {
        let pLat = place.lat;
        let pLon = place.lon;
        let distanceText = i18n[currentLang].unavailable;
        let routeTimeText = i18n[currentLang].unavailable;

        if (!pLat || !pLon) {
            try {
                const cleanTitle = place.titulo.toLowerCase().split('(')[0].split('/')[0].split('-')[0].trim();
                const hardCoords = {
                    "grumari": { lat: -23.0478, lon: -43.5186 },
                    "boa vista": { lat: -22.9052, lon: -43.2229 },
                    "aquario": { lat: -22.8931, lon: -43.1895 },
                    "porto maravilha": { lat: -22.8953, lon: -43.1814 },
                    "amanhã": { lat: -22.8945, lon: -43.1795 },
                    "tomorrow": { lat: -22.8945, lon: -43.1795 }
                };

                let found = false;
                for(let k in hardCoords) {
                    if (cleanTitle.includes(k)) {
                        pLat = hardCoords[k].lat;
                        pLon = hardCoords[k].lon;
                        found = true; break;
                    }
                }

                if (!found) {
                    await new Promise(r => setTimeout(r, index * 600)); // Delay progressivo folgado p/ Nominatim
                    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cleanTitle + ", Rio de Janeiro")}`);
                    const dataGeo = await res.json();
                    if (dataGeo && dataGeo.length > 0) {
                        pLat = parseFloat(dataGeo[0].lat);
                        pLon = parseFloat(dataGeo[0].lon);
                    }
                }
                
                if (pLat && pLon) {
                    let allPlaces = JSON.parse(localStorage.getItem('tourPlaces')) || [];
                    const idx = allPlaces.findIndex(p => p.id === place.id);
                    if (idx !== -1) {
                        allPlaces[idx].lat = pLat;
                        allPlaces[idx].lon = pLon;
                        localStorage.setItem('tourPlaces', JSON.stringify(allPlaces));
                    }
                }
            } catch(e) { console.error('Geocoding fallback error', e); }
        }

        if (pLat && pLon) {
            try {
                await new Promise(r => setTimeout(r, index * 100)); // Delay escalonado para OSRM api (evita timeout coletivo)
                const routeInfo = await getRouteInfo(userLat, userLon, pLat, pLon);
                if (routeInfo) {
                    distanceText = `${routeInfo.dist} km`;
                    routeTimeText = routeInfo.timeMin > 60 ? `${Math.floor(routeInfo.timeMin/60)}h ${routeInfo.timeMin%60}m` : `${routeInfo.timeMin} min`;
                }
            } catch (e) {
                console.error('OSRM falhou silenciosamente para card', place.id);
            }
        }

        const elDist = document.getElementById(`dist-${place.id}`);
        const elTime = document.getElementById(`time-${place.id}`);
        if(elDist) {
            elDist.innerText = distanceText;
            elDist.style.color = (distanceText.includes('km') || distanceText.includes('min')) ? '#2ecc71' : '#e74c3c';
        }
        if(elTime) {
            elTime.innerText = routeTimeText;
            elTime.style.color = (distanceText.includes('km') || distanceText.includes('min')) ? '#2ecc71' : '#e74c3c';
        }
    });
}

async function renderAdvices() {
    const advicesPane = document.getElementById('advices');
    if (!advicesPane) return;

    let advices = JSON.parse(localStorage.getItem('tourAdvices'));
    if (!advices) {
        advices = (typeof tourAdvices !== 'undefined') ? tourAdvices : [];
        localStorage.setItem('tourAdvices', JSON.stringify(advices));
    }
    
    if (advices.length === 0) {
        advicesPane.innerHTML = `<p style="text-align:center; font-weight:300;">${i18n[currentLang].no_advices}</p>`;
        return;
    }

    advicesPane.innerHTML = `<p style="text-align:center; padding:20px; font-weight:300;">${i18n[currentLang].calculating}</p>`;
    
    const advicePromises = advices.map(async (adv) => {
        const tTitulo = await getTranslation(adv.titulo, currentLang);
        const tTexto = await getTranslation(adv.texto, currentLang);
        
        return `
            <div class="advice-card">
                <div class="advice-icon-wrap">
                    <img src="${adv.icone}" alt="${tTitulo}">
                </div>
                <div class="advice-content">
                    <h3>${tTitulo}</h3>
                    <p>${tTexto}</p>
                </div>
            </div>
        `;
    });

    const advHtmlArray = await Promise.all(advicePromises);
    advicesPane.innerHTML = advHtmlArray.join('');
}
