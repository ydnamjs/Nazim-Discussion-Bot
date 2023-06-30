import { AwardSpecs, CommentSpecs, DiscussionSpecs, PostSpecs } from "../../generalModels/DiscussionScoring";

let DEFAULT_AWARDS = new Map<string, AwardSpecs>([
    ["🥇", { points: 100, trackStudents: false }],
    ["🥈", { points: 50, trackStudents: false }],
    ["🥉", { points: 20, trackStudents: false }],
    ["👍", {points: 10, trackStudents: true }]
]);

export const DEFAULT_POST_SPECS: PostSpecs = {
    points: 270,
    commentPoints: 60,
    minLength: 50,
    minParagraphs: 0,
    minLinks: 0,
    awards: DEFAULT_AWARDS
}

export const DEFAULT_COMMENT_SPECS: CommentSpecs = {
    points: 210,
    minLength: 25,
    minParagraphs: 0,
    minLinks: 0,
    awards: DEFAULT_AWARDS
}

export const DEFAULT_DISCUSSION_SPECS: DiscussionSpecs = {
    postSpecs: DEFAULT_POST_SPECS,
    commentSpecs: DEFAULT_COMMENT_SPECS,
    scorePeriods: []
}