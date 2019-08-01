module.exports = {
  description: 'not health bills',
  bills: [
    {
      _id: 'b1',
      amount: 30,
      date: '2017-12-07T00:00:00.000Z',
      isRefund: false,
      vendor: 'SFR'
    }
  ],
  operations: [
    {
      _id: 'sfr',
      date: '2017-12-07T12:00:00.000Z',
      label: 'Facture SFR',
      amount: -30
    }
  ],
  expectedResult: {
    b1: {
      debitOperation: 'sfr'
    }
  }
}
