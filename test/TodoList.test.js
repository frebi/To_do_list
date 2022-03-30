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

    it('lists tasks', async () => {
        const taskCount = await todoList.taskCount()
        const task = await todoList.tasks(taskCount)
        assert.equal(task.id.toNumber(), taskCount.toNumber())
        assert.equal(task.content, 'test task')
        assert.equal(task.completed, false)
        assert.equal(taskCount.toNumber(), 1)
    })

    it('create tasks', async () => {
        const result = await todoList.createTask('A new task')
        const taskCount = await todoList.taskCount()
        assert.equal(taskCount, 2)
        //console.log(result)
        const event = result.logs[0].args
        assert.equal(event.id.toNumber(), 2)
        assert.equal(event.content, 'A new task')
        assert.equal(event.completed, false)
    })
})