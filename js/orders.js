const ordersUrl = "/labs/api/orders";

let orderList = [];
let dishesById = new Map();
let editingId = null;
let deletingId = null;
let is_saving = false;
let is_deleting = false;

const orderIcons = {
    view: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5C6.5 5 2.4 10.1 1.6 11.4a1.1 1.1 0 0 0 0 1.2C2.4 13.9 6.5 19 12 19s9.6-5.1 10.4-6.4a1.1 1.1 0 0 0 0-1.2C21.6 10.1 17.5 5 12 5Zm0 12a5 5 0 1 1 0-10 5 5 0 0 1 0 10Zm0-2a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/></svg>`,
    edit: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m4 16.5-.9 4.4 4.4-.9L19.6 7.9a2.1 2.1 0 0 0-3-3L4 16.5Zm2.8.3L16.7 6.1a.5.5 0 0 1 .7 0l.5.5a.5.5 0 0 1 0 .7L7.2 18.1l-1.9.4.4-1.9Z"/></svg>`,
    delete: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 3h6l1 2h4v2H4V5h4l1-2Zm-3 6h12l-1 12H7L6 9Zm3 2v8h2v-8H9Zm4 0v8h2v-8h-2Z"/></svg>`
}

const EscapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, symbol => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
}[symbol]));

