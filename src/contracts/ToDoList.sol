pragma solidity ^0.5.0;

//import "openzeppelin-solidity/contracts/utils/math/SafeMath.sol";

contract ToDoList{

    //using SafeMath for uint256;

    uint public taskCount = 0;
    uint public biggestId = 0;

    struct Task{
        uint id;
        string content;
        bool completed;
        bool deleted;
    }

    mapping (uint => Task) public tasks;

    event TaskCreated(uint id, string content, bool completed, bool deleted);
    event TaskCompleted(uint id, bool completed);
    event TaskDeleted(uint id, bool deleted);

    constructor() public{
        createTask("test task");
    }

    // if a task has been completed and flagged to true, createTask function will replace the completed task
    // with a new one updating the id to a greater one (biggest)  
    function createTask(string memory _content) public{
        for(uint i=0; i<taskCount; i++){
            if(tasks[i].deleted){
                biggestId ++;
                tasks[i].id = biggestId;
                tasks[i].content = _content;
                tasks[i].completed = false;
                tasks[i].deleted = false;
                emit TaskCreated(biggestId, _content, false, false);
                break;
            }
            else if(!tasks[i].deleted && i==taskCount-1){
                taskCount ++;
                biggestId ++;
                tasks[taskCount] = Task(biggestId, _content, false, false);
                emit TaskCreated(biggestId, _content, false, false);
                break;
            }
        }
        if(taskCount == 0){
            taskCount ++;
            biggestId ++;
            tasks[taskCount] = Task(biggestId, _content, false, false);
            emit TaskCreated(biggestId, _content, false, false);
        }
    }

    function toggleCompleted(uint _id) public {
        Task memory _task = tasks[_id];
        _task.completed = !_task.completed;
        tasks[_id] = _task;
        emit TaskCompleted(_id, _task.completed);
    }

    function toggleDeleted(uint _id) public {
        Task memory _task = tasks[_id];
        _task.deleted = !_task.deleted;
        tasks[_id] = _task;
        emit TaskDeleted(_id, _task.deleted);
    }
}