import { CommentSpecs, DiscussionSpecs, PostSpecs } from "../../generalModels/DiscussionScoring";

const DEFAULT_POST_SPECS: PostSpecs = {
    points: 250,
    commentPoints: 60,
    minLength: 50,
    minParagraphs: 0,
    minLinks: 0,
    awards: [
        // default gold award
        {
            reaction: ":first_place:",
            points: 100,
            trackStudents: false
        },
        // default silver award
        {
            reaction: ":second_place:",
            points: 50,
            trackStudents: false
        },
        // default bronze award
        {
            reaction: ":third_place:",
            points: 20,
            trackStudents: false
        },
    ]
}

const DEFAULT_COMMENT_SPECS: CommentSpecs = {
    points: 250,
    minLength: 25,
    minParagraphs: 0,
    minLinks: 0,
    awards: [
        // default gold award
        {
            reaction: ":first_place:",
            points: 100,
            trackStudents: false
        },
        // default silver award
        {
            reaction: ":second_place:",
            points: 50,
            trackStudents: false
        },
        // default bronze award
        {
            reaction: ":third_place:",
            points: 20,
            trackStudents: false
        },
    ]   
}

export const DEFAULT_DISCUSSION_SPECS: DiscussionSpecs = {
    postSpecs: DEFAULT_POST_SPECS,
    commentSpecs: DEFAULT_COMMENT_SPECS,
    scorePeriods: []
}