import md5 from 'md5'
import axios from "axios";

// URL API
const password = "Valantis";
const apiUrl = "https://api.valantis.store:41000/";

// Лимит для получения айдишек
const limit = 220


// Функция для формирования авторизационной строки
function generateAuthString(password) {
    const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const authString = md5(`${password}_${timestamp}`)
    console.log(authString)
    return authString;
}

// Получения айдишек по блокам из 4 страниц
export async function getIds(nextPages = 1) {
    if (nextPages === 0) {
        console.log("nextPages cannot be 0. At least 1")
        return;
    }
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
    let result = []

    try {
        const response = await axios.post(apiUrl, {
                "action": "get_items",
                "params": {"ids": ids}
            },
            {
                headers: {
                    'X-Auth': authString
                }
            }
        )
        result = [...result, ...response.data.result]


        result = new Set(result)
        return [...result]
    } catch (e) {
        console.log(e.message)
    }
}


let ids;
let items
await getIds().then(res => ids = res)
console.log("ids", ids)
await getItems(ids.slice(0, 50)).then(res => items = res)
console.log("items", items)