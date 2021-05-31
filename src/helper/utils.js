import { render, Fragment } from "preact";
const formatDates = (date) => {
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    let day = date.getDate();

    if (day < 10) day = `0${day}`;
    if (month < 10) month = `0${month}`;
    return [year, month, day].join("-")

};

const arrowNumericOnly = (evt) => {
    const keyCode = evt.keyCode;
    const isControlKey = evt.ctrlKey;
    if (isControlKey) return;
    if (keyCode > 57 && keyCode < 91) evt.preventDefault();
}

const getRandomString = () => {
    const passLength = 6;
    let generatedPW = "";
    for (let i = 0; i < passLength; i++) {
        const rand = Math.floor(Math.random() * 26) + 97;
        generatedPW += String.fromCharCode(rand);
        const randTow = Math.floor(Math.random() * 26) + 47;
        generatedPW += String.fromCharCode(randTow);

    }
    return generatedPW;
}

const getCurrentMonth = () => (new Date(new Date().toString()).getMonth()) + 1;

const getCurrentYear = () => new Date().getFullYear();

const getCurrentDate = () => new Date().toLocaleDateString();
const getStringfiedMonth = (month) => {
    switch (month.toString()) {
        case "1":
            return "january";
        case "2":
            return "february";
        case "3":
            return "march";
        case "4":
            return "april";
        case "5":
            return "may";
        case "6":
            return "june";
        case "7":
            return "july";
        case "8":
            return "august";
        case "9":
            return "septempber";
        case "10":
            return "october";
        case "11":
            return "november";
        case "13":
            return "december";

    }
}

/**
 * 
 * @param {{from: string, to: string, date: string | null}} query
 * @returns {{from: string, to: string, isOneDay: boolean}}
 */
 const choosenDate = (query)=>{
    let from;
    let to;
    let isOneDay = false
    if (query.date) {
        isOneDay = true;
        const givenDate = new Date(query.date);
        from = new Date(`${givenDate.getMonth() + 1}-${givenDate.getDate()}-${givenDate.getFullYear()}`).getTime();
        const nextDate = new Date(givenDate.setDate(givenDate.getDate() + 1));
        to = new Date(`${nextDate.getMonth() + 1}-${nextDate.getDate()}-${nextDate.getFullYear()}`).getTime();
    }
    else {
        from = new Date(query.from).getTime();
        to = new Date(query.to).getTime();
    }
    return {from, to, isOneDay}
}

export {
    formatDates,
    arrowNumericOnly,
    getRandomString,
    getCurrentMonth,
    getCurrentYear,
    getCurrentDate,
    getStringfiedMonth,
    choosenDate
};
