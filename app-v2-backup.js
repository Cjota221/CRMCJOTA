// ==========================================
// CRM LEVE - APLICAÇÃO PRINCIPAL
// ==========================================

// Estado Global da Aplicação
const state = {
    clients: [],
    groups: [],
    importHistory: [],
    filteredClients: [],
    selectedClientIds: new Set(),
    currentPage: 1,
    rowsPerPage: 100,
    contextClient: null,
    currentClientInModal: null,
    currentGroupIdToExport: null
};

// ==========================================
// INICIALIZAÇÃO
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    init();
});

function init() {
    loadDataFromLocalStorage();
    cacheDOM();
    setupEventListeners();
    applyTheme();
    
    if (state.clients.length > 0) {
        populateStateFilter();
        populateYearFilter();
        state.filteredClients = [...state.clients];
        renderAll();
        navigateTo('dashboard');
    } else {
        navigateTo('upload');
    }
    
    DOM.app.style.opacity = '1';
}

// Cache de elementos DOM
const DOM = {};

function cacheDOM() {
    DOM.app = document.getElementById('app');
    DOM.sidebar = document.querySelector('.sidebar');
    DOM.menuToggle = document.getElementById('menu-toggle');
    DOM.mainNav = document.getElementById('main-nav');
    DOM.breadcrumb = document.getElementById('breadcrumb');
    DOM.themeSwitcher = document.getElementById('theme-switcher');
    DOM.globalSearch = document.getElementById('global-search');
    
    // Views
    DOM.views = {
        dashboard: document.getElementById('dashboard-view'),
        inactivity: document.getElementById('inactivity-view'),
        upload: document.getElementById('upload-view'),
        clients: document.getElementById('clients-view'),
        groups: document.getElementById('groups-view'),
    };
    
    // Upload
    DOM.uploadBox = document.getElementById('upload-box');
    DOM.fileInput = document.getElementById('csv-file-input');
    DOM.loadingSpinner = document.getElementById('loading-spinner');
    DOM.importHistoryList = document.getElementById('import-history-list');
    DOM.syncDataBtn = document.getElementById('sync-data-btn');
    
    // Clientes
    DOM.clientsTableBody = document.querySelector('#clients-table tbody');
    DOM.paginationControls = document.getElementById('pagination-controls');
    DOM.filteredCountEl = document.getElementById('filtered-count');
    DOM.sortByEl = document.getElementById('sort-by');
    DOM.filterStateEl = document.getElementById('filter-state');
    DOM.filterMinPurchaseEl = document.getElementById('filter-min-purchase');
    DOM.filterMaxPurchaseEl = document.getElementById('filter-max-purchase');
    DOM.filterInactivityEl = document.getElementById('filter-inactivity');
    DOM.filterBirthdayMonthEl = document.getElementById('filter-birthday-month');
    DOM.filterLastPurchaseYearEl = document.getElementById('filter-last-purchase-year');
    DOM.applyFiltersBtn = document.getElementById('apply-filters');
    DOM.createGroupBtn = document.getElementById('create-group-btn');
    DOM.createGroupSelectionBtn = document.getElementById('create-group-selection-btn');
    DOM.filterTodayBirthdayBtn = document.getElementById('filter-today-birthday-btn');
    
    // Seleção e Exportação
    DOM.selectAllPageCheckbox = document.getElementById('select-all-page');
    DOM.selectAllFilteredBtn = document.getElementById('select-all-filtered-btn');
    DOM.clearSelectionBtn = document.getElementById('clear-selection-btn');
    DOM.exportActions = document.getElementById('export-actions');
    DOM.selectedCountEl = document.getElementById('selected-count');
    DOM.pageCountEl = document.getElementById('page-count');
    DOM.filteredTotalEl = document.getElementById('filtered-total');
    DOM.exportWhatsappBtn = document.getElementById('export-whatsapp-btn');
    DOM.exportEmailBtn = document.getElementById('export-email-btn');
    DOM.exportBothBtn = document.getElementById('export-both-btn');
    
    // Grupos
    DOM.groupListEl = document.getElementById('group-list');
    DOM.inactivityReportGrid = document.getElementById('inactivity-report-grid');
    
    // Modais
    DOM.modals = {
        createGroup: document.getElementById('create-group-modal'),
        renameGroup: document.getElementById('rename-group-modal'),
        viewGroup: document.getElementById('view-group-modal'),
        viewClient: document.getElementById('view-client-modal'),
    };
    
    DOM.groupNameInput = document.getElementById('group-name');
    DOM.groupClientCountEl = document.getElementById('group-client-count');
    DOM.saveGroupBtn = document.getElementById('save-group-btn');
    DOM.viewGroupNameEl = document.getElementById('view-group-name');
    DOM.groupClientsTableBody = document.querySelector('#group-clients-table tbody');
    DOM.exportGroupWhatsappBtn = document.getElementById('export-group-whatsapp-btn');
    DOM.exportGroupEmailBtn = document.getElementById('export-group-email-btn');
    DOM.exportGroupBothBtn = document.getElementById('export-group-both-btn');
    DOM.renameGroupNameInput = document.getElementById('rename-group-name');
    DOM.renameGroupIdInput = document.getElementById('rename-group-id');
    DOM.renameGroupSaveBtn = document.getElementById('rename-group-save-btn');
    DOM.saveClientNoteBtn = document.getElementById('save-client-note-btn');
    DOM.contextMenu = document.getElementById('context-menu');
    DOM.resetDataBtn = document.getElementById('reset-data');
    DOM.notificationEl = document.getElementById('notification');
}

