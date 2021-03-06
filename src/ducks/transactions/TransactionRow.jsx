import React from 'react'
import PropTypes from 'prop-types'
import cx from 'classnames'
import compose from 'lodash/flowRight'

import {
  translate,
  Media,
  Bd,
  Img,
  Icon,
  Text,
  Caption,
  useI18n
} from 'cozy-ui/transpiled/react'
import flag from 'cozy-flags'

import Figure from 'cozy-ui/transpiled/react/Figure'
import { TdSecondary } from 'components/Table'
import * as List from 'components/List'

import { withDispatch } from 'utils'
import TransactionActions from 'ducks/transactions/TransactionActions'
import {
  getAccountLabel,
  getAccountInstitutionLabel
} from 'ducks/account/helpers'

import { getCategoryName } from 'ducks/categories/categoriesMap'
import CategoryIcon from 'ducks/categories/CategoryIcon'
import { getCategoryId } from 'ducks/transactions/helpers'
import { withUpdateCategory } from 'ducks/categories'
import {
  getLabel,
  getDate,
  getApplicationDate
} from 'ducks/transactions/helpers'
import { getFrequencyText } from 'ducks/recurrence/utils'
import styles from 'ducks/transactions/Transactions.styl'
import { getCurrencySymbol } from 'utils/currencySymbol'
import TransactionModal from 'ducks/transactions/TransactionModal'
import iconRecurrence from 'assets/icons/icon-recurrence.svg'

import useSwitch from 'hooks/useSwitch'

const withSelection = Component => {
  const Wrapped = props => {
    const [modalOpened, show, hide] = useSwitch(false)
    return (
      <>
        <Component {...props} selectTransaction={show} />
        {modalOpened ? (
          <TransactionModal
            requestClose={hide}
            transactionId={props.transaction._id}
          />
        ) : null}
      </>
    )
  }
  Wrapped.displayName = `withSelection(${Component.displayName ||
    Component.name})`
  return Wrapped
}

class _TransactionDate extends React.PureComponent {
  render() {
    const { t, f, isExtraLarge, transaction } = this.props
    return (
      <span
        title={
          transaction.realisationDate &&
          transaction.date !== transaction.realisationDate
            ? t('Transactions.will-be-debited-on', {
                date: f(transaction.date, 'D MMMM YYYY')
              })
            : null
        }
      >
        {f(getDate(transaction), `D ${isExtraLarge ? 'MMMM' : 'MMM'} YYYY`)}
      </span>
    )
  }
}

const AccountCaption = React.memo(function AccountCaption({ account }) {
  const accountInstitutionLabel = getAccountInstitutionLabel(account)
  return (
    <Caption className="u-ellipsis">
      {getAccountLabel(account)}
      {accountInstitutionLabel && ` - ${accountInstitutionLabel}`}
    </Caption>
  )
})

const ApplicationDateCaption = React.memo(function ApplicationDateCaption({
  transaction,
  f
}) {
  const applicationDate = getApplicationDate(transaction)
  return (
    <Caption>
      <Icon size={10} icon="logout" /> {f(applicationDate, 'MMMM')}
    </Caption>
  )
})

const RecurrenceCaption = ({ recurrence }) => {
  const { t } = useI18n()
  const freqText = getFrequencyText(t, recurrence)
  return (
    <Caption>
      {freqText} <Icon icon={iconRecurrence} size="10" />
    </Caption>
  )
}

const TransactionDate = translate()(_TransactionDate)

class _RowDesktop extends React.PureComponent {
  constructor(props) {
    super(props)
    this.onSelectTransaction = this.onSelectTransaction.bind(this)
  }

  onSelectTransaction() {
    this.props.selectTransaction(this.props.transaction)
  }

