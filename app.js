const BSC_CHAIN_ID = "0x38"; // BSC 主网

async function connectWallet() {
  console.log("连接钱包按钮被点击"); // 调试提示
  if (typeof window.ethereum === "undefined") {
    alert("请先安装 MetaMask!");
    return;
  }

  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const network = await provider.getNetwork();

    if (network.chainId !== 56) {
      alert("请切换到 BSC 主网!");
      return;
    }

    document.getElementById("status").innerText = "已连接BSC链";
    window.location.href = "relation.html"; // 跳转确认关系页面
  } catch (err) {
    console.error(err);
    alert("连接失败: " + err.message);
  }
}

// 事件绑定
window.addEventListener("DOMContentLoaded", () => {
  const connectButton = document.getElementById("connectButton");
  if (connectButton) {
    console.log("按钮事件已绑定"); // 调试提示
    connectButton.addEventListener("click", connectWallet);
  } else {
    console.error("未找到按钮 connectButton");
  }
});