// ==========================================
// NAVEGAÇÃO
// ==========================================
function navigateTo(viewName) {
    Object.values(DOM.views).forEach(v => v.classList.remove('active'));
    if (DOM.views[viewName]) DOM.views[viewName].classList.add('active');
    
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if(link.getAttribute('href') === `#${viewName}`) {
            link.classList.add('active');
            DOM.breadcrumb.textContent = `Dashboard > ${link.title}`;
        }
    });

    if (viewName === 'dashboard') {
        renderDashboard();
        DOM.breadcrumb.textContent = 'Dashboard';
    }
    if (viewName === 'inactivity') {
        renderInactivityReport();
    }
    
    DOM.sidebar.classList.remove('open');
}

// ==========================================
// GERENCIAMENTO DE DADOS (LocalStorage)
// ==========================================
function loadDataFromLocalStorage() {
    state.clients = JSON.parse(localStorage.getItem('crm_clients') || '[]');
    state.groups = JSON.parse(localStorage.getItem('crm_groups') || '[]');
    state.importHistory = JSON.parse(localStorage.getItem('crm_import_history') || '[]');
}

function saveDataToLocalStorage() {
    localStorage.setItem('crm_clients', JSON.stringify(state.clients));
    localStorage.setItem('crm_groups', JSON.stringify(state.groups));
    localStorage.setItem('crm_import_history', JSON.stringify(state.importHistory));
}

// ==========================================
// UPLOAD E PROCESSAMENTO DE CSV
// ==========================================
function handleFileUpload(file) {
    if (!file || !file.type.match('text/csv')) {
        return showNotification('Por favor, selecione um arquivo .CSV válido.', 'error');
    }
    
    DOM.loadingSpinner.style.display = 'block';
    DOM.uploadBox.style.display = 'none';
    
    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const csvText = event.target.result;
            processAndMergeData(csvText, file.name);
            
            state.importHistory.push({
                filename: file.name,
                date: new Date().toISOString(),
                content: csvText
            });
            
            saveDataToLocalStorage();
            
            setTimeout(() => {
                DOM.loadingSpinner.style.display = 'none';
                DOM.uploadBox.style.display = 'block';
                populateStateFilter();
                populateYearFilter();
                renderAll();
            }, 500);
        } catch (error) {
            showNotification(`Ocorreu um erro: ${error.message}`, 'error');
            console.error(error);
            DOM.loadingSpinner.style.display = 'none';
            DOM.uploadBox.style.display = 'block';
        }
    };
    reader.readAsText(file, 'UTF-8');
}

function processAndMergeData(csvText, filename) {
    const newClients = processCSV(csvText);
    let addedCount = 0;
    let updatedCount = 0;
    let maxId = state.clients.length > 0 ? Math.max(...state.clients.map(c => c.id)) : 0;

    newClients.forEach(newClient => {
        if (!newClient.whatsapp) return;

        const existingClient = state.clients.find(c => c.whatsapp === newClient.whatsapp);
        if (existingClient) {
            let wasUpdated = false;
            const newPurchaseDate = new Date(newClient.dataUltimaCompra);
            const existingPurchaseDate = new Date(existingClient.dataUltimaCompra);

            if (newPurchaseDate > existingPurchaseDate) {
                existingClient.dataUltimaCompra = newClient.dataUltimaCompra;
                existingClient.totalCompras = newClient.totalCompras;
                wasUpdated = true;
            }

            for (const key of ['email', 'cpf', 'endereco', 'cidade', 'estado', 'dataNascimento']) {
                if (!existingClient[key] && newClient[key]) {
                    existingClient[key] = newClient[key];
                    wasUpdated = true;
                }
            }

            if (wasUpdated) updatedCount++;

        } else {
            newClient.id = ++maxId;
            state.clients.push(newClient);
            addedCount++;
        }
    });
    
    showNotification(`"${filename}": ${addedCount} novos clientes. ${updatedCount} atualizados.`);
}

