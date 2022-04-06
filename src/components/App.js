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
            content_list: []
        };

        //binding methods here
       this.loadTasks = this.loadTasks.bind(this)

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


    render(){
        return(
            <div>
                <h1>To do list</h1>
                <button onClick={this.loadTasks.bind(this)}>Show tasks</button>
                <div>
                    <ul>
                        {this.state.content_list.map(item => (
                            <li key={item}>{item}</li>
                        ))}
                    </ul>
                </div>
            </div>
        );
    }
}

export default App;