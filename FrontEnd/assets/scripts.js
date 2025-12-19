let allWorks = []; // Хранение всех работ для фильтрации

// Récupération des travaux depuis l'API
async function fetchWorks() {
    try {
        const response = await fetch('http://localhost:5678/api/works');
        allWorks = await response.json();
        displayWorks(allWorks);
        displayFilters(allWorks);
    } catch (error) {
        console.error('Erreur lors de la récupération des travaux:', error);
    }
}

// Affichage des travaux dans la galerie
function displayWorks(works) {
    const gallery = document.querySelector('.gallery');
    gallery.innerHTML = '';

    works.forEach(work => {
        const figure = document.createElement('figure');
        
        const img = document.createElement('img');
        img.src = work.imageUrl;
        img.alt = work.title;
        
        const figcaption = document.createElement('figcaption');
        figcaption.textContent = work.title;
        
        figure.appendChild(img);
        figure.appendChild(figcaption);
        gallery.appendChild(figure);
    });
}

// Génération dynamique des filtres
function displayFilters(works) {
    const portfolio = document.getElementById('portfolio');
    const gallery = document.querySelector('.gallery');
    
    // Créer le conteneur des filtres
    const filtersContainer = document.createElement('div');
    filtersContainer.classList.add('filters');
    
    // Extraire les catégories uniques avec Set
    const categories = works.map(work => work.category);
    console.log(categories);
    const uniqueCategories = [...new Map(categories.map(cat => [cat.id, cat])).values()];
    console.log(uniqueCategories);
    
    // Bouton "Tous"
    const btnAll = document.createElement('button');
    btnAll.textContent = 'Tous';
    btnAll.classList.add('filter-btn', 'active');
    btnAll.addEventListener('click', () => {
        setActiveFilter(btnAll);
        displayWorks(allWorks);
    });
    filtersContainer.appendChild(btnAll);
    
    // Boutons pour chaque catégorie
    uniqueCategories.forEach(category => {
        const btn = document.createElement('button');
        btn.textContent = category.name;
        btn.classList.add('filter-btn');
        btn.addEventListener('click', () => {
            setActiveFilter(btn);
            const filteredWorks = allWorks.filter(work => work.categoryId === category.id);
            displayWorks(filteredWorks);
        });
        filtersContainer.appendChild(btn);
    });
    
    // Insérer les filtres avant la galerie
    portfolio.insertBefore(filtersContainer, gallery);
}

// Gestion de l'état actif des boutons
function setActiveFilter(activeBtn) {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    activeBtn.classList.add('active');
}

// Lancement au chargement de la page
fetchWorks();