describe('Client pagina tests', () => {
  beforeEach(() => {
    // Mock client API
    cy.intercept('GET', '**/t/client/123*', {
      statusCode: 200,
      body: {
        id: '123',
        name: 'Jan Jansen',
        dateOfBirth: '1957-01-01',
        roomNumber: 'Kamer 101',
        location: 'Afdeling de Leede',
        Allergieën: 'hooikoorts, Morfine',
        reanimeren: 'Ja',
      },
    }).as('getClient');

    // Pagina bezoeken
    cy.visit('http://127.0.0.1:5500/client.html?id=123');

    // Wacht op client data
    cy.wait('@getClient');
  });

  it('shows full client info after fetching from API', () => {
    cy.contains('Naam: Jan Jansen').should('be.visible');
    cy.contains('Cliënt ID: 123').should('be.visible');
    cy.contains('Geboortedatum: 1957-01-01').should('be.visible');
    cy.contains('Kamernummer: Kamer 101').should('be.visible');
    cy.contains('Afdeling: Afdeling de Leede').should('be.visible');
    cy.contains('Allergieën: hooikoorts, Morfine').should('be.visible');
    cy.contains('Reanimeren: Ja').should('be.visible');
  });

  it('clicking newScannerBtn returns to scanner.html', () => {
    cy.get('#newScannerBtn').click();
    cy.url().should('include', '/scanner.html');
  });

  it('shows emergency contact info when showEmergencyContactBtn is clicked', () => {
    cy.intercept('GET', '**/t/client_contact_relations/123*', {
      statusCode: 200,
      body: {
        contacts: [
          {
            id: 10310,
            name: 'Mw. MMT 05-11-86',
            clientContactRelationType: { name: 'example' },
            personalRelationType: {
              name: 'example',
              relationCategory: { contactInfo: '0612345679' },
            },
            inCaseOfEmergency: false,
          },
          {
            id: 10311,
            name: 'Dhr. Jan Contact',
            clientContactRelationType: { name: 'familielid' },
            personalRelationType: {
              name: 'familielid',
              relationCategory: { contactInfo: '0612345678' },
            },
            inCaseOfEmergency: true,
          },
        ],
      },
    }).as('getEmergencyContact');

    cy.get('#showEmergencyContactBtn').click();
    cy.wait('@getEmergencyContact');

    cy.get('#emergencyContact').should('contain.text', 'Naam: Dhr. Jan Contact');
    cy.get('#emergencyContact').should('contain.text', 'Relatie: familielid');
    cy.get('#emergencyContact').should('contain.text', 'Telefoon: 0612345678');
  });

  it('geeft een foutmelding bij ongeldig JSON antwoord', () => {
    cy.intercept('GET', '**/t/client/*', {
      statusCode: 200,
      body: 'niet geldig json',
      headers: { 'content-type': 'application/json' },
    }).as('ongeldigeJson');

    cy.visit('http://127.0.0.1:5500/client.html?id=123', {
      failOnStatusCode: false,
    });

    cy.wait('@ongeldigeJson');

    cy.on('window:alert', (text) => {
      expect(text.toLowerCase()).to.include('fout');
    });
  });

  describe('Medische notities', () => {
    it('toont medische notities en sluit verwijderde notities uit', () => {
      cy.intercept('GET', '**/t/clients/123/medical_notes', {
        statusCode: 200,
        body: {
          medicalNotes: [
            {
              id: 1,
              content: 'Dummy note for client 123',
              deleted: false,
              startDate: '2023-06-01',
              endDate: '2023-06-30',
              createdBy: 'Dr. Smith',
              authorId: 5,
            },
            {
              id: 2,
              content: 'Dummy note for client 123',
              deleted: true,
              startDate: '2023-06-01',
              endDate: '2023-06-30',
              createdBy: 'Dr. Smith',
              authorId: 5,
            },
            {
              id: 3,
              content: 'Dummy note for client 123',
              deleted: false,
              startDate: '2023-06-01',
              endDate: '2023-06-30',
              createdBy: 'Dr. Smith',
              authorId: 5,
            },
          ],
        },
      }).as('getMedicalNotes');

      cy.get('#showNotesBtn').click();
      cy.wait('@getMedicalNotes');

      cy.get('#medicalNotes').should('contain', 'Medische notities:');
      cy.get('#medicalNotes').should('contain', 'ID: 1');
      cy.get('#medicalNotes').should('contain', 'ID: 3');
      cy.get('#medicalNotes').should('not.contain', 'ID: 2');
    });

    it('toont foutmelding als medische notities niet kunnen worden opgehaald', () => {
      cy.intercept('GET', '**/t/clients/123/medical_notes', {
        statusCode: 500,
        body: {},
      }).as('getMedicalNotesError');

      cy.get('#showNotesBtn').click();
      cy.wait('@getMedicalNotesError');

      cy.get('#medicalNotes').should('contain', 'Fout bij ophalen medische notities.');
    });
  });

  describe('Rapportages Knop Tests', () => {
    it('toont rapportages als ze bestaan', () => {
      cy.intercept('GET', '**/t/dossier/reports/123', {
        statusCode: 200,
        body: {
          reports: [
            {
              id: 1,
              reportingDate: '2014-04-01T17:00:00.000+02:00',
              comment: 'meneer rook vanmiddag naar alocohol',
              carenName: 'Foeken',
              carenRole: 'verpleegkundige',
              status: 1,
              reportTypeId: 101,
            },
            {
              id: 2,
              reportingDate: '2014-04-01T17:00:00.000+02:00',
              comment: 'Goed geplast',
              carenName: 'Foeken',
              carenRole: 'verpleegkundige',
              status: 1,
              reportTypeId: 101,
            },
          ],
        },
      }).as('getReports');

      cy.get('#showReportsBtn').click();
      cy.wait('@getReports');

      cy.get('#reports').should('contain', 'Rapportages:');
      cy.get('#reports').should('contain', 'meneer rook vanmiddag naar alocohol');
      cy.get('#reports').should('contain', 'Goed geplast');
      cy.get('#reports').should('contain', 'Foeken (verpleegkundige)');
    });

    it('toont melding als er geen rapportages zijn', () => {
      cy.intercept('GET', '**/t/dossier/reports/123', {
        statusCode: 200,
        body: { reports: [] },
      }).as('getEmptyReports');

      cy.get('#showReportsBtn').click();
      cy.wait('@getEmptyReports');

      cy.get('#reports').should('contain', 'Geen rapportages gevonden.');
    });

    it('toont foutmelding bij falende API call', () => {
      cy.intercept('GET', '**/t/dossier/reports/123', {
        statusCode: 500,
        body: {},
      }).as('getReportsFail');

      cy.get('#showReportsBtn').click();
      cy.wait('@getReportsFail');

      cy.get('#reports').should('contain', 'Fout bij ophalen rapportages.');
    });
  });
});
