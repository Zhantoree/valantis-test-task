import React, {useEffect, useRef, useState} from 'react'
import './App.scss'
import Pages from "./components/pages.jsx";

function App() {
    // НЕ ЗАБУДЬ ЗАТРИМАТЬ ПОЛЯ ФИЛЬТРА
    const [filter, setFilter] = useState('price');
    const [mode, setMode] = useState(false)
    const [ids, setIds] = useState([])
    const [items, setItems] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [input, setInput] = useState('')
    const inputRef = useRef()

    const handleSubmit = () => {
        setIds([])
        setItems([])
        if(inputRef.current.value.trim() === ''){
            setMode(false)
            setIsLoading(true)
        }else {
            setMode(true)
            setIsLoading(true)
        }
    }
    useEffect(()=>{
        console.log("INPUT CHANGE DETECTED")
    }, [input])

    return (
        <main className="wrapper">
            <section className="filter">
                <select onChange={e => setFilter(e.target.value)} name="filter"
                        value={filter}
                        className={"select"}
                        id="filter">
                    <option value="price">Price</option>
                    <option value="product">Name</option>
                    <option value="brand">Brand</option>
                </select>
                <input className={"input"} ref={inputRef} type="text"/>
                <button className={"button"} onClick={handleSubmit}>Find</button>
            </section>
            <Pages ref={inputRef} ids={ids} setIds={setIds} items={items} setItems={setItems} filter={filter} isLoading={isLoading} setIsLoading={setIsLoading} mode={mode} setMode={setMode}/>
        </main>
    )
}

export default App
