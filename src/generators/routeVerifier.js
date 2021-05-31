import { route } from "preact-router";

export default function defineRouteDest(url, permissions, evt) {
    let res;
    const path = evt.current.props.path;
    switch (path) {
        case "/":
            res = permissions.includes("dashboard")
            if (!res) route(`/${permissions[0]}`);
            break;
        case "/addNewSale":
            res = permissions.includes("add new sale")
            if (!res) route(`/${permissions[0]}`);
            break;
        case "/allProductSoldByUser":
            res = permissions.includes("personal sales")
            if (!res) route(`/${permissions[0]}`);
            break;
        case "/addNewProductInStock":
            res = permissions.includes("add purchase");
            if (!res) route(`/${permissions[0]}`);
            break;
        case "/stock":
            res = permissions.includes("stock");
            if (!res) route(`/${permissions[0]}`);
            break;
        case "/stock/:productId":
            res = permissions.includes("stock");
            if (!res) route(`/${permissions[0]}`);
            break;
        case "/stock/purchaseLogs":
            res = permissions.includes("stock");
            if (!res) route(`/${permissions[0]}`);
            break;
        case "/sales":
            res = permissions.includes("sales");
            if (!res) route(`/${permissions[0]}`);
            break;
        case "/sales":
            res = permissions.includes("sales");
            if (!res) route(`/${permissions[0]}`);
            break;
        case "/expenses":
            res = permissions.includes("expenses");
            if (!res) route(`/${permissions[0]}`);
            break;
        case "/products":
            res = permissions.includes("products");
            if (!res) route(`/${permissions[0]}`);
            break;
        case "/addNewLoan":
            res = permissions.includes("add loan");
            if (!res) route(`/${permissions[0]}`);
            break;
        case "/loans":
            res = permissions.includes("loans");
            if (!res) route(`/${permissions[0]}`);
            break;
        case "/loans/:loanId":
            res = permissions.includes("loans");
            if (!res) route(`/${permissions[0]}`);
            break;
        case "/users":
            res = permissions.includes("users");
            if (!res) route(`/${permissions[0]}`);
            break;
        case "/purchaseLogs":
            res = permissions.includes("stock");
            if (!res) route(`/${permissions[0]}`);
            break;
        case "/addUser":
            res = permissions.includes("add user");
            if (!res) route(`/${permissions[0]}`);
            break;
        case "/editUser/:userDocId":
            res = permissions.includes("edit user");
            if (!res) route(`/${permissions[0]}`);
            break;
        default:
            route(`/${permissions[0]}`);
            break;
    }
}

export const allPermission = [
    "dashboard",
    "add user",
    "edit user",
    "delete user",
    "users",
    "stock",
    "edit stock",
    "expenses",
    "delete expense",
    "add expense",
    "edit expense",
    "add new sale",
    "personal sales",
    "sales",
    "edit sales",
    "delete sales",
    "edit purchase",
    "delete purchase",
    "add purchase",
    "loans",
    "add loan",
    "edit loan",
    "delete loan",
    "products",
    "add product",
    "delete product",
    "edit product"
];