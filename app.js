const BSC_CHAIN_ID = "0x38"; // BSC 主网

if (typeof ethers === "undefined") {
  alert("ethers.js 未加载，请检查网络或 CDN!");
  throw new Error("ethers.js 未加载");
}

async function connectWallet() {
  if (!window.ethereum) {
    alert("请先安装 MetaMask!");
    return;
  }

  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const accounts = await provider.send("eth_requestAccounts", []);
    const network = await provider.getNetwork();

    if (network.chainId !== 56) {
      alert("请切换到 BSC 主网!");
      return;
    }

    document.getElementById("status").innerText = "已连接BSC链";
    window.location.href = "relation.html";
  } catch (err) {
    alert("连接失败: " + err.message);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const connectButton = document.getElementById("connectButton");
  if (connectButton) {
    connectButton.addEventListener("click", connectWallet);
  }
});