function processCSV(csvText) {
    const lines = csvText.split(/\r\n|\n/).filter(line => line.trim() !== '');
    if (lines.length < 2) return [];
    
    const headerLine = lines[0].replace(/^\uFEFF/, '');
    const delimiter = (headerLine.match(/;/g) || []).length > (headerLine.match(/,/g) || []).length ? ';' : ',';
    const headers = headerLine.split(delimiter).map(h => h.trim().replace(/"/g, '').toLowerCase());
    const dataLines = lines.slice(1);
    
    const fieldMappingConfig = {
        nome: { aliases: ['nome', 'nome cliente', 'cliente', 'destinatário', 'razão social', 'nome fantasia'], index: -1, required: true },
        whatsapp: { aliases: ['whatsapp', 'telefone 2', 'telefone', 'celular', 'telefone principal'], index: -1, required: true },
        email: { aliases: ['email', 'e-mail'], index: -1 },
        cpf: { aliases: ['cpf', 'cnpj', 'cpf/cnpj'], index: -1 },
        endereco: { aliases: ['endereço', 'endereco', 'endereco1'], index: -1 },
        estado: { aliases: ['estado', 'uf'], index: -1 },
        cidade: { aliases: ['cidade'], index: -1 },
        totalCompras: { aliases: ['total compras', 'total com', 'valor total'], index: -1 },
        dataNascimento: { aliases: ['data nascimento', 'datanascimento(dd/mm/yyyy)', 'data de aniversário'], index: -1 },
        dataUltimaCompra: { aliases: ['última compra', 'ultima compra'], index: -1 }
    };
    
    for (const fieldKey in fieldMappingConfig) {
        const config = fieldMappingConfig[fieldKey];
        const foundAlias = config.aliases.find(alias => headers.includes(alias));
        if (foundAlias) config.index = headers.indexOf(foundAlias);
        if (config.required && config.index === -1) {
            throw new Error(`Coluna obrigatória não encontrada: "${config.aliases.join('", "')}"`);
        }
    }
    
    const normalizePhone = (phone) => {
        if (!phone) return '';
        let cleanPhone = phone.replace(/\D/g, '');
        if (cleanPhone.startsWith('55') && cleanPhone.length > 11) {
            return cleanPhone;
        }
        return cleanPhone;
    };
    
    const cleanData = (data) => data ? data.trim().replace(/"/g, '').replace(/'/g, '') : '';
    
    const parseDate = (dateString) => {
        if (!dateString) return null;
        const parts = dateString.match(/(\d+)/g);
        if (!parts || parts.length < 3) return null;
        if (parts[0].length <= 2 && parts[1].length <= 2 && parts[2].length === 4) {
            return new Date(parts[2], parts[1] - 1, parts[0]);
        }
        if (parts[0].length === 4 && parts[1].length <= 2 && parts[2].length <= 2) {
            return new Date(parts[0], parts[1] - 1, parts[2]);
        }
        return null;
    };
    
    const clientsData = dataLines.map(line => {
        const data = line.split(delimiter);
        const nome = fieldMappingConfig.nome.index !== -1 ? cleanData(data[fieldMappingConfig.nome.index]) : 'N/A';
        const whatsapp = fieldMappingConfig.whatsapp.index !== -1 ? normalizePhone(cleanData(data[fieldMappingConfig.whatsapp.index])) : '';
        
        let lastPurchase = null;
        const lastPurchaseRaw = fieldMappingConfig.dataUltimaCompra.index !== -1 ? cleanData(data[fieldMappingConfig.dataUltimaCompra.index]) : null;
        lastPurchase = parseDate(lastPurchaseRaw);
        
        if (!lastPurchase) {
            lastPurchase = new Date();
            lastPurchase.setDate(lastPurchase.getDate() - Math.floor(Math.random() * 365 * 2));
        }
        
        const birthDateRaw = fieldMappingConfig.dataNascimento.index !== -1 ? cleanData(data[fieldMappingConfig.dataNascimento.index]) : null;
        const dataNascimento = parseDate(birthDateRaw);
        
        let totalCompras = 0;
        if (fieldMappingConfig.totalCompras.index !== -1 && data[fieldMappingConfig.totalCompras.index]) {
            const totalComprasRaw = cleanData(data[fieldMappingConfig.totalCompras.index]);
            totalCompras = parseFloat(totalComprasRaw.replace(/[R$."]/g, '').replace(',', '.')) || 0;
        }
        
        return {
            nome,
            whatsapp,
            isFavorite: false,
            notes: [],
            email: fieldMappingConfig.email.index !== -1 ? cleanData(data[fieldMappingConfig.email.index]) : '',
            cpf: fieldMappingConfig.cpf.index !== -1 ? cleanData(data[fieldMappingConfig.cpf.index]) : '',
            endereco: fieldMappingConfig.endereco.index !== -1 ? cleanData(data[fieldMappingConfig.endereco.index]) : '',
            estado: fieldMappingConfig.estado.index !== -1 ? cleanData(data[fieldMappingConfig.estado.index]) : 'N/A',
            cidade: fieldMappingConfig.cidade.index !== -1 ? cleanData(data[fieldMappingConfig.cidade.index]) : 'N/A',
            totalCompras,
            dataUltimaCompra: lastPurchase.toISOString(),
            dataNascimento: dataNascimento ? dataNascimento.toISOString() : null
        };
    });
    
    return clientsData.filter(c => c.nome && c.nome !== 'N/A' && c.whatsapp && c.whatsapp.length >= 10);
}

function syncAllData() {
    showNotification('Sincronizando todos os dados...');
    state.clients = [];
    const historyCopy = [...state.importHistory];
    state.importHistory = [];
    
    historyCopy.forEach(item => {
        processAndMergeData(item.content, item.filename);
        state.importHistory.push({
            filename: item.filename,
            date: item.date,
            content: item.content
        });
    });
    
    saveDataToLocalStorage();
    renderAll();
    showNotification('Sincronização completa!', 'success');
}

// ==========================================
// RENDERIZAÇÕES
// ==========================================
function renderAll() {
    renderClientsTable();
    renderGroups();
    renderDashboard();
    renderInactivityReport();
    renderImportHistory();
    updateSelectionUI();
}

function renderClientsTable() {
    DOM.clientsTableBody.innerHTML = '';
    
    if (state.filteredClients.length === 0) {
        DOM.clientsTableBody.innerHTML = '<tr><td colspan="9" style="text-align:center;">Nenhum cliente encontrado.</td></tr>';
        renderPagination();
        return;
    }
    
    const paginatedClients = state.filteredClients.slice(
        (state.currentPage - 1) * state.rowsPerPage,
        state.currentPage * state.rowsPerPage
    );
    
    DOM.pageCountEl.textContent = paginatedClients.length;
    DOM.filteredTotalEl.textContent = state.filteredClients.length;
    
    paginatedClients.forEach(client => {
        const row = document.createElement('tr');
        row.dataset.clientId = client.id;
        
        const lastPurchaseDate = new Date(client.dataUltimaCompra);
        const birthDate = client.dataNascimento ? new Date(client.dataNascimento) : null;
        
        row.innerHTML = `
            <td data-label=""><input type="checkbox" class="client-checkbox" data-client-id="${client.id}" ${state.selectedClientIds.has(client.id) ? 'checked' : ''}></td>
            <td data-label="Favorito"><span class="favorite-star ${client.isFavorite ? 'favorited' : ''}" data-client-id="${client.id}">&#9733;</span></td>
            <td data-label="Nome">${client.nome}</td>
            <td data-label="WhatsApp">${client.whatsapp}</td>
            <td data-label="E-mail">${client.email || 'N/A'}</td>
            <td data-label="Localização">${client.cidade || 'N/A'}, ${client.estado || 'N/A'}</td>
            <td data-label="Última Compra">${lastPurchaseDate.toLocaleDateString('pt-BR')}</td>
            <td data-label="Data Nasc.">${birthDate ? birthDate.toLocaleDateString('pt-BR') : 'N/A'}</td>
            <td data-label="Ações"><button class="button button-secondary view-details-btn" data-client-id="${client.id}">Ver</button></td>
        `;
        
        DOM.clientsTableBody.appendChild(row);
    });
    
    renderPagination();
}

function renderPagination() {
    DOM.paginationControls.innerHTML = '';
    const totalPages = Math.ceil(state.filteredClients.length / state.rowsPerPage);
    
    if (totalPages <= 1) return;
    
    const prevButton = document.createElement('button');
    prevButton.innerText = 'Anterior';
    prevButton.disabled = state.currentPage === 1;
    prevButton.onclick = () => {
        state.currentPage--;
        renderClientsTable();
        updatePageCheckbox();
    };
    
    const pageInfo = document.createElement('span');
    pageInfo.innerText = `Página ${state.currentPage} de ${totalPages}`;
    
    const nextButton = document.createElement('button');
    nextButton.innerText = 'Próxima';
    nextButton.disabled = state.currentPage === totalPages;
    nextButton.onclick = () => {
        state.currentPage++;
        renderClientsTable();
        updatePageCheckbox();
    };
    
    DOM.paginationControls.append(prevButton, pageInfo, nextButton);
}

function renderGroups() {
    DOM.groupListEl.innerHTML = '';
    
    if (state.groups.length === 0) {
        return DOM.groupListEl.innerHTML = '<p>Nenhum grupo criado ainda. Use os filtros na aba "Clientes" para criar um.</p>';
    }
    
    state.groups.forEach(group => {
        const groupItem = document.createElement('div');
        groupItem.className = 'group-item';
        groupItem.innerHTML = `
            <div>
                <h3>${group.name}</h3>
                <p>${group.clientIds.length} cliente(s)</p>
            </div>
            <div class="group-actions">
                <button class="button button-secondary view-group-btn" data-group-id="${group.id}">Ver</button>
                <button class="button button-secondary edit-group-btn" data-group-id="${group.id}">Renomear</button>
                <button class="button button-danger delete-group-btn" data-group-id="${group.id}">Excluir</button>
            </div>
        `;
        DOM.groupListEl.appendChild(groupItem);
    });
}

function renderImportHistory() {
    DOM.importHistoryList.innerHTML = '';
    
    if (state.importHistory.length === 0) {
        DOM.importHistoryList.innerHTML = `<li>Nenhum arquivo importado ainda.</li>`;
        return;
    }
    
    state.importHistory.forEach(item => {
        const date = new Date(item.date);
        const li = document.createElement('li');
        li.innerHTML = `<span>${item.filename}</span><span style="color: var(--secondary-color)">${date.toLocaleDateString()} ${date.toLocaleTimeString()}</span>`;
        DOM.importHistoryList.appendChild(li);
    });
}

function renderDashboard() {
    const ninetyDaysAgo = new Date().setDate(new Date().getDate() - 90);
    const activeClients = state.clients.filter(c => new Date(c.dataUltimaCompra) > ninetyDaysAgo).length;
    
    document.getElementById('db-total-clients').textContent = state.clients.length;
    document.getElementById('db-active-inactive').textContent = `${activeClients} / ${state.clients.length - activeClients}`;
    
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1));
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    const birthdayList = document.getElementById('db-birthday-list');
    birthdayList.innerHTML = '';
    
    const weeklyBirthdays = state.clients.filter(c => {
        if (!c.dataNascimento) return false;
        const birthDate = new Date(c.dataNascimento);
        const birthDay = birthDate.getDate();
        const birthMonth = birthDate.getMonth();
        
        for (let d = new Date(startOfWeek); d <= endOfWeek; d.setDate(d.getDate() + 1)) {
            if (d.getDate() === birthDay && d.getMonth() === birthMonth) return true;
        }
        return false;
    });
    
    document.getElementById('db-birthday-week').textContent = weeklyBirthdays.length;
    weeklyBirthdays.slice(0, 3).forEach(c => birthdayList.innerHTML += `<li>${c.nome}</li>`);
    if (weeklyBirthdays.length === 0) birthdayList.innerHTML = `<li>Nenhum na semana.</li>`;
    
    const topClientsList = document.getElementById('db-top-clients');
    topClientsList.innerHTML = '';
    [...state.clients].sort((a,b) => b.totalCompras - a.totalCompras)
        .slice(0,5)
        .forEach(c => topClientsList.innerHTML += `<li>${c.nome}</li>`);
}

function renderInactivityReport() {
    const now = new Date();
    const segments = {
        active: { label: "Compraram nos últimos 3 meses", count: 0, min: 0, max: 90 },
        warm: { label: "Inativos de 3 a 6 meses", count: 0, min: 90, max: 180 },
        cool: { label: "Inativos de 6 meses a 1 ano", count: 0, min: 180, max: 365 },
        cold: { label: "Inativos há mais de 1 ano", count: 0, min: 365, max: Infinity }
    };

    state.clients.forEach(c => {
        const diffDays = (now - new Date(c.dataUltimaCompra)) / (1000 * 3600 * 24);
        if (diffDays >= 365) segments.cold.count++;
        else if (diffDays >= 180) segments.cool.count++;
        else if (diffDays >= 90) segments.warm.count++;
        else segments.active.count++;
    });

    DOM.inactivityReportGrid.innerHTML = Object.values(segments).map(s => `
        <div class="dashboard-card">
            <h3>${s.label}</h3>
            <p class="metric">${s.count}</p>
            <button class="button view-inactivity-group" data-min-days="${s.min}" data-max-days="${s.max}" style="margin-top: 1rem;">Ver Clientes</button>
        </div>
    `).join('');
}

// ==========================================
// FILTROS
// ==========================================
function applyAllFilters(searchTerm = null) {
    let result = [...state.clients];
    
    if (searchTerm) {
        const term = searchTerm.toLowerCase();
        result = result.filter(c => 
            c.nome.toLowerCase().includes(term) || 
            c.whatsapp.includes(term) || 
            (c.email && c.email.toLowerCase().includes(term)) ||
            (c.cidade && c.cidade.toLowerCase().includes(term))
        );
    } else {
        if (DOM.filterStateEl.value) {
            result = result.filter(c => c.estado === DOM.filterStateEl.value);
        }
        
        const minPurchase = parseFloat(DOM.filterMinPurchaseEl.value);
        if (!isNaN(minPurchase)) {
            result = result.filter(c => c.totalCompras >= minPurchase);
        }
        
        const maxPurchase = parseFloat(DOM.filterMaxPurchaseEl.value);
        if (!isNaN(maxPurchase)) {
            result = result.filter(c => c.totalCompras <= maxPurchase);
        }
        
        if (DOM.filterInactivityEl.value) {
            const now = new Date();
            result = result.filter(c => 
                (now - new Date(c.dataUltimaCompra)) / (1000 * 3600 * 24) > DOM.filterInactivityEl.value
            );
        }
        
        if (DOM.filterBirthdayMonthEl.value) {
            result = result.filter(c => 
                c.dataNascimento && new Date(c.dataNascimento).getMonth() + 1 === +DOM.filterBirthdayMonthEl.value
            );
        }
        
        if (DOM.filterLastPurchaseYearEl.value) {
            result = result.filter(c => 
                c.dataUltimaCompra && new Date(c.dataUltimaCompra).getFullYear() === +DOM.filterLastPurchaseYearEl.value
            );
        }
    }
    
    const sortBy = DOM.sortByEl.value;
    result.sort((a, b) => {
        if (sortBy === 'favorites') return (b.isFavorite || 0) - (a.isFavorite || 0);
        if (sortBy === 'total_asc') return a.totalCompras - b.totalCompras;
        if (sortBy === 'inactive_desc') return new Date(a.dataUltimaCompra) - new Date(b.dataUltimaCompra);
        if (sortBy === 'inactive_asc') return new Date(b.dataUltimaCompra) - new Date(a.dataUltimaCompra);
        return b.totalCompras - a.totalCompras;
    });
    
    state.filteredClients = result;
    state.currentPage = 1;
    DOM.filteredCountEl.textContent = `${result.length} cliente(s) encontrado(s).`;
    DOM.createGroupBtn.disabled = result.length === 0;
    renderClientsTable();
    updateSelectionUI();
}

function populateStateFilter() {
    const states = [...new Set(state.clients.map(c => c.estado))].sort();
    DOM.filterStateEl.innerHTML = '<option value="">Todos</option>';
    states.forEach(s => {
        if (s && s.trim()) {
            DOM.filterStateEl.innerHTML += `<option value="${s}">${s}</option>`;
        }
    });
}

function populateYearFilter() {
    const years = [...new Set(state.clients.map(c => new Date(c.dataUltimaCompra).getFullYear()))]
        .sort((a, b) => b - a);
    DOM.filterLastPurchaseYearEl.innerHTML = '<option value="">Todos</option>';
    years.forEach(y => DOM.filterLastPurchaseYearEl.innerHTML += `<option value="${y}">${y}</option>`);
}

function filterTodayBirthdays() {
    const today = new Date();
    const day = today.getDate();
    const month = today.getMonth() + 1;
    
    const result = state.clients.filter(c => {
        if (!c.dataNascimento) return false;
        const birthDate = new Date(c.dataNascimento);
        return !isNaN(birthDate.getTime()) && 
               birthDate.getDate() === day && 
               birthDate.getMonth() + 1 === month;
    });
    
    [DOM.filterStateEl, DOM.filterInactivityEl, DOM.filterMinPurchaseEl, 
     DOM.filterMaxPurchaseEl, DOM.filterBirthdayMonthEl, DOM.filterLastPurchaseYearEl]
        .forEach(el => el.value = '');
    
    DOM.sortByEl.value = 'total_desc';
    state.filteredClients = result;
    state.currentPage = 1;
    DOM.filteredCountEl.textContent = `${result.length} aniversariante(s) hoje.`;
    DOM.createGroupBtn.disabled = result.length === 0;
    renderClientsTable();
}

function filterByInactivityRange(minDays, maxDays = Infinity) {
    const now = new Date();
    const result = state.clients.filter(c => {
        const diffDays = (now - new Date(c.dataUltimaCompra)) / (1000 * 3600 * 24);
        return diffDays >= minDays && diffDays < maxDays;
    });
    
    state.filteredClients = result;
    state.currentPage = 1;
    DOM.globalSearch.value = '';
    
    [DOM.filterStateEl, DOM.filterInactivityEl, DOM.filterMinPurchaseEl, 
     DOM.filterMaxPurchaseEl, DOM.filterBirthdayMonthEl, DOM.filterLastPurchaseYearEl]
        .forEach(el => el.value = '');
    
    navigateTo('clients');
    DOM.filteredCountEl.textContent = `${result.length} cliente(s) encontrado(s).`;
    DOM.createGroupBtn.disabled = result.length === 0;
    renderClientsTable();
}

// ==========================================
// SELEÇÃO DE CLIENTES
// ==========================================
function updateSelectionUI() {
    const count = state.selectedClientIds.size;
    
    DOM.selectedCountEl.textContent = count;
    
    if (count > 0) {
        DOM.createGroupBtn.style.display = 'none';
        DOM.createGroupSelectionBtn.style.display = 'inline-flex';
        DOM.createGroupSelectionBtn.textContent = `Criar Grupo com ${count} Selecionado(s)`;
        DOM.exportActions.style.display = 'block';
        DOM.clearSelectionBtn.style.display = 'inline-flex';
    } else {
        DOM.createGroupBtn.style.display = 'inline-flex';
        DOM.createGroupSelectionBtn.style.display = 'none';
        DOM.exportActions.style.display = 'none';
        DOM.clearSelectionBtn.style.display = 'none';
        DOM.createGroupBtn.disabled = state.filteredClients.length === 0;
    }
    
    updatePageCheckbox();
}

function updatePageCheckbox() {
    const paginatedClients = state.filteredClients.slice(
        (state.currentPage - 1) * state.rowsPerPage,
        state.currentPage * state.rowsPerPage
    );
    
    const allPageSelected = paginatedClients.length > 0 && 
        paginatedClients.every(c => state.selectedClientIds.has(c.id));
    
    DOM.selectAllPageCheckbox.checked = allPageSelected;
}

function selectAllOnPage() {
    const paginatedClients = state.filteredClients.slice(
        (state.currentPage - 1) * state.rowsPerPage,
        state.currentPage * state.rowsPerPage
    );
    
    const isChecked = DOM.selectAllPageCheckbox.checked;
    
    paginatedClients.forEach(client => {
        if (isChecked) {
            state.selectedClientIds.add(client.id);
        } else {
            state.selectedClientIds.delete(client.id);
        }
    });
    
    renderClientsTable();
    updateSelectionUI();
}

function selectAllFiltered() {
    state.filteredClients.forEach(client => {
        state.selectedClientIds.add(client.id);
    });
    
    renderClientsTable();
    updateSelectionUI();
    showNotification(`${state.filteredClients.length} clientes selecionados!`);
}

function clearSelection() {
    state.selectedClientIds.clear();
    renderClientsTable();
    updateSelectionUI();
    showNotification('Seleção limpa!');
}

// ==========================================
// EXPORTAÇÃO
// ==========================================
function exportClients(type) {
    const selectedClients = state.clients.filter(c => state.selectedClientIds.has(c.id));
    
    if (selectedClients.length === 0) {
        return showNotification('Nenhum cliente selecionado para exportar.', 'error');
    }
    
    let csvContent = "data:text/csv;charset=utf-8,";
    let headers = [];
    
    if (type === 'whatsapp' || type === 'both') {
        headers.push('Nome', 'WhatsApp');
    }
    if (type === 'email' || type === 'both') {
        if (!headers.includes('Nome')) headers.push('Nome');
        headers.push('E-mail');
    }
    
    csvContent += headers.join(',') + '\r\n';
    
    selectedClients.forEach(client => {
        let row = [];
        
        if (type === 'whatsapp') {
            let phone = client.whatsapp.replace(/\D/g, '');
            if (!phone.startsWith('55')) phone = `55${phone}`;
            row.push(`"${client.nome.replace(/"/g, '""')}"`, `+${phone}`);
        } else if (type === 'email') {
            row.push(
                `"${client.nome.replace(/"/g, '""')}"`,
                `"${(client.email || '').replace(/"/g, '""`')}"`
            );
        } else if (type === 'both') {
            let phone = client.whatsapp.replace(/\D/g, '');
            if (!phone.startsWith('55')) phone = `55${phone}`;
            row.push(
                `"${client.nome.replace(/"/g, '""')}"`,
                `+${phone}`,
                `"${(client.email || '').replace(/"/g, '""')}"`
            );
        }
        
        csvContent += row.join(',') + '\r\n';
    });
    
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `clientes_${type}_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification(`${selectedClients.length} clientes exportados com sucesso!`);
}

function exportGroup(groupId, type) {
    const group = state.groups.find(g => g.id === groupId);
    if (!group) return;
    
    const clientsInGroup = group.clientIds
        .map(id => state.clients.find(c => c.id === id))
        .filter(Boolean);
    
    let csvContent = "data:text/csv;charset=utf-8,";
    let headers = [];
    
    if (type === 'whatsapp' || type === 'both') {
        headers.push('Nome', 'WhatsApp');
    }
    if (type === 'email' || type === 'both') {
        if (!headers.includes('Nome')) headers.push('Nome');
        headers.push('E-mail');
    }
    
    csvContent += headers.join(',') + '\r\n';
    
    clientsInGroup.forEach(client => {
        let row = [];
        
        if (type === 'whatsapp') {
            let phone = client.whatsapp.replace(/\D/g, '');
            if (!phone.startsWith('55')) phone = `55${phone}`;
            row.push(`"${client.nome.replace(/"/g, '""')}"`, `+${phone}`);
        } else if (type === 'email') {
            row.push(
                `"${client.nome.replace(/"/g, '""')}"`,
                `"${(client.email || '').replace(/"/g, '""')}"`
            );
        } else if (type === 'both') {
            let phone = client.whatsapp.replace(/\D/g, '');
            if (!phone.startsWith('55')) phone = `55${phone}`;
            row.push(
                `"${client.nome.replace(/"/g, '""')}"`,
                `+${phone}`,
                `"${(client.email || '').replace(/"/g, '""')}"`
            );
        }
        
        csvContent += row.join(',') + '\r\n';
    });
    
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `grupo_${group.name.replace(/\s/g, '_')}_${type}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// ==========================================
// GRUPOS
// ==========================================
function saveGroup() {
    const name = DOM.groupNameInput.value.trim();
    if (!name) {
        return showNotification('Por favor, dê um nome ao grupo.', 'error');
    }
    
    const clientIdsToSave = state.selectedClientIds.size > 0 
        ? Array.from(state.selectedClientIds) 
        : state.filteredClients.map(c => c.id);

    if (clientIdsToSave.length === 0) {
        return showNotification('Nenhum cliente para adicionar ao grupo.', 'error');
    }

    const newGroup = {
        id: Date.now(),
        name,
        clientIds: clientIdsToSave
    };
    
    state.groups.push(newGroup);
    saveDataToLocalStorage();
    
    state.selectedClientIds.clear();
    DOM.selectAllPageCheckbox.checked = false;
    
    renderAll();
    closeModal('createGroup');
    navigateTo('groups');
    showNotification('Grupo criado com sucesso!');
}

function openViewGroupModal(groupId) {
    const group = state.groups.find(g => g.id === groupId);
    if (!group) return;
    
    state.currentGroupIdToExport = group.id;
    DOM.viewGroupNameEl.textContent = `Clientes do Grupo: ${group.name}`;
    DOM.groupClientsTableBody.innerHTML = '';
    
    const clientsInGroup = group.clientIds
        .map(id => state.clients.find(c => c.id === id))
        .filter(Boolean);
    
    clientsInGroup.forEach(client => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${client.nome}</td>
            <td>${client.whatsapp}</td>
            <td>${client.email || 'N/A'}</td>
        `;
        DOM.groupClientsTableBody.appendChild(row);
    });
    
    openModal('viewGroup');
}

