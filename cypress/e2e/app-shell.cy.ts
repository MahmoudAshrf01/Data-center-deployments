describe('application shell', () => {
  it('loads the deployment workspace', () => {
    cy.visit('/')

    cy.contains('h1', 'Data center deployments').should('be.visible')
    cy.contains('button', 'Server 02').should('be.visible')
  })

  it('searches and opens device details', () => {
    cy.visit('/')
    cy.get('#device-search').type('storage')
    cy.get('[aria-label="Search results"]')
      .contains('button', 'Storage 01')
      .click()

    cy.contains('h2', 'Storage 01').should('be.visible')
  })

  it('filters the visible device list', () => {
    cy.visit('/')
    cy.get('[aria-label="Status filter"]').click()
    cy.contains('[role="option"]', 'Failed').click()

    cy.contains('button', 'Storage 01').should('be.visible')
    cy.contains('button', 'Server 01').should('not.exist')
  })
})
