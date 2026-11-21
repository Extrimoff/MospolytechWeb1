const ordersUrl = "/labs/api/orders";

const RenderComposition = () => {
    const list = document.querySelector("#order-dishes");
    const empty = document.querySelector("#order-empty");

    let content = ``;

    for (const category of categories) {
        const dish = selected[category.id];

        if (dish === null)
            continue;

        content += `
            <div class="dish" data-id="${dish.id}" data-category="${dish.category}" data-kind="${dish.kind}">
                <img class="dish-photo" src="${dish.image}" alt="${dish.name}" loading="lazy">
                <p class="dish-price">${dish.price} ₽</p>
                <p class="dish-name">${dish.name}</p>
                <p class="dish-weight">${dish.count}</p>
                <button class="dish-remove" type="button">Удалить</button>
            </div>`;
    }

    list.innerHTML = content;
    empty.classList.toggle("hidden", content !== "");
}

const RenderSummary = () => {
    const order_block = document.querySelector("#order-content");
    const total_block = document.querySelector("#order-total");

    let content = ``;

    for (const category of categories) {
        const dish = selected[category.id];

        content += `<div class="order-category">
            <h4>${category.title}</h4>`;

        if (dish === null)
            content += `<p class="order-empty_category">${category.empty}</p>`;
        else
            content += `<p class="order-dish"><span>${dish.name}</span><span>${dish.price} ₽</span></p>`;

        content += `</div>`;
    }

    order_block.innerHTML = content;
    total_block.innerHTML = `<div class="order-total">
        <span>Стоимость заказа</span>
        <span>${GetOrderTotal()} ₽</span>
    </div>`;
}

const RemoveDish = (button) => {
    const card = button.closest(".dish");

    selected[card.dataset.category] = null;

    SaveOrderIds();
    RenderComposition();
    RenderSummary();
}

const hideTime = () => {
    document.querySelector("#time-choice-input").classList.add("hidden");
}

const showTime = () => {
    document.querySelector("#time-choice-input").classList.remove("hidden");
}

const BuildOrderData = (form) => {
    const form_data = new FormData(form);
    const delivery_type = form_data.get("delivery_type");

    const data = {
        full_name: form_data.get("full_name").trim(),
        email: form_data.get("email").trim(),
        subscribe: form_data.get("subscribe") === null ? 0 : 1,
        phone: form_data.get("phone").trim(),
        delivery_address: form_data.get("delivery_address").trim(),
        delivery_type: delivery_type,
        delivery_time: delivery_type === "by_time" ? form_data.get("delivery_time") : null,
        comment: form_data.get("comment").trim()
    };

    for (const category of categories)
        data[`${category.id}_id`] = selected[category.id] === null ? null : selected[category.id].id;

    return data;
}

const SendOrder = async (form) => {
    const response = await fetch(`${ordersUrl}?api_key=${apiKey}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(BuildOrderData(form))
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok)
        throw new Error(result.error ?? "Не удалось оформить заказ");
}

document.addEventListener('DOMContentLoaded', async () => {
    const form = document.querySelector(".order form");
    const list = document.querySelector("#order-dishes");

    let is_sending = false;

    hideTime();

    try {
        await loadDishes();
    } catch (error) {
        console.error(error);
        ShowNotification("Не удалось загрузить блюда");
        return;
    }

    LoadSelected();
    RenderComposition();
    RenderSummary();

    list.addEventListener("click", (event) => {
        const remove_button = event.target.closest(".dish-remove");

        if (remove_button !== null)
            RemoveDish(remove_button);
    })

    document.querySelector("#time-radio").addEventListener("click", hideTime);
    document.querySelector("#time-radio-enable").addEventListener("click", showTime);

    form.addEventListener("reset", () => {
        ClearOrder();
        RenderComposition();
        RenderSummary();
    });

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        if (is_sending)
            return;

        const error = GetOrderError();

        if (error !== null) {
            ShowNotification(error);
            return;
        }

        if (!form.reportValidity())
            return;

        const form_data = new FormData(form);

        if (form_data.get("delivery_type") === "by_time" && form_data.get("delivery_time") === "") {
            ShowNotification("Укажите время доставки");
            return;
        }

        is_sending = true;

        try {
            await SendOrder(form);
            ClearOrder();
            form.reset();
            RenderComposition();
            RenderSummary();
            ShowNotification("Заказ успешно оформлен");
        } catch (error) {
            console.error(error);
            ShowNotification(error instanceof TypeError ? "Не удалось отправить заказ" : error.message);
        } finally {
            is_sending = false;
        }
    });
})
