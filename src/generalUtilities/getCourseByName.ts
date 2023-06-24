import { Course, courseModel } from "../generalModels/Course";

export async function getCourseByName(courseName: string) {
    let course: Course | null = null;
    try {
        course = await courseModel.findOne({name: courseName});
    }
    catch(error: any) {
        console.error(error);
    }
    return course !== null ? course : undefined;
}