  render() {
    const {
      t,
      f,
      transaction,
      isExtraLarge,
      showCategoryChoice,
      filteringOnAccount,
      onRef,
      showRecurrence
    } = this.props

    const categoryId = getCategoryId(transaction)
    const categoryName = getCategoryName(categoryId)
    const categoryTitle = t(`Data.subcategories.${categoryName}`)

    const account = transaction.account.data
    const recurrence = transaction.recurrence
      ? transaction.recurrence.data
      : null
    const trRest = flag('show-transactions-ids') ? { id: transaction._id } : {}

    const applicationDate = getApplicationDate(transaction)
    return (
      <tr ref={onRef} {...trRest} className="u-clickable">
        <td className={cx(styles.ColumnSizeDesc, 'u-pv-half', 'u-pl-1')}>
          <Media className="u-clickable">
            <Img title={categoryTitle} onClick={showCategoryChoice}>
              <CategoryIcon
                categoryId={categoryId}
                className={styles['bnk-op-caticon']}
              />
            </Img>
            <Bd className="u-pl-1">
              <List.Content onClick={this.onSelectTransaction}>
                <Text>{getLabel(transaction)}</Text>
                {!filteringOnAccount && <AccountCaption account={account} />}
                {applicationDate ? (
                  <ApplicationDateCaption f={f} transaction={transaction} />
                ) : null}
                {recurrence && showRecurrence ? (
                  <RecurrenceCaption recurrence={recurrence} />
                ) : null}
              </List.Content>
            </Bd>
          </Media>
        </td>
        <TdSecondary
          className={cx(styles.ColumnSizeDate, 'u-clickable')}
          onClick={this.onSelectTransaction}
        >
          <TransactionDate
            isExtraLarge={isExtraLarge}
            transaction={transaction}
          />
        </TdSecondary>
        <TdSecondary
          className={cx(styles.ColumnSizeAmount, 'u-clickable')}
          onClick={this.onSelectTransaction}
        >
          <Figure
            total={transaction.amount}
            symbol={getCurrencySymbol(transaction.currency)}
            coloredPositive
            signed
          />
        </TdSecondary>
        <TdSecondary className={styles.ColumnSizeAction}>
          <TransactionActions transaction={transaction} onlyDefault />
        </TdSecondary>
      </tr>
    )
  }
}

_RowDesktop.defaultProps = {
  showRecurrence: true
}

export const RowDesktop = compose(
  translate(),
  withDispatch,
  withSelection,
  withUpdateCategory()
)(_RowDesktop)

class _RowMobile extends React.PureComponent {
  render() {
    const {
      transaction,
      t,
      f,
      filteringOnAccount,
      onRef,
      showRecurrence
    } = this.props
    const account = transaction.account.data
    const rowRest = {}

    if (flag('show-transactions-ids')) {
      rowRest.id = transaction._id
    }

    rowRest.className = cx(styles.TransactionRowMobile)

    const applicationDate = getApplicationDate(transaction)
    const recurrence = transaction.recurrence
      ? transaction.recurrence.data
      : null

    return (
      <List.Row onRef={onRef} {...rowRest}>
        <Media className="u-w-100">
          <Img
            className="u-clickable u-mr-half"
            title={t(
              `Data.subcategories.${getCategoryName(
                getCategoryId(transaction)
              )}`
            )}
            onClick={this.handleSelect}
          >
            <CategoryIcon categoryId={getCategoryId(transaction)} />
          </Img>
          <Bd className="u-clickable u-mr-half">
            <List.Content onClick={this.handleSelect}>
              <Text className="u-ellipsis">{getLabel(transaction)}</Text>
              {!filteringOnAccount && <AccountCaption account={account} />}
              {applicationDate ? (
                <ApplicationDateCaption f={f} transaction={transaction} />
              ) : null}
            </List.Content>
          </Bd>
          <Img
            onClick={this.handleSelect}
            className={styles.TransactionRowMobileImg}
          >
            <Figure
              total={transaction.amount}
              symbol={getCurrencySymbol(transaction.currency)}
              coloredPositive
              signed
            />
            {recurrence && showRecurrence ? (
              <RecurrenceCaption recurrence={recurrence} />
            ) : null}
          </Img>
          {false}
        </Media>
        {
          <TransactionActions
            transaction={transaction}
            onlyDefault
            compact
            menuPosition="right"
            className={cx(
              'u-mt-half',
              'u-ml-2-half',
              styles.TransactionRowMobile__actions
            )}
          />
        }
      </List.Row>
    )
  }

  handleSelect = () => {
    this.props.selectTransaction(this.props.transaction)
  }
}

_RowMobile.propTypes = {
  transaction: PropTypes.object.isRequired,
  showRecurrence: PropTypes.bool
}

_RowMobile.defaultProps = {
  showRecurrence: true
}

export const RowMobile = compose(
  withSelection,
  translate()
)(_RowMobile)
