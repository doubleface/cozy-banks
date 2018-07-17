import React from 'react'
import { translate, Button, withBreakpoints } from 'cozy-ui/react'
import { some, flowRight as compose } from 'lodash'
import { cozyConnect, fetchCollection } from 'cozy-client'
import { TRIGGER_DOCTYPE } from 'doctypes'
import { isCollectionLoading } from 'utils/client'

import Topbar from 'components/Topbar'
import PageTitle from 'components/PageTitle'
import CollectLink from 'ducks/settings/CollectLink'

import calculator from 'assets/icons/icon-calculator.svg'
import watch from 'assets/icons/icon-watch.svg'
import cozy from 'assets/icons/icon-cozy.svg'
import palette from 'cozy-ui/stylus/settings/palette.json'

import {
  Hero,
  Sections,
  Section,
  Subtitle,
  Paragraph,
  Icon,
  CTA
} from 'cozy-ui/react/Hero'

const Onboarding = props => {
  const {
    t,
    triggers,
    breakpoints: { isMobile }
  } = props

  const isTriggersLoaded = !isCollectionLoading(triggers)
  const hasTriggers = some(
    triggers.data,
    trigger => trigger.worker === 'konnector'
  )

  return (
    <Hero>
      <Topbar>
        <PageTitle>
          {t(`Onboarding.title.${isMobile ? 'mobile' : 'desktop'}`)}
        </PageTitle>
      </Topbar>
      <Sections>
        <Section>
          <Icon color={palette.pomegranate} icon={calculator} />
          <Subtitle>{t('Onboarding.manage-budget.title')}</Subtitle>
          <Paragraph>{t('Onboarding.manage-budget.description')}</Paragraph>
        </Section>
        {!isMobile ? (
          <Section>
            <Icon color={palette.portage} icon={watch} />
            <Subtitle>{t('Onboarding.save-time.title')}</Subtitle>
            <Paragraph>{t('Onboarding.save-time.description')}</Paragraph>
          </Section>
        ) : null}
        {!isMobile ? (
          <Section>
            <Icon color={palette['dodgerBlue']} icon={cozy} />
            <Subtitle>{t('Onboarding.cozy-assistant.title')}</Subtitle>
            <Paragraph>{t('Onboarding.cozy-assistant.description')}</Paragraph>
          </Section>
        ) : null}
      </Sections>
      <CTA>
        <CollectLink>
          <Button theme="regular">
            {t('Onboarding.connect-bank-account')}
          </Button>
        </CollectLink>
      </CTA>
      {isTriggersLoaded &&
        hasTriggers && (
          <Paragraph style="text-align: center">
            {t('Onboarding.wait-moments')}
          </Paragraph>
        )}
    </Hero>
  )
}

const mapDocumentsToProps = () => ({
  triggers: fetchCollection('triggers', TRIGGER_DOCTYPE)
})

export default compose(
  translate(),
  withBreakpoints(),
  cozyConnect(mapDocumentsToProps)
)(Onboarding)
