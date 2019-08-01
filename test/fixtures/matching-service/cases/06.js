module.exports = {
  description: 'malakoff real case',
  bills: [
    {
      _id: 'b1',
      amount: 5.9,
      originalAmount: 45,
      originalDate: '2018-01-09T00:00:00.000Z',
      date: '2018-01-09T00:00:00.000Z',
      isRefund: true,
      vendor: 'Ameli',
      type: 'health_costs'
    },
    {
      _id: 'b2',
      amount: 13.8,
      originalAmount: 45,
      originalDate: '2018-01-15T00:00:00.000Z',
      date: '2018-01-15T00:00:00.000Z',
      isRefund: true,
      vendor: 'Malakoff Mederic',
      type: 'health_costs'
    }
  ],
  operations: [
    {
      _id: 'docteur',
      date: '2018-01-09T12:00:00.000Z',
      label: 'Docteur Konqui',
      amount: -45,
      manualCategoryId: '400610'
    },
    {
      _id: 'malakoff',
      date: '2018-01-15T12:00:00.000Z',
      label: 'Malakoff Mederic Pre',
      amount: 13.8,
      manualCategoryId: '400610'
    },
    {
      _id: 'cpam',
      date: '2018-01-12T12:00:00.000Z',
      label: 'Cpam de Paris',
      amount: 5.9,
      manualCategoryId: '400610'
    }
  ],
  expectedResult: {
    b1: {
      creditOperation: 'cpam',
      debitOperation: 'docteur'
    },
    b2: {
      creditOperation: 'malakoff',
      debitOperation: 'docteur'
    }
  }
}
