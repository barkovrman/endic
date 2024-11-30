const controlsDiv = document.getElementById('controls');
const tbody = document.querySelector('#dictionary tbody');
const filterSelect = document.getElementById('filter');
const learnedWords = JSON.parse(localStorage.getItem('learnedWords') || '{}');
let currentIndex = 0;
const columnVisibility = JSON.parse(localStorage.getItem('columnVisibility') || '{}');

// Восстановление состояния чекбоксов
document.getElementById('toggleImage').checked = columnVisibility.toggleImage ?? true;
document.getElementById('toggleActions').checked = columnVisibility.toggleActions ?? true;
document.getElementById('toggleWord').checked = columnVisibility.toggleWord ?? true;
document.getElementById('toggleExample').checked = columnVisibility.toggleExample ?? true;
document.getElementById('toggleTranslation').checked = columnVisibility.toggleTranslation ?? true;
document.getElementById('toggleExampleTranslation').checked = columnVisibility.toggleExampleTranslation ?? true;
filterSelect.value = localStorage.getItem('filter') || 'all';

// Функция для управления видимостью колонок
function updateColumnVisibility() {
    document.querySelectorAll('.column-image').forEach(el => el.classList.toggle('hidden', !document.getElementById('toggleImage').checked));
    document.querySelectorAll('.column-actions').forEach(el => el.classList.toggle('hidden', !document.getElementById('toggleActions').checked));
    document.querySelectorAll('.column-word').forEach(el => el.classList.toggle('hidden', !document.getElementById('toggleWord').checked));
    document.querySelectorAll('.column-example').forEach(el => el.classList.toggle('hidden', !document.getElementById('toggleExample').checked));
    document.querySelectorAll('.column-translation').forEach(el => el.classList.toggle('hidden', !document.getElementById('toggleTranslation').checked));
    document.querySelectorAll('.column-example-translation').forEach(el => el.classList.toggle('hidden', !document.getElementById('toggleExampleTranslation').checked));
}

function updateCounts() {
    const totalWords = dictionaryData.length;
    const learnedWordsCount = Object.values(learnedWords).filter(v => v).length;
    const notLearnedWordsCount = totalWords - learnedWordsCount;

    document.getElementById('totalWordsCount').textContent = totalWords;
    document.getElementById('learnedWordsCountSpan').textContent = learnedWordsCount;
    document.getElementById('notLearnedWordsCountSpan').textContent = notLearnedWordsCount;
}

function renderTable() {
    tbody.innerHTML = '';
    dictionaryData.forEach((entry, index) => {
        if (!entry) return;
        const isLearned = learnedWords[entry[0]] || false;
        if (filterSelect.value === 'learned' && !isLearned) return;
        if (filterSelect.value === 'notLearned' && isLearned) return;

        const row = document.createElement('tr');

        // Картинка
        const imageCell = document.createElement('td');
        imageCell.classList.add('column-image');
        /*const img = document.createElement('img');
        img.src = `pic/${entry[0]}.jpg`;
        img.alt = entry[0];
        imageCell.appendChild(img);*/
        row.appendChild(imageCell);

        // Действия (произношение)
        const actionsCell = document.createElement('td');
        actionsCell.classList.add('column-actions');
        const playEnButton = document.createElement('button');
        playEnButton.textContent = 'En';
        playEnButton.onclick = () => speak(entry[0], 'en-US');
        actionsCell.appendChild(playEnButton);

        const playRuButton = document.createElement('button');
        playRuButton.textContent = 'Ru';
        playRuButton.onclick = () => speak(entry[1], 'ru-RU');
        actionsCell.appendChild(playRuButton);

        const playExampleEnButton = document.createElement('button');
        playExampleEnButton.textContent = 'ExEn';
        playExampleEnButton.onclick = () => speak(entry[2], 'en-US');
        actionsCell.appendChild(playExampleEnButton);

        const playExampleRuButton = document.createElement('button');
        playExampleRuButton.textContent = 'ExRu';
        playExampleRuButton.onclick = () => speak(entry[3], 'ru-RU');
        actionsCell.appendChild(playExampleRuButton);

        row.appendChild(actionsCell);

        // Англ слово
        const wordCell = document.createElement('td');
        wordCell.classList.add('column-word');
        wordCell.textContent = entry[0];
        row.appendChild(wordCell);

        // Пример на англ
        const exampleCell = document.createElement('td');
        exampleCell.classList.add('column-example');
        exampleCell.textContent = entry[2];
        row.appendChild(exampleCell);

        // Рус слово
        const translationCell = document.createElement('td');
        translationCell.classList.add('column-translation');
        translationCell.textContent = entry[1];
        row.appendChild(translationCell);

        // Пример на русском
        const exampleTranslationCell = document.createElement('td');
        exampleTranslationCell.classList.add('column-example-translation');
        exampleTranslationCell.textContent = entry[3];
        row.appendChild(exampleTranslationCell);

        // Напомнить
        const remindCell = document.createElement('td');
        const remindButton = document.createElement('button');
        remindButton.textContent = 'Напомнить';
        remindButton.onclick = () => alert(`Англ слово: ${entry[0]}\nРус слово: ${entry[1]}\nПример на англ: ${entry[2]}\nПример на русском: ${entry[3]}`);
        remindCell.appendChild(remindButton);
        row.appendChild(remindCell);

        // Чекбокс "Выучено"
        const learnedCell = document.createElement('td');
        const learnedCheckbox = document.createElement('input');
        learnedCheckbox.type = 'checkbox';
        learnedCheckbox.checked = isLearned;
        learnedCheckbox.classList.add('learned-checkbox');

        learnedCell.appendChild(learnedCheckbox);
        row.appendChild(learnedCell);

        tbody.appendChild(row);
        updateColumnVisibility();
        tbody.appendChild(row);
        row.setAttribute('data-index', index);

        row.addEventListener('click', () => {
            // Remove the highlight from currently highlighted row
            const rows = tbody.getElementsByTagName('tr');
            Array.from(rows).forEach(r => r.classList.remove('highlighted'));

            // Get the index of the clicked row relative to its parent table
            currentIndex = row.rowIndex - 1; // Subtract 1 if tbody is not the top-level parent

            // Highlight the newly selected row
            row.classList.add('highlighted');
        });

        setLearnedCheckboxListeners();
        updateCounts();
    })
}


