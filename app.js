// Estado da aplicação
let currentSection = 'dashboard';
let schools = [];
let exercises = [];
let events = [];
let materials = [];
let recentActivities = [];

// Variáveis do calendário
let currentCalendarDate = new Date();
let currentCalendarMonth = currentCalendarDate.getMonth();
let currentCalendarYear = currentCalendarDate.getFullYear();
let yearViewYear = currentCalendarYear;

// Inicialização da aplicação
document.addEventListener('DOMContentLoaded', function () {
    console.log('Inicializando Portal Arduino...');

    // Carregar tema salvo
    const savedTheme = localStorage.getItem('theme');
    const btn = document.getElementById('themeToggleBtn');

    if (savedTheme === 'dark') {
        document.body.setAttribute('data-theme', 'dark');
        if (btn) btn.innerHTML = '<i class="fas fa-sun"></i> Ativar Tema Claro';
    }

    // Carregar dados iniciais
    loadAllData();

    // Gerar calendário
    generateCalendar();

    console.log('Portal Arduino inicializado!');
});

// Navegação entre seções
function showSection(sectionName) {
    // Remover classe active de todas as seções
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });

    // Remover classe active de todos os itens de navegação
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });

    // Mostrar seção selecionada
    document.getElementById(sectionName).classList.add('active');

    // Marcar item de navegação como ativo
    event.target.classList.add('active');

    currentSection = sectionName;

    // Auto-refresh ao trocar de aba
    refreshCurrentSection(sectionName);
}

// Função para atualizar seção atual
async function refreshCurrentSection(sectionName) {
    // Recarregar dados do Firebase antes de mostrar a seção
    await loadAllData();

    switch (sectionName) {
        case 'dashboard':
            updateDashboardStats();
            loadRecentActivities();
            break;
        case 'exercises':
            loadExercises();
            break;
        case 'schools':
            loadSchools();
            break;
        case 'materials':
            loadMaterials();
            break;
        case 'calendar':
            generateCalendar();
            break;
    }
}

// Carregar todos os dados
async function loadAllData() {
    try {
        console.log('Carregando dados do Firebase...');

        const [schoolsData, exercisesData, eventsData, materialsData, activitiesData, studentsData] = await Promise.all([
            DB.getAll(COLLECTIONS.SCHOOLS),
            DB.getAll(COLLECTIONS.EXERCISES),
            DB.getAll(COLLECTIONS.EVENTS),
            DB.getAll(COLLECTIONS.MATERIALS),
            DB.getAll(COLLECTIONS.ACTIVITIES),
            DB.getAll(COLLECTIONS.STUDENTS)
        ]);

        schools = Object.values(schoolsData);
        exercises = Object.values(exercisesData);
        events = Object.values(eventsData);
        materials = Object.values(materialsData);
        recentActivities = Object.values(activitiesData).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        window.students = Object.values(studentsData);

        console.log('Dados carregados do Firebase!');

    } catch (error) {
        console.error('Erro ao carregar dados do Firebase:', error);
        schools = [];
        exercises = [];
        events = [];
        materials = [];
        recentActivities = [];
        window.students = [];
    }

    updateDashboardStats();
    loadExercises();
    loadSchools();
    loadMaterials();
    loadRecentActivities();
}



// Atualizar estatísticas do dashboard
function updateDashboardStats() {
    document.getElementById('totalSchools').textContent = schools.length;
    document.getElementById('totalStudents').textContent = window.students ? window.students.length : 0;
    document.getElementById('totalExercises').textContent = exercises.length;

    // Calcular eventos futuros (a partir de hoje)
    const today = new Date();
    const todayString = today.getFullYear() + '-' +
        String(today.getMonth() + 1).padStart(2, '0') + '-' +
        String(today.getDate()).padStart(2, '0');

    const upcomingEventsCount = events.filter(event => {
        return event.date >= todayString;
    }).length;

    document.getElementById('upcomingEvents').textContent = upcomingEventsCount;
    console.log('Dashboard atualizado - Próximos eventos:', upcomingEventsCount);
    console.log('Data de hoje:', todayString);
    console.log('Eventos:', events.map(e => ({ title: e.title, date: e.date })));
}

