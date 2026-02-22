(function() {
    const UP = { sx: 553, sy: 173 };
    //const UP = { sx: 537, sy: 389 };  // Middle coords
    const TOLERANCE = 80;
    const DOUBLE_MS = 500;

    let lastTapTime = 0;
    let singleTimer = null;
    let lastEventMs = 0;

    function isUpButton(sx, sy) {
        const dx = sx - UP.sx;
        const dy = sy - UP.sy;
        return Math.sqrt(dx*dx + dy*dy) < TOLERANCE;
    }

    function handleUp() {
        const now = Date.now();
        // Deduplicate pointerdown+touchstart for same physical press (within 30ms)
        if (now - lastEventMs < 30) return;
        lastEventMs = now;

        const diff = now - lastTapTime;
        const isDouble = diff < DOUBLE_MS && diff > 0;

        if (singleTimer) {
            clearTimeout(singleTimer);
            singleTimer = null;
        }

        if (isDouble) {
            lastTapTime = 0;
            console.log('Remote: UP DOUBLE → nextWord + playAll');
            document.getElementById('nextRowBtn').click();
            setTimeout(() => document.getElementById('playAllBtn').click(), 100);
        } else {
            lastTapTime = now;
            singleTimer = setTimeout(() => {
                singleTimer = null;
                lastTapTime = 0;
                console.log('Remote: UP SINGLE → playExEn');
                document.getElementById('playExEnBtn').click();
            }, DOUBLE_MS);
        }
    }

    document.addEventListener('touchstart', (e) => {
        const t = e.touches[0];
        if (!isUpButton(t.screenX, t.screenY)) return;
        e.preventDefault();
        e.stopPropagation();
        handleUp();
    }, { capture: true, passive: false });

    document.addEventListener('pointerdown', (e) => {
        if (e.pointerType !== 'pen') return;
        if (!isUpButton(e.screenX, e.screenY)) return;
        e.preventDefault();
        e.stopPropagation();
        handleUp();
    }, true);

    console.log('TikTok remote conrol: UP=PlayAll, UP×2=NextWord');
})();