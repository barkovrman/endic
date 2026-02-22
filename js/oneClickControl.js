(function() {
    const DOUBLE_MS = 500;

    let lastTapTime = 0;
    let lastEventMs = 0;
    let singleTimer  = null;

    function handlePress() {
        const now  = Date.now();

        // Deduplicate pointerdown+touchstart from same physical press
        if (now - lastEventMs < 30) return;
        lastEventMs = now;

        const diff     = now - lastTapTime;
        const isDouble = diff < DOUBLE_MS && diff > 0;

        if (singleTimer) {
            clearTimeout(singleTimer);
            singleTimer = null;
        }

        if (isDouble) {
            lastTapTime = 0;
            console.log('oneClickControl: DOUBLE → nextWord + playAll');
            document.getElementById('nextRowBtn').click();
            setTimeout(() => document.getElementById('playAllBtn').click(), 100);
        } else {
            lastTapTime = now;
            singleTimer = setTimeout(() => {
                singleTimer  = null;
                lastTapTime  = 0;
                console.log('oneClickControl: SINGLE → playExEn');
                document.getElementById('playExEnBtn').click();
            }, DOUBLE_MS);
        }
    }

    const el = document.getElementById('oneClickControl');
    if (!el) {
        console.error('oneClickControl: div#oneClickControl not found!');
        return;
    }

    el.addEventListener('click', (e) => { e.preventDefault(); handlePress(); }, true);

    console.log('oneClickControl ready. SINGLE=playExEn, DOUBLE=nextWord+playAll');
})();