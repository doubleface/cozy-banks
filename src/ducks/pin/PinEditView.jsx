import React from 'react'
import PropTypes from 'prop-types'
import compose from 'lodash/flowRight'

import { translate } from 'cozy-ui/react'
import Alerter from 'cozy-ui/react/Alerter'
import Spinner from 'cozy-ui/react/Spinner'
import Icon from 'cozy-ui/react/Icon'
import Button from 'cozy-ui/react/Button'
import { queryConnect, withMutations } from 'cozy-client'

import PinKeyboard from 'ducks/pin/PinKeyboard'
import PinWrapper from 'ducks/pin/PinWrapper'
import PinButton from 'ducks/pin/PinButton'
import { pinSetting } from 'ducks/pin/queries'
import { SETTINGS_DOCTYPE } from 'doctypes'
import styles from 'ducks/pin/styles.styl'
import { PIN_MAX_LENGTH } from 'ducks/pin/constants'
import fingerprint from 'assets/icons/icon-fingerprint.svg'

const FullwidthButton = props => <Button {...props} className="u-m-0 u-w-100" />

const FingerprintChoice = translate()(({ t, onChoice }) => {
  return (
    <div className={styles.Pin__FingerprintChoice}>
      <div className={styles.Pin__FingerprintChoice__top}>
        <Icon className="u-mb-1" size="3rem" icon={fingerprint} />
        <br />
        {t('Pin.use-fingerprint-question')}
        <br />
      </div>
      <div style={{ flexGrow: 0 }}>
        <FullwidthButton
          theme="secondary"
          label="yes"
          onClick={onChoice.bind(null, true)}
        />
        <br />
        <FullwidthButton
          theme="primary"
          label="no"
          onClick={onChoice.bind(null, false)}
        />
      </div>
    </div>
  )
})

/**
 * Handles pin edit
 *  - user has to repeat
 *  - show error if both pin are not the same
 *  - show spinner while pin in saving
 **/
class PinEditView extends React.Component {
  state = {
    pin1: null,
    error: null,
    value: '',
    saving: false
  }

  constructor(props) {
    super(props)
    this.handleKeyboardChange = this.handleKeyboardChange.bind(this)
    this.handleChooseFingerprint = this.handleChooseFingerprint.bind(this)
  }

  componentDidMount() {
    document.addEventListener('back', this.props.onExit)
  }

  componentWillUnmount() {
    document.removeEventListener('back', this.props.onExit)
  }

  async savePin(pinValue, fingerprint) {
    const doc = this.props.pinSetting.data
    await this.props.saveDocument({
      _type: SETTINGS_DOCTYPE,
      _id: 'pin',
      ...doc,
      pin: pinValue,
      fingerprint
    })
  }

  async checkToSave(pin) {
    if (this.state.pin1) {
      if (this.state.pin1 === pin) {
        this.setState({ chosenPin: pin })
      } else {
        this.setState({ error: 'different-pins', pin1: null, value: '' })
      }
    } else {
      this.setState({ error: null, pin1: pin, value: '' })
    }
  }

  handleKeyboardChange(value) {
    this.setState({ value })
    if (value.length === PIN_MAX_LENGTH) {
      this.checkToSave(value)
    }
  }

  async handleChooseFingerprint(fingerprintChoice) {
    const t = this.props.t
    try {
      await this.savePin(this.state.chosenPin, fingerprintChoice)
    } catch (e) {
      Alerter.error(t('Pin.error-save'))
      throw e
    } finally {
      this.setState({ saving: false })
    }
    Alerter.success(t('Pin.successfully-changed'))
    this.props.onSaved()
  }

  render() {
    const { t } = this.props
    if (this.state.saving) {
      return (
        <PinWrapper>
          <Spinner />
        </PinWrapper>
      )
    }
    const topMessage = !this.state.pin1
      ? t('Pin.please-enter-pin')
      : t('Pin.please-repeat-pin')

    const bottomMessage = this.state.error ? (
      <div className={styles['Pin__error']}>
        {t(`Pin.errors.${this.state.error}`)}
      </div>
    ) : null
    return (
      <PinWrapper>
        {!this.state.chosenPin ? (
          <PinKeyboard
            leftButton={
              <PinButton isText onClick={this.props.onExit}>
                {t('General.back')}
              </PinButton>
            }
            topMessage={topMessage}
            bottomMessage={bottomMessage}
            value={this.state.value}
            onChange={this.handleKeyboardChange}
          />
        ) : (
          <FingerprintChoice onChoice={this.handleChooseFingerprint} />
        )}
      </PinWrapper>
    )
  }
}

PinEditView.propTypes = {
  onSaved: PropTypes.func.isRequired
}

export const DumbPinEditView = PinEditView
export default compose(
  translate(),
  withMutations(),
  queryConnect({
    pinSetting
  })
)(PinEditView)