function setLearnedCheckboxListeners() {
    document.querySelectorAll('input[type="checkbox"]').forEach(learnedCheckbox => {
        // Attach the change event listener directly when creating the checkbox
        learnedCheckbox.onchange = function() {
            const parentRow = this.closest('tr');
            if (parentRow) {
                const word = parentRow.children[2].textContent;
                learnedWords[word] = this.checked;
                localStorage.setItem('learnedWords', JSON.stringify(learnedWords));
                parentRow.classList.add('hidden');
                updateCounts();
            }
        };
    })
}

// Сортировка в случайном порядке
function shuffleArray(array) {
    return array.sort(() => Math.random() - 0.5);
}

function prevRow() {
    currentIndex = (currentIndex > 0) ? currentIndex - 1 : 0;
    highlightRow();
}

function nextRow() {
    const rows = tbody.getElementsByTagName('tr');
    currentIndex = (currentIndex < rows.length - 1) ? currentIndex + 1 : currentIndex;
    highlightRow();
}

function playEn() {
    const rows = tbody.getElementsByTagName('tr');
    const word = rows[currentIndex].children[2].textContent;
    speak(word, 'en-US');
}

function playRu() {
    const rows = tbody.getElementsByTagName('tr');
    const translation = rows[currentIndex].children[4].textContent;
    speak(translation, 'ru-RU');
}

function playExEn() {
    const rows = tbody.getElementsByTagName('tr');
    const exampleEn = rows[currentIndex].children[3].textContent;
    speak(exampleEn, 'en-US');
}

function playExRu() {
    const rows = tbody.getElementsByTagName('tr');
    const exampleRu = rows[currentIndex].children[5].textContent;
    speak(exampleRu, 'ru-RU');
}

function playAll() {
    playEn();
    setTimeout(() => {
        playRu();
        setTimeout(() => {
            playExEn();
            setTimeout(() => {
                playExRu();
            }, 1000);
        }, 1000);
    }, 1000);
}

function speak(text, lang) {
    const msg = new SpeechSynthesisUtterance(text);
    msg.lang = lang;
    msg.rate = 0.5;
    msg.rate = lang === 'en-US' ? 0.5 : (lang === 'ru-RU' ? 1.5 : msg.rate);
    window.speechSynthesis.speak(msg);
}

function highlightRow() {
    const rows = tbody.getElementsByTagName('tr');
    Array.from(rows).forEach(row => row.classList.remove('highlighted'));
    if (rows[currentIndex]) {
        rows[currentIndex].classList.add('highlighted');
    }
}

// Сохранение состояния чекбоксов и фильтра
document.getElementById('filter').addEventListener('change', e => {
    localStorage.setItem('filter', e.target.value);
    renderTable();
});


// Сброс хранилища
document.getElementById('resetStorage').addEventListener('click', () => {
    if (confirm('Внимание! Будут сброшены все выученные слова!')) {
        localStorage.removeItem('learnedWords');
        localStorage.removeItem('columnVisibility');
        localStorage.removeItem('filter');
        location.reload();
    }
});

// Обновление видимости колонок при изменении состояния чекбоксов
['toggleImage', 'toggleActions', 'toggleWord', 'toggleExample', 'toggleTranslation', 'toggleExampleTranslation'].forEach(id => {
    document.getElementById(id).addEventListener('change', e => {
        columnVisibility[id] = e.target.checked;
        localStorage.setItem('columnVisibility', JSON.stringify(columnVisibility));
        updateColumnVisibility();
    });
});

// Инициализация таблицы
controlsDiv.innerHTML = `
    <button onclick="prevRow()">Prev</button>
    <button onclick="nextRow()">Next</button>
    <button onclick="playEn()">En</button>
    <button onclick="playRu()">Ru</button>
    <button onclick="playExEn()">ExEn</button>
    <button onclick="playExRu()">ExRu</button>
    <button onclick="playAll()">All</button>
`;


dictionaryData = shuffleArray(dictionaryData);

if (dictionaryData) {
    renderTable();
    highlightRow();
}