// Carregar exercícios
function loadExercises() {
    const container = document.getElementById('exercisesList');
    container.innerHTML = '';

    if (exercises.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #666; padding: 40px;">Nenhum exercício cadastrado ainda. Clique em "Novo Exercício" para adicionar.</p>';
        return;
    }

    exercises.forEach(exercise => {
        const exerciseCard = document.createElement('div');
        exerciseCard.className = 'exercise-card';
        exerciseCard.innerHTML = `
            <div class="exercise-image">
                ${exercise.imageUrl ? `<img src="${exercise.imageUrl}" alt="${exercise.title}" style="width:100%;height:100%;object-fit:cover;">` : '<i class="fas fa-microchip"></i>'}
            </div>
            <div class="exercise-content">
                <div class="exercise-title">${exercise.title}</div>
                <p>${exercise.description || 'Sem descrição'}</p>
                <div class="code-preview">${exercise.code ? exercise.code.substring(0, 100) + '...' : 'Código não disponível'}</div>
                <div style="margin-top: 15px; display: flex; gap: 8px; flex-wrap: wrap;">
                    <button class="btn btn-primary" onclick="viewExercise('${exercise.id}')">
                        <i class="fas fa-eye"></i> Ver
                    </button>
                    ${exercise.tinkercad ? `<a href="${exercise.tinkercad}" target="_blank" class="btn btn-success" style="text-decoration: none;"><i class="fas fa-external-link-alt"></i> Tinkercad</a>` : ''}
                    <button class="btn btn-secondary" onclick="deleteExercise('${exercise.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
        container.appendChild(exerciseCard);
    });
}

// Carregar escolas
function loadSchools() {
    const container = document.getElementById('schoolsList');
    container.innerHTML = '';

    if (schools.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #666; padding: 40px;">Nenhuma escola cadastrada ainda. Clique em "Nova Escola" para adicionar.</p>';
        return;
    }

    schools.forEach(school => {
        const schoolCard = document.createElement('div');
        schoolCard.className = 'card';
        schoolCard.innerHTML = `
            <h4><i class="fas fa-school"></i> ${school.name}</h4>
            <p><i class="fas fa-map-marker-alt"></i> ${school.address || 'Endereço não informado'}</p>
            <p><i class="fas fa-phone"></i> ${school.phone || 'Telefone não informado'}</p>
            <p><i class="fas fa-envelope"></i> ${school.email || 'Email não informado'}</p>
            <p><i class="fas fa-users"></i> ${school.students || 0} alunos</p>
            <div style="margin-top: 15px; display: flex; gap: 10px; flex-wrap: wrap;">
                <button class="btn btn-primary" onclick="manageStudents('${school.id}')">
                    <i class="fas fa-users"></i> Gerenciar Alunos
                </button>
                <button class="btn btn-secondary" onclick="editSchool('${school.id}')">
                    <i class="fas fa-edit"></i> Editar
                </button>
                <button class="btn btn-secondary" onclick="deleteSchool('${school.id}')" style="background: linear-gradient(135deg, #dc3545, #c82333); color: white;">
                    <i class="fas fa-trash"></i> Remover
                </button>
            </div>
        `;
        container.appendChild(schoolCard);
    });
}

// Carregar materiais
function loadMaterials() {
    const container = document.getElementById('materialsList');
    container.innerHTML = '';

    if (materials.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #666; padding: 40px;">Nenhum material cadastrado ainda. Clique em "Upload Material" para adicionar.</p>';
        return;
    }

    materials.forEach(material => {
        const materialItem = document.createElement('div');
        materialItem.className = 'material-item';

        // Ícone baseado no tipo de arquivo
        let icon = 'fas fa-file';
        if (material.fileName.toLowerCase().includes('.pdf')) icon = 'fas fa-file-pdf';
        else if (material.fileName.toLowerCase().includes('.doc')) icon = 'fas fa-file-word';
        else if (material.fileName.toLowerCase().includes('.txt')) icon = 'fas fa-file-alt';

        // Formatação do tamanho do arquivo
        const fileSize = formatFileSize(material.fileSize);

        materialItem.innerHTML = `
            <div class="material-header">
                <div class="material-icon">
                    <i class="${icon}"></i>
                </div>
                <div class="material-title">${material.title}</div>
                <div class="material-category">${getCategoryName(material.category)}</div>
            </div>
            <div class="material-description">${material.description || 'Sem descrição'}</div>
            <div class="material-actions">
                <button class="btn btn-primary" onclick="downloadMaterial('${material.id}')">
                    <i class="fas fa-download"></i> Download
                </button>
                <button class="btn btn-secondary" onclick="deleteMaterial('${material.id}')">
                    <i class="fas fa-trash"></i> Excluir
                </button>
                <div class="material-size">${fileSize}</div>
            </div>
        `;
        container.appendChild(materialItem);
    });
}

function getCategoryName(category) {
    const categories = {
        'guia': 'Guia de Estudo',
        'tutorial': 'Tutorial',
        'referencia': 'Referência',
        'exercicio': 'Exercícios',
        'outros': 'Outros'
    };
    return categories[category] || 'Outros';
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function downloadMaterial(materialId) {
    const material = materials.find(m => m.id === materialId);
    if (material && material.fileUrl) {
        // Download real do GitHub
        const link = document.createElement('a');
        link.href = material.fileUrl;
        link.download = material.fileName;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } else {
        alert('Arquivo não encontrado.');
    }
}

async function deleteMaterial(materialId) {
    const material = materials.find(m => m.id === materialId);
    if (confirm('Tem certeza que deseja excluir este material?')) {
        try {
            // Deletar arquivo do GitHub se existir
            if (material && material.uniqueFileName) {
                await GitHubStorage.deleteFile(material.uniqueFileName);
            }
            
            // Deletar do Firebase
            await DB.delete(COLLECTIONS.MATERIALS, materialId);
            materials = materials.filter(m => m.id !== materialId);

            if (material) {
                await addRecentActivity('material', 'Material excluído', material.title);
            }

            loadMaterials();
            updateDashboardStats();
            alert('Material excluído com sucesso!');
        } catch (error) {
            console.error('Erro ao excluir material:', error);
            alert('Erro ao excluir material.');
        }
    }
}

// Gerar calendário
function generateCalendar() {
    const calendar = document.getElementById('calendarGrid');

    // Atualizar título do mês
    const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    document.getElementById('currentMonth').textContent = `${monthNames[currentCalendarMonth]} ${currentCalendarYear}`;

    // Limpar calendário
    calendar.innerHTML = '';

    // Cabeçalhos dos dias
    const dayHeaders = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    dayHeaders.forEach(day => {
        const header = document.createElement('div');
        header.className = 'calendar-header';
        header.textContent = day;
        calendar.appendChild(header);
    });

    // Primeiro dia do mês e número de dias
    const firstDay = new Date(currentCalendarYear, currentCalendarMonth, 1).getDay();
    const daysInMonth = new Date(currentCalendarYear, currentCalendarMonth + 1, 0).getDate();

    // Dias vazios no início
    for (let i = 0; i < firstDay; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'calendar-day';
        calendar.appendChild(emptyDay);
    }

    // Dias do mês
    for (let day = 1; day <= daysInMonth; day++) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        dayElement.innerHTML = `<strong>${day}</strong>`;

        // Verificar se há eventos neste dia
        const dayEvents = events.filter(event => {
            const eventDateParts = event.date.split('-');
            const eventYear = parseInt(eventDateParts[0]);
            const eventMonth = parseInt(eventDateParts[1]) - 1;
            const eventDay = parseInt(eventDateParts[2]);
            return eventDay === day &&
                eventMonth === currentCalendarMonth &&
                eventYear === currentCalendarYear;
        });

        if (dayEvents.length > 0) {
            dayElement.classList.add('has-event');
            dayEvents.forEach(event => {
                const eventDiv = document.createElement('div');
                eventDiv.className = 'event';
                eventDiv.textContent = event.title.length > 15 ? event.title.substring(0, 15) + '...' : event.title;
                dayElement.appendChild(eventDiv);
            });
        }

        // Adicionar evento de clique
        dayElement.addEventListener('click', function () {
            selectCalendarDay(currentCalendarYear, currentCalendarMonth, day);
        });

        calendar.appendChild(dayElement);
    }
}

// Modais
function openModal(modalId) {
    document.getElementById(modalId).style.display = 'block';

    // Popular escolas no formulário de eventos
    if (modalId === 'eventModal') {
        populateSchoolSelect();
    }

    // Carregar visualização anual
    if (modalId === 'yearViewModal') {
        yearViewYear = currentCalendarYear;
        generateYearView();
    }

    // Carregar histórico de atividades
    if (modalId === 'historyModal') {
        loadHistoryActivities();
    }
}

function populateSchoolSelect() {
    const select = document.getElementById('eventSchoolSelect');
    select.innerHTML = '<option value="">Selecione uma escola</option>';

    schools.forEach(school => {
        const option = document.createElement('option');
        option.value = school.id;
        option.textContent = school.name;
        select.appendChild(option);
    });
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Fechar modal clicando fora
window.onclick = function (event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
}

// Formulários
document.getElementById('exerciseForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const exerciseData = {
        id: Date.now().toString(),
        title: formData.get('title'),
        description: formData.get('description'),
        code: formData.get('code'),
        tinkercad: formData.get('tinkercad'),
        difficulty: 'Básico',
        category: 'Geral',
        createdAt: new Date().toISOString()
    };

    // Processar imagem se fornecida
    const imageFile = formData.get('image');
    if (imageFile && imageFile.size > 0) {
        // Verificar tamanho da imagem (máximo 500KB)
        if (imageFile.size > 500 * 1024) {
            alert('Imagem muito grande! Tamanho máximo: 500KB');
            return;
        }

        const reader = new FileReader();
        reader.onload = function (e) {
            exerciseData.imageUrl = e.target.result;
            saveExercise(exerciseData);
        };
        reader.readAsDataURL(imageFile);
    } else {
        saveExercise(exerciseData);
    }

    async function saveExercise(data) {
        try {
            // Remover o ID temporário antes de salvar no Firebase
            const tempId = data.id;
            delete data.id;

            const exerciseId = await DB.save(COLLECTIONS.EXERCISES, data);
            data.id = exerciseId;
            exercises.push(data);

            // Adicionar atividade recente
            await addRecentActivity('exercise', 'Novo exercício adicionado', data.title);

            // Recarregar interface
            loadExercises();
            updateDashboardStats();

            closeModal('exerciseModal');
            e.target.reset();

            alert('Exercício adicionado com sucesso!');
        } catch (error) {
            console.error('Erro ao salvar exercício:', error);
            alert('Erro ao salvar exercício. Tente novamente.');
        }
    }
});

document.getElementById('schoolForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const schoolData = {
        id: Date.now().toString(),
        name: formData.get('name'),
        address: formData.get('address'),
        phone: formData.get('phone'),
        email: formData.get('email'),
        students: 0,
        score: 0,
        createdAt: new Date().toISOString()
    };

    try {
        // Remover o ID temporário antes de salvar no Firebase
        delete schoolData.id;

        const schoolId = await DB.save(COLLECTIONS.SCHOOLS, schoolData);
        schoolData.id = schoolId;
        schools.push(schoolData);

        // Adicionar atividade recente
        await addRecentActivity('school', 'Nova escola cadastrada', schoolData.name);

        // Recarregar interface
        loadSchools();
        updateDashboardStats();

        closeModal('schoolModal');
        e.target.reset();

        alert('Escola cadastrada com sucesso!');
    } catch (error) {
        console.error('Erro ao cadastrar escola:', error);
        alert('Erro ao cadastrar escola. Tente novamente.');
    }
});

document.getElementById('eventForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const editingId = e.target.getAttribute('data-editing');

    if (editingId) {
        // Editando evento existente
        const event = events.find(ev => ev.id === editingId);
        if (event) {
            try {
                event.title = formData.get('title');
                event.date = formData.get('date');
                event.time = formData.get('time');
                event.school = formData.get('school');
                event.scholars = formData.get('scholars');

                // Salvar no Firebase
                await DB.save(COLLECTIONS.EVENTS, event, event.id);

                // Adicionar atividade recente
                await addRecentActivity('event', 'Evento editado', event.title);

                alert('Evento atualizado com sucesso!');
            } catch (error) {
                console.error('Erro ao atualizar evento:', error);
                alert('Erro ao atualizar evento.');
                return;
            }
        }
    } else {
        // Criando novo evento
        try {
            const eventData = {
                title: formData.get('title'),
                date: formData.get('date'),
                time: formData.get('time'),
                school: formData.get('school'),
                scholars: formData.get('scholars'),
                createdAt: new Date().toISOString()
            };

            const eventId = await DB.save(COLLECTIONS.EVENTS, eventData);
            eventData.id = eventId;
            events.push(eventData);

            console.log('Evento criado:', eventData);
            console.log('Total de eventos após criação:', events.length);

            // Adicionar atividade recente
            await addRecentActivity('event', 'Novo evento agendado', eventData.title);

            alert('Evento agendado com sucesso!');
        } catch (error) {
            console.error('Erro ao criar evento:', error);
            alert('Erro ao criar evento.');
            return;
        }
    }

    // Recarregar dados do Firebase e interface
    await loadAllData();
    generateCalendar();
    console.log('Dashboard atualizado após evento');

    // Resetar formulário
    closeModal('eventModal');
    e.target.reset();
    e.target.removeAttribute('data-editing');
    document.querySelector('#eventModal h3').textContent = 'Novo Evento';
    document.querySelector('#eventForm button[type="submit"]').textContent = 'Agendar Evento';
});

// Formulário de materiais
document.getElementById('materialForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const file = formData.get('file');

    // Verificar se um arquivo foi selecionado
    if (!file || file.size === 0) {
        alert('Por favor, selecione um arquivo!');
        return;
    }

    // Validar tamanho do arquivo (50MB para GitHub)
    if (file.size > 50 * 1024 * 1024) {
        alert('Arquivo muito grande! Tamanho máximo: 50MB');
        return;
    }

    // Validar tipo de arquivo
    const allowedTypes = ['.pdf', '.doc', '.docx', '.txt'];
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    if (!allowedTypes.includes(fileExtension)) {
        alert('Tipo de arquivo não permitido! Use apenas: PDF, DOC, DOCX ou TXT');
        return;
    }

    try {
        // Mostrar loading
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Enviando...';
        submitBtn.disabled = true;
        
        // Gerar nome único para o arquivo
        const uniqueFileName = Date.now() + '_' + file.name;
        
        // Upload para GitHub
        const fileUrl = await GitHubStorage.uploadFile(file, uniqueFileName);
        
        const materialData = {
            title: formData.get('title'),
            description: formData.get('description'),
            category: formData.get('category'),
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
            fileUrl: fileUrl,
            uniqueFileName: uniqueFileName,
            createdAt: new Date().toISOString()
        };
        
        const materialId = await DB.save(COLLECTIONS.MATERIALS, materialData);
        materialData.id = materialId;
        materials.push(materialData);

        // Adicionar atividade recente
        await addRecentActivity('material', 'Novo material adicionado', materialData.title);

        // Recarregar interface
        loadMaterials();
        updateDashboardStats();

        closeModal('materialModal');
        document.getElementById('materialForm').reset();
        
        // Restaurar botão
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;

        alert('Material enviado com sucesso!');
    } catch (error) {
        alert('Erro ao enviar material. Verifique sua configuração do GitHub.');
        console.error('Erro:', error);
        
        // Restaurar botão em caso de erro
        const submitBtn = e.target.querySelector('button[type="submit"]');
        submitBtn.textContent = 'Upload Material';
        submitBtn.disabled = false;
    }
});

// Funções auxiliares
function filterSchools(searchTerm) {
    const filteredSchools = schools.filter(school =>
        school.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const container = document.getElementById('schoolsList');
    container.innerHTML = '';

    filteredSchools.forEach(school => {
        const schoolCard = document.createElement('div');
        schoolCard.className = 'card';
        schoolCard.innerHTML = `
            <h4><i class="fas fa-school"></i> ${school.name}</h4>
            <p><i class="fas fa-map-marker-alt"></i> ${school.address || 'Endereço não informado'}</p>
            <p><i class="fas fa-phone"></i> ${school.phone || 'Telefone não informado'}</p>
            <p><i class="fas fa-envelope"></i> ${school.email || 'Email não informado'}</p>
            <p><i class="fas fa-users"></i> ${school.students || 0} alunos</p>
            <div style="margin-top: 15px;">
                <button class="btn btn-primary" onclick="manageStudents('${school.id}')">
                    <i class="fas fa-users"></i> Gerenciar Alunos
                </button>
                <button class="btn btn-secondary" onclick="editSchool('${school.id}')">
                    <i class="fas fa-edit"></i> Editar
                </button>
            </div>
        `;
        container.appendChild(schoolCard);
    });
}

function viewExercise(exerciseId) {
    const exercise = exercises.find(ex => ex.id === exerciseId);
    if (exercise) {
        // Criar modal para visualizar exercício
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'block';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 800px;">
                <span class="close" onclick="this.parentElement.parentElement.remove()">&times;</span>
                <h3><i class="fas fa-code"></i> ${exercise.title}</h3>
                <p><strong>Descrição:</strong> ${exercise.description || 'Sem descrição'}</p>
                ${exercise.tinkercad ? `<p><strong>Tinkercad:</strong> <a href="${exercise.tinkercad}" target="_blank" style="color: var(--arduino-blue);">Abrir Simulação</a></p>` : ''}
                ${exercise.imageUrl ? `<img src="${exercise.imageUrl}" alt="Circuito" style="width:100%; max-width:400px; margin:20px 0; border-radius:8px;">` : ''}
                <h4>Código Arduino:</h4>
                <pre style="background:var(--input-bg); padding:20px; border-radius:8px; overflow-x:auto; font-family:monospace;
            border-left-color: var(--accent-cyan);
            color: var(--text-light);
                
                ">${exercise.code}</pre>
            </div>
        `;
        document.body.appendChild(modal);

        // Fechar modal clicando fora
        modal.onclick = function (e) {
            if (e.target === modal) {
                modal.remove();
            }
        };
    }
}

async function deleteExercise(exerciseId) {
    console.log('deleteExercise chamada com ID:', exerciseId);
    const exercise = exercises.find(ex => ex.id === exerciseId);
    console.log('Exercício encontrado:', exercise);

    if (confirm('Tem certeza que deseja excluir este exercício?')) {
        try {
            console.log('Deletando do Firebase...');
            await DB.delete(COLLECTIONS.EXERCISES, exerciseId);
            console.log('Deletado do Firebase, atualizando array local...');

            exercises = exercises.filter(ex => ex.id !== exerciseId);
            console.log('Array atualizado, exercícios restantes:', exercises.length);

            if (exercise) {
                await addRecentActivity('exercise', 'Exercício excluído', exercise.title);
            }

            loadExercises();
            updateDashboardStats();
            alert('Exercício excluído com sucesso!');
        } catch (error) {
            console.error('Erro ao excluir exercício:', error);
            alert('Erro ao excluir exercício.');
        }
    }
}

// Variável global para armazenar alunos
if (!window.students) {
    window.students = JSON.parse(localStorage.getItem('arduino_students')) || [];
}

function manageStudents(schoolId) {
    const school = schools.find(s => s.id === schoolId);
    if (!school) return;

    document.getElementById('manageStudentsTitle').textContent = `Gerenciar Alunos - ${school.name}`;
    document.getElementById('manageStudentsModal').setAttribute('data-school-id', schoolId);

    loadStudentsList(schoolId);
    openModal('manageStudentsModal');
}

function loadStudentsList(schoolId) {
    const container = document.getElementById('studentsList');
    const schoolStudents = window.students.filter(s => s.schoolId === schoolId);

    if (schoolStudents.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">Nenhum aluno cadastrado ainda. Use o botão "Importar Alunos" acima.</p>';
        return;
    }

    let html = '<h4><i class="fas fa-users"></i> Lista de Alunos (' + schoolStudents.length + ')</h4>';
    html += '<table class="table"><thead><tr><th>Nome</th><th>Ano</th><th>Ações</th></tr></thead><tbody>';

    schoolStudents.forEach(student => {
        html += `
            <tr>
                <td>${student.name}</td>
                <td>${student.year}</td>
                <td>
                    <button class="btn btn-secondary" onclick="editStudent('${student.id}')" style="padding: 6px 12px; font-size: 0.8em;">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="btn btn-secondary" onclick="deleteStudent('${student.id}')" style="padding: 6px 12px; font-size: 0.8em; background: linear-gradient(135deg, #dc3545, #c82333); color: white; margin-left: 5px;">
                        <i class="fas fa-trash"></i> Remover
                    </button>
                </td>
            </tr>
        `;
    });

    html += '</tbody></table>';
    container.innerHTML = html;
}

async function importStudents() {
    const fileInput = document.getElementById('studentsFile');
    const file = fileInput.files[0];
    const schoolId = document.getElementById('manageStudentsModal').getAttribute('data-school-id');

    if (!file) {
        alert('Por favor, selecione um arquivo Excel!');
        return;
    }

    const reader = new FileReader();
    reader.onload = async function (e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);

            // Remover alunos existentes desta escola do array local
            window.students = window.students.filter(s => s.schoolId !== schoolId);

            let importedCount = 0;
            const studentsToSave = [];

            jsonData.forEach(row => {
                const name = row['Nome'] || row['nome'] || row['NOME'];
                const year = row['Ano'] || row['ano'] || row['ANO'];

                if (name && year) {
                    const studentData = {
                        name: name.toString().trim(),
                        year: year.toString().trim(),
                        schoolId: schoolId,
                        createdAt: new Date().toISOString()
                    };

                    studentsToSave.push(studentData);
                    importedCount++;
                }
            });

            if (importedCount > 0) {
                // Salvar cada aluno no Firebase
                for (const studentData of studentsToSave) {
                    const studentId = await DB.save(COLLECTIONS.STUDENTS, studentData);
                    studentData.id = studentId;
                    window.students.push(studentData);
                }

                // Atualizar contador de alunos na escola
                const school = schools.find(s => s.id === schoolId);
                if (school) {
                    school.students = window.students.filter(s => s.schoolId === schoolId).length;
                    await DB.save(COLLECTIONS.SCHOOLS, school, school.id);

                    // Adicionar atividade recente
                    await addRecentActivity('student', `${importedCount} alunos importados`, school.name);
                }

                // Recarregar interfaces
                loadStudentsList(schoolId);
                loadSchools();
                updateDashboardStats();

                alert(`${importedCount} alunos importados com sucesso!`);
                fileInput.value = '';
            } else {
                alert('Nenhum aluno válido encontrado no arquivo. Verifique se as colunas "Nome" e "Ano" existem.');
            }
        } catch (error) {
            console.error('Erro ao processar arquivo:', error);
            alert('Erro ao processar arquivo Excel. Verifique o formato.');
        }
    };

    reader.readAsArrayBuffer(file);
}

