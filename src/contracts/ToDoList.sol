pragma solidity ^0.5.0;

contract ToDoList{

    uint public taskCount = 0;

    struct Task{
        uint id;
        string content;
        bool completed;
    }

    mapping (uint => Task) public tasks;

    event TaskCreated(uint id, string content, bool completed);
    event TaskCompleted(uint id, bool completed);

    constructor() public{
        createTask("test task");
    }

    function createTask(string memory _content) public{
        for(uint i=0; i<taskCount; i++){
            if(tasks[i].completed){
                tasks[i].content = _content;
                tasks[i].completed = false;
                emit TaskCreated(taskCount, _content, false);
                break;
            }
            else if(!tasks[i].completed && i==taskCount-1){
                taskCount ++;
                tasks[taskCount] = Task(taskCount, _content, false);
                emit TaskCreated(taskCount, _content, false);
                break;
            }
        }
        if(taskCount == 0){
            taskCount ++;
            tasks[taskCount] = Task(taskCount, _content, false);
            emit TaskCreated(taskCount, _content, false);
        }
    }

    function toggleCompleted(uint _id) public {
        Task memory _task = tasks[_id];
        _task.completed = !_task.completed;
        tasks[_id] = _task;
        emit TaskCompleted(_id, _task.completed);
    }
}