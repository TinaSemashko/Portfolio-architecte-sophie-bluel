let allWorks = [];

// ==================== FETCH & DISPLAY ====================

async function fetchWorks() {
    try {
        const response = await fetch('http://localhost:5678/api/works');
        allWorks = await response.json();
        displayWorks(allWorks);
        displayFilters(allWorks);
        displayModalGallery(allWorks);
    } catch (error) {
        console.error('Erreur lors de la récupération des travaux:', error);
    }
}

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

function displayFilters(works) {
    const filtersContainer = document.querySelector('.filters');
    if (filtersContainer.children.length > 0) return;
    
    const categories = works.map(work => work.category);
    const uniqueCategories = [...new Map(categories.map(cat => [cat.id, cat])).values()];
    
    const btnAll = document.createElement('button');
    btnAll.textContent = 'Tous';
    btnAll.classList.add('filter-btn', 'active');
    btnAll.addEventListener('click', () => {
        setActiveFilter(btnAll);
        displayWorks(allWorks);
    });
    filtersContainer.appendChild(btnAll);
    
    uniqueCategories.forEach(category => {
        const btn = document.createElement('button');
        btn.textContent = category.name;
        btn.classList.add('filter-btn');
        btn.addEventListener('click', () => {
            setActiveFilter(btn);
            displayWorks(allWorks.filter(work => work.categoryId === category.id));
        });
        filtersContainer.appendChild(btn);
    });
}

function setActiveFilter(activeBtn) {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    activeBtn.classList.add('active');
}

// ==================== LOGIN STATUS ====================

function checkLoginStatus() {
    const token = localStorage.getItem('token');
    const editBar = document.getElementById('edit-bar');
    const editBtn = document.getElementById('edit-gallery-btn');
    const filters = document.querySelector('.filters');
    
    if (token) {
        editBar.classList.remove('hidden');
        editBtn.classList.remove('hidden');
        filters.classList.add('hidden');
    } else {
        editBar.classList.add('hidden');
        editBtn.classList.add('hidden');
        filters.classList.remove('hidden');
    }
}

// ==================== MODAL ====================

function openModal() {
    const modal = document.getElementById('modal');
    modal.classList.remove('hidden');
    modal.setAttribute('aria-hidden', 'false');
    showGalleryView();
}

function closeModal() {
    const modal = document.getElementById('modal');
    modal.classList.add('hidden');
    modal.setAttribute('aria-hidden', 'true');
    resetAddForm();
    hideModalError();
}

function showGalleryView() {
    document.getElementById('modal-gallery-view').classList.remove('hidden');
    document.getElementById('modal-add-view').classList.add('hidden');
    document.querySelector('.modal-back').classList.add('hidden');
}

function showAddView() {
    document.getElementById('modal-gallery-view').classList.add('hidden');
    document.getElementById('modal-add-view').classList.remove('hidden');
    document.querySelector('.modal-back').classList.remove('hidden');
    populateCategorySelect();
}

function displayModalGallery(works) {
    const modalGallery = document.querySelector('.modal-gallery');
    if (!modalGallery) return;
    modalGallery.innerHTML = '';
    
    works.forEach(work => {
        const figure = document.createElement('figure');
        
        const img = document.createElement('img');
        img.src = work.imageUrl;
        img.alt = work.title;
        
        const deleteBtn = document.createElement('button');
        deleteBtn.classList.add('delete-btn');
        deleteBtn.innerHTML = '<i class="fa-solid fa-trash-can"></i>';
        deleteBtn.addEventListener('click', () => deleteWork(work.id));
        
        figure.appendChild(img);
        figure.appendChild(deleteBtn);
        modalGallery.appendChild(figure);
    });
}

function populateCategorySelect() {
    const select = document.getElementById('category-input');
    if (!select || select.options.length > 1) return;
    
    const categories = [...new Map(allWorks.map(w => [w.category.id, w.category])).values()];
    categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat.id;
        option.textContent = cat.name;
        select.appendChild(option);
    });
}

// ==================== IMAGE PREVIEW ====================

function setupImagePreview() {
    const imageInput = document.getElementById('image-input');
    const imagePreview = document.getElementById('image-preview');
    const uploadZone = document.getElementById('upload-zone');
    
    if (!imageInput) return;
    
    imageInput.addEventListener('change', () => {
        const file = imageInput.files[0];
        
        if (!file) return;
        
        // Check file size (4MB = 4 * 1024 * 1024 bytes)
        const maxSize = 4 * 1024 * 1024;
        if (file.size > maxSize) {
            showModalError('Le fichier dépasse 4 Mo');
            imageInput.value = '';
            return;
        }
        
        // Check file type
        const allowedTypes = ['image/png', 'image/jpeg'];
        if (!allowedTypes.includes(file.type)) {
            showModalError('Format accepté : JPG ou PNG uniquement');
            imageInput.value = '';
            return;
        }
        
        // Show preview
        const reader = new FileReader();
        reader.onload = (e) => {
            imagePreview.src = e.target.result;
            imagePreview.classList.remove('hidden');
            uploadZone.classList.add('hidden');
            hideModalError();
        };
        reader.readAsDataURL(file);
        
        validateForm();
    });
}