function editSchool(schoolId) {
    const school = schools.find(s => s.id === schoolId);
    if (!school) return;

    document.getElementById('editSchoolId').value = school.id;
    document.getElementById('editSchoolName').value = school.name;
    document.getElementById('editSchoolAddress').value = school.address || '';
    document.getElementById('editSchoolPhone').value = school.phone || '';
    document.getElementById('editSchoolEmail').value = school.email || '';

    openModal('editSchoolModal');
}

async function deleteSchool(schoolId) {
    const school = schools.find(s => s.id === schoolId);
    if (!school) return;

    if (confirm(`Tem certeza que deseja remover a escola "${school.name}"?\n\nEsta ação também removerá todos os alunos associados.`)) {
        try {
            // Encontrar e deletar todos os alunos da escola no Firebase
            const schoolStudents = window.students.filter(s => s.schoolId === schoolId);
            for (const student of schoolStudents) {
                await DB.delete(COLLECTIONS.STUDENTS, student.id);
            }

            // Deletar a escola
            await DB.delete(COLLECTIONS.SCHOOLS, schoolId);

            // Atualizar arrays locais
            schools = schools.filter(s => s.id !== schoolId);
            window.students = window.students.filter(s => s.schoolId !== schoolId);

            await addRecentActivity('school', 'Escola removida', school.name);

            loadSchools();
            updateDashboardStats();

            alert('Escola removida com sucesso!');
        } catch (error) {
            console.error('Erro ao remover escola:', error);
            alert('Erro ao remover escola.');
        }
    }
}