function openRenameModal(groupId) {
    const group = state.groups.find(g => g.id === groupId);
    if (group) {
        DOM.renameGroupNameInput.value = group.name;
        DOM.renameGroupIdInput.value = group.id;
        openModal('renameGroup');
    }
}

function saveGroupName() {
    const groupId = parseInt(DOM.renameGroupIdInput.value, 10);
    const newName = DOM.renameGroupNameInput.value.trim();
    
    if (!newName) {
        return showNotification('O nome do grupo não pode ser vazio.', 'error');
    }
    
    const group = state.groups.find(g => g.id === groupId);
    if (group) {
        group.name = newName;
        saveDataToLocalStorage();
        renderGroups();
        closeModal('renameGroup');
        showNotification('Grupo renomeado com sucesso!');
    }
}

// ==========================================
// CLIENTE DETALHES
// ==========================================
function openClientDetailsModal(clientId) {
    const client = state.clients.find(c => c.id === clientId);
    if (!client) return;
    
    state.currentClientInModal = clientId;
    
    document.getElementById('client-detail-name').textContent = client.nome || 'N/A';
    document.getElementById('client-detail-whatsapp').textContent = client.whatsapp || 'N/A';
    document.getElementById('client-detail-email').textContent = client.email || 'N/A';
    document.getElementById('client-detail-cpf').textContent = client.cpf || 'N/A';
    document.getElementById('client-detail-endereco').textContent = client.endereco || 'N/A';
    document.getElementById('client-detail-cidade').textContent = client.cidade || 'N/A';
    document.getElementById('client-detail-estado').textContent = client.estado || 'N/A';
    document.getElementById('client-detail-nascimento').textContent = client.dataNascimento ? 
        new Date(client.dataNascimento).toLocaleDateString('pt-BR') : 'N/A';
    document.getElementById('client-detail-ultima-compra').textContent = client.dataUltimaCompra ? 
        new Date(client.dataUltimaCompra).toLocaleDateString('pt-BR') : 'N/A';
    document.getElementById('client-detail-total-comprado').textContent = 
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(client.totalCompras || 0);

    renderClientNotes(clientId);
    openModal('viewClient');
}

