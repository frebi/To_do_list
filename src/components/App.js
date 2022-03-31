import Web3 from 'web3'

import React, {Component} from 'react';
import './App.css';

import ToDoList from '../abis/ToDoList.json'


class App extends Component{
    
    render(){
        return(
            <div>To do list</div>
        );
    }
    
    constructor(){
        super();
        this.state = {
            web3: null,
            todolist: null,
            account: "0x0",
            task_object: null
        };

        //binding methods here

    }

    //componentWillMount() is deprecated
    componentDidMount(){
        this.loadWeb3()
    }

    async loadWeb3(){
        console.log("test")
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

        await this.loadTodolist()
    }

    async loadTodolist(){
        let count = await this.state.todolist.methods.taskCount().call()
        let task_object = await this.state.todolist.methods.tasks(count).call()
        this.setState({task_object})

        console.log(count)
        console.log(`string content of task: ${this.state.task_object[1]}`)
    }
}

export default App;