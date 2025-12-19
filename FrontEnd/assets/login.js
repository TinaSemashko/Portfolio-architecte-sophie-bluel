const loginForm = document.getElementById('login-form');

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Supprimer le message d'erreur précédent
    const existingError = document.querySelector('.error-message');
    if (existingError) existingError.remove();
    
    // Récupérer les valeurs du formulaire
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    try {
        const response = await fetch('http://localhost:5678/api/users/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        if (response.ok) {
            const data = await response.json();
            // Stocker le token
            localStorage.setItem('token', data.token);
            // Rediriger vers la page d'accueil
            window.location.href = 'index.html';
        } else {
            // Afficher le message d'erreur
            displayError('E-mail ou mot de passe incorrect');
        }
    } catch (error) {
        console.error('Erreur:', error);
        displayError('Erreur de connexion au serveur');
    }
});

function displayError(message) {
    const form = document.getElementById('login-form');
    const errorDiv = document.createElement('p');
    errorDiv.classList.add('error-message');
    errorDiv.textContent = message;
    form.insertBefore(errorDiv, form.firstChild);
}