async function editStudent(studentId) {
    const student = window.students.find(s => s.id === studentId);
    if (!student) return;

    const newName = prompt('Nome do aluno:', student.name);
    if (newName === null) return;

    const newYear = prompt('Ano do aluno:', student.year);
    if (newYear === null) return;

    if (newName.trim() && newYear.trim()) {
        try {
            const school = schools.find(s => s.id === student.schoolId);
            student.name = newName.trim();
            student.year = newYear.trim();

            // Salvar no Firebase
            await DB.save(COLLECTIONS.STUDENTS, student, student.id);

            // Adicionar atividade recente
            if (school) {
                await addRecentActivity('student', 'Aluno editado', `${student.name} - ${school.name}`);
            }

            loadStudentsList(student.schoolId);

            alert('Aluno atualizado com sucesso!');
        } catch (error) {
            console.error('Erro ao atualizar aluno:', error);
            alert('Erro ao atualizar aluno.');
        }
    }
}

async function deleteStudent(studentId) {
    const student = window.students.find(s => s.id === studentId);
    if (!student) return;

    if (confirm(`Tem certeza que deseja remover o aluno "${student.name}"?`)) {
        try {
            const studentName = student.name;
            const school = schools.find(s => s.id === student.schoolId);

            // Deletar do Firebase
            await DB.delete(COLLECTIONS.STUDENTS, studentId);

            // Remover do array local
            window.students = window.students.filter(s => s.id !== studentId);

            // Atualizar contador na escola
            if (school) {
                school.students = window.students.filter(s => s.schoolId === student.schoolId).length;
                await DB.save(COLLECTIONS.SCHOOLS, school, school.id);

                // Adicionar atividade recente
                await addRecentActivity('student', 'Aluno removido', `${studentName} - ${school.name}`);
            }

            loadStudentsList(student.schoolId);
            loadSchools();
            updateDashboardStats();

            alert('Aluno removido com sucesso!');
        } catch (error) {
            console.error('Erro ao remover aluno:', error);
            alert('Erro ao remover aluno.');
        }
    }
}



