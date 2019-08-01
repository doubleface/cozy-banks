module.exports = {
  description:
    'should not link bills with operation that have not the right originalAmount',
  bills: [
    {
      _id: 'b1',
      amount: 16.1,
      groupAmount: 14.6,
      originalAmount: 100,
      originalDate: '2018-04-11T00:00:00.000Z',
      date: '2018-04-13T00:00:00.000Z',
      isRefund: true,
      vendor: 'Ameli',
      type: 'health_costs'
    }
  ],
  operations: [
    {
      _id: 'cohen',
      date: '2018-04-12T12:00:00.000Z',
      label: 'SELARL DR COHEN',
      amount: -150,
      manualCategoryId: '400610'
    },
    {
      _id: 'reimbursement',
      date: '2018-04-16T12:00:00.000Z',
      label: 'CPAM DES HAUTS DE SEINE',
      amount: 14.6,
      manualCategoryId: '400610'
    }
  ],
  expectedResult: {
    b1: {
      creditOperation: 'reimbursement'
    }
  }
}
