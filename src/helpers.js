export async function connect() {
    try{
        const accounts = await window.ethereum.request({method: 'eth_requestAccounts'})
        const account = handleAccountsChanged(accounts)
        return account
    } catch (er){
        if(er.code === 4001){
            alert('Please connect to metamask to continue')
        }else{
            console.error(er)
        }

    }
}

export function handleAccountsChanged(accounts){
    if(accounts.length === 0){
        console.log("Please connect to metamask")
    }else{
        window.ethereum.on("accountsChanged", () => {window.location.reload()})
        return accounts[0]
    }
}