function refreshData() {
    loadAllData();
    alert('Dados atualizados!');
}

// Função para debug - mostrar no console
function debugFirebase() {
    console.log('=== DEBUG FIREBASE ===');
    console.log('Schools:', schools);
    console.log('Exercises:', exercises);
    console.log('Materials:', materials);
    console.log('Events:', events);
    console.log('Activities:', recentActivities);
}

// Função para resetar o banco de dados Firebase
async function resetFirebaseDatabase() {
    if (!confirm('ATENÇÃO: Isso vai apagar TODOS os dados do Firebase!\n\nTem certeza que deseja continuar?')) {
        return;
    }

    try {
        console.log('Resetando banco de dados Firebase...');

        // Buscar todos os documentos de cada coleção e deletar
        const collections = [COLLECTIONS.SCHOOLS, COLLECTIONS.EXERCISES, COLLECTIONS.MATERIALS, COLLECTIONS.EVENTS, COLLECTIONS.ACTIVITIES, COLLECTIONS.STUDENTS];

        for (const collection of collections) {
            const snapshot = await db.collection(collection).get();
            const batch = db.batch();

            snapshot.docs.forEach(doc => {
                batch.delete(doc.ref);
            });

            await batch.commit();
            console.log(`Coleção ${collection} limpa`);
        }

        // Limpar arrays locais
        schools = [];
        exercises = [];
        events = [];
        materials = [];
        recentActivities = [];
        window.students = [];

        // Recarregar interface
        updateDashboardStats();
        loadExercises();
        loadSchools();
        loadMaterials();
        loadRecentActivities();

        alert('Banco de dados resetado com sucesso!');

    } catch (error) {
        console.error('Erro ao resetar banco:', error);
        alert('Erro ao resetar banco de dados.');
    }
}

