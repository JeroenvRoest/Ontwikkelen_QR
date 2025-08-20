 // variabelen   
    const loginForm = document.getElementById('loginForm');
    const message = document.getElementById('message');
    
    // let op het submit event van de form
    loginForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      // haalt de gebruiksnaam en wachtwoord op
      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;

      // probeert in te loggen via API
      try {
        const response = await fetch(`${API_URL}/t/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });

        if (!response.ok) {
          throw new Error('Login mislukt');
        }

        const data = await response.json();
        console.log('Login succesvol:', data);

        // Sla inlog status en user info op in localStorage
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('token', data.token);

        // ga naar scanner pagina
        window.location.href = 'scanner.html';

      } catch (error) {
        console.error(error);
        message.textContent = 'Fout bij inloggen: ' + error.message;
      }
    });