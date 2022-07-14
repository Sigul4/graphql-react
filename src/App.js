// import FetchFullContent from './FetchFullContent'
import './App.css';
import React, {useState} from 'react';
import {createStore, applyMiddleware} from 'redux';
import thunk from 'redux-thunk';
import {Provider, connect} from 'react-redux';
// import { gql, useQuery } from '@apollo/client'


function promiseReducer(state, {type, status, name, payload, error}){ 
  
    if (state === undefined){
        return {}
    }

    if (type === 'PROMISE'){
        return {
            ...state,
            [name]: {status, payload ,error}
        }
    }
    return state 
}

const store = createStore(promiseReducer, applyMiddleware(thunk))

let gql = async (url, query, variables) =>{
            let res = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json'
                },
                body: JSON.stringify({query, variables})
            })
            return res.json()
          }

const IphoneGoods = gql('http://shop-roles.node.ed.asmer.org.ua/graphql', 
                        `query iphones($q:String){
                            CategoryFind(query:$q){
                              _id 
                              name 
                              goods{
                                name,
                                description,
                                images{
                                  url
                                }
                                price
                              }
                            }
                          }`, {q: JSON.stringify([{name:"iPhone"}])})

const SamsungGoods = gql('http://shop-roles.node.ed.asmer.org.ua/graphql', 
                        `query samsung($q:String){
                            CategoryFind(query:$q){
                              _id 
                              name 
                              goods{
                                name,
                                description,
                                images{
                                  url
                                }
                                price
                              }
                            }
                          }`, {q: JSON.stringify([{name:"Samsung"}])})

const actionPending   = name            => ({type: 'PROMISE', status: 'PENDING', name})
const actionFulfilled = (name, payload) => ({type: 'PROMISE', status: 'FULFILLED', name, payload})
const actionRejected  = (name, error)   => ({type: 'PROMISE', status: 'REJECTED', name, error})

const actionPromise = (name, promise) =>
    async dispatch => {
        dispatch(actionPending(name))
        try{
            let payload = await promise
            console.log(payload)
            dispatch(actionFulfilled(name, payload))
            return payload
        }
        catch(err){
            dispatch(actionRejected(name, err))
        }
    }


// const url = 'https://shop-items-server.herokuapp.com/'
// store.dispatch(actionPromise('FetchSecondContent', fetch(url).then(res => res.json())))





store.dispatch(actionPromise('IphoneGoods', IphoneGoods))
store.dispatch(actionPromise('SamsungGoods', SamsungGoods))
    

const PromiseViewer = ({status, payload, error}) =>{
console.log({status, payload, error})
return(
<div className='category-bar'>

    {status === 'PENDING'   &&  <><strong>Почекай, хлопчине!</strong><br/></>}
    {status === 'REJECTED'  &&  <><strong>ERROR</strong>: {error}<br/></>}
    {status === 'FULFILLED' &&  <><strong>Category</strong>: {payload.data.CategoryFind[0].name}<br/></>}
    {status === 'FULFILLED' &&  <ul class="listOfSmartphones"> {payload.data.CategoryFind[0].goods.map( smartphone => 
                                  <li className='good-bar' key={smartphone._id}>📱{smartphone.name}<br/>
                                  <strong>💸 Price: </strong>      {smartphone.price}<br/>
                                  <img src='http://shop-roles.node.ed.asmer.org.ua/{smartphone.url}'/><br/>
                                  <strong>🐷 Description: </strong>{smartphone.description}
                                  </li>
                                  )}
                                </ul>}
</div>)}


const AppleProducts = connect(state => state.IphoneGoods || {})(PromiseViewer)
const SamsungProducts = connect(state => state.SamsungGoods || {})(PromiseViewer)


console.log(store.getState().GoodsByCatId)

function App() {
  return (
    <Provider store={store}>
        <div className="App">
          <SamsungProducts/>
          <AppleProducts/>
        </div>
    </Provider>
  );
}

export default App;