// Formulário de edição de escola
document.getElementById('editSchoolForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const schoolId = document.getElementById('editSchoolId').value;
    const school = schools.find(s => s.id === schoolId);

    if (school) {
        try {
            school.name = document.getElementById('editSchoolName').value;
            school.address = document.getElementById('editSchoolAddress').value;
            school.phone = document.getElementById('editSchoolPhone').value;
            school.email = document.getElementById('editSchoolEmail').value;

            // Salvar no Firebase
            await DB.save(COLLECTIONS.SCHOOLS, school, school.id);

            // Adicionar atividade recente
            await addRecentActivity('school', 'Escola editada', school.name);

            loadSchools();
            closeModal('editSchoolModal');

            alert('Escola atualizada com sucesso!');
        } catch (error) {
            console.error('Erro ao atualizar escola:', error);
            alert('Erro ao atualizar escola.');
        }
    }
});

// Variável global para armazenar evento atual sendo visualizado
let currentViewingEvent = null;

function viewEvent(eventId) {
    const event = events.find(e => e.id === eventId);
    if (!event) return;

    currentViewingEvent = event;
    const school = schools.find(s => s.id === event.school);
    const schoolName = school ? school.name : event.school || 'Não informado';

    const content = `
        <div style="background:var(--input-bg); padding: 20px; border-radius: 8px; margin: 15px 0;">
            <h4 style="color: var(--arduino-blue); margin-bottom: 15px;">
                <i class="fas fa-calendar-check"></i> ${event.title}
            </h4>
            <div style="display: grid; gap: 10px;">
                <p><i class="fas fa-calendar-alt"></i> <strong>Data:</strong> ${formatDate(event.date)}</p>
                <p><i class="fas fa-clock"></i> <strong>Horário:</strong> ${event.time || 'Não informado'}</p>
                <p><i class="fas fa-school"></i> <strong>Escola:</strong> ${schoolName}</p>
                <p><i class="fas fa-users"></i> <strong>Bolsistas Responsáveis:</strong> ${event.scholars || 'Não informado'}</p>
                <p><i class="fas fa-info-circle"></i> <strong>Criado em:</strong> ${formatDateTime(event.createdAt)}</p>
            </div>
        </div>
    `;

    document.getElementById('viewEventTitle').textContent = 'Detalhes do Evento';
    document.getElementById('viewEventContent').innerHTML = content;
    document.getElementById('editEventBtn').style.display = 'inline-flex';
    document.getElementById('deleteEventBtn').style.display = 'inline-flex';

    openModal('viewEventModal');
}

