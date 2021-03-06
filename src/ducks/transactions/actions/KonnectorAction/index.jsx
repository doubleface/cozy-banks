import React from 'react'
import PropTypes from 'prop-types'
import { flowRight as compose } from 'lodash'
import { translate } from 'cozy-ui/transpiled/react'
import icon from 'assets/icons/actions/icon-link-out.svg'
import TransactionModalRow from 'ducks/transactions/TransactionModalRow'
import palette from 'cozy-ui/transpiled/react/palette'
import { triggersConn } from 'doctypes'
import InformativeModal from 'ducks/transactions/actions/KonnectorAction/InformativeModal'
import ConfigurationModal from 'ducks/transactions/actions/KonnectorAction/ConfigurationModal'
import match from 'ducks/transactions/actions/KonnectorAction/match'
import { KonnectorChip } from 'components/KonnectorChip'
import { findMatchingBrandWithoutTrigger } from 'ducks/brandDictionary/selectors'
import { connect } from 'react-redux'

const name = 'konnector'

const transactionModalRowStyle = { color: palette.dodgerBlue }
class Component extends React.Component {
  state = {
    showInformativeModal: false,
    showIntentModal: false
  }

  showInformativeModal = () =>
    this.setState({
      showInformativeModal: true
    })

  hideInformativeModal = () =>
    this.setState({
      showInformativeModal: false
    })

  showIntentModal = () =>
    this.setState({
      showIntentModal: true
    })

  hideIntentModal = () =>
    this.setState({
      showIntentModal: false
    })

  onInformativeModalConfirm = async () => {
    this.hideInformativeModal()
    this.showIntentModal()
  }

  onIntentComplete = () => {
    this.props.fetchTriggers()
    this.hideIntentModal()
  }

  renderModalItem(label) {
    return (
      <TransactionModalRow
        iconLeft="plus"
        style={transactionModalRowStyle}
        onClick={this.showInformativeModal}
      >
        {label}
      </TransactionModalRow>
    )
  }

  renderTransactionRow(label, brand) {
    return (
      <KonnectorChip
        onClick={this.showInformativeModal}
        konnectorType={brand.health ? 'health' : 'generic'}
      />
    )
  }

  render() {
    const { t, isModalItem } = this.props

    const brand = this.props.brand
    if (!brand) return

    const healthOrGeneric = brand.health ? 'health' : 'generic'
    const label = t(`Transactions.actions.konnector.${healthOrGeneric}`)

    return (
      <>
        {isModalItem
          ? this.renderModalItem(label)
          : this.renderTransactionRow(label, brand)}
        {this.state.showInformativeModal && (
          <InformativeModal
            onCancel={this.hideInformativeModal}
            onConfirm={this.onInformativeModalConfirm}
            title={t(
              `Transactions.actions.informativeModal.${healthOrGeneric}.title`
            )}
            description={t(
              `Transactions.actions.informativeModal.${healthOrGeneric}.description`,
              {
                brandName: brand.name
              }
            )}
            caption={t('Transactions.actions.informativeModal.caption')}
            cancelText={t('Transactions.actions.informativeModal.cancel')}
            confirmText={t('Transactions.actions.informativeModal.confirm')}
          />
        )}
        {this.state.showIntentModal && (
          <ConfigurationModal
            dismissAction={this.hideIntentModal}
            onComplete={this.onIntentComplete}
            slug={brand.konnectorSlug}
          />
        )}
      </>
    )
  }
}

Component.propTypes = {
  t: PropTypes.func.isRequired,
  transaction: PropTypes.object.isRequired,
  actionProps: PropTypes.object.isRequired,
  compact: PropTypes.bool,
  isModalItem: PropTypes.bool,
  fetchTriggers: PropTypes.func.isRequired
}

const mkFetchTriggers = client => () =>
  client.query(triggersConn.query(client), { as: triggersConn.as })
const addFetchTriggers = Component => {
  const res = (props, context) => (
    <Component {...props} fetchTriggers={mkFetchTriggers(context.client)} />
  )
  res.contextTypes = {
    client: PropTypes.object.isRequired
  }
  res.displayName = `withAddTrigger(${Component.displayName})`
  return res
}

const action = {
  name,
  icon,
  match,
  Component: compose(
    translate(),
    addFetchTriggers,
    connect((state, { actionProps, transaction }) => ({
      brand: findMatchingBrandWithoutTrigger(
        transaction.label,
        actionProps.brands
      )
    }))
  )(Component)
}

export default action
