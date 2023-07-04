
interface courseQueueNode {
    action: Function,
    next: courseQueueNode | undefined,
}

export class courseQueue {

    head: courseQueueNode | undefined;
    tail: courseQueueNode | undefined;

    push( scoreAction: Function ) {
        
        const newActionNode: courseQueueNode = { action: scoreAction, next: undefined}
        
        if(this.head && this.tail)
            this.tail.next = newActionNode;
        else {
            this.head = newActionNode;
            this.tail = newActionNode;
            this.startProcessingActions();
        }
    }

    async startProcessingActions() {
        while(this.head) {
            await this.head.action();
            this.head = this.head.next;
        }
    }

    constructor(courseName: string) {

        this.head = undefined;
    }
}