function renderClientNotes(clientId) {
    const client = state.clients.find(c => c.id === clientId);
    const notesList = document.getElementById('client-detail-notes-list');
    notesList.innerHTML = '';
    document.getElementById('client-note-input').value = '';

    if (client && client.notes && client.notes.length > 0) {
        [...client.notes].reverse().forEach(note => {
            const noteEl = document.createElement('div');
            noteEl.className = 'note-item';
            const noteDate = new Date(note.date);
            noteEl.innerHTML = `
                <p>${note.text}</p>
                <div class="note-date">${noteDate.toLocaleDateString()} ${noteDate.toLocaleTimeString()}</div>
            `;
            notesList.appendChild(noteEl);
        });
    } else {
        notesList.innerHTML = '<p>Nenhuma observação ainda.</p>';
    }
}

function saveClientNote() {
    const clientId = state.currentClientInModal;
    const noteInput = document.getElementById('client-note-input');
    const noteText = noteInput.value.trim();

    if (!clientId || !noteText) return;

    const client = state.clients.find(c => c.id === clientId);
    if (client) {
        if (!client.notes) client.notes = [];
        client.notes.push({
            text: noteText,
            date: new Date().toISOString()
        });
        saveDataToLocalStorage();
        renderClientNotes(clientId);
        noteInput.value = '';
        showNotification('Observação salva!');
    }
}

