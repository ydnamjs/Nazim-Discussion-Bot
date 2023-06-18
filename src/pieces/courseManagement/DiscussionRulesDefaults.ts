import { AwardSpecs, CommentSpecs, DiscussionSpecs, PostSpecs } from "../../generalModels/DiscussionScoring";

let DEFAULT_AWARDS = new Map<string, AwardSpecs>([
    [":first_place:", { points: 100, trackStudents: false }],
    [":second_place:", { points: 50, trackStudents: false }],
    [":third_place:", { points: 20, trackStudents: false }],
]);

const DEFAULT_POST_SPECS: PostSpecs = {
    points: 250,
    commentPoints: 60,
    minLength: 50,
    minParagraphs: 0,
    minLinks: 0,
    awards: DEFAULT_AWARDS
}

const DEFAULT_COMMENT_SPECS: CommentSpecs = {
    points: 250,
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