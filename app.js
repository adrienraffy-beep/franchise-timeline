const API_KEY = '2e4e1e3248154b2f8843aab1c19e1c7b'; // Remplacez par votre clé
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const timeline = document.getElementById('timeline');
const loading = document.getElementById('loading');
const errorMsg = document.getElementById('error-message');

searchBtn.addEventListener('click', searchGame);

async function searchGame() {
    const query = searchInput.value.trim();
    if (!query) return;

    loading.classList.remove('hidden');
    timeline.innerHTML = '';
    errorMsg.classList.add('hidden');

    try {
        // 1. Rechercher le jeu pour obtenir son ID
        const searchResponse = await fetch(`https://rawg.io{API_KEY}&search=${query}&page_size=1`);
        const searchData = await searchResponse.json();

        if (searchData.results.length === 0) {
            throw new Error("Aucun jeu trouvé avec ce nom.");
        }

        const gameId = searchData.results[0].id;

        // 2. Récupérer la série (le groupe) liée à ce jeu
        const seriesResponse = await fetch(`https://rawg.io{gameId}/game-series?key=${API_KEY}`);
        const seriesData = await seriesResponse.json();

        // Inclure le jeu recherché à la liste s'il n'y est pas déjà
        let allGames = seriesData.results;
        if (!allGames.some(g => g.id === gameId)) {
            allGames.push(searchData.results[0]);
        }

        if (allGames.length <= 1) {
            throw new Error("Ce jeu ne semble pas faire partie d'une série répertoriée.");
        }

        // 3. Trier les jeux par date de sortie croissante
        allGames.sort((a, b) => new Date(a.released) - new Date(b.released));

        // 4. Afficher la Timeline
        renderTimeline(allGames);

    } catch (error) {
        errorMsg.textContent = error.message;
        errorMsg.classList.remove('hidden');
    } finally {
        loading.classList.add('hidden');
    }
}

function renderTimeline(games) {
    games.forEach((game, index) => {
        const side = index % 2 === 0 ? 'left' : 'right';
        const releaseDate = game.released ? new Date(game.released).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Date inconnue';
        
        // Note : RAWG ne sépare pas strictement jaquette et screenshot dans cette liste, 
        // on utilise l'image principale et le background pour simuler les deux visuels requis.
        const itemHtml = `
            <div class="timeline-item ${side}">
                <div class="card">
                    <span class="date">${releaseDate}</span>
                    <h3>${game.name}</h3>
                    <p>Note globale : ${game.rating || 'N/A'}/5</p>
                    <div class="media-container">
                        <img class="cover" src="${game.background_image}" alt="Jaquette de ${game.name}">
                        <img class="gameplay" src="${game.background_image}" alt="Capture de ${game.name}">
                    </div>
                </div>
            </div>
        `;
        timeline.insertAdjacentHTML('beforeend', itemHtml);
    });
}