function editEventFromView() {
    if (!currentViewingEvent) return;

    // Preencher formulário com dados do evento
    document.querySelector('#eventForm input[name="title"]').value = currentViewingEvent.title;
    document.querySelector('#eventForm input[name="date"]').value = currentViewingEvent.date;
    document.querySelector('#eventForm input[name="time"]').value = currentViewingEvent.time || '';
    document.querySelector('#eventForm select[name="school"]').value = currentViewingEvent.school || '';
    document.querySelector('#eventForm input[name="scholars"]').value = currentViewingEvent.scholars || '';

    // Marcar que estamos editando
    document.getElementById('eventForm').setAttribute('data-editing', currentViewingEvent.id);
    document.querySelector('#eventModal h3').textContent = 'Editar Evento';
    document.querySelector('#eventForm button[type="submit"]').textContent = 'Salvar Alterações';

    closeModal('viewEventModal');
    openModal('eventModal');
}

async function deleteEventFromView() {
    if (!currentViewingEvent) return;

    if (confirm(`Tem certeza que deseja excluir o evento "${currentViewingEvent.title}"?`)) {
        try {
            const eventTitle = currentViewingEvent.title;

            await DB.delete(COLLECTIONS.EVENTS, currentViewingEvent.id);
            events = events.filter(e => e.id !== currentViewingEvent.id);

            await addRecentActivity('event', 'Evento excluído', eventTitle);

            generateCalendar();
            updateDashboardStats();
            closeModal('viewEventModal');

            alert('Evento excluído com sucesso!');
            currentViewingEvent = null;
        } catch (error) {
            console.error('Erro ao excluir evento:', error);
            alert('Erro ao excluir evento.');
        }
    }
}

// Funções de utilidade
function formatDate(dateString) {
    const parts = dateString.split('-');
    const year = parts[0];
    const month = parts[1];
    const day = parts[2];
    return `${day}/${month}/${year}`;
}

