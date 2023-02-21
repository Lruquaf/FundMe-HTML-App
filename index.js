import {ethers} from "./ethers-5.6.esm.min.js"
import {abi, address} from "./constants.js"

const connectButton = document.getElementById("connectButton")
const fundButton = document.getElementById("fundButton")
const balanceButton = document.getElementById("balanceButton")
const withdrawButton = document.getElementById("withdrawButton")
connectButton.onclick = connect
fundButton.onclick = fund
balanceButton.onclick = getBalance
withdrawButton.onclick = withdraw

async function connect() {
    if (typeof window.ethereum !== "undefined") {
        console.log("I see a metamask!")
        await window.ethereum.request({
            method: "eth_requestAccounts",
        })
        document.getElementById("connectButton").innerHTML = "Connected!"
    } else {
        document.getElementById("connectButton").innerHTML =
            "Please install Metamask!"
    }
}

async function getBalance() {
    if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const balance = await provider.getBalance(address)
        console.log(ethers.utils.formatEther(balance))
        document.getElementById(
            "balanceButton"
        ).innerHTML = `Balance: ${ethers.utils.formatEther(balance)}`
    }
}
async function fund() {
    const maticAmount = document.getElementById("maticAmount").value
    console.log(`Funding with ${maticAmount}`)
    if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(address, abi, signer)
        try {
            const txResponse = await contract.fund({
                value: ethers.utils.parseEther(maticAmount),
            })
            await listenForTxMine(txResponse, provider)
            console.log("Done!")
        } catch (error) {
            console.log(error)
        }
    }
}

function listenForTxMine(txResponse, provider) {
    console.log(`Mining ${txResponse.hash}...`)
    return new Promise((resolve, reject) => {
        provider.once(txResponse.hash, (txReceipt) => {
            console.log(
                `Completed with ${txReceipt.confirmations} confirmations`
            )
            resolve()
        })
    })
}

async function withdraw() {
    if (typeof window.ethereum !== "undefined") {
        console.log("Withdrawing...")
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(address, abi, signer)
        try {
            const txResponse = await contract.withdraw()
            await listenForTxMine(txResponse, provider)
        } catch (error) {
            console.log(error)
        }
    }
}
