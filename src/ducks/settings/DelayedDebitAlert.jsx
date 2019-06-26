import React from 'react'
import PropTypes from 'prop-types'
import { translate } from 'cozy-ui/react'
import SelectBox from 'cozy-ui/react/SelectBox'
import { groupBy, pick, mapValues } from 'lodash'
import { getAccountLabel, getAccountType } from 'ducks/account/helpers'
import ToggleRow, { ToggleRowWrapper } from 'ducks/settings/ToggleRow'
import styles from 'ducks/settings/DelayedDebitAlert.styl'

const AccountsAssociationSelect = props => {
  const {
    association,
    creditCardOptions,
    checkingsOptions,
    enabled,
    onChange,
    ...rest
  } = props

  return (
    <div className={styles.AccountsPicker} {...rest}>
      <SelectBox
        size="medium"
        disabled={!enabled}
        options={creditCardOptions}
        value={creditCardOptions.find(
          option => option.value === association.creditCardAccount
        )}
        onChange={selected =>
          onChange({ ...association, creditCardAccount: selected.value })
        }
      />
      <SelectBox
        size="medium"
        disabled={!enabled}
        options={checkingsOptions}
        value={checkingsOptions.find(
          option => option.value === association.checkingsAccount
        )}
        onChange={selected =>
          onChange({ ...association, checkingsAccount: selected.value })
        }
      />
    </div>
  )
}

class DumbDelayedDebitAlert extends React.Component {
  static propTypes = {
    // TODO replace `PropTypes.object` with a shape coming from cozy-doctypes
    accounts: PropTypes.arrayOf(PropTypes.object).isRequired,
    enabled: PropTypes.bool.isRequired,
    onToggle: PropTypes.func.isRequired,
    onAccountsAssociationChange: PropTypes.func.isRequired,
    t: PropTypes.func.isRequired
  }

  render() {
    const {
      accounts,
      enabled,
      accountsAssociations,
      onToggle,
      onAccountsAssociationChange,
      t
    } = this.props

    const accountsByType = pick(groupBy(accounts, getAccountType), [
      'CreditCard',
      'Checkings'
    ])

    const {
      CreditCard: creditCardOptions,
      Checkings: checkingsOptions
    } = mapValues(accountsByType, accounts =>
      accounts.map(account => ({
        value: account._id,
        label: getAccountLabel(account)
      }))
    )

    return (
      <ToggleRowWrapper>
        <ToggleRow
          title={t('Notifications.delayed_debit.settingTitle')}
          description={t('Notifications.delayed_debit.description')}
          onToggle={onToggle}
          enabled={enabled}
          name="delayedDebit"
        />
        {accountsAssociations.map((association, index) => (
          <AccountsAssociationSelect
            creditCardOptions={creditCardOptions}
            checkingsOptions={checkingsOptions}
            association={association}
            enabled={enabled}
            key={association.creditCardAccount + association.checkingsAccount}
            onChange={newAssociation =>
              onAccountsAssociationChange(index, newAssociation)
            }
          />
        ))}
        {accountsAssociations.length === 0 ? (
          <AccountsAssociationSelect
            creditCardOptions={creditCardOptions}
            checkingsOptions={checkingsOptions}
            association={{
              creditCardAccount: null,
              checkingsAccount: null
            }}
            enabled={enabled}
            onChange={newAssociation =>
              onAccountsAssociationChange(0, newAssociation)
            }
          />
        ) : null}
      </ToggleRowWrapper>
    )
  }
}

const DelayedDebitAlert = translate()(DumbDelayedDebitAlert)

export default DelayedDebitAlert
