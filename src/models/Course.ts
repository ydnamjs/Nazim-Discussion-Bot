import mongoose, { Schema } from "mongoose";

//interface
export interface course extends Document {
    INSTRUCTOR_ID: string,
    COURSE_NAME: string,
    PASSWORD: string
}

//schema
const course_schema: Schema = new mongoose.Schema({
    INSTRUCTOR_ID: {
        type: String,
        required: true
    },
    COURSE_NAME: {
        type: String,
        required: true
    },
    PASSWORD: {
        type: String,
        required: false
    }
},
{
    versionKey: false
});

//model
export const course_model = mongoose.model<course>('COURSE', course_schema);