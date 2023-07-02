import { APIEmbedField, ButtonInteraction, ButtonStyle, InteractionUpdateOptions, MessageComponentInteraction } from "discord.js";
import { NavigatedMenu, NavigatedMenuData } from "../../../../menu/NavigatedMenu";
import { ComponentBehavior } from "../../../../menu/BaseMenu";
import { PostSpecs } from "../../../../../generalModels/DiscussionScoring";
import { getCourseByName } from "../../../../../generalUtilities/CourseUtilities";
import { sendDismissableReply } from "../../../../../generalUtilities/DismissableMessage";
import { makeActionRowButton } from "../../../../../generalUtilities/MakeActionRow";
import { openAddPostAwardModal, openEditPostModal } from "./PostScoringModals";

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

const EDIT_SCORING_BUTTON_ID = "discussion-edit-post-scoring-button";
const EDIT_SCORING_BUTTON_LABEL = "Edit Post Scoring";
const EDIT_SCORING_BUTTON_DISABLED = false;
const EDIT_SCORING_BUTTON_STYLE = ButtonStyle.Primary

const ADD_AWARD_BUTTON_ID = "discussion-add-post-award-button";
const ADD_AWARD_BUTTON_LABEL = "Add Post Award";
const ADD_AWARD_BUTTON_DISABLED = false;
const ADD_AWARD_BUTTON_STYLE = ButtonStyle.Primary

const EDIT_AWARD_BUTTON_ID = "discussion-edit-post-award-button";
const EDIT_AWARD_BUTTON_LABEL = "Edit Post Award";
const EDIT_AWARD_BUTTON_DISABLED = true;
const EDIT_AWARD_BUTTON_STYLE = ButtonStyle.Primary

const DELETE_AWARD_BUTTON_ID = "discussion-delete-post-award-button";
const DELETE_AWARD_BUTTON_LABEL = "Delete Post Award";
const DELETE_AWARD_BUTTON_DISABLED = true;
const DELETE_AWARD_BUTTON_STYLE = ButtonStyle.Primary

const EDIT_SCORING_BUTTON_DATA = {
    custom_id: EDIT_SCORING_BUTTON_ID,
    label: EDIT_SCORING_BUTTON_LABEL,
    disabled: EDIT_SCORING_BUTTON_DISABLED,
    style: EDIT_SCORING_BUTTON_STYLE
};

const ADD_AWARD_BUTTON_DATA = {
    custom_id: ADD_AWARD_BUTTON_ID,
    label: ADD_AWARD_BUTTON_LABEL,
    disabled: ADD_AWARD_BUTTON_DISABLED,
    style: ADD_AWARD_BUTTON_STYLE
};

const EDIT_AWARD_BUTTON_DATA = {
    custom_id: EDIT_AWARD_BUTTON_ID,
    label: EDIT_AWARD_BUTTON_LABEL,
    disabled: EDIT_AWARD_BUTTON_DISABLED,
    style: EDIT_AWARD_BUTTON_STYLE
};

const DELETE_AWARD_BUTTON_DATA = {
    custom_id: DELETE_AWARD_BUTTON_ID,
    label: DELETE_AWARD_BUTTON_LABEL,
    disabled: DELETE_AWARD_BUTTON_DISABLED,
    style: DELETE_AWARD_BUTTON_STYLE
};

const SCORE_BUTTON_ROW = makeActionRowButton([EDIT_SCORING_BUTTON_DATA, ADD_AWARD_BUTTON_DATA, EDIT_AWARD_BUTTON_DATA, DELETE_AWARD_BUTTON_DATA])

export async function updateToManagePostScoringMenu(courseName: string, componentInteraction: MessageComponentInteraction, isInteractionUpdate: boolean) {
    
    let course = await getCourseByName(courseName)

    if(!course || !course.discussionSpecs) {
        await sendDismissableReply(componentInteraction.message, "Database error. Please message admin");
        await componentInteraction.message.delete()
        return;
    }

    const managePostScoringMenu = new ManagePostScoringMenu(courseName, course.discussionSpecs.postSpecs);
    isInteractionUpdate ? componentInteraction.update(managePostScoringMenu.menuMessageData as InteractionUpdateOptions) : componentInteraction.message.edit(managePostScoringMenu.menuMessageData as InteractionUpdateOptions);
    managePostScoringMenu.collectMenuInteraction(componentInteraction.message);
}

export async function refreshManagePostScoringMenu(courseName: string, componentInteraction: MessageComponentInteraction) {
    let course = await getCourseByName(courseName)

    if(!course || !course.discussionSpecs) {
        await sendDismissableReply(componentInteraction.message, "Database error. Please message admin");
        await componentInteraction.message.delete()
        return;
    }

    const managePostScoringMenu = new ManagePostScoringMenu(courseName, course.discussionSpecs.postSpecs);
    componentInteraction.message.edit(managePostScoringMenu.menuMessageData as InteractionUpdateOptions);
}

export class ManagePostScoringMenu extends NavigatedMenu {
    
    constructor(courseName: string, postSpecs: PostSpecs) {

        const menuData: NavigatedMenuData = {
            title: TITLE_COURSE_PREFIX + courseName.toUpperCase(),
            description: MENU_DESCRIPTION,
            fields: generateFields(postSpecs),
            additionalComponents: [SCORE_BUTTON_ROW],
            additionalComponentBehaviors: generateBehaviors(courseName),
        }

        super(menuData, 0);
    }
}

function generateBehaviors(courseName: string): ComponentBehavior[] {
    
    const behaviors: ComponentBehavior[] = [
        {
            filter: (customId) => {return customId === EDIT_SCORING_BUTTON_ID},
            resultingAction: (triggerInteraction) => { openEditPostModal(courseName, triggerInteraction as ButtonInteraction) }
        },
        {
            filter: (customId) => {return customId === ADD_AWARD_BUTTON_ID},
            resultingAction: (triggerInteraction) => { openAddPostAwardModal(courseName, triggerInteraction as ButtonInteraction) }
        }
    ];
    
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