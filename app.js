const BSC_CHAIN_ID = "0x38"; // BSC 主网

async function connectWallet() {
  const debugEl = document.getElementById("debug");
  debugEl.innerText = ""; // 清空调试信息

  console.log("连接钱包按钮被点击");
  debugEl.innerText += "按钮点击事件触发\n";

  if (!window.ethereum) {
    alert("请先安装 MetaMask!");
    debugEl.innerText += "未检测到 MetaMask\n";
    return;
  }

  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum);

    // 请求授权账户访问
    const accounts = await provider.send("eth_requestAccounts", []);
    console.log("已连接账户:", accounts);
    debugEl.innerText += `已连接账户: ${accounts[0]}\n`;

    // 获取链信息
    const network = await provider.getNetwork();
    console.log("当前链ID:", network.chainId);
    debugEl.innerText += `当前链ID: ${network.chainId}\n`;

    if (network.chainId !== 56) {
      alert("请切换到 BSC 主网!");
      debugEl.innerText += "链不是BSC\n";
      return;
    }

    document.getElementById("status").innerText = "已连接BSC链";

    // 成功后跳转
    window.location.href = "relation.html";
  } catch (err) {
    console.error("连接失败:", err);
    debugEl.innerText += "连接失败: " + err.message + "\n";
    alert("连接失败: " + err.message);
  }
}

// 确保 DOM 加载完成再绑定事件
document.addEventListener("DOMContentLoaded", () => {
  const connectButton = document.getElementById("connectButton");
  if (connectButton) {
    console.log("按钮事件已绑定");
    document.getElementById("debug").innerText += "按钮事件已绑定\n";
    connectButton.addEventListener("click", connectWallet);
  } else {
    console.error("未找到 connectButton 按钮");
    document.getElementById("debug").innerText += "未找到 connectButton 按钮\n";
  }
});