// ==================== FORM VALIDATION ====================

function validateForm() {
    const imageInput = document.getElementById('image-input');
    const titleInput = document.getElementById('title-input');
    const categoryInput = document.getElementById('category-input');
    const btnValidate = document.querySelector('.btn-validate');
    
    if (!imageInput || !titleInput || !categoryInput || !btnValidate) return;
    
    const hasImage = imageInput.files.length > 0;
    const hasTitle = titleInput.value.trim() !== '';
    const hasCategory = categoryInput.value !== '';
    
    btnValidate.disabled = !(hasImage && hasTitle && hasCategory);
}

function setupFormValidation() {
    const titleInput = document.getElementById('title-input');
    const categoryInput = document.getElementById('category-input');
    
    if (!titleInput || !categoryInput) return;
    
    titleInput.addEventListener('input', validateForm);
    categoryInput.addEventListener('change', validateForm);
}

function resetAddForm() {
    const form = document.getElementById('add-work-form');
    const imagePreview = document.getElementById('image-preview');
    const uploadZone = document.getElementById('upload-zone');
    const btnValidate = document.querySelector('.btn-validate');
    
    if (!form) return;
    
    form.reset();
    if (imagePreview) imagePreview.classList.add('hidden');
    if (uploadZone) uploadZone.classList.remove('hidden');
    if (btnValidate) btnValidate.disabled = true;
}

// ==================== ERROR DISPLAY ====================

function showModalError(message) {
    const errorDiv = document.getElementById('modal-error');
    if (!errorDiv) return;
    
    errorDiv.textContent = message;
    errorDiv.classList.remove('hidden');
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        errorDiv.classList.add('hidden');
    }, 5000);
}

function hideModalError() {
    const errorDiv = document.getElementById('modal-error');
    if (errorDiv) errorDiv.classList.add('hidden');
}

// ==================== DELETE WORK ====================

async function deleteWork(workId) {
    const token = localStorage.getItem('token');
    
    if (!token) {
        showModalError('Vous devez être connecté');
        return;
    }
    
    try {
        const response = await fetch(`http://localhost:5678/api/works/${workId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            allWorks = allWorks.filter(work => work.id !== workId);
            displayWorks(allWorks);
            displayModalGallery(allWorks);
            hideModalError();
        } else if (response.status === 401) {
            showModalError('Session expirée, reconnectez-vous');
            localStorage.removeItem('token');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        } else if (response.status === 500) {
            showModalError('Erreur serveur inattendue');
        } else {
            showModalError('Erreur lors de la suppression');
        }
    } catch (error) {
        console.error('Erreur:', error);
        showModalError('Erreur de connexion au serveur');
    }
}

// ==================== ADD WORK ====================

async function addWork(e) {
    e.preventDefault();
    
    const token = localStorage.getItem('token');
    
    if (!token) {
        showModalError('Vous devez être connecté');
        return;
    }
    
    const imageInput = document.getElementById('image-input');
    const titleInput = document.getElementById('title-input');
    const categoryInput = document.getElementById('category-input');
    
    // Create FormData
    const formData = new FormData();
    formData.append('image', imageInput.files[0]);
    formData.append('title', titleInput.value);
    formData.append('category', categoryInput.value);
    
    try {
        const response = await fetch('http://localhost:5678/api/works', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });
        
        if (response.ok) {
            const newWork = await response.json();
            // Add to array
            allWorks.push(newWork);
            // Update both galleries
            displayWorks(allWorks);
            displayModalGallery(allWorks);
            // Reset form and go back to gallery view
            resetAddForm();
            showGalleryView();
        } else if (response.status === 400) {
            showModalError('Données invalides');
        } else if (response.status === 401) {
            showModalError('Session expirée, reconnectez-vous');
            localStorage.removeItem('token');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        } else if (response.status === 500) {
            showModalError('Erreur serveur inattendue');
        } else {
            showModalError('Erreur lors de l\'ajout');
        }
    } catch (error) {
        console.error('Erreur:', error);
        showModalError('Erreur de connexion au serveur');
    }
}

// ==================== EVENT LISTENERS ====================

function setupEventListeners() {
    const editBtn = document.getElementById('edit-gallery-btn');
    const modalOverlay = document.querySelector('.modal-overlay');
    const modalClose = document.querySelector('.modal-close');
    const modalBack = document.querySelector('.modal-back');
    const btnAddPhoto = document.getElementById('btn-add-photo');
    const addWorkForm = document.getElementById('add-work-form');
    
    editBtn?.addEventListener('click', openModal);
    modalOverlay?.addEventListener('click', closeModal);
    modalClose?.addEventListener('click', closeModal);
    modalBack?.addEventListener('click', showGalleryView);
    btnAddPhoto?.addEventListener('click', showAddView);
    addWorkForm?.addEventListener('submit', addWork);
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });
}

// ==================== INIT ====================

document.addEventListener('DOMContentLoaded', () => {
    fetchWorks();
    checkLoginStatus();
    setupEventListeners();
    setupImagePreview();
    setupFormValidation();
});