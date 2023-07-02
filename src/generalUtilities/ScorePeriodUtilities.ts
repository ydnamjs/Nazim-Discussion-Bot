import { ScorePeriod } from "../generalModels/DiscussionScoring";

/**
 * @function sorts periods and returns the sorted periods. Not that sorting mutates the original array of periods as it uses the Array.sort function
 * @param {ScorePeriod[]} periods - the periods to be sorted
 * @returns {ScorePeriod[]} sorted periods - 
 */
export function sortPeriods(periods: ScorePeriod[]): ScorePeriod[] {

    return periods.sort((a, b) => {return a.start.valueOf() - b.start.valueOf()});
}