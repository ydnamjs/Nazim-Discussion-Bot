import { BaseInteraction, ButtonComponentData, ButtonStyle, Client, InteractionUpdateOptions, Message, MessageComponentInteraction } from "discord.js";
import { BaseMenu, ComponentBehavior } from "../../menu/BaseMenu";
import { makeActionRowButton } from "../../../generalUtilities/MakeActionRow";
import { updateToStaffCoursesMenu } from "./staff/StaffCoursesMenu";
import { CourseQueue } from "../scoring/courseQueue";

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

export async function sendDiscussionMainMenu(interaction: BaseInteraction, courseQueues: Map<string, CourseQueue>): Promise<Message<false>> {
    
    const mainMenu = makeMainMenu(courseQueues);

    const sentMenuMessage = await interaction.user.send(mainMenu.menuMessageData);
    mainMenu.collectMenuInteraction(sentMenuMessage)
    return sentMenuMessage;
}

export function makeMainMenu(courseQueues: Map<string, CourseQueue>) {
    const MAIN_MENU_BUTTON_BEHAVIORS: ComponentBehavior[] = [
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
    
    return new BaseMenu({
        title: MAIN_MENU_TITLE,
        description: MAIN_MENU_DESCRIPTION,
        fields: MAIN_MENU_FIELDS,
        components: MAIN_MENU_COMPONENTS,
        componentBehaviors: MAIN_MENU_BUTTON_BEHAVIORS
    });
}