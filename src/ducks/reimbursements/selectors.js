import groupBy from 'lodash/groupBy'
import { getHealthExpenses, getHealthExpensesByPeriod } from 'ducks/filters'
import { createSelector } from 'reselect'
import {
  isReimbursementLate,
  getReimbursementStatus
} from 'ducks/transactions/helpers'
import { getHealthReimbursementLateLimit } from 'ducks/settings/helpers'
import { getSettings } from 'ducks/settings/selectors'

const groupHealthExpenses = healthExpenses => {
  const groupedTransactions = groupBy(healthExpenses, getReimbursementStatus)

  const reimbursed = groupedTransactions.reimbursed || []
  const pending = groupedTransactions.pending || []

  return {
    reimbursed,
    pending
  }
}

export const getGroupedHealthExpensesByPeriod = createSelector(
  [getHealthExpensesByPeriod],
  groupHealthExpenses
)

export const getGroupedHealthExpenses = createSelector(
  [getHealthExpenses],
  groupHealthExpenses
)

export const getHealthReimbursementLateLimitSelector = createSelector(
  [getSettings],
  settings => {
    return getHealthReimbursementLateLimit(settings)
  }
)

export const getLateHealthExpenses = createSelector(
  [getGroupedHealthExpenses, getHealthReimbursementLateLimitSelector],
  (groupedHealthExpenses, healthReimbursementLateLimit) =>
    groupedHealthExpenses.pending.filter(tr =>
      isReimbursementLate(tr, healthReimbursementLateLimit)
    )
)
