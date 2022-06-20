import Web3 from 'web3'

import React, {Component} from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css'

import ToDoList from '../abis/ToDoList.json'


class App extends Component{
    
    constructor(){
        super();
        this.state = {
            web3: null,
            todolist: null,
            account: "0x0",
            task_object: null,
            task_count: null,
            task_content: null,
            task_id: null,
//          content_list: [],
            content_dictionary:{},
            dictionary_completed:{},
            new_task: null
        };

        //binding methods here
       //this.loadTasks = this.loadTasks.bind(this)
       this.createNewTask = this.createNewTask.bind(this)
       this.completedTasks = this.completedTasks.bind(this)

    }

    //componentWillMount() is deprecated
    componentDidMount(){
        this.loadWeb3()
    }

    async loadWeb3(){
        if(window.ethereum){
            /* ---- enable() method is deprecated -----
            await window.ethereum.enable()
            */
            await window.ethereum.request({method: 'eth_requestAccounts'});
            window.web3 = new Web3(window.ethereum);
            this.loadBlockchainData(this.props.dispatch)

        }else if(window.web3){
            window.web3 = new Web3(window.web3.currentProvider)
        }else{
            window.alert('Non-ethereum browser detected.')
        }
    }

    //fetching contract
    async loadBlockchainData(dispatch){
        const web3 = new Web3(window.ethereum)
        this.setState({web3})

        const network_id = await web3.eth.net.getId()
        const accounts = await web3.eth.getAccounts()
        this.setState({account: accounts[0]})

        //------- creating new contract object to interact with -----
        const todolist = new web3.eth.Contract(ToDoList.abi, ToDoList.networks[network_id].address)
        if(!todolist){
            window.alert('ToDoList smart contract not detected on the current network. Please select another network with Metamask.')
        }
        this.setState({todolist})

        this.ContractInfo()
    }


    async ContractInfo(){
        let task_count = await this.state.todolist.methods.taskCount().call()
        this.setState({task_count})
        console.log("task_count: " + task_count)
        this.loadTasks()
    }




    async loadTasks(){
        const temp_dictionary={}
        const temp_completed={}
        for(var i=1; i<=this.state.task_count; i++){
            this.setState({task_object: await this.state.todolist.methods.tasks(i).call()})
            console.log("Status deleted: " + this.state.task_object[3] + ", Status completed: " + this.state.task_object[2] + ", name: " + this.state.task_object[1] + ", id: " + this.state.task_object[0])

            this.setState({task_content: await this.state.task_object[1]})
                
            //Updating array list without modifying the older one since the state cannot be mutated
            if(!(await this.state.task_object[2]) && !(await this.state.task_object[3])){
                this.setState({task_id: await this.state.task_object[0]})
                temp_dictionary[this.state.task_id]=this.state.task_content
                this.setState({content_dictionary: temp_dictionary})
            }else if(await this.state.task_object[2] && !(await this.state.task_object[3])){
                this.setState({task_id: await this.state.task_object[0]})
                temp_completed[this.state.task_id]=this.state.task_content
                this.setState({dictionary_completed: temp_completed})
            }
        }
        Object.entries(this.state.content_dictionary).sort();

        console.log("Dictionary length: "+Object.keys(this.state.content_dictionary).length);
        console.log(
            Object.entries(this.state.content_dictionary)
            .map( ([key, value]) => `${key}-${value}` )
          )
        console.log("------ task completed: "+Object.keys(this.state.dictionary_completed).length)
        //console.log("------ task deleted: "+(this.state.task_count - Object.keys(this.state.dictionary_completed).length - Object.entries(this.state.content_dictionary).length))
    }



    createNewTask(){
        if(this.state.new_task === "" || this.state.new_task === null){
            window.alert("Please insert a valid task!")
            return
        }

        this.state.todolist.methods.createTask(this.state.new_task).send({from: this.state.account})
                                    .on('transactionHash', () => {
                                        this.updateTaskList()
                                    })
    }


    async updateTaskList(){
        this.setState({content_dictionary : {}})
        this.setState({dictionary_completed : {}})
        window.location.reload();
    }
    



    async completedTasks(elem){
        console.log(elem)
        if(window.confirm("The selected task will be completed")){
            this.state.todolist.methods.toggleCompleted(elem).send({from : this.state.account})
                                        .on('transactionHash', () => {
                                            this.updateTaskList()
                                        })
        }else window.location.reload();
    }

