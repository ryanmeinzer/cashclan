import React, {useState, useEffect} from "react"
import {useMemberContext} from './providers/member'
import Matches from './Matches'
import Locations from './Locations'

const Publish = () => {

    const [state, setState] = useState({active: false, mode: '', amount: 60, premium: 5, location: ''})
    const {member} = useMemberContext()

    useEffect(() => {
        member
            && fetch(`https://cashclan-backend.herokuapp.com/members/${member.id}`)
                .then((obj) => obj.json())
                .then(json => setState(
                    json.active === true
                        ?
                        {active: json.active, mode: json.mode, amount: json.amount, premium: json.premium, location: json.location}
                        :
                        {active: false, mode: '', amount: 60, premium: 5, location: ''}
                ))
    }, [member])

    const handleChange = (event) => {
        const target = event.target
        let value = target.value === 'true' ? true : target.value === 'false' ? false : target.value
        let name = target.name
        if (name === 'amount' || name === 'premium') {value = parseInt(value)}
        setState({...state, [name]: value})
        name === 'active' && handleActiveChange(value)
    }

    // BE is deleting member's pending transaction(s) if they unpublish their offer
    const handleActiveChange = (value) => {
        const requestOptions = {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            // if inactive, set mode & location to '' and amount & premium to 0 on BE for extra clarity
            body: JSON.stringify(value === true ? {...state, active: true} : {active: false, mode: '', amount: 0, premium: 0, location: ''})
        }
        fetch(`https://cashclan-backend.herokuapp.com/members/${member.id}`, requestOptions)
            .then(response => response.json())
            .catch(error => error)
        value === false && setState({active: false, mode: '', amount: 60, premium: 5, location: ''})
    }

    const handleCancel = () => {
        setState({active: false, mode: '', amount: 60, premium: 5, location: ''})
    }

    const handleSubmit = (event) => {
        event.preventDefault()
        const requestOptions = {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({...state, active: true})
        }
        fetch(`https://cashclan-backend.herokuapp.com/members/${member.id}`, requestOptions)
            .then(response => response.json())
            .catch(error => error)
        setState({...state, active: true})
    }

    return (
        <>
            <div align="center">
                <div>
                    {
                        state.active
                            ?
                            (
                                <>
                                    You are actively publishing your below offer to the CashClan.
                                    <p>
                                        {state.mode === 'buying' && 'You will buy at least'} {state.mode === 'selling' && 'You will sell up to'} ${state.amount !== 0 && state.amount !== null && `${state.amount}`} {state.mode === 'buying' && 'and will pay up to a '} {state.mode === 'selling' && 'and must make at least a '} {state.premium !== 0 && state.premium !== null && `${state.premium}%`} {state.mode === 'buying' && 'cost'} {state.mode === 'selling' && 'profit'} {state.location && `at ${state.location}.`}
                                    </p>
                                </>
                            )
                            :
                            <>
                                <p>You are not active. Publish an offer to the CashClan below.</p>
                            </>
                    }
                </div>
                <form
                    onSubmit={handleSubmit}
                >
                    <input
                        name="mode"
                        type="radio"
                        value="buying"
                        onChange={handleChange}
                        disabled={state.active}
                        checked={state.mode === 'buying'}
                        required
                    />
                    <label
                        style={{
                            color: (!state.active ? 'black' : 'lightGray')
                        }}
                    >Buy Cash</label>
                    <input
                        name="mode"
                        type="radio"
                        value="selling"
                        onChange={handleChange}
                        disabled={state.active}
                        checked={state.mode === 'selling'}
                        required
                    />
                    <label
                        style={{
                            color: (!state.active ? 'black' : 'lightGray')
                        }}
                    >Sell Cash</label>
                    <br />
                    <input
                        type="range"
                        name="amount"
                        min={10}
                        max={300}
                        step={10}
                        value={state.amount}
                        onChange={handleChange}
                        disabled={state.active || state.mode === null}
                        required
                        style={{
                            color: (!state.active ? 'black' : 'lightGray')
                        }}
                        hidden={!state.mode}
                    />
                    <span
                        style={{
                            color: (!state.active && state.mode !== null ? 'black' : 'lightGray')
                        }}
                        hidden={!state.mode}
                    >
                        {state.mode === 'buying' && 'will buy at least '}
                        {state.mode === 'selling' && 'will sell up to '}
                        ${state.amount}
                    </span>
                    <br />
                    <input
                        type="range"
                        name="premium"
                        min={1}
                        max={10}
                        step={1}
                        value={parseInt(state.premium)}
                        onChange={handleChange}
                        disabled={state.active || state.mode === null}
                        required
                        style={{
                            color: (!state.active ? 'black' : 'lightGray')
                        }}
                        hidden={!state.mode}
                    />
                    <span
                        style={{
                            color: (!state.active && state.mode !== null ? 'black' : 'lightGray')
                        }}
                        hidden={!state.mode}
                    >
                        {state.mode === 'buying' && 'will pay up to a '}
                        {state.mode === 'selling' && 'must make at least a '}
                        {state.premium}%
                        {state.mode === 'buying' && ' cost'}
                        {state.mode === 'selling' && ' profit'}
                    </span>
                    <br />
                    <Locations state={state} handleChange={handleChange} />
                    <br />
                    <br />
                    {
                        state.active
                            ?
                            <button
                                type="submit"
                                name="active"
                                // type="button"
                                value={false}
                                onClick={handleChange}
                            > Unpublish or Update
                            </button>
                            :
                            <>
                                <button
                                    type="reset"
                                    // reset range input
                                    onClick={handleCancel}
                                    disabled={state.active || state.mode === null}
                                    hidden={!state.mode}
                                > Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={state.active || state.mode === null}
                                    hidden={!state.mode}
                                > Publish to the CashClan
                                </button>
                            </>
                    }
                </form>
                {state.mode === 'buying'
                    && <p
                        style={{
                            color: (!state.active ? 'green' : 'lightGray')
                        }}
                    >
                        <em>
                            You'll {(state.amount * (state.premium / 100)) < 5.50 ? 'save' : 'spend'} {Math.abs((5.50 - (state.amount * (state.premium / 100))) / 5.50 * 100).toFixed()}% {(state.amount * (state.premium / 100)) > 5.50 && 'more'} compared to the $5.50 average total ATM + bank fees by buying at least ${state.amount} cash through Venmo from a CashClan member{state.location && ` at ${state.location}`}. {(state.amount * (state.premium / 100)) > 5.50 ? "However, that would be" : "That'd also be"} saving you {20 - state.premium}% compared to the ~20% average credit card rate in the USA.
                        </em>
                    </p>
                }
                {state.mode === 'selling'
                    && <p
                        style={{
                            color: (!state.active ? 'green' : 'lightGray')
                        }}
                    >
                        <em>
                            You'll earn {Math.abs(state.premium - .5)}% {state.premium > .5 ? 'more' : 'less'} than the 0.5% average bank rate in the USA by selling up to ${state.amount} of your cash through Venmo to a CashClan member{state.location && ` at ${state.location}`}. {state.premium > 7 && `That'd also be earning you ${Math.abs(state.premium - 7)}% more than the 7% average stock market rate in the USA.`}
                        </em>
                    </p>
                }
            </div>
            {
                state.active
                && <div align="left"><Matches offer={state} /></div>
            }
        </>
    )
}

export default Publish