const FormatDate = (value) => {
    const date = new Date(value);

    if (Number.isNaN(date.getTime()))
        return value;

    const pad = (number) => String(number).padStart(2, "0");

    return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

const FormatDelivery = (order) => {
    if (order.delivery_type === "by_time" && order.delivery_time)
        return order.delivery_time;

    return "Как можно скорее (с 7:00 до 23:00)";
}

const SortOrders = () => {
    orderList.sort((first, second) => new Date(second.created_at) - new Date(first.created_at));
}

const GetOrderDishes = (order) => {
    const result = [];

    for (const category of categories) {
        const dish = dishesById.get(Number(order[`${category.id}_id`]));

        if (dish !== undefined)
            result.push({ title: category.title, dish: dish });
    }

    return result;
}

const GetOrderCost = (order) => {
    let total = 0;

    for (const item of GetOrderDishes(order))
        total += item.dish.price;

    return total;
}

const LoadOrders = async () => {
    const response = await fetch(`${ordersUrl}?api_key=${apiKey}`);
    const result = await response.json().catch(() => ({}));

    if (!response.ok)
        throw new Error(result.error ?? "Не удалось загрузить заказы");

    return result;
}

const RenderOrders = () => {
    const list = document.querySelector("#orders-list");
    const wrap = document.querySelector(".orders-wrap");
    const empty = document.querySelector("#orders-empty");

    let content = ``;

    orderList.forEach((order, index) => {
        const names = GetOrderDishes(order).map(item => EscapeHtml(item.dish.name)).join(", ");

        content += `
            <tr>
                <td>${index + 1}</td>
                <td>${FormatDate(order.created_at)}</td>
                <td>${names}</td>
                <td>${GetOrderCost(order)} ₽</td>
                <td>${FormatDelivery(order)}</td>
                <td>
                    <div class="orders-actions">
                        <button class="order-action" type="button" data-action="view" data-id="${order.id}" title="Подробнее">${orderIcons.view}</button>
                        <button class="order-action" type="button" data-action="edit" data-id="${order.id}" title="Редактирование">${orderIcons.edit}</button>
                        <button class="order-action order-action-delete" type="button" data-action="delete" data-id="${order.id}" title="Удаление">${orderIcons.delete}</button>
                    </div>
                </td>
            </tr>`;
    });

    list.innerHTML = content;
    wrap.classList.toggle("hidden", orderList.length === 0);
    empty.classList.toggle("hidden", orderList.length !== 0);
}

const RenderModalComposition = (order, target) => {
    let content = ``;

    for (const item of GetOrderDishes(order))
        content += `<p class="modal-dish"><span>${item.title}</span><span>${EscapeHtml(item.dish.name)} (${item.dish.price} ₽)</span></p>`;

    content += `<p class="modal-dish modal-total"><span>Стоимость</span><span>${GetOrderCost(order)} ₽</span></p>`;

    target.innerHTML = content;
}

const OpenModal = (modal) => {
    modal.classList.remove("hidden");
}

const CloseModal = (modal) => {
    if (modal !== null)
        modal.classList.add("hidden");
}

const OpenViewModal = (order) => {
    const body = document.querySelector("#view-body");

    body.innerHTML = `
        <p class="modal-line"><span>Дата оформления</span><span>${FormatDate(order.created_at)}</span></p>

        <h4>Доставка</h4>
        <p class="modal-line"><span>Имя получателя</span><span>${EscapeHtml(order.full_name)}</span></p>
        <p class="modal-line"><span>Адрес доставки</span><span>${EscapeHtml(order.delivery_address)}</span></p>
        <p class="modal-line"><span>Время доставки</span><span>${FormatDelivery(order)}</span></p>
        <p class="modal-line"><span>Телефон</span><span>${EscapeHtml(order.phone)}</span></p>
        <p class="modal-line"><span>Email</span><span>${EscapeHtml(order.email)}</span></p>

        <h4>Комментарий</h4>
        <p class="modal-comment">${order.comment ? EscapeHtml(order.comment) : "—"}</p>

        <h4>Состав заказа</h4>
        <div id="view-composition"></div>
    `;

    RenderModalComposition(order, body.querySelector("#view-composition"));
    OpenModal(document.querySelector("#view-modal"));
}

const UpdateEditTime = () => {
    const form = document.querySelector("#edit-form");
    const checked = form.querySelector('input[name="delivery_type"]:checked');
    const is_by_time = checked !== null && checked.value === "by_time";

    document.querySelector("#edit-time-row").classList.toggle("hidden", !is_by_time);
}

const OpenEditModal = (order) => {
    const form = document.querySelector("#edit-form");

    editingId = order.id;

    document.querySelector("#edit-date").textContent = FormatDate(order.created_at);
    form.elements.full_name.value = order.full_name ?? "";
    form.elements.email.value = order.email ?? "";
    form.elements.phone.value = order.phone ?? "";
    form.elements.delivery_address.value = order.delivery_address ?? "";
    form.elements.comment.value = order.comment ?? "";
    form.elements.delivery_time.value = order.delivery_time ?? "";

    for (const radio of form.querySelectorAll('input[name="delivery_type"]'))
        radio.checked = radio.value === order.delivery_type;

    RenderModalComposition(order, document.querySelector("#edit-composition"));
    UpdateEditTime();
    OpenModal(document.querySelector("#edit-modal"));
}

const OpenDeleteModal = (order) => {
    deletingId = order.id;

    document.querySelector("#delete-info").textContent =
        `Заказ от ${FormatDate(order.created_at)} на сумму ${GetOrderCost(order)} ₽`;

    OpenModal(document.querySelector("#delete-modal"));
}

const SaveOrderEdits = async (event) => {
    event.preventDefault();

    if (is_saving || editingId === null)
        return;

    const form = document.querySelector("#edit-form");

    if (!form.reportValidity())
        return;

    const form_data = new FormData(form);
    const delivery_type = form_data.get("delivery_type");

    if (delivery_type === "by_time" && form_data.get("delivery_time") === "") {
        ShowNotification("Укажите время доставки");
        return;
    }

    const data = {
        full_name: form_data.get("full_name").trim(),
        email: form_data.get("email").trim(),
        phone: form_data.get("phone").trim(),
        delivery_address: form_data.get("delivery_address").trim(),
        delivery_type: delivery_type,
        delivery_time: delivery_type === "by_time" ? form_data.get("delivery_time") : null,
        comment: form_data.get("comment").trim()
    };

    const save_button = form.querySelector('button[type="submit"]');
    const order_id = editingId;

    is_saving = true;
    save_button.disabled = true;

    try {
        const response = await fetch(`${ordersUrl}/${order_id}?api_key=${apiKey}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        const result = await response.json().catch(() => ({}));

        if (!response.ok)
            throw new Error(result.error ?? "Не удалось изменить заказ");

        const index = orderList.findIndex(order => order.id === order_id);

        if (index !== -1)
            orderList[index] = result;

        editingId = null;
        SortOrders();
        RenderOrders();
        CloseModal(document.querySelector("#edit-modal"));
        ShowNotification("Заказ успешно изменён");
    } catch (error) {
        console.error(error);
        ShowNotification(error instanceof TypeError ? "Не удалось отправить запрос" : error.message);
    } finally {
        is_saving = false;
        save_button.disabled = false;
    }
}

const DeleteOrder = async () => {
    if (is_deleting || deletingId === null)
        return;

    const button = document.querySelector("#delete-confirm");
    const order_id = deletingId;

    is_deleting = true;
    button.disabled = true;

    try {
        const response = await fetch(`${ordersUrl}/${order_id}?api_key=${apiKey}`, {
            method: "DELETE"
        });

        const result = await response.json().catch(() => ({}));

        if (!response.ok)
            throw new Error(result.error ?? "Не удалось удалить заказ");

        orderList = orderList.filter(order => order.id !== order_id);
        deletingId = null;
        RenderOrders();
        CloseModal(document.querySelector("#delete-modal"));
        ShowNotification("Заказ успешно удалён");
    } catch (error) {
        console.error(error);
        ShowNotification(error instanceof TypeError ? "Не удалось отправить запрос" : error.message);
    } finally {
        is_deleting = false;
        button.disabled = false;
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    document.addEventListener("click", (event) => {
        const close_button = event.target.closest("[data-close]");

        if (close_button !== null) {
            CloseModal(close_button.closest(".modal-overlay"));
            return;
        }

        if (event.target.classList.contains("modal-overlay"))
            CloseModal(event.target);
    });

    document.addEventListener("keydown", (event) => {
        if (event.key !== "Escape")
            return;

        for (const modal of document.querySelectorAll(".modal-overlay"))
            CloseModal(modal);
    });

    document.querySelector("#orders-list").addEventListener("click", (event) => {
        const button = event.target.closest(".order-action");

        if (button === null)
            return;

        const order = orderList.find(item => item.id === Number(button.dataset.id));

        if (order === undefined)
            return;

        if (button.dataset.action === "view")
            OpenViewModal(order);
        else if (button.dataset.action === "edit")
            OpenEditModal(order);
        else if (button.dataset.action === "delete")
            OpenDeleteModal(order);
    });

    document.querySelector("#edit-form").addEventListener("submit", SaveOrderEdits);

    document.querySelector("#edit-form").addEventListener("change", (event) => {
        if (event.target.name === "delivery_type")
            UpdateEditTime();
    });

    document.querySelector("#delete-confirm").addEventListener("click", DeleteOrder);

    try {
        await loadDishes();
        orderList = await LoadOrders();
    } catch (error) {
        console.error(error);
        ShowNotification(error.message);
        return;
    }

    SortOrders();

    dishesById = new Map(dishes.map(dish => [dish.id, dish]));

    RenderOrders();
})
