import React from 'react'
import PropTypes from 'prop-types'
import Alerter from 'cozy-ui/transpiled/react/Alerter'
import { useI18n } from 'cozy-ui/transpiled/react/I18n'

import { makeEditionModalFromSpec } from 'components/EditionModal'
import Rules from 'ducks/settings/Rules'
import EditableSettingCard from './EditableSettingCard'
import { ensureNewRuleFormat } from './ruleUtils'

const makeRuleComponent = ({
  getRuleDescriptionProps,
  getRuleDescriptionKey,
  getNewRule,
  getInitialRules,
  spec,
  displayName,
  shouldOpenOnToggle
}) => {
  const EditionModal = makeEditionModalFromSpec(spec)

  const RulesComponent = props => {
    const { t } = useI18n()
    let {
      rules: rawInitialRules,
      getAccountOrGroupLabel,
      onChangeRules,
      ruleProps
    } = props

    const initialRules = ensureNewRuleFormat(rawInitialRules)
    const onError = err => {
      // eslint-disable-next-line no-console
      console.warn('Could not save rule')
      // eslint-disable-next-line no-console
      console.error(err)
      Alerter.error(t('Settings.rules.saving-error'))
    }

    return (
      <Rules
        rules={initialRules}
        onUpdate={onChangeRules}
        onError={onError}
        addButtonLabelKey="Settings.rules.create"
        makeNewItem={getNewRule}
        ItemEditionModal={EditionModal}
      >
        {(rule, i, createOrUpdateRule, removeRule) => (
          <EditableSettingCard
            doc={rule}
            key={i}
            onToggle={enabled => {
              createOrUpdateRule({ ...rule, enabled })
            }}
            removeModalTitle={t('Settings.rules.remove-modal.title')}
            removeModalDescription={t('Settings.rules.remove-modal.desc')}
            onChangeDoc={createOrUpdateRule}
            onRemoveDoc={removeRule}
            canBeRemoved={initialRules.length > 1}
            editModalProps={spec}
            getAccountOrGroupLabel={getAccountOrGroupLabel}
            descriptionKey={getRuleDescriptionKey}
            descriptionProps={getRuleDescriptionProps}
            shouldOpenOnToggle={shouldOpenOnToggle}
            ruleProps={ruleProps}
          />
        )}
      </Rules>
    )
  }
  RulesComponent.defaultProps = {
    rules: getInitialRules()
  }

  RulesComponent.propTypes = {
    rules: PropTypes.array.isRequired,
    onChangeRules: PropTypes.func.isRequired
  }

  RulesComponent.displayName = displayName

  return RulesComponent
}

export default makeRuleComponent