    async deletedTasks(elem){
        console.log(elem)
        if(window.confirm("The selected task will be deleted")){
            this.state.todolist.methods.toggleDeleted(elem).send({from : this.state.account})
                                        .on('transactionHash', () => {
                                            this.updateTaskList()
                                        })
        }else window.location.reload();
    }

    async undoTasks(elem){
        console.log(elem)
        if(window.confirm("The selected task will be completed")){
            this.state.todolist.methods.toggleCompleted(elem).send({from : this.state.account})
                                        .on('transactionHash', () => {
                                            this.updateTaskList()
                                        })
        }else window.location.reload();
    }
    
    editTasks(elem){
        console.log(elem)
        document.getElementById("task_"+elem).style.display = "none"
        document.getElementById("edit_task_"+elem).style.display = "unset"
        document.getElementById("EditButton_"+elem).style.display = "none"
        document.getElementById("SaveButton_"+elem).style.display = "unset"
    }


    async updateTask(elem){
        const newTask = document.getElementById("edit_task_"+elem).value
        //console.log(newTask)

        if(window.confirm("The selected task will be edited")){
            this.state.todolist.methods.editTask(elem, newTask).send({from : this.state.account})
                                        .on('transactionHash', () => {
                                            this.updateTaskList()
                                        })
        }else window.location.reload();
    }




    render(){
        /*
        let tasks = this.state.content_list.map(item => (
            
            <div key={item} className="form-check">
                <input className="form-check-input" type="checkbox" value="" id="task-check" onClick={() => this.completedTasks(item)}/>
                <label className="form-check-label" htmlFor="task-check">
                {item}
                </label>
          </div>
        ))
        */

        let tasks = Object.entries(this.state.content_dictionary).map(([key, value]) => (
            
            <div key={key} className="form-check container py-1">
                <div className="row content-center">
                    <div className="col-2 center">
                        <label id={"task_"+key} className="form-check-label" htmlFor="task-check">
                        {value}
                        </label>
                        <input id={"edit_task_"+key} type="text" style={{display: 'none'}}></input>
                    </div>
                    <div className="col-4">
                        <button id={"EditButton_"+key} type="button" className="btn btn-primary space" onClick={() => this.editTasks(Number(key))}>Edit</button>
                        <button id={"SaveButton_"+key} type="button" className="btn btn-warning space" style={{display: 'none'}} onClick={() => this.updateTask(Number(key))}>Save</button>
                        <button type="button" className="btn btn-primary space" onClick={() => this.completedTasks(Number(key))}>Complete</button>
                        <button type="button" className="btn btn-primary space" onClick={() => this.deletedTasks(Number(key))}>Delete</button>
                    </div>
                </div>
            </div>
          
        ))

        let tasks_completed = Object.entries(this.state.dictionary_completed).map(([key, value]) => (
            
            <div key={key} className="form-check container py-1">
                <div className="row content-center">
                    <div className="col-2 center">
                        <label className="form-check-label" htmlFor="task-check">
                        {value}
                        </label>
                    </div>
                    <div className="col-4">
                        <button type="button" className="btn btn-primary space" onClick={() => this.deletedTasks(Number(key))}>Delete</button>
                        <button type="button" className="btn btn-primary space" onClick={() => this.undoTasks(Number(key))}>Undo Complete</button>
                    </div>
                </div>
            </div>
          
        ))

        return(
            <div className="container text-center">
                <div className="container py-4">
                    <h1>To do list</h1>
                </div>
                <div>
                    <form onSubmit={(e) => {
									e.preventDefault()
									this.createNewTask()
					}}>
                        <div className="container py-2">
                            <label className="bold py-2">Add a new task </label><br/>
                            <div className="input-group my-2 content-center">
                                <input className="input-group-text" id="inputGroup-sizing-default" type="text" onChange={(e) => this.setState({ new_task: e.target.value })}/>&nbsp;&nbsp;
                                <button type="submit" className="btn btn-primary" >Add to list</button>
                            </div>
                        </div>
                    </form>
                </div><br/>
                {Object.keys(this.state.content_dictionary).length !== 0 ? 
                <div>
                    <div className="container py-4">
                        <label className="bold py-3">Tasks To Do</label><br/>
                        <ul>
                            {tasks}
                        </ul>
                    </div>
                </div> : ""
                }
                {Object.keys(this.state.dictionary_completed).length !== 0 ? 
                <div>
                    <div className="container py-4">
                        <label className="bold py-3">Completed Tasks</label><br/>
                        <ul>
                            {tasks_completed}
                        </ul>
                    </div>
                </div> : ""
                }
            </div>
        );
    }
}

export default App;