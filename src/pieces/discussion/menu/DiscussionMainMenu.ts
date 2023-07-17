import { BaseInteraction, ButtonComponentData, ButtonStyle, Client, InteractionUpdateOptions, Message, MessageComponentInteraction, User } from "discord.js";
import { BaseMenu, ComponentBehavior } from "../../menu/BaseMenu";
import { makeActionRowButton } from "../../../generalUtilities/MakeActionRow";
import { updateToStaffCoursesMenu } from "./staff/StaffCoursesMenu";
import { CourseQueue } from "../scoring/courseQueue";
import { MenuCreationData, sendMenu, updateMenu } from "./MenuUtilities";

const MAIN_MENU_TITLE = "Discussion Menu";
const MAIN_MENU_DESCRIPTION = "Welcom to the discussion menu! Click the button below that corresponds to your role to open a menu for that role";
const MAIN_MENU_FIELDS: {name: string,  value:string}[] = [];

const MAIN_MENU_STUDENT_BUTTON_ID = "discussion_student_menu_button";
const MAIN_MENU_STUDENT_BUTTON_LABEL = "student view";
const MAIN_MENU_STUDENT_BUTTON_STYLE = ButtonStyle.Primary;
const MAIN_MENU_STUDENT_BUTTON_DISABLED = true;

const MAIN_MENU_STAFF_BUTTON_ID = "discussion_staff_menu_button";
const MAIN_MENU_STAFF_BUTTON_LABEL = "staff view";
const MAIN_MENU_STAFF_BUTTON_STYLE = ButtonStyle.Primary;
const MAIN_MENU_STAFF_BUTTON_DISABLED = false;

const MAIN_MENU_BUTTON_DATA: Partial<ButtonComponentData>[] = [
    {
        customId: MAIN_MENU_STUDENT_BUTTON_ID,
        label: MAIN_MENU_STUDENT_BUTTON_LABEL,
        style: MAIN_MENU_STUDENT_BUTTON_STYLE,
        disabled: MAIN_MENU_STUDENT_BUTTON_DISABLED
    },
    {
        customId: MAIN_MENU_STAFF_BUTTON_ID,
        label: MAIN_MENU_STAFF_BUTTON_LABEL,
        style: MAIN_MENU_STAFF_BUTTON_STYLE,
        disabled: MAIN_MENU_STAFF_BUTTON_DISABLED
    }
];

const MAIN_MENU_COMPONENTS = [makeActionRowButton(MAIN_MENU_BUTTON_DATA)];

const MAIN_MENU_CREATION_DATA: MenuCreationData = {
    title: MAIN_MENU_TITLE,
    description: MAIN_MENU_DESCRIPTION,
    fields: MAIN_MENU_FIELDS,
    components: MAIN_MENU_COMPONENTS,
};

export async function SendDiscussionMainMenu(user: User, courseQueues: Map<string, CourseQueue>): Promise<Message> {
    
    const sentMenuMessage = await sendMenu(user, MAIN_MENU_CREATION_DATA, GenerateBehaviors(courseQueues));
    return sentMenuMessage;
}

export async function UpdateDiscussionMainMenu(interaction: MessageComponentInteraction, courseQueues: Map<string, CourseQueue>) {
    
    updateMenu(interaction, MAIN_MENU_CREATION_DATA, GenerateBehaviors(courseQueues))
}

function GenerateBehaviors(courseQueues: Map<string, CourseQueue>): ComponentBehavior[] {
    return [
        {
            filter: (customId: string) => {
                return customId === MAIN_MENU_STUDENT_BUTTON_ID;
            },
            resultingAction: (componentInteraction: MessageComponentInteraction) => {
                // TODO: Implement opening of student view once student menu is implemented
                componentInteraction.update({
                    content: "Student view not yet implemented",
                    embeds: [],
                    components: []
                });
            }
        },
        {
            filter: (customId: string) => {
                return customId === MAIN_MENU_STAFF_BUTTON_ID;
            },
            resultingAction: (componentInteraction: MessageComponentInteraction) => {
                updateToStaffCoursesMenu(componentInteraction, courseQueues)
            }
        },
    ]
}