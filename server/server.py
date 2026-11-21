import json
import mimetypes
import os
import re
import sys
import threading
from datetime import datetime
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, unquote, urlparse

BASE_DIR = Path(__file__).resolve().parent
ROOT_DIR = BASE_DIR.parent
DISHES_FILE = BASE_DIR / "dishes.json"
ORDERS_FILE = BASE_DIR / "orders.json"
ORDERS_LOCK = threading.Lock()

with DISHES_FILE.open(encoding="utf-8") as file:
    DISHES = json.load(file)

DISHES_BY_ID = {dish["id"]: dish for dish in DISHES}

COMBOS = [
    frozenset(("soup", "main_course", "salad", "drink")),
    frozenset(("soup", "main_course", "drink")),
    frozenset(("soup", "salad", "drink")),
    frozenset(("main_course", "salad", "drink")),
    frozenset(("main_course", "drink"))
]

DISH_FIELDS = {
    "soup_id": "soup",
    "main_course_id": "main_course",
    "salad_id": "salad",
    "drink_id": "drink"
}

EMAIL_PATTERN = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
TIME_PATTERN = re.compile(r"^\d{2}:\d{2}$")


def load_orders():
    if not ORDERS_FILE.exists():
        return []

    with ORDERS_FILE.open(encoding="utf-8") as file:
        try:
            return json.load(file)
        except json.JSONDecodeError:
            return []


def save_orders(orders):
    temp_file = ORDERS_FILE.with_name(ORDERS_FILE.name + ".tmp")

    with temp_file.open("w", encoding="utf-8") as file:
        json.dump(orders, file, ensure_ascii=False, indent=4)

    os.replace(temp_file, ORDERS_FILE)


def as_text(value):
    if value is None:
        return ""

    return str(value).strip()


def normalize_subscribe(value):
    if str(value).lower() in ("1", "true", "on", "yes"):
        return 1

    return 0


def find_dish_id(value, category):
    if value in (None, "", 0, "0"):
        return None

    try:
        dish_id = int(value)
    except (TypeError, ValueError):
        raise ValueError("Некорректный идентификатор блюда")

    dish = DISHES_BY_ID.get(dish_id)

    if dish is None:
        raise ValueError("Блюдо не найдено")

    if dish["category"] != category:
        raise ValueError("Блюдо не соответствует категории")

    return dish_id


def validate_delivery_time(value):
    if not TIME_PATTERN.fullmatch(value):
        raise ValueError("Укажите время в формате HH:MM")

    hours, minutes = map(int, value.split(":"))

    if hours > 23 or minutes > 59:
        raise ValueError("Некорректное время доставки")

    total_minutes = hours * 60 + minutes

    if total_minutes < 7 * 60 or total_minutes > 23 * 60:
        raise ValueError("Доставка осуществляется с 7:00 до 23:00")

    if minutes % 5 != 0:
        raise ValueError("Время доставки указывается с шагом 5 минут")

    now = datetime.now()

    if total_minutes <= now.hour * 60 + now.minute:
        raise ValueError("Время доставки не должно быть раньше текущего")

    return value


def build_order(data):
    full_name = as_text(data.get("full_name"))
    email = as_text(data.get("email"))
    phone = as_text(data.get("phone"))
    delivery_address = as_text(data.get("delivery_address"))
    delivery_type = as_text(data.get("delivery_type"))
    comment = as_text(data.get("comment"))

    if not full_name:
        raise ValueError("Укажите имя")

    if not EMAIL_PATTERN.fullmatch(email):
        raise ValueError("Укажите корректный email")

    if not phone:
        raise ValueError("Укажите номер телефона")

    if not delivery_address:
        raise ValueError("Укажите адрес доставки")

    if delivery_type not in ("now", "by_time"):
        raise ValueError("Укажите способ доставки")

    delivery_time = None

    if delivery_type == "by_time":
        delivery_time = validate_delivery_time(as_text(data.get("delivery_time")))

    selected = {}

    for field, category in DISH_FIELDS.items():
        dish_id = find_dish_id(data.get(field), category)

        if dish_id is not None:
            selected[category] = dish_id

    dessert_id = find_dish_id(data.get("dessert_id"), "dessert")

    if "drink" not in selected:
        raise ValueError("Выберите напиток")

    if frozenset(selected) not in COMBOS:
        raise ValueError("Состав заказа не соответствует ни одному комбо")

    return {
        "full_name": full_name,
        "email": email,
        "subscribe": normalize_subscribe(data.get("subscribe")),
        "phone": phone,
        "delivery_address": delivery_address,
        "delivery_type": delivery_type,
        "delivery_time": delivery_time,
        "comment": comment,
        "soup_id": selected.get("soup"),
        "main_course_id": selected.get("main_course"),
        "salad_id": selected.get("salad"),
        "drink_id": selected.get("drink"),
        "dessert_id": dessert_id
    }


