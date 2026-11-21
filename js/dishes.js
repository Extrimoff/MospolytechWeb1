let dishes = [];

const dishesUrl = "https://api.jsonbin.io/v3/b/6b00db86ffd5d16053d25936";
const dishesAccessKey = "$2a$10$zyk2GQJaqMKZs9FcORx79upaHI.SXGj7rKD7//J.T9ClFm7qF0FYS";

const loadDishes = async () => {
    const response = await fetch(dishesUrl, {
        method: "GET",
        headers: {
            "X-Access-Key": dishesAccessKey
        }
    });

    if (!response.ok)
        throw new Error("Не удалось загрузить блюда");

    const data = await response.json();

    dishes = data.record;
}
