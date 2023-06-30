import { APIEmbedField, InteractionUpdateOptions, MessageComponentInteraction } from "discord.js";
import { NavigatedMenu, NavigatedMenuData } from "../../NavigatedMenu";
import { ComponentBehavior } from "../../BaseMenu";
import { PostSpecs } from "../../../../../generalModels/DiscussionScoring";
import { getCourseByName } from "../../../../../generalUtilities/getCourseByName";
import { sendDismissableReply } from "../../../../../generalUtilities/DismissableMessage";

const TITLE_COURSE_PREFIX = "Manage Post Scoring For CISC ";
const MENU_DESCRIPTION = "replace me";

const SCORE_PREFIX = "Post Points: ";
const SCORE_DESCRIPTION = "The number of points awarded for a post that meets the requirements specified below";

const COMMENT_POINTS_PREFIX = "Comment Points: ";
const COMMENT_POINTS_DESCRIPTION = "The number of points awarded to the poster for comments others leave on their post";

const LENGTH_REQ_PREFIX = "Length Requirement: ";
const LENGTH_REQ_DESCRIPTION = "The minimum number of non white space characters required to recieve score points for a post";

const PARAGRAPH_REQ_PREFIX = "Paragraph Requirement: ";
const PARAGRAPH_REQ_DESCRIPTION = "The minimum number of paragraphs required to recieve points for a post";

const LINK_REQ_PREFIX = "Link Requirement: ";
const LINK_REQ_DESCRIPTION = "The minimum number of links required to recieve points for a post";

const AWARD_NAME = "Awards & Penalties"
const AWARD_DESCRIPTION = "Below this you will find a list of all awards/penalities and basic info about them";

const AWARD_POINT_PREFIX = "points: ";
const AWARD_GIVERS_PREFIX = "\ngivers: "
const AWARD_STAFFONLY_TEXT = "Staff Only"
const AWARD_NOT_STAFFONLY_TEXT = "Everyone"

export async function updateToManagePostScoringMenu(courseName: string, componentInteraction: MessageComponentInteraction) {
    
    let course = await getCourseByName(courseName)

    if(!course || !course.discussionSpecs) {
        await sendDismissableReply(componentInteraction.message, "Database error. Please message admin");
        await componentInteraction.message.delete()
        return;
    }

    const managePostScoringMenu = new ManagePostScoringMenu(courseName, course.discussionSpecs.postSpecs);
    componentInteraction.update(managePostScoringMenu.menuMessageData as InteractionUpdateOptions);
    managePostScoringMenu.collectMenuInteraction(componentInteraction.message);
}

export class ManagePostScoringMenu extends NavigatedMenu {
    
    constructor(courseName: string, postSpecs: PostSpecs) {

        const menuData: NavigatedMenuData = {
            title: TITLE_COURSE_PREFIX + courseName.toUpperCase(),
            description: MENU_DESCRIPTION,
            fields: generateFields(postSpecs),
            additionalComponents: [],
            additionalComponentBehaviors: generateBehaviors(courseName),
        }

        super(menuData, 0);
    }
}

function generateBehaviors(courseName: string): ComponentBehavior[] {
    
    const behaviors: ComponentBehavior[] = []
    
    return behaviors
}

function generateFields(postSpecs: PostSpecs): APIEmbedField[] {
    
    const fields = [
        {
            name: SCORE_PREFIX + postSpecs.points,
            value: SCORE_DESCRIPTION
        },
        {
            name: COMMENT_POINTS_PREFIX + postSpecs.commentPoints,
            value: COMMENT_POINTS_DESCRIPTION
        },
        {
            name: LENGTH_REQ_PREFIX + postSpecs.minLength,
            value: LENGTH_REQ_DESCRIPTION
        },
        {
            name: PARAGRAPH_REQ_PREFIX + postSpecs.minParagraphs,
            value: PARAGRAPH_REQ_DESCRIPTION
        },
        {
            name: LINK_REQ_PREFIX + postSpecs.minLinks,
            value: LINK_REQ_DESCRIPTION
        },
        {
            name: AWARD_NAME,
            value: AWARD_DESCRIPTION
        }
    ];
    
    fields.push(...makeAwardFields(postSpecs))

    return fields;
}

function makeAwardFields(postSpecs: PostSpecs) {
    const awards = [...postSpecs.awards];

    const awardFields: APIEmbedField[] = awards.map((award)=> {
        return {
            name: award[0],
            value: AWARD_POINT_PREFIX + award[1].points + AWARD_GIVERS_PREFIX + (award[1].trackStudents ? AWARD_NOT_STAFFONLY_TEXT : AWARD_STAFFONLY_TEXT)
        }
    })

    return awardFields;
}