function formatDateTime(isoString) {
    const date = new Date(isoString);
    return date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function changeMonth(direction) {
    currentCalendarMonth += direction;

    // Ajustar ano se necessário
    if (currentCalendarMonth > 11) {
        currentCalendarMonth = 0;
        currentCalendarYear++;
    } else if (currentCalendarMonth < 0) {
        currentCalendarMonth = 11;
        currentCalendarYear--;
    }

    // Regenerar calendário
    generateCalendar();
}

function changeYear(direction) {
    yearViewYear += direction;
    generateYearView();
}

function generateYearView() {
    const yearGrid = document.getElementById('yearViewGrid');
    const yearTitle = document.getElementById('yearViewTitle');

    yearTitle.textContent = yearViewYear;
    yearGrid.innerHTML = '';

    const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

    monthNames.forEach((monthName, monthIndex) => {
        // Contar eventos do mês
        const monthEvents = events.filter(event => {
            const eventDateParts = event.date.split('-');
            const eventYear = parseInt(eventDateParts[0]);
            const eventMonth = parseInt(eventDateParts[1]) - 1;
            return eventYear === yearViewYear && eventMonth === monthIndex;
        });

        const monthCard = document.createElement('div');
        monthCard.className = 'month-card';
        if (monthIndex === currentCalendarMonth && yearViewYear === currentCalendarYear) {
            monthCard.classList.add('current');
        }

        monthCard.innerHTML = `
            <div class="month-name">${monthName}</div>
            <div class="month-events">${monthEvents.length} evento(s)</div>
        `;

        monthCard.addEventListener('click', function () {
            selectMonth(monthIndex, yearViewYear);
        });

        yearGrid.appendChild(monthCard);
    });
}

function selectMonth(month, year) {
    currentCalendarMonth = month;
    currentCalendarYear = year;
    closeModal('yearViewModal');
    generateCalendar();
}

function formatTime(timeString) {
    return timeString ? timeString.substring(0, 5) : '';
}

function selectCalendarDay(year, month, day) {
    console.log('Clicou no dia:', day, 'Mês:', month, 'Ano:', year);

    const selectedDate = new Date(year, month, day);
    const dateString = selectedDate.toLocaleDateString('pt-BR');

    const dayEvents = events.filter(event => {
        const eventDateParts = event.date.split('-');
        const eventYear = parseInt(eventDateParts[0]);
        const eventMonth = parseInt(eventDateParts[1]) - 1;
        const eventDay = parseInt(eventDateParts[2]);
        return eventDay === day &&
            eventMonth === month &&
            eventYear === year;
    });

    console.log('Eventos encontrados:', dayEvents.length);

    if (dayEvents.length > 0) {
        showDayEventsModal(dayEvents, dateString, year, month, day);
    } else {
        if (confirm(`Deseja agendar um evento para ${dateString}?`)) {
            document.querySelector('#eventForm input[name="date"]').value =
                `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            openModal('eventModal');
        }
    }
}

function showDayEventsModal(dayEvents, dateString, year, month, day) {
    let content = `<h4><i class="fas fa-calendar-day"></i> Eventos em ${dateString}</h4><hr>`;

    dayEvents.forEach((event, index) => {
        const school = schools.find(s => s.id === event.school);
        const schoolName = school ? school.name : event.school || 'Não informado';

        content += `
            <div class="card" style="margin: 15px 0; padding: 20px; cursor: pointer;" onclick="viewEvent('${event.id}')">
                <h5 style="color: var(--arduino-blue); margin-bottom: 10px;">
                    <i class="fas fa-calendar-check"></i> ${event.title}
                </h5>
                <p><i class="fas fa-clock"></i> <strong>Horário:</strong> ${event.time || 'Não informado'}</p>
                <p><i class="fas fa-school"></i> <strong>Escola:</strong> ${schoolName}</p>
                <p><i class="fas fa-users"></i> <strong>Bolsistas:</strong> ${event.scholars || 'Não informado'}</p>
                <small style="color: #666;">Clique para ver detalhes</small>
            </div>
        `;
    });

    content += `
        <hr>
        <button class="btn btn-primary" onclick="addNewEventForDay(${year}, ${month}, ${day})">
            <i class="fas fa-plus"></i> Adicionar Novo Evento
        </button>
    `;

    document.getElementById('viewEventTitle').textContent = `Eventos - ${dateString}`;
    document.getElementById('viewEventContent').innerHTML = content;
    document.getElementById('editEventBtn').style.display = 'none';
    document.getElementById('deleteEventBtn').style.display = 'none';

    openModal('viewEventModal');
}

function addNewEventForDay(year, month, day) {
    closeModal('viewEventModal');
    const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    console.log('Data sendo definida:', dateString, 'para o dia:', day);
    document.querySelector('#eventForm input[name="date"]').value = dateString;
    openModal('eventModal');
}

// Sistema de atividades recentes
async function addRecentActivity(type, description, details = '') {
    const activity = {
        id: Date.now().toString(),
        type: type,
        description: description,
        details: details,
        timestamp: new Date().toISOString(),
        icon: getActivityIcon(type),
        color: getActivityColor(type)
    };

    recentActivities.unshift(activity);

    // Limpar atividades antigas (mais de 30 dias)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    recentActivities = recentActivities.filter(act => new Date(act.timestamp) > thirtyDaysAgo);

    // Salvar no Firebase
    try {
        await DB.save(COLLECTIONS.ACTIVITIES, activity, activity.id);
    } catch (error) {
        console.error('Erro ao salvar atividade no Firebase:', error);
    }

    loadRecentActivities();
}

function getActivityIcon(type) {
    const icons = {
        'school': 'fas fa-school',
        'student': 'fas fa-user-graduate',
        'exercise': 'fas fa-code',
        'material': 'fas fa-file-pdf',
        'event': 'fas fa-calendar-check'
    };
    return icons[type] || 'fas fa-info-circle';
}

function getActivityColor(type) {
    const colors = {
        'school': 'var(--primary-blue)',
        'student': 'var(--accent-cyan)',
        'exercise': 'var(--primary-yellow)',
        'material': 'var(--primary-red)',
        'event': 'var(--secondary-blue)'
    };
    return colors[type] || 'var(--text-light)';
}

function loadRecentActivities() {
    const container = document.getElementById('recentActivities');

    // Mostrar apenas as 5 atividades mais recentes
    const recentOnly = recentActivities.slice(0, 5);

    if (recentOnly.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-light); padding: 40px;">Nenhuma atividade recente ainda.</p>';
        return;
    }

    let html = '';
    recentOnly.forEach(activity => {
        const timeAgo = getTimeAgo(activity.timestamp);
        html += `
            <div style="padding: 15px; border-left: 3px solid ${activity.color}; margin: 15px 0; background: var(--hover-bg, rgba(0,0,0,0.02)); border-radius: 8px;">
                <div style="display: flex; align-items: center; gap: 12px;">
                    <i class="${activity.icon}" style="color: ${activity.color}; font-size: 1.2em;"></i>
                    <div style="flex: 1;">
                        <strong style="color: var(--text-dark);">${activity.description}</strong>
                        ${activity.details ? `<br><small style="color: var(--text-light);">${activity.details}</small>` : ''}
                        <br><small style="color: var(--text-light); font-size: 0.85em;">${timeAgo}</small>
                    </div>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

function loadHistoryActivities() {
    const container = document.getElementById('historyActivities');

    if (recentActivities.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-light); padding: 40px;">Nenhuma atividade no histórico.</p>';
        return;
    }

    let html = '';
    recentActivities.forEach(activity => {
        const timeAgo = getTimeAgo(activity.timestamp);
        const fullDate = new Date(activity.timestamp).toLocaleString('pt-BR');
        html += `
            <div style="padding: 12px; border-left: 3px solid ${activity.color}; margin: 10px 0; background: var(--hover-bg, rgba(0,0,0,0.02)); border-radius: 6px;">
                <div style="display: flex; align-items: center; gap: 10px;">
                    <i class="${activity.icon}" style="color: ${activity.color}; font-size: 1.1em;"></i>
                    <div style="flex: 1;">
                        <strong style="color: var(--text-dark); font-size: 0.95em;">${activity.description}</strong>
                        ${activity.details ? `<br><small style="color: var(--text-light);">${activity.details}</small>` : ''}
                        <br><small style="color: var(--text-light); font-size: 0.8em;" title="${fullDate}">${timeAgo}</small>
                    </div>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

function getTimeAgo(timestamp) {
    const now = new Date();
    const past = new Date(timestamp);
    const diffMs = now - past;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'agora mesmo';
    if (diffMins < 60) return `há ${diffMins} minuto${diffMins > 1 ? 's' : ''}`;
    if (diffHours < 24) return `há ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
    if (diffDays < 7) return `há ${diffDays} dia${diffDays > 1 ? 's' : ''}`;
    return past.toLocaleDateString('pt-BR');
}

// Funcionalidade de tema escuro
function toggleTheme() {
    const body = document.body;
    const btn = document.getElementById('themeToggleBtn');
    const currentTheme = localStorage.getItem('theme') || 'light';

    if (currentTheme === 'light') {
        body.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
        btn.innerHTML = '<i class="fas fa-sun"></i> Ativar Tema Claro';
    } else {
        body.removeAttribute('data-theme');
        localStorage.setItem('theme', 'light');
        btn.innerHTML = '<i class="fas fa-moon"></i> Ativar Tema Escuro';
    }
}

