import and from "ramda/es/and"
import any from "ramda/es/any"
import ascend from "ramda/es/ascend"
import compose from "ramda/es/compose"
import descend from "ramda/es/descend"
import eqBy from "ramda/es/eqBy"
import filter from "ramda/es/filter"
import find from "ramda/es/find"
import flatten from "ramda/es/flatten"
import head from "ramda/es/head"
import includes from "ramda/es/includes"
import is from "ramda/es/is"
import _isEmpty from "ramda/es/isEmpty"
import isNil from "ramda/es/isNil"
import join from "ramda/es/join"
import map from "ramda/es/map"
import none from "ramda/es/none"
import not from "ramda/es/not"
import or from "ramda/es/or"
import pluck from "ramda/es/pluck"
import prop from "ramda/es/prop"
import propSatisfies from "ramda/es/propSatisfies"
import sort from "ramda/es/sort"
import sortBy from "ramda/es/sortBy"
import split from "ramda/es/split"
import symmetricDifferenceWith from "ramda/es/symmetricDifferenceWith"
import take from "ramda/es/take"
import toLower from "ramda/es/toLower"
import trim from "ramda/es/trim"
import values from "ramda/es/values"
import reject from "ramda/es/reject"

const isEmpty = (i: any): boolean => isNil(i) || _isEmpty(i)
const isNotEmpty = (i: any): boolean => not(isEmpty(i))
const isPresent = (i: any): boolean => not(isNil(i))

export {
  reject,
  and,
  any,
  ascend,
  compose,
  descend,
  eqBy,
  filter,
  find,
  flatten,
  head,
  includes,
  is,
  isEmpty,
  isNil,
  isNotEmpty,
  isPresent,
  join,
  map,
  none,
  not,
  or,
  pluck,
  prop,
  propSatisfies,
  sort,
  sortBy,
  split,
  symmetricDifferenceWith,
  take,
  toLower,
  trim,
  values,
}
