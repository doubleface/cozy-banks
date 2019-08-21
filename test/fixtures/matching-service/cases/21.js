module.exports = {
  description: 'bill without vendor',
  bills: [
    {
      _id: 'b1',
      amount: 30,
      date: '2019-07-31T00:00:00.000Z'
    }
  ],
  operations: [
    {
      _id: 'op1',
      date: '2019-07-31T12:00:00.000Z',
      label: 'Anything',
      amount: -30
    }
  ],
  expectedResult: {
    b1: {
      debitOperation: undefined,
      creditOperation: undefined
    }
  }
}
