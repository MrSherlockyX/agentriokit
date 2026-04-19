document.addEventListener('DOMContentLoaded', () => {
    // ==========================================
    // SISTEMA DE LOGIN COM PIN E SESSION_STORAGE
    // ==========================================
    const pinOverlay = document.getElementById('pinOverlay');
    const adminContent = document.getElementById('adminContent');
    const pinInput = document.getElementById('pinInput');
    const btnPin = document.getElementById('btnPin');
    const pinError = document.getElementById('pinError');

    // Verificar se já logou na sessão atual do navegador
    if(sessionStorage.getItem('adminAuth') === 'true') {
        pinOverlay.style.display = 'none';
        adminContent.style.display = 'block';
    }

    if (btnPin) {
        btnPin.addEventListener('click', () => {
            if (pinInput.value === ADMIN_PIN) {
                // Autenticou
                sessionStorage.setItem('adminAuth', 'true');
                pinOverlay.style.display = 'none';
                adminContent.style.display = 'block';
            } else {
                // Errou a senha
                pinError.style.display = 'block';
                pinInput.value = '';
            }
        });
    }

    const form = document.getElementById('placeForm');
    const btnLimpar = document.getElementById('btnLimpar');
    const btnExport = document.getElementById('btnExport');

    if (btnExport) {
        btnExport.addEventListener('click', () => {
            const places = localStorage.getItem('tourPlaces') || '[]';
            const advices = localStorage.getItem('tourAdvices') || '[]';
            
            const output = `/* Arquivo gerado via Exportação do Painel */\nconst tourPlaces = ${places};\n\nconst tourAdvices = ${advices};\n`;
            
            const blob = new Blob([output], { type: 'application/javascript' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = 'data.js';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            alert("Sucesso! O banco 'data.js' foi gerado e baixado no seu computador.\nPegue este arquivo e cole-o DENTRO da pasta 'js', sobrepondo o arquivo antigo. Em seguida jogue a pasta inteira para hospedagem!");
        });
    }

    const enderecoInput = document.getElementById('endereco');
    const addressSuggestions = document.getElementById('addressSuggestions');
    const chosenLatInput = document.getElementById('chosenLat');
    const chosenLonInput = document.getElementById('chosenLon');

    let debounceTimeout;
    if (enderecoInput) {
        enderecoInput.addEventListener('input', (e) => {
            clearTimeout(debounceTimeout);
            const query = e.target.value;
            chosenLatInput.value = '';
            chosenLonInput.value = '';
            
            if (query.length < 5) {
                addressSuggestions.style.display = 'none';
                return;
            }

            debounceTimeout = setTimeout(async () => {
                try {
                    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query + ", Rio de Janeiro")}&limit=5`);
                    const data = await res.json();
                    
                    addressSuggestions.innerHTML = '';
                    if (data && data.length > 0) {
                        addressSuggestions.style.display = 'block';
                        data.forEach(item => {
                            const div = document.createElement('div');
                            div.style.padding = '10px';
                            div.style.borderBottom = '1px solid #ccc';
                            div.style.cursor = 'pointer';
                            div.style.fontSize = '12px';
                            div.innerText = item.display_name;
                            
                            div.addEventListener('click', () => {
                                enderecoInput.value = item.display_name;
                                chosenLatInput.value = item.lat;
                                chosenLonInput.value = item.lon;
                                addressSuggestions.style.display = 'none';
                            });
                            
                            addressSuggestions.appendChild(div);
                        });
                    } else {
                        addressSuggestions.style.display = 'none';
                    }
                } catch(err) {
                    console.error('Busca de sugestões falhou', err);
                }
            }, 600); // 600ms debounce p/ nao estressar api
        });
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const btnSubmit = form.querySelector('button[type="submit"]');
        btnSubmit.innerText = 'Buscando Coordenadas e Salvando...';
        btnSubmit.disabled = true;

        const titulo = document.getElementById('titulo').value;
        const foto = document.getElementById('foto').value;
        const tempo = document.getElementById('tempo').value;
        const preco = document.getElementById('preco').value;
        const endereco = document.getElementById('endereco').value;

        // Obter coordenadas escolhidas da lista suspensa (Autocomplete)
        let lat = chosenLatInput.value ? parseFloat(chosenLatInput.value) : null;
        let lon = chosenLonInput.value ? parseFloat(chosenLonInput.value) : null;
        
        // Fallback apenas se o usuario ignorou a lista suspensa e digitou algo à força, cego
        if (!lat || !lon) {
            try {
                let res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(endereco)}&limit=1`);
                let data = await res.json();
                if (data && data.length > 0) {
                    lat = parseFloat(data[0].lat);
                    lon = parseFloat(data[0].lon);
                } else {
                    res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(titulo)}&limit=1`);
                    data = await res.json();
                    if (data && data.length > 0) {
                        lat = parseFloat(data[0].lat);
                        lon = parseFloat(data[0].lon);
                    }
                }
            } catch (error) {
                console.error('Erro ao buscar coordenadas:', error);
            }
        }

        const newPlace = {
            id: Date.now().toString(),
            titulo,
            foto,
            tempo,
            preco,
            endereco,
            lat,
            lon
        };

        const places = JSON.parse(localStorage.getItem('tourPlaces') || '[]');
        places.push(newPlace);
        localStorage.setItem('tourPlaces', JSON.stringify(places));

        alert('Ponto turístico salvo com sucesso!');
        form.reset();
        chosenLatInput.value = '';
        chosenLonInput.value = '';
        if(addressSuggestions) addressSuggestions.style.display = 'none';
        
        btnSubmit.innerText = 'Salvar Card';
        btnSubmit.disabled = false;
        renderAdminList();
    });

    btnLimpar.addEventListener('click', () => {
        if(confirm('Tem certeza que deseja apagar todos os pontos turísticos e conselhos?')) {
            localStorage.removeItem('tourPlaces');
            localStorage.removeItem('tourAdvices');
            alert('Dados apagados com sucesso!');
            renderAdminList();
        }
    });

    const adviceForm = document.getElementById('adviceForm');
    if (adviceForm) {
        adviceForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const btnSubmit = adviceForm.querySelector('button[type="submit"]');
            btnSubmit.innerText = 'Salvando...';
            btnSubmit.disabled = true;

            const titulo = document.getElementById('advTitulo').value;
            const icone = document.getElementById('advIcone').value;
            const texto = document.getElementById('advTexto').value;

            const newAdvice = {
                id: Date.now().toString(),
                titulo,
                icone,
                texto
            };

            const advices = JSON.parse(localStorage.getItem('tourAdvices') || '[]');
            advices.push(newAdvice);
            localStorage.setItem('tourAdvices', JSON.stringify(advices));

            alert('Conselho salvo com sucesso!');
            adviceForm.reset();
            btnSubmit.innerText = 'Salvar Conselho';
            btnSubmit.disabled = false;
            renderAdminList();
        });
    }

    function renderAdminList() {
        const listDiv = document.getElementById('cardsList');
        if (!listDiv) return;
        
        let places = JSON.parse(localStorage.getItem('tourPlaces'));
        let advices = JSON.parse(localStorage.getItem('tourAdvices'));
        
        if (!places) {
            places = (typeof tourPlaces !== 'undefined') ? tourPlaces : [];
            localStorage.setItem('tourPlaces', JSON.stringify(places));
        }
        if (!advices) {
            advices = (typeof tourAdvices !== 'undefined') ? tourAdvices : [];
            localStorage.setItem('tourAdvices', JSON.stringify(advices));
        }
        
        listDiv.innerHTML = '';
        
        places.forEach(p => {
            listDiv.innerHTML += `
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #eee; padding-bottom: 8px;">
                    <div>
                        <strong>[Turismo]</strong> ${p.titulo}
                    </div>
                    <button onclick="deleteItem('tourPlaces', '${p.id}')" style="background:#e74c3c; color:#fff; border:none; padding:5px 12px; border-radius:8px; cursor:pointer; font-weight:bold;">Excluir</button>
                </div>
            `;
        });
        
        advices.forEach(a => {
            listDiv.innerHTML += `
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #eee; padding-bottom: 8px;">
                    <div>
                        <strong>[Conselho]</strong> ${a.titulo}
                    </div>
                    <button onclick="deleteItem('tourAdvices', '${a.id}')" style="background:#e74c3c; color:#fff; border:none; padding:5px 12px; border-radius:8px; cursor:pointer; font-weight:bold;">Excluir</button>
                </div>
            `;
        });
        
        if (places.length === 0 && advices.length === 0) {
            listDiv.innerHTML = '<p style="font-size:14px;">Nenhum card encontrado.</p>';
        }
    }
    
    window.deleteItem = function(storageKey, id) {
        if(confirm('Tem certeza que deseja excluir este card especificamente?')) {
            let items = JSON.parse(localStorage.getItem(storageKey)) || [];
            items = items.filter(item => item.id !== id);
            localStorage.setItem(storageKey, JSON.stringify(items));
            renderAdminList();
            alert('Removido com sucesso!');
        }
    };
    
    renderAdminList();
});
