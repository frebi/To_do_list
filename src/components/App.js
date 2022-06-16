import Web3 from 'web3'

import React, {Component} from 'react';
import './App.css';

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
            content_list: [],
            content_dictionary:{},
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
        const temp_dictionary={};
        for(var i=1; i<=this.state.task_count; i++){
            this.setState({task_object: await this.state.todolist.methods.tasks(i).call()})
            console.log("Status completed: " + this.state.task_object[2] + ", name: " + this.state.task_object[1] + ", id: " + this.state.task_object[0])

            this.setState({task_content: await this.state.task_object[1]})
                
            //Updating array list without modifying the older one since the state cannot be mutated
            if(!(await this.state.task_object[2])){
                this.setState({task_id: await this.state.task_object[0]})
                temp_dictionary[this.state.task_id]=this.state.task_content;
                this.setState({content_dictionary: temp_dictionary});
            }
        }
        console.log("Dictionary length: "+Object.keys(this.state.content_dictionary).length);
        console.log(
            Object.entries(this.state.content_dictionary)
            .map( ([key, value]) => `${key}-${value}` )
          )
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
        window.location.reload();
    }
    



    async completedTasks(elem){
        console.log(elem)
        //console.log(this.state.content_list.indexOf(elem)+1)
        if(window.confirm("The selected task will be completed")){
            this.state.todolist.methods.toggleCompleted(elem).send({from : this.state.account})
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
            
            <div key={key} className="form-check">
                <input className="form-check-input" type="checkbox" value="" id="task-check" onClick={() => this.completedTasks(Number(key))}/>
                <label className="form-check-label" htmlFor="task-check">
                {value}
                </label>
          </div>
        ))

        return(
            <div>
                <h1>To do list</h1>
                <div>
                    <form onSubmit={(e) => {
									e.preventDefault()
									this.createNewTask()
					}}>
                        <div className="form-group">
                            <label>Add a new task </label><br/>
                            <input type="text" onChange={(e) => this.setState({ new_task: e.target.value })}/>&nbsp;&nbsp;
                            <button type="submit">Add to list</button>
                        </div>
                    </form>
                </div><br/>
                {Object.keys(this.state.content_dictionary).length !== 0 ? 
                <div>
                    Tasks:
                    <ul>
                        {tasks}
                    </ul>
                </div> : ""
                }
            </div>
        );
    }
}

export default App;