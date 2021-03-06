import makeRuleComponent from './makeRuleComponent'
import { balanceLower } from './specs'

const getBalanceLowerDescriptionKey = props => {
  if (props.doc && props.doc.accountOrGroup) {
    return 'Notifications.if_balance_lower.descriptionWithAccountGroup'
  } else {
    return 'Notifications.if_balance_lower.description'
  }
}

const getBalanceLowerDescriptionProps = props => {
  return {
    accountOrGroupLabel: props.doc.accountOrGroup
      ? props.getAccountOrGroupLabel(props.doc.accountOrGroup)
      : null,
    value: props.doc.value
  }
}

const initialBalanceLowerRules = [
  { id: 0, value: 30, accountOrGroup: null, enabled: false }
]

const newBalanceLowerRule = { enabled: true, value: 100, accountOrGroup: null }

export default makeRuleComponent({
  displayName: 'BalanceLower',
  getInitialRules: () => initialBalanceLowerRules,
  spec: balanceLower,
  getNewRule: () => ({ ...newBalanceLowerRule }),
  getRuleDescriptionKey: getBalanceLowerDescriptionKey,
  getRuleDescriptionProps: getBalanceLowerDescriptionProps
})
