const groupBy = require('lodash/groupBy')
const sortBy = require('lodash/sortBy')
const sum = require('lodash/sum')
const mergeWith = require('lodash/mergeWith')
const isArray = require('lodash/isArray')
const isString = require('lodash/isString')

const ONE_DAY = 86400 * 1000

const mean = iterable => sum(iterable) / iterable.length
const median = iterable => {
  const sorted = [...iterable].sort()
  if (sorted.length % 2 == 0) {
    const mid = sorted.length / 2
    return (sorted[mid - 1] + sorted[mid]) / 2
  } else {
    const mid = Math.floor(sorted.length / 2)
    return sorted[mid]
  }
}

/**
 * Computes stats on operations
 *
 * @param  {Array} operations
 * @return {Object}
 */
const makeStats = operations => {
  const dates = sortBy(operations, x => x.date).map(x => +new Date(x.date))
  const deltas = dates
    .map((d, i) => (i === 0 ? null : (d - dates[i - 1]) / ONE_DAY))
    .slice(1)
  const m = mean(deltas)
  const med = median(deltas)
  const sqDistToAverage = deltas.map(d => Math.pow(d, 2) - Math.pow(m, 2))
  const sigma = Math.sqrt(sum(sqDistToAverage) / deltas.length)
  const mad = median(deltas.map(d => Math.abs(d - med)))
  return {
    deltas: {
      sigma,
      mean: m,
      median: median,
      mad
    }
  }
}

/**
 * Will return a predicate that returns true only if all
 * predicates return true
 *
 * Lodash as the same function but it is convenient to have
 * it here to be able to add logging easily
 *
 * @param  {Array[Function]} predicates
 * @return {Function}
 */
const overEvery = predicates => item => {
  for (const predicate of predicates) {
    if (!predicate(item)) {
      return false
    }
  }
  return true
}

function customizer(objValue, srcValue) {
  if (isArray(objValue)) {
    return objValue.concat(srcValue)
  } else if (isString(objValue)) {
    return `${objValue} / ${srcValue}`
  }
}

const mergeBundles = bundles => {
  if (bundles.length < 2) {
    return bundles[0]
  } else {
    const bundle = mergeWith(bundles[0], ...bundles.slice(1), customizer)
    return bundle
  }
}

/**
 * How rules work:
 *
 * 1. Operations are grouped into bundles based on their <b>amount</b>{' '}
 * and their category.
 *
 * 2. Filtering according to the preStat rules.
 *
 * 3. Then stats are computed on those bundles to compute intervals in days
 * between operations, their standard deviation and mean. The idea is to
 * be able to remove bundles where operations are not evenly spaced in
 * time.
 *
 * 4. Filtering according to the <b>postStat</b> rules.
 *
 * 5. Merging of similar bundles.
 *
 * @param  {array} operations
 * @param  {array} rules
 * @return {array} recurring bundles
 */
export const findRecurringBundles = (operations, rules) => {
  const groups = groupBy(
    operations,
    x => `${x.manualCategoryId || x.automaticCategoryId}/${x.amount}`
  )
  const bundles = Object.entries(groups).map(([key, ops]) => {
    const [categoryId, amount] = key.split('/')
    return {
      categoryId,
      amount,
      key,
      ops
    }
  })

  const { preStat = [], postStat = [], merging = [] } = groupBy(
    rules,
    rule => rule.stage
  )
  const preBundles = bundles
    .filter(overEvery(preStat.map(r => r.rule)))
    .map(bundle => ({ ...bundle, stats: makeStats(bundle.ops) }))
    .filter(overEvery(postStat.map(r => r.rule)))

  let postBundles = preBundles
  if (merging) {
    for (const r of merging) {
      const groups = groupBy(postBundles, r.rule)
      postBundles = Object.values(groups).map(mergeBundles)
    }
  }
  return postBundles
}

const sameFirstLabel = bundle => {
  return bundle.ops[0].label
}




export const categoryShouldBeSet = () =>
  function categoryShouldBeSet(bundle) {
    return bundle.categoryId !== '0'
  }

export const bundleSizeShouldBeMoreThan = n =>
  function bundleSizeShouldBeMoreThan(bundle) {
    return bundle.ops.length > n
  }

export const amountShouldBeMoreThan = amount =>
  function amountShouldBeMoreThan(bundle) {
    return Math.abs(bundle.amount) > amount
  }

export const deltaMeanSuperiorTo = n =>
  function deltaMeanSuperiorTo(bundle) {
    return bundle.stats.deltas.mean > n
  }

export const deltaMeanInferiorTo = n =>
  function deltaMeanInferiorTo(bundle) {
    return bundle.stats.deltas.mean < n
  }

export const sigmaInferiorTo = n =>
  function sigmaInferiorTo(bundle) {
    return bundle.stats.deltas.sigma < n
  }

export const madInferiorTo = n =>
  function madInferiorTo(bundle) {
    return bundle.stats.deltas.mad < n
  }

export const rulesPerName = {
  categoryShouldBeSet: {
    rule: categoryShouldBeSet,
    description: 'Filter out bundles where the category is not set',
    stage: 'preStat'
  },
  bundleSizeShouldBeMoreThan: {
    rule: bundleSizeShouldBeMoreThan,
    description: 'Filter out bundles where the size is below',
    stage: 'preStat'
  },
  amountShouldBeMoreThan: {
    rule: amountShouldBeMoreThan,
    description: 'Amount of bundle is more than',
    stage: 'preStat'
  },
  deltaMeanSuperiorTo: {
    rule: deltaMeanSuperiorTo,
    description: 'Mean interval in days between operations should be more than',
    stage: 'postStat'
  },
  deltaMeanInferiorTo: {
    rule: deltaMeanInferiorTo,
    description: 'Mean interval in days between operations should be less than',
    stage: 'postStat'
  },
  sigmaInferiorTo: {
    rule: sigmaInferiorTo,
    description:
      "Standard deviation of bundle's date intervals should be less than",
    stage: 'postStat'
  },
  madInferiorTo: {
    rule: madInferiorTo,
    description:
      "Median absolute deviation of bundle's date intervals should be less than",
    stage: 'postStat'
  },
  mergeBundles: {
    rule: () => sameFirstLabel,
    description: 'Merge similar bundles',
    stage: 'merging'
  }
}

export const getRulesFromConfig = config => {
  return Object.entries(config)
    .map(([ruleName, config]) => {
      if (!config.active) {
        return null
      }
      if (!rulesPerName[ruleName]) {
        throw new Error(`Unknown rule ${ruleName}`)
      }
      const { rule: makeRule, stage } = rulesPerName[ruleName]
      return { rule: makeRule(config.options), stage }
    })
    .filter(Boolean)
}
