const { assert } = require("chai")

const TodoList = artifacts.require('./ToDoList')

contract('ToDoList', (accounts) => {

    let todoList 

    beforeEach(async () =>{
        todoList = await TodoList.deployed()
    })

    it('deploys successfully', async () => {
        const address = await todoList.address
        assert.notEqual(address, 0x0)
        assert.notEqual(address, '')
        assert.notEqual(address, null)
        assert.notEqual(address, undefined)
    })

    describe('Tasks counters', async () => {
        it('lists tasks', async () => {
            const taskCount = await todoList.taskCount()
            const task = await todoList.tasks(taskCount)
            assert.equal(task.id.toNumber(), taskCount.toNumber())
            assert.equal(task.content, 'test task')
            assert.equal(task.completed, false)
            assert.equal(task.deleted, false)
            assert.equal(taskCount.toNumber(), 1)
        })

        it('BiggestId tasks', async () => {
            const BiggestId = await todoList.biggestId()
            const taskCount = await todoList.taskCount()
            assert.equal(BiggestId.toNumber(), taskCount.toNumber())
            assert.equal(BiggestId.toNumber(), 1)
        })
    })

    describe('createTask', async () => {
        it('Create task when no one before has been deleted... no mapping recycling', async () => {
            const result = await todoList.createTask('A new task')
            const taskCount = await todoList.taskCount()
            const BiggestId = await todoList.biggestId()
            assert.equal(taskCount, 2)
            assert.equal(BiggestId, 2)
            //console.log(result)
            const event = result.logs[0].args
            assert.equal(event.id.toNumber(), 2)
            assert.equal(event.id.toNumber(), BiggestId.toNumber())
            assert.equal(event.content, 'A new task')
            assert.equal(event.completed, false)
            assert.equal(event.deleted, false)
        })

        it('Create task when one or more have been deleted... mapping recycling!', async () => {
            const DeleteResult = await todoList.toggleDeleted(2)
            const result = await todoList.createTask('Recycing task')
            const taskCount = await todoList.taskCount()
            const BiggestId = await todoList.biggestId()
            assert.equal(taskCount, 2)
            assert.equal(BiggestId, 3)
            //console.log(result)
            const event = result.logs[0].args
            assert.equal(event.id.toNumber(), 3)
            assert.equal(event.id.toNumber(), BiggestId.toNumber())
            assert.equal(event.content, 'Recycing task')
            assert.equal(event.completed, false)
            assert.equal(event.deleted, false)
        })
    })

    describe('toggleCompleted', async () => {
        it('Complete task', async () => {            
            const result = await todoList.toggleCompleted(3)
            const eventDel = result.logs[0].args
            assert.equal(eventDel.id.toNumber(), 3)
            //assert.equal(eventDel.content, 'Recycling task')
            assert.equal(eventDel.completed, true)
            //assert.equal(eventDel.deleted, true)
            const taskCount = await todoList.taskCount()
            const BiggestId = await todoList.biggestId()
            assert.equal(taskCount, 2)
            assert.equal(BiggestId, 3)
        })
    })

    describe('toggleDeleted', async () => {
        it('Delete task', async () => {
            const CreateResult = await todoList.createTask('New temp task')
            var taskCount = await todoList.taskCount()
            var BiggestId = await todoList.biggestId()
            assert.equal(taskCount, 3)
            assert.equal(BiggestId, 4)
            //console.log(result)
            const event = CreateResult.logs[0].args
            assert.equal(event.id.toNumber(), 4)
            
            const result = await todoList.toggleDeleted(4)
            const eventDel = result.logs[0].args
            assert.equal(eventDel.id.toNumber(), 4)
            //assert.equal(eventDel.content, 'New temp task')
            //assert.equal(eventDel.completed, false)
            assert.equal(eventDel.deleted, true)
            taskCount = await todoList.taskCount()
            BiggestId = await todoList.biggestId()
            assert.equal(taskCount, 3)
            assert.equal(BiggestId, 4)
        })
    })

    describe('editTask', async () => {
        it('Edit task', async () => {            
            const result = await todoList.editTask(1, "new edit")
            const eventEdit = result.logs[0].args
            assert.equal(eventEdit.id.toNumber(), 1)
            assert.equal(eventEdit.content, 'new edit')
            //assert.equal(eventEdit.completed, true)
            //assert.equal(eventEdit.deleted, true)
            const taskCount = await todoList.taskCount()
            const BiggestId = await todoList.biggestId()
            assert.equal(taskCount, 3)
            assert.equal(BiggestId, 4)
        })
    })
    
})