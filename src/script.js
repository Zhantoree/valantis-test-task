import md5 from 'md5'
import axios from "axios";

// URL API
const password = "Valantis";
const apiUrl = "https://api.valantis.store:41000/";

// Лимит для получения айдишек
const limit = 100
const pageSize = 50


// Функция для формирования авторизационной строки
function generateAuthString(password) {
    const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const authString = md5(`${password}_${timestamp}`)
    return authString;
}

// Получения айдишек по блокам из 2 страниц
export async function getIds(nextPages = 0) {
    const offset = nextPages * limit
    const authString = generateAuthString(password)
    try {
        const response = await axios.post(apiUrl, {
                "action": "get_ids",
                "params": {"offset": offset, "limit": limit}
            },
            {
                headers: {
                    'X-Auth': authString
                }
            }
        )
        const result = new Set(response.data.result)
        return [...result]
    } catch (e) {
        console.log(e.message)
    }
}

// Получение товаров
export async function getItems(ids) {
    const authString = generateAuthString(password)
    let temp = []
    try {
        const length = Math.ceil(ids.length / 100)
        for (let i = 0; i<length; i++){
            let start = i*100
            let end = (i+1)*100
            if((ids.length - start) <= 100){
                end = (ids.length - start) * (-1)
            }
            const response = await axios.post(apiUrl, {
                    "action": "get_items",
                    "params": {"ids": end > 0 ? ids.slice(start, end) : ids.slice(end)}
                },
                {
                    headers: {
                        'X-Auth': authString
                    }
                }
            )
            temp = response.data.result
        }
        const uniqueIds = new Set()
        const result  = temp.filter(item =>{
            if(!uniqueIds.has(item.id)){
                uniqueIds.add(item.id)
                return true
            }
            return false
        })
        return result
    } catch (e) {
        console.log(e)
    }
}

export async function getFilterItems(request) {
    const authString = generateAuthString(password)
    if(request===null) {
        console.log("Bad filter. No params provided!")
        return;
    }
    try {
        const response = await axios.post(apiUrl, request,
            {
                headers: {
                    'X-Auth': authString
                }
            }
        )
        let filterIds = [...(new Set(response.data.result))]
        let result = await getItems(filterIds)
        return result
    } catch (e) {
        console.log(e.message)
    }
}

export function paginate(items, pageNumber) {
    const  startIndex = (pageNumber-1) * pageSize
    return [...items].slice(startIndex, pageSize * pageNumber)
}