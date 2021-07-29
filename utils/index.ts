export const generateArrayNaturalNumberFrom = (n: number): number[] => {
  return [...Array(n).keys()]
}

/** Get current date time in hyphen format year-month-dayThour-minute-second
 * we use this format when we are allowed only alphanumeric with hyphen
 **/
export const getModifiedCurrentIsoDateString = (): string => {
  return new Date().toISOString().replace(/:/g, '-').substring(0, 19)
}
