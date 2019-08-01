module.exports = {
  description: 'health bills with debit operation but without credit',
  bills: [
    {
      _id: 'b1',
      amount: 5,
      originalAmount: 20,
      originalDate: '2017-12-13T00:00:00.000Z',
      date: '2017-12-15T00:00:00.000Z',
      isRefund: true,
      vendor: 'Ameli',
      type: 'health_costs'
    }
  ],
  operations: [
    {
      _id: 'medecin',
      date: '2017-12-13T12:00:00.000Z',
      label: 'Visite chez le médecin',
      amount: -20,
      manualCategoryId: '400610'
    },
    {
      _id: 'cpam',
      date: '2017-12-15T12:00:00.000Z',
      label: 'Remboursement CPAM',
      amount: 10,
      manualCategoryId: '400610'
    }
  ],
  expectedResult: {
    b1: {
      debitOperation: 'medecin'
    }
  }
}
