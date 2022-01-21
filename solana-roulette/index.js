const web3 = require("@solana/web3.js");


const inquirer = require("inquirer");
const chalk = require("chalk");
const figlet = require("figlet");

const { getReturnAmount, totalAmtToBePaid, randomNumber } = require('./helper');
const { getWalletBalance, transferSOL, airDropSol } = require("./solana");

const connection = new web3.Connection(web3.clusterApiUrl("devnet"), "confirmed");
//For checking whether the connection is successfully made
console.log(connection);

const userWallet = web3.Keypair.generate();
const treasuryWallet = web3.Keypair.generate();
console.log(userWallet);
console.log(treasuryWallet);

//const userWallet = web3.Keypair.fromSecretKey(Uint8Array.from(userSecretKey));
//const treasuryWallet = web3.Keypair.fromSecretKey(Uint8Array.from(userSecretKey));

const askQuestions = () => {
        const questions = [{
                    name: "SOL",
                    type: "number",
                    message: "SOL staking Amount",
                },
                {
                    type: "rawlist",
                    name: "RATIO",
                    message: "Staking Ratio",
                    choices: ["1:1.2", "1:1.4", "1:1.6", "1:1.8", "1:2"],
                    filter: function(val) {
                        const stakeFactor = val.split(":")[1];
                        return stakeFactor;
                    },
                },
                {
                    type: "number",
                    name: "RANDOM",
                    message: "Random Number (1 to 10)",
                    when: async(val) => {
                            if (parseFloat(totalAmtToBePaid(val.SOL)) > 5) {
                                console.log(chalk.red `You have violated the max stake limit. Stake with smaller amount.`)
                                return false;
                            } else {
                                console.log(`You need to pay ${chalk.green`${totalAmtToBePaid(val.SOL)}`} to move forward`)
                    const userBalance = await getWalletBalance(userWallet.publicKey.toString())
                    if (userBalance < totalAmtToBePaid(val.SOL)) {
                        console.log(chalk.red`You don't have enough balance in your wallet`);
                        return false;
                    } else {
                        console.log(chalk.green`You will get ${getReturnAmount(val.SOL, parseFloat(val.RATIO))} if guessing the number correctly`)
                        return true;
                    }
                }
            },
        }
    ];
    return inquirer.prompt(questions);
};

const gameExecution = async() => {
    console.log(
        chalk.yellow(
            figlet.textSync("SOL Stake", {
                font: "Standard",
                horizontalLayout: "default",
                verticalLayout: "default"
            })
        )
    );
    console.log(chalk.red `The max bidding amount is 2.5 SOL`);
    const generateRandomNumber = randomNumber(1, 5);
    await airDropSol(userWallet, 2);

    console.log("Generated number", generateRandomNumber);

    const answers = await askQuestions();
    if (answers.RANDOM) {
        const paymentSignature = await transferSOL(userWallet, treasuryWallet, totalAmtToBePaid(answers.SOL))
        console.log(`Signature of payment for playing the game`, chalk.green `${paymentSignature}`);

        if (answers.RANDOM === generateRandomNumber) {

            await airDropSol(treasuryWallet, getReturnAmount(answers.SOL, parseFloat(answers.RATIO)));

            const prizeSignature = await transferSOL(treasuryWallet, userWallet, getReturnAmount(answers.SOL, parseFloat(answers.RATIO)))

            console.log(chalk.green `Your guess is absolutely correct`);
            console.log(`Here is the price signature `, chalk.green `${prizeSignature}`);

        } else {

            console.log(chalk.yellowBright `Better luck next time`)
        }
    }
}

gameExecution();