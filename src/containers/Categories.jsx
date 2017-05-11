import styles from '../styles/categories'

import React, { Component } from 'react'
import { connect } from 'react-redux'
import { translate } from '../lib/I18n'
import categoriesMap from '../lib/categoriesMap'

import Select from '../components/Select'
import FigureBlock from '../components/FigureBlock'
import CategoriesBoard from '../components/CategoriesBoard'
import Loading from '../components/Loading'
import PieChart from '../components/PieChart'

import {
  fetchOperations,
  indexOperationsByDate
}
from '../actions'

const TOTAL_FILTER = 'total'
const DEBIT_FILTER = 'debit'
const INCOME_CATEGORY = 'income'
const FILTERS = [TOTAL_FILTER, DEBIT_FILTER]
const DATE_OPTIONS = ['Du 01 mars au 31 mars 2017']

export class Categories extends Component {
  constructor (props) {
    super(props)
    this.state = {
      isFetching: true,
      filter: FILTERS[0]
    }

    props.fetchOperations()
      .then((
        this.setState({isFetching: false})
      ))
  }

  applyFilter (selectName, filterLabel, filterIndex) {
    this.setState({filter: FILTERS[filterIndex]})
  }

  render () {
    const { t, operationsByCategories } = this.props
    if (this.state.isFetching) {
      return <Loading loadingType='categories' />
    }
    if (Object.values(operationsByCategories).length === 0) {
      return <div><h2>Categorisation</h2><p>Pas de categories à afficher.</p></div>
    }
    // compute the filter to use
    const { filter } = this.state
    const FILTER_OPTIONS = FILTERS.map(filter => (t(`Categories.filter.${filter}`)))
    const shouldFilterIncome = filter === DEBIT_FILTER

    // turn the breakdown into an simple array with computed values, as the components expect
    let categories = Object.values(operationsByCategories).map(category => {
      let subcategories = Object.values(category.subcategories).map(subcategory => {
        const debit = subcategory.operations.reduce((total, op) => (op.amount < 0 ? total + op.amount : total), 0)
        const credit = subcategory.operations.reduce((total, op) => (op.amount > 0 ? total + op.amount : total), 0)

        return {
          name: subcategory.name,
          amount: credit + debit,
          debit: debit,
          credit: credit,
          percentage: 0,
          currency: subcategory.operations[0].currency,
          operationsNumber: subcategory.operations.length
        }
      })

      const debit = category.operations.reduce((total, op) => (op.amount < 0 ? total + op.amount : total), 0)
      const credit = category.operations.reduce((total, op) => (op.amount > 0 ? total + op.amount : total), 0)

      return {
        name: category.name,
        color: category.color,
        amount: credit + debit,
        debit: debit,
        credit: credit,
        percentage: 0,
        currency: category.operations[0].currency,
        operationsNumber: category.operations.length,
        subcategories: subcategories
      }
    })

    if (shouldFilterIncome) categories = categories.filter(category => (category.name !== INCOME_CATEGORY))

    // now we need to run some extra calculations based on the sums we just did
    const absoluteOperationsTotal = categories.reduce((total, category) => (total + Math.abs(category.amount)), 0)
    const globalCurrency = categories[0].currency
    let operationsTotal = 0

    // compute individual percentages. This can only be done now because we need the computed amounts
    categories.forEach(category => {
      category.percentage = Math.round(Math.abs(category.amount) / absoluteOperationsTotal * 100)

      category.subcategories.forEach(subcategory => {
        subcategory.percentage = Math.round(Math.abs(subcategory.amount) / absoluteOperationsTotal * 100)
      })

      operationsTotal += category.amount
    })

    // sort the categories for display
    categories = categories.sort((a, b) => (b.percentage - a.percentage))

    // configure the pie chart
    const pieDataObject = {labels: [], data: [], colors: []}
    categories.forEach((category) => {
      pieDataObject.labels.push(t(`Data.categories.${category.name}`))
      pieDataObject.data.push(Math.abs(category.amount).toFixed(2)) // use positive values
      pieDataObject.colors.push(category.color)
    })
    return (
      <div>
        <h2>
          Catégorisation
        </h2>
        <div className={styles['bnk-cat-form']}>
          <Select
            name='dateRange'
            options={DATE_OPTIONS}
            onChange={() => {}}
          />
          <Select
            name='filterRange'
            options={FILTER_OPTIONS}
            onChange={this.applyFilter.bind(this)}
          />
        </div>

        <div className={styles['bnk-cat-debits']}>
          <CategoriesBoard
            categories={categories}
          />
          <div class={styles['bnk-cat-figure']}>
            <FigureBlock
              label={t(`Categories.title.${filter}`)}
              total={operationsTotal}
              currency={globalCurrency}
            />
            <PieChart
              labels={pieDataObject.labels}
              data={pieDataObject.data}
              colors={pieDataObject.colors}
              className='bnk-cat-debits-pie'
            />
          </div>
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  let categories = {}

  state.operations.forEach(operation => {
    // Creates a map of categories, where each entry contains a list of related operations and a breakdown by sub-category
    let category = categoriesMap.get(operation.operationType) || categoriesMap.get('uncategorized_others')

    // create a new parent category if necessary
    if (!categories.hasOwnProperty(category.name)) {
      categories[category.name] = {
        name: category.name,
        color: category.color,
        operations: [],
        subcategories: {}
      }
    }

    // create the subcategory if necessary
    if (!categories[category.name].subcategories.hasOwnProperty(operation.operationType)) {
      categories[category.name].subcategories[operation.operationType] = {
        name: operation.operationType,
        operations: []
      }
    }

    categories[category.name].operations.push(operation)
    categories[category.name].subcategories[operation.operationType].operations.push(operation)
  })

  return {
    operationsByCategories: categories
  }
}

export const mapDispatchToProps = (dispatch, ownProps) => ({
  fetchOperations: async () => {
    const mangoIndex = await dispatch(indexOperationsByDate())
    return dispatch(fetchOperations(mangoIndex))
  }
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(translate()(Categories))
