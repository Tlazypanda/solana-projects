function totalAmtToBePaid(amt) {
    return amt;
}

function randomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getReturnAmount(amt, stakeFactor) {
    return amt * stakeFactor;
}

module.exports = {
    randomNumber,
    totalAmtToBePaid,
    getReturnAmount
};