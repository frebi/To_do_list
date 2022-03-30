import Web3 from 'web3'

import React, {Component} from 'react';
import './App.css';


class App extends Component{

    render(){
        return(
            <div>To do list</div>
        );
    }

    componentWillMount(){
        this.loadWeb3()
    }

    async loadWeb3(){
        if(window.ethereum){
            window.web3 = new Web3(window.ethereum)
            await window.ethereum.enable()

        }else if(window.web3){
            window.web3 = new Web3(window.web3.currentProvider)
        }else{
            window.alert('Non-ethereum browser detected.')
        }
    }
}

export default App;