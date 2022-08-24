import all from "ramda/es/all"
import and from "ramda/es/and"
import any from "ramda/es/any"
import ascend from "ramda/es/ascend"
import compose from "ramda/es/compose"
import descend from "ramda/es/descend"
import eqBy from "ramda/es/eqBy"
import filter from "ramda/es/filter"
import find from "ramda/es/find"
import flatten from "ramda/es/flatten"
import has from "ramda/es/has"
import head from "ramda/es/head"
import includes from "ramda/es/includes"
import is from "ramda/es/is"
import _isEmpty from "ramda/es/isEmpty"
import isNil from "ramda/es/isNil"
import join from "ramda/es/join"
import map from "ramda/es/map"
import match from "ramda/es/match"
import none from "ramda/es/none"
import not from "ramda/es/not"
import omit from "ramda/es/omit"
import or from "ramda/es/or"
import pick from "ramda/es/pick"
import pluck from "ramda/es/pluck"
import prop from "ramda/es/prop"
import propSatisfies from "ramda/es/propSatisfies"
import reject from "ramda/es/reject"
import sort from "ramda/es/sort"
import sortBy from "ramda/es/sortBy"
import split from "ramda/es/split"
import symmetricDifferenceWith from "ramda/es/symmetricDifferenceWith"
import take from "ramda/es/take"
import toLower from "ramda/es/toLower"
import trim from "ramda/es/trim"
import uniqBy from "ramda/es/uniqBy"
import values from "ramda/es/values"

const isEmpty = (i: any): boolean => isNil(i) || _isEmpty(i)
const isNotEmpty = (i: any): boolean => not(isEmpty(i))
const isPresent = (i: any): boolean => not(isNil(i))
const isNotLastItem = (idx: number, all: any[]) => !(idx + 1 === all.length)

export {
  all,
  and,
  any,
  ascend,
  compose,
  descend,
  eqBy,
  filter,
  find,
  flatten,
  has,
  head,
  includes,
  is,
  isEmpty,
  isNil,
  isNotEmpty,
  isPresent,
  join,
  map,
  match,
  none,
  not,
  omit,
  or,
  pick,
  pluck,
  prop,
  propSatisfies,
  reject,
  sort,
  sortBy,
  split,
  symmetricDifferenceWith,
  take,
  toLower,
  trim,
  uniqBy,
  values,
  isNotLastItem,
}
