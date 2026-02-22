const tbody = document.querySelector('#dictionary tbody');
const learnedWords = JSON.parse(localStorage.getItem('learnedWords') || '{}');
let currentIndex = 0;
const columnVisibility = JSON.parse(localStorage.getItem('columnVisibility') || '{}');
const partSizeToShow = 20;
const currentDataElement = document.getElementById('currentData');

// Восстановление состояния чекбоксов
document.getElementById('togglePartial').checked = columnVisibility.togglePartial ?? true;
document.getElementById('toggleImage').checked = columnVisibility.toggleImage ?? true;
document.getElementById('toggleActions').checked = columnVisibility.toggleActions ?? true;
document.getElementById('toggleWord').checked = columnVisibility.toggleWord ?? true;
document.getElementById('toggleExample').checked = columnVisibility.toggleExample ?? true;
document.getElementById('toggleTranslation').checked = columnVisibility.toggleTranslation ?? true;
document.getElementById('toggleExampleTranslation').checked = columnVisibility.toggleExampleTranslation ?? true;

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

    let nextIndex = 0;
    const lenDictionary = dictionaryData.length;

    let showDictionaryData = dictionaryData.filter(entry => !learnedWords[entry[0]]);
    if (document.getElementById('togglePartial').checked) {
        showDictionaryData = showDictionaryData.slice(0, partSizeToShow);
    }


    /*while (nextIndex < lenDictionary) {
        // Get the next slice
        showDictionaryData = dictionaryData.slice(nextIndex, nextIndex + partSizeToShow);

        // Filter the slice for not-learned words
        showDictionaryData = showDictionaryData.filter(entry => !learnedWords[entry[0]]);

        // If we found any not-learned words, stop processing and use this slice
        if (showDictionaryData.length > 0) break;

        // Move to the next portion
        nextIndex += partSizeToShow;
    }*/


    // Shuffle the results if there are words to show
    if (showDictionaryData && showDictionaryData.length > 0) {
        showDictionaryData = shuffleArray(showDictionaryData);
    }


    showDictionaryData
        .forEach((entry, index) => {
        if (!entry) return;
        const isLearned = learnedWords[entry[0]] || false;
        if (isLearned) return;

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


function hideCurrentData(){
    console.log('hideCurrentData');
    currentDataElement.classList.add('whiteColor');
}

function showCurrentData(){
    console.log('showCurrentData');
    currentDataElement.classList.remove('whiteColor');
}


function whenChangeRow(){
    hideCurrentData();
    highlightRow();
}

function prevRow() {
    currentIndex = (currentIndex > 0) ? currentIndex - 1 : 0;
    whenChangeRow();
}

function nextRow() {
    const rows = tbody.getElementsByTagName('tr');
    currentIndex = (currentIndex < rows.length - 1) ? currentIndex + 1 : currentIndex;
    whenChangeRow();
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

function markCurrentWordAsLearned() {
    const rows = tbody.getElementsByTagName('tr');
    if (rows[currentIndex]) {
        const row = rows[currentIndex];
        const word = row.children[2].textContent; // Get the English word from the current row
        const confirmationMessage = `Are you sure you want to mark "${word}" as learned?`;

        if (confirm(confirmationMessage))
            if (!learnedWords[word]) {
                learnedWords[word] = true; // Mark the word as learned
                localStorage.setItem('learnedWords', JSON.stringify(learnedWords));
                row.classList.add('hidden'); // Optionally hide the row
                updateCounts(); // Update counts for learned / not learned words
                nextRow();
            }
    }
}

// Define your sequence as an array of objects with function and delay
const sequence = [
    { func: playEn, delay: 0 },
    { func: playRu, delay: 4000 },
    { func: playEn, delay: 4000 },
    { func: playEn, delay: 4000 },
    { func: playExEn, delay: 6000 },
    { func: playExEn, delay: 6000 },
    { func: playExRu, delay: 6000 },
    { func: playExEn, delay: 6000 },
    { func: playExEn, delay: 6000 },
];

function playAll() {
    let index = 0;

    function executeNext() {
        let delay = 6000;

        if (index < sequence.length) {
            const currentStep = sequence[index];

            // Execute current function
            currentStep.func();

            // Move to next index
            index++;

            // Schedule next execution if there are more steps
            if (index < sequence.length) {
                setTimeout(executeNext, currentStep.delay);
            }
        }
    }

    executeNext();
}


function speak(text, lang) {
    const msg = new SpeechSynthesisUtterance(text);
    msg.lang = lang;
    msg.rate = lang === 'en-US' ? 1 : (lang === 'ru-RU' ? 1.5 : msg.rate);
    window.speechSynthesis.speak(msg);
}

function highlightRow() {
    const rows = tbody.getElementsByTagName('tr');
    Array.from(rows).forEach(row => row.classList.remove('highlighted'));
    if (rows[currentIndex]) {
        rows[currentIndex].classList.add('highlighted');
    }
    const currentEnglishWord = rows[currentIndex].children[2].textContent;
    document.getElementById('currentEnText').textContent = currentEnglishWord;
    document.getElementById('currentRuText').textContent = rows[currentIndex].children[4].textContent;
    document.getElementById('currentExEnText').textContent = rows[currentIndex].children[3].textContent;
    document.getElementById('currentExRuText').textContent = rows[currentIndex].children[5].textContent;
}


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

// Обработка изменения состояния чекбокса 'partial'
document.getElementById('togglePartial').addEventListener('change', e => {
    columnVisibility['togglePartial'] = e.target.checked;
    localStorage.setItem('columnVisibility', JSON.stringify(columnVisibility));
    renderTable(); // Re-render the table when the partial checkbox changes
});


document.addEventListener('keydown', (event) => {
    switch (event.key.toLowerCase()) {
        case 'd':
            document.getElementById('prevRowBtn').click();
            break;
        case 'f':
            document.getElementById('nextRowBtn').click();
            break;
        case 'e':
            document.getElementById('playEnBtn').click();
            break;
        case 'r':
            document.getElementById('playRuBtn').click();
            break;
        case 't':
            document.getElementById('playExEnBtn').click();
            break;
        case 'y':
            document.getElementById('playExRuBtn').click();
            break;
        case 'a':
            document.getElementById('playAllBtn').click();
            break;
    }
});


document.getElementById('currentData').addEventListener('click', function () {
    showCurrentData();
});

if (dictionaryData) {
    renderTable();
    whenChangeRow();
}