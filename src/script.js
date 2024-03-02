import md5 from 'md5'
import axios from "axios";

// Заданный пароль и URL API
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

// Функция для выполнения запроса к API с авторизацией
async function fetchData() {
    const authString = generateAuthString(password);
    try {
        const response = await axios.post(apiUrl, {
                "action": "get_ids",
                "params": {"ids": null}
            },
            {
                headers: {
                    'X-Auth': authString
                }
            }
        );
    } catch (error) {
        console.log(error)
    }
}

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
        console.log(e)
    }
}

export async function getItems(ids) {
    const authString = generateAuthString(password)
    let result = []

    try {
        for (let i = 0; i<ids.length/100; i++){
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
            result = [...result, ...response.data.result]
        }

        result = new Set(result)
        return [...result]
    } catch (e) {
        console.log(e)
    }
}


let ids;
let items
await getIds().then(res => ids = res)
console.log(ids)
await getItems(ids).then(res => items = res)
console.log(items)