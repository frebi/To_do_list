pragma solidity ^0.5.0;

//import "openzeppelin-solidity/contracts/utils/math/SafeMath.sol";

contract ToDoList{

    //using SafeMath for uint256;

    address public owner;
    uint public taskCount = 0;
    uint public biggestId = 0;

    modifier onlyOwner(){
        require(msg.sender == owner);
        _;
    }

    constructor() public{
        owner = msg.sender;
        createTask("test task");
    }

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
    event TaskEdited(uint id, string content);


    // if a task has been completed and flagged to true, createTask function will replace the completed task
    // with a new one updating the id to a greater one (biggest)  
    function createTask(string memory _content) public onlyOwner{
        for(uint i=1; i<=taskCount; i++){
            if(tasks[i].deleted){
                biggestId ++;
                tasks[i].id = biggestId;
                tasks[i].content = _content;
                tasks[i].completed = false;
                tasks[i].deleted = false;
                emit TaskCreated(biggestId, _content, false, false);
                break;
            }
            else if(!tasks[i].deleted && i==taskCount){
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

    function toggleCompleted(uint _id) public onlyOwner{
        for(uint i=1; i<=taskCount; i++){
            if(tasks[i].id == _id){
                Task memory _task = tasks[i];
                _task.completed = !_task.completed;
                tasks[i] = _task;
                emit TaskCompleted(_id, _task.completed);
                break;
            }
        }
    }

    function toggleDeleted(uint _id) public onlyOwner{
        for(uint i=1; i<=taskCount; i++){
            if(tasks[i].id == _id){
                Task memory _task = tasks[i];
                _task.deleted = !_task.deleted;
                tasks[i] = _task;
                emit TaskDeleted(_id, _task.deleted);
                break;
            }
        }
    }

    function editTask(uint _id, string memory _content) public onlyOwner{
        for(uint i=1; i<=taskCount; i++){
            if(tasks[i].id == _id){
                tasks[i].content = _content;
                emit TaskEdited(_id, _content);
                break;
            }
        }
    }
}