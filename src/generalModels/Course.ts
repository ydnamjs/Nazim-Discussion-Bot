import mongoose, { Schema } from "mongoose";
import { DiscussionSpecs } from "./DiscussionScoring";

// from udcis/sage https://github.com/ud-cis-discord/Sage
export interface Course {
	name: string;
	channels: {
		category: string;
		general: string;
		staff: string;
		private: string;
        discussion: string | null;
	}
	roles: {
		student: string;
		staff: string;
	}
	assignments: Array<string>;
    discussionSpecs: DiscussionSpecs | null
}

//schema
export const course_schema: Schema = new mongoose.Schema({
	name: String,
	channels: {
		category: String,
		general: String,
		staff: String,
		private: String,
        discussion: String,
	},
	roles: {
		student: String,
		staff: String,
	},
	assignments: Array<String>,
    discussionSpecs: {
        postSpecs: {
            points: Number,
            commentPoints: Number,
            minLength: Number,
            minParagraphs: Number,
            minLinks: Number,
            awards: Array<{
                reaction: string,
                points: number,
                trackStudents: boolean
            }>,
        },
        commentSpecs: {
            points: Number,
            minLength: Number,
            minParagraphs: Number,
            minLinks: Number,
            awards: Array<{
                reaction: string,
                points: number,
                trackStudents: boolean
            }>,
        },
        scorePeriods: Array<{
            start: Date,
            end: Date,
            goalPoints: number,
            maxPoints: number
        }>
    }
},
{
    versionKey: false
});

//model
export const courseModel = mongoose.model<Course>('COURSE', course_schema);