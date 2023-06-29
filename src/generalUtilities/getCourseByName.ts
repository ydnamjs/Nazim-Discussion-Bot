import { StudentScoreData } from "../generalModels/DiscussionScoring";
import { Course, courseModel } from "../generalModels/Course";

export async function getCourseByName(courseName: string) {
    let course: Course | null = null;
    try {
        course = await courseModel.findOne({name: courseName});
    }
    catch(error: any) {
        console.error(error);
    }

    // we do this because mongo db doesn't store maps as maps, it stores them as objects so in order to actually use the scores as a map,
    // we have to convert it from object to map
    course?.discussionSpecs?.scorePeriods.forEach((scorePeriod)=> {
        scorePeriod.studentScores = new Map<string, StudentScoreData>(Object.entries(scorePeriod.studentScores))
    })

    return course !== null ? course : undefined;
}