function toggleFavorite(clientId) {
    const client = state.clients.find(c => c.id === clientId);
    if (client) {
        client.isFavorite = !client.isFavorite;
        saveDataToLocalStorage();
        renderClientsTable();
    }
}

// ==========================================
// MODAL
// ==========================================
function openModal(modalId) {
    DOM.modals[modalId].classList.add('active');
}

function closeModal(modalId) {
    DOM.modals[modalId].classList.remove('active');
}

// ==========================================
// TEMA
// ==========================================
function applyTheme() {
    if (localStorage.getItem('crm_theme') === 'dark') {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }
}

// ==========================================
// NOTIFICAÇÃO
// ==========================================
function showNotification(message, type = 'success', duration = 4000) {
    DOM.notificationEl.textContent = message;
    DOM.notificationEl.className = `notification ${type} show`;
    setTimeout(() => DOM.notificationEl.classList.remove('show'), duration);
}

// ==========================================
// EVENT LISTENERS
// ==========================================
function setupEventListeners() {
    // Navegação
    DOM.mainNav.addEventListener('click', e => {
        if(e.target.closest('.nav-link')) {
            e.preventDefault();
            navigateTo(e.target.closest('.nav-link').getAttribute('href').substring(1));
        }
    });
    
    DOM.menuToggle.addEventListener('click', () => DOM.sidebar.classList.toggle('open'));
    
    // Busca global
    DOM.globalSearch.addEventListener('input', e => {
        navigateTo('clients');
        applyAllFilters(e.target.value);
    });
    
    // Tema
    DOM.themeSwitcher.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        localStorage.setItem('crm_theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
    });
    
    // Upload
    DOM.uploadBox.addEventListener('click', () => DOM.fileInput.click());
    DOM.fileInput.addEventListener('change', e => handleFileUpload(e.target.files[0]));
    
    ['dragover', 'drop'].forEach(evt => DOM.uploadBox.addEventListener(evt, e => e.preventDefault()));
    DOM.uploadBox.addEventListener('drop', e => handleFileUpload(e.dataTransfer.files[0]));
    
    DOM.syncDataBtn.addEventListener('click', syncAllData);
    
    // Filtros
    DOM.applyFiltersBtn.addEventListener('click', () => applyAllFilters());
    DOM.filterTodayBirthdayBtn.addEventListener('click', filterTodayBirthdays);
    
    // Seleção
    DOM.selectAllPageCheckbox.addEventListener('change', selectAllOnPage);
    DOM.selectAllFilteredBtn.addEventListener('click', selectAllFiltered);
    DOM.clearSelectionBtn.addEventListener('click', clearSelection);
    
    // Exportação
    DOM.exportWhatsappBtn.addEventListener('click', () => exportClients('whatsapp'));
    DOM.exportEmailBtn.addEventListener('click', () => exportClients('email'));
    DOM.exportBothBtn.addEventListener('click', () => exportClients('both'));
    
    // Grupos
    DOM.createGroupBtn.addEventListener('click', () => {
        state.selectedClientIds.clear();
        renderClientsTable();
        updateSelectionUI();
        DOM.groupNameInput.value = '';
        DOM.groupClientCountEl.textContent = state.filteredClients.length;
        openModal('createGroup');
    });
    
    DOM.createGroupSelectionBtn.addEventListener('click', () => {
        DOM.groupNameInput.value = '';
        DOM.groupClientCountEl.textContent = state.selectedClientIds.size;
        openModal('createGroup');
    });
    
    DOM.saveGroupBtn.addEventListener('click', saveGroup);
    
    DOM.groupListEl.addEventListener('click', e => {
        const target = e.target.closest('button');
        if (!target) return;
        
        const groupId = +target.dataset.groupId;
        
        if (target.classList.contains('delete-group-btn') && confirm('Excluir este grupo?')) {
            state.groups = state.groups.filter(g => g.id !== groupId);
            saveDataToLocalStorage();
            renderGroups();
        }
        if (target.classList.contains('view-group-btn')) {
            openViewGroupModal(groupId);
        }
        if (target.classList.contains('edit-group-btn')) {
            openRenameModal(groupId);
        }
    });
    
    DOM.exportGroupWhatsappBtn.addEventListener('click', () => exportGroup(state.currentGroupIdToExport, 'whatsapp'));
    DOM.exportGroupEmailBtn.addEventListener('click', () => exportGroup(state.currentGroupIdToExport, 'email'));
    DOM.exportGroupBothBtn.addEventListener('click', () => exportGroup(state.currentGroupIdToExport, 'both'));
    
    DOM.renameGroupSaveBtn.addEventListener('click', saveGroupName);
    
    // Tabela de clientes
    DOM.clientsTableBody.addEventListener('click', e => {
        const target = e.target;
        
        if (target.closest('.view-details-btn')) {
            openClientDetailsModal(+target.closest('.view-details-btn').dataset.clientId);
        }
        
        if (target.closest('.favorite-star')) {
            toggleFavorite(+target.closest('.favorite-star').dataset.clientId);
        }
        
        if (target.classList.contains('client-checkbox')) {
            const clientId = +target.dataset.clientId;
            if (target.checked) {
                state.selectedClientIds.add(clientId);
            } else {
                state.selectedClientIds.delete(clientId);
            }
            updateSelectionUI();
        }
    });
    
    // Context Menu
    DOM.clientsTableBody.addEventListener('contextmenu', e => {
        e.preventDefault();
        const row = e.target.closest('tr');
        if (!row) return;
        
        state.contextClient = state.clients.find(c => c.id === +row.dataset.clientId);
        if(!state.contextClient) return;
        
        DOM.contextMenu.style.top = `${e.pageY}px`;
        DOM.contextMenu.style.left = `${e.pageX}px`;
        DOM.contextMenu.style.display = 'block';
    });
    
    document.addEventListener('click', () => DOM.contextMenu.style.display = 'none');
    
    DOM.contextMenu.addEventListener('click', e => {
        if(!state.contextClient) return;
        
        const action = e.target.closest('li').id;
        
        if (action === 'ctx-whatsapp') {
            window.open(`https://wa.me/55${state.contextClient.whatsapp}`, '_blank');
        }
        if (action === 'ctx-email' && state.contextClient.email) {
            window.location.href = `mailto:${state.contextClient.email}`;
        }
        if (action === 'ctx-details') {
            openClientDetailsModal(state.contextClient.id);
        }
    });
    
    // Modais
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', () => btn.closest('.modal-overlay').classList.remove('active'));
    });
    
    // Cliente detalhes
    DOM.saveClientNoteBtn.addEventListener('click', saveClientNote);
    
    // Inatividade
    DOM.inactivityReportGrid.addEventListener('click', (e) => {
        const target = e.target.closest('.view-inactivity-group');
        if (target) {
            filterByInactivityRange(+target.dataset.minDays, +target.dataset.maxDays);
        }
    });
    
    // Reset
    DOM.resetDataBtn.addEventListener('click', () => {
        if(confirm('Isso apagará TODOS os dados. Deseja continuar?')) {
            localStorage.clear();
            window.location.reload();
        }
    });
}
