document.addEventListener('DOMContentLoaded', () => {
    const searchContainer = document.querySelector('.search-container');
    const searchInput = searchContainer?.querySelector("input[type='search']");
    const listItems = Array.from(searchContainer?.querySelectorAll('li') ?? []);

    if (!searchContainer || !searchInput) {
        return;
    }

    const hangulInitials = ['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
    const hangulBase = 0xac00;
    const hangulLast = 0xd7a3;
    const initialInterval = 588;

    const normalizeText = (value) => value.toLowerCase().replace(/\s+/g, '');

    const toInitials = (value) => {
        let result = '';

        for (const character of value) {
            const code = character.charCodeAt(0);

            if (code >= hangulBase && code <= hangulLast) {
                const index = Math.floor((code - hangulBase) / initialInterval);
                result += hangulInitials[index] ?? character;
                continue;
            }

            if (/\s/.test(character)) {
                continue;
            }

            result += character.toLowerCase();
        }

        return result;
    };

    const toWordInitials = (value) => {
        return value
            .split(/\s+/)
            .filter(Boolean)
            .map((word) => toInitials(word)[0] ?? '')
            .join('');
    };

    const buildSearchIndex = (item) => {
        const title = item.dataset.title ?? '';
        const location = item.dataset.location ?? '';
        const date = item.dataset.date ?? '';
        const dday = item.dataset.dday ?? '';
        const titleInitials = toInitials(title);
        const locationInitials = toInitials(location);
        const titleWordInitials = toWordInitials(title);
        const locationWordInitials = toWordInitials(location);
        const combined = [title, location, date, dday, titleInitials, locationInitials].filter(Boolean).join(' ');

        return {
            combined,
            normalizedCombined: normalizeText(combined),
            initialsCombined: toInitials(combined),
            title,
            location,
            titleInitials,
            locationInitials,
            titleWordInitials,
            locationWordInitials,
        };
    };

    const searchableItems = listItems.map((item) => ({
        item,
        index: buildSearchIndex(item),
    }));

    const filterItems = () => {
        const query = searchInput.value.trim();
        const normalizedQuery = normalizeText(query);
        const queryInitials = toInitials(query);
        let matchedCount = 0;

        searchableItems.forEach(({ item, index }) => {
            const matched =
                normalizedQuery === '' ||
                index.normalizedCombined.includes(normalizedQuery) ||
                index.initialsCombined.includes(queryInitials) ||
                index.initialsCombined.includes(normalizedQuery) ||
                index.titleInitials.includes(queryInitials) ||
                index.locationInitials.includes(queryInitials) ||
                index.titleWordInitials.includes(queryInitials) ||
                index.locationWordInitials.includes(queryInitials);

            item.hidden = !matched;

            if (matched) {
                matchedCount += 1;
            }
        });

        searchContainer.classList.toggle('has-results', matchedCount > 0 || query === '');
    };

    const closeSearchList = () => {
        searchContainer.classList.remove('is-active');
    };

    const openSearchList = () => {
        searchContainer.classList.add('is-active');
        filterItems();
    };

    searchInput.addEventListener('focus', openSearchList);
    searchInput.addEventListener('input', filterItems);

    searchInput.addEventListener('blur', () => {
        window.setTimeout(() => {
            if (!searchContainer.contains(document.activeElement)) {
                closeSearchList();
            }
        }, 0);
    });

    document.addEventListener('pointerdown', (event) => {
        if (!searchContainer.contains(event.target)) {
            closeSearchList();
        }
    });

    filterItems();
});