def public_order(order):
    return {key: value for key, value in order.items() if key != "api_key"}


class Handler(BaseHTTPRequestHandler):
    server_version = "FoodConstructDemo/1.0"

    def send_json(self, data, status=200):
        body = json.dumps(data, ensure_ascii=False).encode("utf-8")

        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(body)

    def send_not_found(self):
        body = "404 Not Found".encode("utf-8")

        self.send_response(404)
        self.send_header("Content-Type", "text/plain; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def read_body(self):
        length = int(self.headers.get("Content-Length", 0))
        raw = self.rfile.read(length) if length else b""
        content_type = self.headers.get("Content-Type", "")

        if "application/json" in content_type:
            data = json.loads(raw.decode("utf-8"))
        elif "application/x-www-form-urlencoded" in content_type:
            data = {key: values[0] for key, values in parse_qs(raw.decode("utf-8")).items()}
        else:
            raise ValueError("Ожидается JSON")

        if not isinstance(data, dict):
            raise ValueError("Ожидается объект JSON")

        return data

    def get_api_key(self, parsed):
        query = parse_qs(parsed.query)
        api_key = query.get("api_key", ["demo"])[0].strip()

        return api_key or "demo"

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)

        if parsed.path.startswith("/labs/api/"):
            self.handle_api("GET", parsed)
            return

        self.serve_static(parsed.path)

    def do_POST(self):
        parsed = urlparse(self.path)

        if parsed.path.startswith("/labs/api/"):
            self.handle_api("POST", parsed)
            return

        self.send_not_found()

    def do_PUT(self):
        parsed = urlparse(self.path)

        if parsed.path.startswith("/labs/api/"):
            self.handle_api("PUT", parsed)
            return

        self.send_not_found()

    def do_DELETE(self):
        parsed = urlparse(self.path)

        if parsed.path.startswith("/labs/api/"):
            self.handle_api("DELETE", parsed)
            return

        self.send_not_found()

    def handle_api(self, method, parsed):
        parts = [part for part in parsed.path.strip("/").split("/") if part]

        if len(parts) < 3:
            self.send_json({"error": "Неизвестный запрос"}, 404)
            return

        resource = parts[2]
        item_id = None

        if len(parts) >= 4:
            try:
                item_id = int(parts[3])
            except ValueError:
                self.send_json({"error": "Некорректный идентификатор"}, 404)
                return

        if resource == "dishes":
            self.handle_dishes(method, item_id)
        elif resource == "orders":
            self.handle_orders(method, item_id, parsed)
        else:
            self.send_json({"error": "Неизвестный запрос"}, 404)

    def handle_dishes(self, method, dish_id):
        if method != "GET":
            self.send_json({"error": "Метод не поддерживается"}, 405)
            return

        if dish_id is None:
            self.send_json(DISHES)
            return

        dish = DISHES_BY_ID.get(dish_id)

        if dish is None:
            self.send_json({"error": "Блюдо не найдено"}, 404)
            return

        self.send_json(dish)

    def handle_orders(self, method, order_id, parsed):
        api_key = self.get_api_key(parsed)

        if method == "POST":
            if order_id is not None:
                self.send_json({"error": "Неизвестный запрос"}, 404)
                return

            try:
                data = self.read_body()
                order = build_order(data)
            except (ValueError, json.JSONDecodeError) as error:
                self.send_json({"error": str(error)}, 400)
                return

            with ORDERS_LOCK:
                orders = load_orders()
                own_orders = [item for item in orders if item.get("api_key") == api_key]

                if len(own_orders) >= 10:
                    self.send_json({"error": "Нельзя создать больше 10 заказов"}, 409)
                    return

                now = datetime.now().isoformat(timespec="seconds")
                order["id"] = max((item["id"] for item in orders), default=0) + 1
                order["api_key"] = api_key
                order["created_at"] = now
                order["updated_at"] = now
                order["student_id"] = 1
                orders.append(order)
                save_orders(orders)

            self.send_json(public_order(order), 201)
            return

        if method == "GET":
            with ORDERS_LOCK:
                orders = load_orders()

            own_orders = [item for item in orders if item.get("api_key") == api_key]

            if order_id is None:
                self.send_json([public_order(item) for item in own_orders])
                return

            order = next((item for item in own_orders if item["id"] == order_id), None)

            if order is None:
                self.send_json({"error": "Заказ не найден"}, 404)
                return

            self.send_json(public_order(order))
            return

        if method == "PUT":
            if order_id is None:
                self.send_json({"error": "Неизвестный запрос"}, 404)
                return

            try:
                data = self.read_body()
            except (ValueError, json.JSONDecodeError) as error:
                self.send_json({"error": str(error)}, 400)
                return

            with ORDERS_LOCK:
                orders = load_orders()
                order = next((item for item in orders if item["id"] == order_id and item.get("api_key") == api_key), None)

                if order is None:
                    self.send_json({"error": "Заказ не найден"}, 404)
                    return

                merged = dict(order)
                merged.update(data)

                try:
                    updated = build_order(merged)
                except ValueError as error:
                    self.send_json({"error": str(error)}, 400)
                    return

                updated["id"] = order["id"]
                updated["api_key"] = order["api_key"]
                updated["created_at"] = order["created_at"]
                updated["updated_at"] = datetime.now().isoformat(timespec="seconds")
                updated["student_id"] = order["student_id"]

                index = orders.index(order)
                orders[index] = updated
                save_orders(orders)

            self.send_json(public_order(updated))
            return

        if method == "DELETE":
            if order_id is None:
                self.send_json({"error": "Неизвестный запрос"}, 404)
                return

            with ORDERS_LOCK:
                orders = load_orders()
                order = next((item for item in orders if item["id"] == order_id and item.get("api_key") == api_key), None)

                if order is None:
                    self.send_json({"error": "Заказ не найден"}, 404)
                    return

                orders.remove(order)
                save_orders(orders)

            self.send_json(public_order(order))
            return

        self.send_json({"error": "Метод не поддерживается"}, 405)

    def serve_static(self, path):
        if path == "/":
            path = "/index.html"

        relative = Path(unquote(path).lstrip("/"))

        if ".." in relative.parts or any(part.startswith(".") for part in relative.parts):
            self.send_not_found()
            return

        root = ROOT_DIR.resolve()
        file_path = (root / relative).resolve()

        try:
            relative_path = file_path.relative_to(root)
        except ValueError:
            self.send_not_found()
            return

        if relative_path.parts and relative_path.parts[0] == "server":
            self.send_not_found()
            return

        if file_path.is_dir():
            file_path = file_path / "index.html"

        if not file_path.is_file():
            self.send_not_found()
            return

        data = file_path.read_bytes()
        content_type = mimetypes.guess_type(file_path.name)[0] or "application/octet-stream"

        if content_type.startswith("text/") or content_type in ("application/javascript", "application/json"):
            content_type += "; charset=utf-8"

        self.send_response(200)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(data)))
        self.send_header("Cache-Control", "no-cache")
        self.end_headers()
        self.wfile.write(data)


class Server(ThreadingHTTPServer):
    allow_reuse_address = True
    daemon_threads = True


def main():
    port = int(os.environ.get("PORT", sys.argv[1] if len(sys.argv) > 1 else 80))
    server = Server(("0.0.0.0", port), Handler)

    print(f"Server started: http://0.0.0.0:{port}")
    print(f"Public address: http://xtrmffserver.ddns.net:{port}")

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
