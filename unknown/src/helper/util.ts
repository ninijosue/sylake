const currentMonth: number = (new Date(new Date().toString()).getMonth()) + 1;

const currentYear:number = new Date().getFullYear();

const currentDate:string = new Date().toLocaleDateString();

export{
    currentDate,
    currentMonth,
    currentYear
}