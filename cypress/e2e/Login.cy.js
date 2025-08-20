describe('Login Page', () => {
  it('logs in and redirects to scanner.html', () => {
    // Visit the login page
    cy.visit('http://127.0.0.1:5500/login.html')

    // Fill in the form
    cy.get('input[name="username"]').type('admin')
    cy.get('input[name="password"]').type('password123')

    // Submit the form
    cy.get('button[type="submit"]').click()

    // Wait for redirect and check URL includes scanner.html
    cy.url().should('include', '/scanner.html')
  })

  it('sends login request to mock API and gets 200 OK', () => {
    // Intercept the login API POST request and give it a name
    cy.intercept('POST', 'https://1a2480b0-fd9b-48ad-bfa8-f417948043b0.mock.pstmn.io/t/login').as('loginRequest')

    // Visit the login page again (new start)
    cy.visit('http://127.0.0.1:5500/login.html')

    // Fill in the form
    cy.get('input[name="username"]').type('admin')
    cy.get('input[name="password"]').type('password123')

    // Submit the form
    cy.get('button[type="submit"]').click()

    // Wait for the intercepted request and check the status code is 200
    cy.wait('@loginRequest').its('response.statusCode').should('eq', 200)

    // check redirect again
    cy.url().should('include', '/scanner.html')
  })
})
describe('Login Page - token opslag en leeg veld', () => {
  it('shows error when username or password is empty', () => {
    cy.visit('http://127.0.0.1:5500/login.html');

    // Submit empty form
    cy.get('button[type="submit"]').click();

    // Check that an alert is shown (of een foutmelding op de pagina)
    cy.on('window:alert', (text) => {
      expect(text.toLowerCase()).to.include('fout');
    });

    // Vul alleen username in
    cy.get('input[name="username"]').type('admin');
    cy.get('button[type="submit"]').click();

    cy.on('window:alert', (text) => {
      expect(text.toLowerCase()).to.include('fout');
    });

    // Vul alleen wachtwoord in
    cy.get('input[name="username"]').clear();
    cy.get('input[name="password"]').type('password123');
    cy.get('button[type="submit"]').click();

    cy.on('window:alert', (text) => {
      expect(text.toLowerCase()).to.include('fout');
    });
  });

  it('stores token in localStorage after successful login', () => {
    cy.intercept('POST', 'https://1a2480b0-fd9b-48ad-bfa8-f417948043b0.mock.pstmn.io/t/login', {
      statusCode: 200,
      body: { token: 'fake-token', user: { username: 'admin' } }
    }).as('loginRequest');

    cy.visit('http://127.0.0.1:5500/login.html');

    cy.get('input[name="username"]').type('admin');
    cy.get('input[name="password"]').type('password123');
    cy.get('button[type="submit"]').click();

    cy.wait('@loginRequest');

    // Check localStorage
    cy.window().then((win) => {
      expect(win.localStorage.getItem('token')).to.eq('fake-token');
      expect(JSON.parse(win.localStorage.getItem('user')).username).to.eq('admin');
    });

    // Check redirect
    cy.url().should('include', '/scanner.html');
  });
});

describe('Login Page - Bad Weather Tests', () => {
  beforeEach(() => {
    cy.visit('http://127.0.0.1:5500/login.html');
  });

  it('toont foutmelding bij verkeerde credentials', () => {
    // Forceer een 401 response van de login endpoint
    cy.intercept('POST', 'https://1a2480b0-fd9b-48ad-bfa8-f417948043b0.mock.pstmn.io/t/login', {
      statusCode: 401,
      body: { message: 'Ongeldige username of wachtwoord' },
    }).as('loginFail');

    cy.get('input[name="username"]').type('fouteUser');
    cy.get('input[name="password"]').type('foutWachtwoord');
    cy.get('button[type="submit"]').click();

    cy.wait('@loginFail');

    // Controleer of de foutmelding zichtbaar is
    cy.on('window:alert', (text) => {
      expect(text.toLowerCase()).to.include('fout');
    });
  });

  it('toont foutmelding bij server error', () => {
    cy.intercept('POST', 'https://1a2480b0-fd9b-48ad-bfa8-f417948043b0.mock.pstmn.io/t/login', {
      statusCode: 500,
      body: { message: 'Server error' },
    }).as('loginServerError');

    cy.get('input[name="username"]').type('admin');
    cy.get('input[name="password"]').type('password123');
    cy.get('button[type="submit"]').click();

    cy.wait('@loginServerError');

    cy.on('window:alert', (text) => {
      expect(text.toLowerCase()).to.include('fout');
    });
  });
});
