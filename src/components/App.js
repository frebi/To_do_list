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
            content_list: [],
            new_task: null
        };

        //binding methods here
       //this.loadTasks = this.loadTasks.bind(this)
       this.createNewTask = this.createNewTask.bind(this)

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
        this.loadTasks()
    }




    async loadTasks(){
        for(var i=1; i<=this.state.task_count; i++){
            this.setState({task_object: await this.state.todolist.methods.tasks(i).call()})
            this.setState({task_content: await this.state.task_object[1]})

            //Updating array list without modifying the older one since the state cannot be mutated
            this.setState(state => {
                const content_list = this.state.content_list.concat(this.state.task_content);
                //console.log(content_list)
                return {
                    content_list
                };
            });
        }
    }



    createNewTask(){
        if(this.state.new_task === "" || this.state.new_task === null){
            window.alert("Please insert a valid task!")
            return
        }

        this.state.todolist.methods.createTask(this.state.new_task).send({from: this.state.account})
                                    .on('transactionHash', () => {
                                        this.addNewTask()
                                    })
    }


    async addNewTask(){
        this.setState({content_list : []})
        await this.ContractInfo()
        window.location.reload(false);
    }



    render(){
        let tasks = this.state.content_list.map(item => (
            <li key={item}>{item}</li>
        ))

        return(
            <div>
                <h1>To do list</h1>
                <div>
                    <form onSubmit={(e) => {
									e.preventDefault()
									this.createNewTask()
					}}>
                        <label>Add a new task </label><br/>
                        <input type="text" onChange={(e) => this.setState({ new_task: e.target.value })}/>&nbsp;&nbsp;
                        <button type="submit">Add to list</button>
                    </form>
                </div><br/>
                {this.state.content_list.length !== 0 ? 
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