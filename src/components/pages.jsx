import {forwardRef, useEffect, useMemo, useState} from 'react';
import {getFilterItems, getIds, getItems, paginate} from "../script.js";
import '../App.scss'

const Pages = forwardRef(({ids, setIds, items, setItems, filter, mode, setMode, isLoading, setIsLoading}, inputRef) => {
    const [error, setError] = useState([])
    const request = {
        "action": "filter",
        "params": {[`${filter}`]: filter === "price" ? Number(inputRef.current?.value) : inputRef.current?.value}
    }

    // Генерация страниц. 1 -> 1,2,3,4.
    // 2 -> 5,6,7,8
    let [nextPages, setNextPages] = useState(0)
    // Массив страниц
    let [pageNumber, setPageNumber] = useState(1)

    async function fetchPages(nextPages) {
        try {
            const newIds = [...await getIds(nextPages)]
            setIds([...ids, ...newIds])
            const newItems = [...await getItems(newIds)]
            setItems([...items, ...newItems])
        } catch (e) {
            setError([...error, e])
            console.log(e)
        }
    }

    async function fetchFilterPage() {
        try {
            const newItems = [...await getFilterItems(request)]
            setItems(newItems)
        } catch (e) {
            setError([...error, e])
            console.log(e)
        } finally {
            setPageNumber(1)
            setIsLoading(false)
            setMode(true)
        }
    }

    const handleNextPage = async () => {
        try {
            await fetchPages(nextPages)
            setIsLoading(false)
            setMode(false)
            console.log(isLoading)
        } catch (e) {
            setError([...error, e])
            console.log(e)
        } finally {
            setIsLoading(false)
        }
    }


    useEffect(() => {
        async function handleNextPageAsync() {
            setIsLoading(true)
            await handleNextPage()
        }

        if (isLoading === false && inputRef.current.value === "" && nextPages !== 1) {
            handleNextPageAsync()
        }

    }, [nextPages])


    useEffect(() => {
        async function fetchFilterPageAsync() {
            await fetchFilterPage()
        }

        if (isLoading === true && inputRef.current.value.trim() !== "") {
            fetchFilterPageAsync()
        }
    }, [isLoading])

    useEffect(() => {
        async function fetchPagesAsync() {
            setItems([])
            setIds([])
            await fetchPages(nextPages)
            setIsLoading(false)
            setMode(false)
        }

        if (isLoading === true && inputRef.current.value === "") {

            fetchPagesAsync()

        }
    }, [isLoading])


    let pages = useMemo(() => {
        let result = []
        for (let i = 1; i <= Math.ceil(items.length / 50); i++) {
            result = [...result, i]
        }
        return result
    }, [items])

    useEffect(() => {

        return () => {
            console.log("DESTROYED")
        }
    }, [])
    return (
        <>
            {
                error.length === 0 ?
                    isLoading ?
                        <div className="loader-wrapper">
                            <span className="loader"></span>
                        </div>
                        :
                        <section className="container">
                            <div className="items">
                                {paginate(items, pageNumber)?.map(item => {
                                    return <div key={item.id} className="item">
                                        <div className="item__img"></div>
                                        <p className="item__name">{item.product}</p>
                                        <p className="item__price">{item.price} $</p>
                                        <p className="item__brand">{!item.brand ? "No brand" : item.brand}
                                        </p>
                                        <p className="item__id">ID:<br/>{item.id}</p>
                                    </div>
                                })}
                            </div>
                            {
                                pages.length > 1 ?
                                    <div className="pages">
                                        {pages.map(page => {
                                            return <a
                                                className={pageNumber === page ? `pages__item active` : `pages__item`}
                                                onClick={() => setPageNumber(page)} key={page}>  {page}  </a>
                                        })}
                                        {
                                            mode ?
                                                <></>
                                                :
                                                <>
                                                    <a className="pages__next pages__item" onClick={() => {
                                                        setIsLoading(true)
                                                        setNextPages(nextPages + 1)
                                                        setPageNumber(nextPages * 2 + 1)
                                                    }}>More</a>
                                                </>
                                        }
                                    </div>
                                    :
                                    <></>
                            }
                        </section>
                    :
                    <div className="error-wrapper">
                        <div className="error">

                        </div>
                    </div>
            }
        </>

    );
});

export default Pages;