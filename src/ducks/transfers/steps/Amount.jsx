import React from 'react'
import PropTypes from 'prop-types'
import Padded from 'components/Spacing/Padded'
import { translate, Field, Button } from 'cozy-ui/transpiled/react'
import PageTitle from 'components/Title/PageTitle'
import { PageContent, PageLayout, PageFooter } from 'ducks/page'

import Title from 'ducks/transfers/steps/Title'

const MINIMUM_AMOUNT = 5
const MAXIMUM_AMOUNT = 1000

const validateAmount = amount => {
  if (amount == '') {
    return { ok: true }
  } else if (parseInt(amount, 10) > MAXIMUM_AMOUNT) {
    return { error: 'too-high', maximum: MAXIMUM_AMOUNT }
  } else if (parseInt(amount, 10) < MINIMUM_AMOUNT) {
    return { error: 'too-low', minimum: MINIMUM_AMOUNT }
  } else if (isNaN(parseInt(amount, 10))) {
    return { error: 'incorrect-number', value: amount }
  }
  return { ok: true }
}

class _ChooseAmount extends React.PureComponent {
  constructor(props, context) {
    super(props, context)
    this.state = { validation: { ok: true } }
    this.handleBlur = this.handleBlur.bind(this)
  }

  componentDidUpdate(prevProps, prevState) {
    this.checkToIncreaseSlideHeight(prevState)
  }

  checkToIncreaseSlideHeight(prevState) {
    if (
      Boolean(prevState.validation.error) !==
      Boolean(this.state.validation.error)
    ) {
      this.context.swipeableViews.slideUpdateHeight()
    }
  }

  handleBlur() {
    this.validate()
  }

  validate() {
    this.setState({ validation: validateAmount(this.props.amount) })
  }

  render() {
    const { t, amount, onChange, onSelect, active } = this.props
    const validation = this.state.validation
    return (
      <PageLayout removeHeight={14}>
        <PageContent>
          <Padded>
            {active && <PageTitle>{t('Transfer.amount.page-title')}</PageTitle>}
            <Title>{t('Transfer.amount.title')}</Title>
            <Field
              className="u-mt-0"
              value={amount}
              onChange={ev => {
                onChange(ev.target.value)
              }}
              type="number"
              onBlur={this.handleBlur}
              label={t('Transfer.amount.field-label')}
              error={validation.error}
              placeholder="10"
            />
            {validation.error ? (
              <p className="u-error">
                {t(`Transfer.amount.errors.${validation.error}`, validation)}
              </p>
            ) : null}
          </Padded>
        </PageContent>
        <PageFooter>
          <Padded>
            <Button
              extension="full"
              theme="primary"
              disabled={amount === '' || !!validation.error}
              label={t('Transfer.amount.confirm')}
              visible={active}
              onClick={onSelect}
            />
          </Padded>
        </PageFooter>
      </PageLayout>
    )
  }
}

_ChooseAmount.contextTypes = {
  swipeableViews: PropTypes.object.isRequired
}

const ChooseAmount = React.memo(translate()(_ChooseAmount))

export default ChooseAmount
