const DEFAULT_POST_RULES = {
    points: 250,
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
            points: 100,
            trackStudents: false
        },
        // default bronze award
        {
            reaction: ":third_place:",
            points: 100,
            trackStudents: false
        },        
    ]
}