import React from 'react'
import { mount } from 'enzyme'
import PropTypes from 'prop-types'
import { DumbBalanceDetailsHeader } from './BalanceDetailsHeader'
import BarBalance from 'components/BarBalance'
import AppLike from 'test/AppLike'
import mockRouter from 'test/mockRouter'
import { getClient } from 'ducks/client'
import useBreakpoints from 'cozy-ui/transpiled/react/hooks/useBreakpoints'
// eslint-disable-next-line no-unused-vars
const client = getClient()

jest.mock('components/Bar', () => ({
  BarCenter: ({ children }) => children,
  BarRight: ({ children }) => children,
  BarLeft: ({ children }) => children
}))

jest.mock('cozy-ui/transpiled/react/hooks/useBreakpoints', () => ({
  __esModule: true,
  default: jest.fn(),
  BreakpointsProvider: ({ children }) => children
}))

const setup = options => {
  const { props, breakpoints } = options
  useBreakpoints.mockReturnValue(breakpoints)
  return mount(
    <AppLike>
      <DumbBalanceDetailsHeader filteredAccounts={[]} {...props} />
    </AppLike>,
    {
      context: {
        router: {
          ...mockRouter,
          getCurrentLocation: () => ({
            pathname: '/'
          })
        }
      },
      childContextTypes: {
        router: PropTypes.object
      }
    }
  )
}

describe('when showBalance is true', () => {
  describe('when rendered on mobile', () => {
    it('should show the balance in the bar', () => {
      const wrapper = setup({
        props: { showBalance: true },
        breakpoints: { isMobile: true }
      })

      expect(wrapper.find(BarBalance)).toHaveLength(1)
    })
  })

  describe('when rendered on tablet/desktop', () => {
    it('should not show the balance in the bar', () => {
      const wrapper = setup({
        props: { showBalance: true },
        breakpoints: { isMobile: false }
      })

      expect(wrapper.find(BarBalance)).toHaveLength(0)
    })
  })
})

describe('when showBalance is false', () => {
  it('should not show the balance in the bar', () => {
    const mobileWrapper = setup({
      breakpoints: { isMobile: true },
      props: { showBalance: false }
    })

    const notMobileWrapper = setup({
      breakpoints: { isMobile: false },
      props: { showBalance: false }
    })

    expect(mobileWrapper.find(BarBalance)).toHaveLength(0)
    expect(notMobileWrapper.find(BarBalance)).toHaveLength(0)
  })
})
