
    let currentPage = 1;
    let totalResults = 0;
    let searchModalInstance = null;

    document.addEventListener('DOMContentLoaded', () => {
        const searchbox = document.getElementById('searchbox');
        const searchButton = document.getElementById('searchButton');
        const searchModal = document.getElementById('searchModal');

        searchbox.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                performSearch(1, true);
            }
        });

        searchButton.addEventListener('click', () => {
            performSearch(1, true);
        });

        searchModal.addEventListener('hidden.bs.modal', () => {
            const hitsContainer = document.getElementById('modal-hits');
            hitsContainer.innerHTML = ''; // Clear modal content on close
        });
    });

    function escapeHTML(str) {
        return str.replace(/&/g, '')
                  .replace(/<p>/g, '')
                  .replace(/<\/p>/g, '')
                  .replace(/<strong>/g, '')
                  .replace(/<\/strong>/g, '');
    }

    function stripHTML(html) {
        let doc = new DOMParser().parseFromString(html, 'text/html');
        return doc.body.textContent || "";
    }

    function getSourceLabel(nguon_gop) {
        let sources = nguon_gop.split(',');
        let label = '';
        sources.forEach(source => {
            if (source.trim() === '1') {
                label = 'ophim';
                return label;
            } else if (source.trim() === '2') {
                label = 'nguonc';
                return label;
            } else if (source.trim() === '3') {
                label = 'kkphim';
            }
        });
        return label;
    }

    function performSearch(page = 1, reset = false) {
        const query = document.getElementById('searchbox').value;
        if (!query) {
            return;
        }
        if (reset) {
            currentPage = 1;
            totalResults = 0;
        }
        fetch(`/Searchajax.php?query=${query}&page=${page}`)
            .then(response => response.json())
            .then(data => {
                const modalHitsContainer = document.getElementById('modal-hits');
                const loadMoreModalButton = document.getElementById('load-more-modal');
                const searchModalLabel = document.getElementById('searchModalLabel');

                // Update modal title with search query
                searchModalLabel.textContent = `Kết quả tìm kiếm cho "${query}"`;

                if (reset) {
                    modalHitsContainer.innerHTML = '';
                }

                if (data.movies.length === 0) {
                    modalHitsContainer.innerHTML = '<div class="alert alert-warning">Không có kết quả nào phù hợp.</div>';
                } else {
                    data.movies.forEach(item => {
                        const sourceLabel = getSourceLabel(item.nguon_gop);
                        const imdbRating = item.imdb ? escapeHTML(item.imdb.toString()) : 'N/A';
                        const hitElement = document.createElement('div');
                        hitElement.className = 'hit list-group-item list-group-item-action px-2';
                        hitElement.innerHTML = `
                            <div class="thumbnail_search">
                                <img src="https://apii.online/_next/img.php?img=https://apii.online/image/${escapeHTML(sourceLabel)}/thumb/.${escapeHTML(item.slug)}.webp&w=40&h=48" alt="${escapeHTML(item.name)}">
                            </div>
                            <a href="https://apii.online/phim/${escapeHTML(item.slug)}" target="_blank"><h5 class="mb-1">${escapeHTML(item.name)} (${escapeHTML(item.origin_name)})</h5></a>
                            <p class="mb-1">${escapeHTML(stripHTML(item.content))}...</p>
                            <div><b>Year: ${escapeHTML(item.year.toString())}, IMDB: ${imdbRating}</b></div>
                        `;
                        modalHitsContainer.appendChild(hitElement);
                    });
                }

                totalResults = data.total;
                if ((currentPage * 10) < totalResults) {
                    loadMoreModalButton.style.display = 'block';
                } else {
                    loadMoreModalButton.style.display = 'none';
                }

                if (!searchModalInstance) {
                    searchModalInstance = new bootstrap.Modal(document.getElementById('searchModal'));
                }
                searchModalInstance.show();
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }

    function loadMore(fromModal = false) {
        currentPage++;
        performSearch(currentPage);
        if (fromModal) {
            if (!searchModalInstance) {
                searchModalInstance = new bootstrap.Modal(document.getElementById('searchModal'));
            }
            searchModalInstance.show();
        }
    }
