module.exports = {
  description: 'third party payments should not be considered',
  bills: [
    {
      _id: 'b1',
      amount: 10,
      groupAmount: 10,
      originalAmount: 50,
      originalDate: '2018-07-19T00:00:00.000Z',
      date: '2018-07-25T00:00:00.000Z',
      isRefund: true,
      isThirdPartyPayer: true,
      vendor: 'Ameli',
      type: 'health_costs'
    }
  ],
  operations: [
    {
      _id: 'to_match',
      date: '2018-07-19T12:00:00.000Z',
      label: 'Ophtalmo',
      amount: -50,
      manualCategoryId: '400610',
      reimbursements: [{ amount: 25 }]
    },
    {
      _id: 'reimbur',
      date: '2018-07-20T12:00:00.000Z',
      label: 'CPAM',
      amount: 10,
      manualCategoryId: '400610'
    }
  ],
  expectedResult: {
    b1: {
      creditOperation: undefined,
      debitOperation: undefined
    }
  }
}
