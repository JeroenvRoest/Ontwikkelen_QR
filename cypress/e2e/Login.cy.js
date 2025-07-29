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
