import mongoose from "mongoose";

const course_schema = new mongoose.Schema({
    INSTRUCTOR_ID: {
        type: String,
        required: true
    },
    COURSE_NAME: {
        type: String,
        required: true
    }
},
{
    versionKey: false
});

export default mongoose.model('COURSE', course_schema);